import { prisma } from './prisma'
import { Resend } from 'resend'
import { sendSMS } from './sms'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendSMSNotification(userId: string, message: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneNumber: true }
    })

    if (user?.phoneNumber) {
      await sendSMS(user.phoneNumber, message)
    }
  } catch (error) {
    console.error('SMS notification error:', error)
  }
}

export async function createNotification(userId: string, title: string, message: string) {
  try {
    // 1. Create In-App Notification
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
      }
    })

    // 2. Send Email via Resend
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })

    if (user?.email) {
      await resend.emails.send({
        from: 'INEC Cooperative <onboarding@resend.dev>', // Change this to your domain later
        to: user.email,
        subject: title,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">${title}</h2>
            <p>${message}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999;">This is an automated notification from the INEC Cooperative Management System.</p>
          </div>
        `
      })
    }
  } catch (error) {
    console.error('Notification system error:', error)
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { read: true }
    })
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    })
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
  }
}
