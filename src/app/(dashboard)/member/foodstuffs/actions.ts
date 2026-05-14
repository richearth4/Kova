'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function placeFoodstuffOrder(formData: FormData) {
  const { dbUser } = await requireAuth()

  const description = formData.get('description') as string
  const totalCost = parseFloat(formData.get('totalCost') as string)

  try {
    await prisma.foodstuffOrder.create({
      data: {
        userId: dbUser.id,
        description,
        totalCost,
        month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        status: 'PENDING'
      }
    })
    revalidatePath('/member/foodstuffs')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to place order' }
  }
}
