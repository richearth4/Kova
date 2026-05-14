'use server'

import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createNotification, sendSMSNotification } from '@/lib/notifications'
import { logAudit } from '@/lib/audit'

export async function reviewLoan(
  loanId: string, 
  status: 'APPROVED' | 'REJECTED' | 'ACTIVE',
  rejectionReason?: string
) {
  const dbUser = await requireRole(['ADMIN', 'SECRETARY'])

  try {
    const loan = await prisma.loan.update({
      where: { id: loanId },
      data: { status },
      include: { user: true }
    })

    const notifTitle = status === 'REJECTED' 
      ? 'Loan Application Rejected'
      : status === 'ACTIVE' 
        ? 'Loan Approved & Activated'
        : 'Loan Application Approved'

    const notifMessage = status === 'REJECTED' 
      ? `Your loan application for ₦${Number(loan.principal).toLocaleString()} has been rejected. Reason: ${rejectionReason || 'Policy requirements not met.'}`
      : `Your loan application for ₦${Number(loan.principal).toLocaleString()} has been ${status === 'ACTIVE' ? 'approved and activated' : 'approved'}. Funds will be disbursed shortly.`

    await createNotification(loan.userId, notifTitle, notifMessage)

    // Send SMS for approval (critical — member needs to know even if not logged in)
    if (status === 'ACTIVE') {
      await sendSMSNotification(
        loan.userId,
        `KOVA Cooperative: Your loan of ₦${Number(loan.principal).toLocaleString()} has been APPROVED. Monthly installment: ₦${(Number(loan.totalRepayment) / loan.durationMonths).toFixed(2)}. Repayment begins next month.`
      )
    } else if (status === 'REJECTED') {
      await sendSMSNotification(
        loan.userId,
        `KOVA Cooperative: Your loan application of ₦${Number(loan.principal).toLocaleString()} was declined. Reason: ${rejectionReason || 'Policy requirements not met.'} Contact the office for details.`
      )
    }

    await logAudit({
      action: 'LOAN_REVIEW',
      entityId: loanId,
      entityType: 'LOAN',
      details: { adminId: dbUser.id, newStatus: status, amount: loan.principal.toString(), rejectionReason: rejectionReason || null }
    })

    revalidatePath('/admin/loans')
    revalidatePath('/admin')
    revalidatePath('/member/loans')
    revalidatePath('/member')
    return { success: true }
  } catch (error) {
    console.error('Loan review error:', error)
    return { success: false, error: 'Failed to update loan status' }
  }
}

