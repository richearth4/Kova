'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createSavingsTarget(formData: FormData) {
  const { dbUser } = await requireAuth()

  const goalName = formData.get('goalName') as string
  const targetAmount = parseFloat(formData.get('targetAmount') as string)

  if (!goalName || isNaN(targetAmount) || targetAmount <= 0) {
    return { success: false, error: 'Invalid goal details' }
  }

  try {
    await prisma.savingsTarget.create({
      data: {
        userId: dbUser.id,
        goalName,
        targetAmount,
        savedAmount: 0,
      },
    })

    revalidatePath('/member/savings')
    revalidatePath('/member')
    return { success: true }
  } catch (error) {
    console.error('Savings target error:', error)
    return { success: false, error: 'Failed to create savings target' }
  }
}

export async function deleteSavingsTarget(id: string) {
  const { dbUser } = await requireAuth()

  try {
    await prisma.savingsTarget.delete({
      where: { 
        id,
        userId: dbUser.id // Security: ensure user owns the target
      }
    })
    revalidatePath('/member/savings')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete target' }
  }
}
