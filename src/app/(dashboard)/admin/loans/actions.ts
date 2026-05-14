'use server'

import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/notifications'
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

    const message = status === 'REJECTED' 
      ? `Your loan application for ₦${loan.principal.toString()} has been rejected. Reason: ${rejectionReason || 'Policy requirements not met.'}`
      : `Your loan application for ₦${loan.principal.toString()} has been ${status.toLowerCase()}.`

    await createNotification(
      loan.userId,
      `Loan Application ${status.toLowerCase()}`,
      message
    )

    await logAudit({
      action: 'LOAN_REVIEW',
      entityId: loanId,
      entityType: 'LOAN',
      details: { adminId: dbUser.id, newStatus: status, amount: loan.principal.toString() }
    })

    revalidatePath('/admin/loans')
    revalidatePath('/member/loans')
    revalidatePath('/member')
    return { success: true }
  } catch (error) {
    console.error('Loan review error:', error)
    return { success: false, error: 'Failed to update loan status' }
  }
}
