'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function placeFoodstuffOrder(formData: FormData) {
  const { dbUser } = await requireAuth()

  const itemsJson = formData.get('itemsJson') as string
  if (!itemsJson) {
    return { success: false, error: 'No items selected' }
  }

  try {
    const selectedItems: { id: string; quantity: number }[] = JSON.parse(itemsJson)
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      return { success: false, error: 'Invalid items list' }
    }

    const activeItems = selectedItems.filter(item => item.quantity > 0)
    if (activeItems.length === 0) {
      return { success: false, error: 'No items in order' }
    }

    const itemIds = activeItems.map(item => item.id)
    const dbItems = await prisma.foodstuffItem.findMany({
      where: {
        id: { in: itemIds },
        available: true
      }
    })

    if (dbItems.length !== activeItems.length) {
      return { success: false, error: 'Some selected items are unavailable or invalid' }
    }

    let calculatedCost = 0
    const descriptionParts: string[] = []

    for (const activeItem of activeItems) {
      const dbItem = dbItems.find(item => item.id === activeItem.id)
      if (!dbItem) {
        return { success: false, error: 'Item not found' }
      }
      calculatedCost += Number(dbItem.price) * activeItem.quantity
      descriptionParts.push(`${dbItem.name} (x${activeItem.quantity})`)
    }

    const description = descriptionParts.join(', ')

    await prisma.foodstuffOrder.create({
      data: {
        tenantId: dbUser.tenantId,
        userId: dbUser.id,
        description,
        totalCost: calculatedCost,
        month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        status: 'PENDING'
      }
    })

    revalidatePath('/member/foodstuffs')
    return { success: true }
  } catch (error) {
    console.error('Failed to place order securely:', error)
    return { success: false, error: 'Failed to place order securely' }
  }
}
