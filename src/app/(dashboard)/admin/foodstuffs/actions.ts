'use server'

import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function addFoodstuffItem(formData: FormData) {
  await requireRole(['ADMIN', 'SECRETARY'])

  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)

  try {
    await prisma.foodstuffItem.create({
      data: { name, price }
    })
    revalidatePath('/admin/foodstuffs')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to add item' }
  }
}

export async function toggleItemAvailability(id: string, available: boolean) {
  await requireRole(['ADMIN', 'SECRETARY'])
  await prisma.foodstuffItem.update({
    where: { id },
    data: { available }
  })
  revalidatePath('/admin/foodstuffs')
  revalidatePath('/member/foodstuffs')
}
