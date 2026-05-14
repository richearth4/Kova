'use server'

import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/notifications'

export async function verifyPayment(paymentId: string, status: 'CONFIRMED' | 'REJECTED', type: string) {
  await requireRole(['SECRETARY', 'ADMIN'])

  try {
    const result = await prisma.$transaction(async (tx) => {
      if (type === 'CONTRIBUTION') {
        const payment = await tx.paymentProof.update({
          where: { id: paymentId },
          data: { status },
          include: { 
            user: true,
            contribution: true 
          }
        })

        if (payment.contribution) {
          await tx.contribution.update({
            where: { id: payment.contribution.id },
            data: { status }
          })
        }
        return { userId: payment.userId, amount: payment.amount, type: 'Contribution' }
      } else {
        const repayment = await tx.loanRepayment.update({
          where: { id: paymentId },
          data: { status },
          include: { loan: { include: { user: true } } }
        })
        return { userId: repayment.loan.userId, amount: repayment.amount, type: 'Loan Repayment' }
      }
    })

    const title = `${result.type} ${status.toLowerCase()}`
    const message = status === 'CONFIRMED' 
      ? `Your ${result.type.toLowerCase()} of ₦${Number(result.amount).toLocaleString()} has been verified.`
      : `Your ${result.type.toLowerCase()} proof for ₦${Number(result.amount).toLocaleString()} was rejected.`

    await createNotification(result.userId, title, message)

    revalidatePath('/secretary/verify-payments')
    revalidatePath('/member')
    revalidatePath('/admin/loans')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to verify payment:', error)
    return { success: false, error: 'Failed to update payment status' }
  }
}
