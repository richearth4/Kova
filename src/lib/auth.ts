import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  if (!dbUser) {
    console.error(`[AUTH] User record not found for Supabase ID: ${user.id}`)
    redirect('/login?error=User record not found in database')
  }

  if (!dbUser.active) {
    console.error(`[AUTH] Account suspended: ${dbUser.email}`)
    redirect('/login?error=Account suspended. Contact administration.')
  }

  return { supabaseUser: user, dbUser }
}

export async function requireRole(allowedRoles: string[]) {
  const { dbUser } = await requireAuth()

  if (!allowedRoles.includes(dbUser.role)) {
    redirect('/unauthorized')
  }

  return dbUser
}
