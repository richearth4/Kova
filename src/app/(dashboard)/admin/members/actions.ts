'use server'

import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { Role } from '@prisma/client'
import { logAudit } from '@/lib/audit'
import { createAdminClient } from '@/lib/supabase/server'

export async function updateUserRole(userId: string, newRole: Role) {
  const admin = await requireRole(['ADMIN'])

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    })
    
    await logAudit({
      action: 'MEMBER_ROLE_UPDATE',
      entityId: userId,
      entityType: 'USER',
      details: {
        newRole,
        updatedBy: admin.id,
        email: updatedUser.email
      }
    })

    revalidatePath('/admin/members')
    return { success: true }
  } catch (error) {
    console.error('Failed to update user role:', error)
    return { success: false, error: 'Failed to update user role' }
  }
}
export async function bulkImportMembers(csvContent: string) {
  await requireRole(['ADMIN'])
  const supabase = await createAdminClient()

  try {
    const lines = csvContent.split('\n').filter(l => l.trim())
    if (lines.length < 2) return { success: false, error: 'CSV is empty' }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const firstNameIdx = headers.indexOf('first name')
    const lastNameIdx = headers.indexOf('last name')
    const emailIdx = headers.indexOf('email')
    const staffIdIdx = headers.indexOf('staff id')

    if (firstNameIdx === -1 || lastNameIdx === -1 || emailIdx === -1) {
      return { success: false, error: 'Invalid CSV format. Required columns: First Name, Last Name, Email' }
    }

    const results = { created: 0, updated: 0, failed: 0 }

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim())
      if (cols.length < headers.length) continue

      const email = cols[emailIdx]
      const firstName = cols[firstNameIdx]
      const lastName = cols[lastNameIdx]
      const staffId = staffIdIdx !== -1 ? cols[staffIdIdx] : null

      if (!email || !firstName || !lastName) {
        results.failed++
        continue
      }

      try {
        const existing = await prisma.user.findUnique({ where: { email } })
        
        if (existing) {
          await prisma.user.update({
            where: { email },
            data: { firstName, lastName, staffId }
          })
          results.updated++
        } else {
          // Create in Supabase Auth first
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: { firstName, lastName }
          })

          if (authError) {
            console.error(`Auth creation failed for ${email}:`, authError)
            results.failed++
            continue
          }

          // Then create in Prisma using the same ID
          await prisma.user.create({
            data: {
              id: authData.user.id,
              email,
              firstName,
              lastName,
              staffId,
              role: 'MEMBER'
            }
          })
          results.created++
        }
      } catch (e) {
        console.error(`Prisma operation failed for ${email}:`, e)
        results.failed++
      }
    }

    await logAudit({
      action: 'BULK_IMPORT',
      entityId: 'SYSTEM',
      entityType: 'USER',
      details: { results }
    })

    revalidatePath('/admin/members')
    return { success: true, results }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleUserStatus(userId: string) {
  const admin = await requireRole(['ADMIN'])

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, error: 'User not found' }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { active: !user.active }
    })

    await logAudit({
      action: updated.active ? 'MEMBER_REACTIVATE' : 'MEMBER_SUSPEND',
      entityId: userId,
      entityType: 'USER',
      details: {
        adminId: admin.id,
        email: user.email
      }
    })

    revalidatePath('/admin/members')
    return { success: true, active: updated.active }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
