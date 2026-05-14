'use server'

import { markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth'

export async function handleMarkAsRead(id: string) {
  await markNotificationAsRead(id)
  revalidatePath('/')
}

export async function handleMarkAllAsRead() {
  const user = await requireRole(['MEMBER', 'SECRETARY', 'ADMIN'])
  await markAllNotificationsAsRead(user.id)
  revalidatePath('/')
}
