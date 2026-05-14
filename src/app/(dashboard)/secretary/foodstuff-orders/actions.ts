'use server'

import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/notifications'
import { logAudit } from '@/lib/audit'

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'

export async function updateFoodstuffOrderStatus(orderId: string, status: OrderStatus) {
  const dbUser = await requireRole(['SECRETARY', 'ADMIN'])

  try {
    const order = await prisma.foodstuffOrder.update({
      where: { id: orderId },
      data: { status },
      include: { user: true }
    })

    // Notify the member of status change
    const statusMessages: Record<string, string> = {
      PROCESSING: `Your foodstuff order of ₦${Number(order.totalCost).toLocaleString()} is now being processed for this month's distribution.`,
      COMPLETED: `Your foodstuff order of ₦${Number(order.totalCost).toLocaleString()} has been fulfilled. Salary deduction applied.`,
      CANCELLED: `Your foodstuff order of ₦${Number(order.totalCost).toLocaleString()} has been cancelled. Contact the secretary for details.`,
    }

    if (statusMessages[status]) {
      await createNotification(
        order.userId,
        `Logistics Order ${status}`,
        statusMessages[status]
      )
    }

    await logAudit({
      action: `ORDER_${status}`,
      entityId: orderId,
      entityType: 'FOODSTUFF',
      details: {
        secretaryId: dbUser.id,
        memberId: order.userId,
        memberName: `${order.user.firstName} ${order.user.lastName}`,
        amount: order.totalCost.toString(),
        newStatus: status
      }
    })

    revalidatePath('/secretary/foodstuff-orders')
    revalidatePath('/member/foodstuffs')
    revalidatePath('/secretary')
    return { success: true }
  } catch (error) {
    console.error('Failed to update order status:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}
