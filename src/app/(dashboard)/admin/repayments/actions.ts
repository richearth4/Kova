'use server'

import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createNotification, sendSMSNotification } from '@/lib/notifications'
import { logAudit } from '@/lib/audit'

export async function verifyLoanRepayment(repaymentId: string, status: 'CONFIRMED' | 'REJECTED') {
  const dbUser = await requireRole(['ADMIN', 'SECRETARY'])

  try {
    const repayment = await prisma.$transaction(async (tx) => {
      const updated = await tx.loanRepayment.update({
        where: { id: repaymentId },
        data: { status },
        include: { loan: { include: { user: true } } }
      })

      // Auto-close loan when fully repaid
      if (status === 'CONFIRMED') {
        const allConfirmed = await tx.loanRepayment.aggregate({
          where: { loanId: updated.loanId, status: 'CONFIRMED' },
          _sum: { amount: true }
        })
        const totalPaid = Number(allConfirmed._sum.amount || 0)
        const totalOwed = Number(updated.loan.totalRepayment)

        if (totalPaid >= totalOwed) {
          await tx.loan.update({
            where: { id: updated.loanId },
            data: { status: 'CLOSED' }
          })

          // Trigger SMS alerts for loan completion
          const completionMessage = `Congratulations ${updated.loan.user.firstName}, your loan (ID: ${updated.loan.id.slice(0,8)}) has been fully repaid and is now CLOSED.`
          
          // 1. Notify Member
          await sendSMSNotification(updated.loan.userId, completionMessage)

          // 2. Notify Admins
          const admins = await tx.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
          })
          
          const adminAlert = `Loan Completion Alert: Member ${updated.loan.user.firstName} ${updated.loan.user.lastName} has completed repayment for loan ${updated.loan.id.slice(0,8)}.`
          for (const admin of admins) {
            await sendSMSNotification(admin.id, adminAlert)
          }
        }
      }

      return updated
    })

    await createNotification(
      repayment.loan.userId,
      `Loan Repayment ${status === 'CONFIRMED' ? 'Approved' : 'Rejected'}`,
      `Your repayment of ₦${Number(repayment.amount).toLocaleString()} has been ${status.toLowerCase()}.`
    )

    await logAudit({
      action: 'REPAYMENT_VERIFY',
      entityId: repaymentId,
      entityType: 'REPAYMENT',
      details: { adminId: dbUser.id, status, amount: repayment.amount.toString() }
    })

    revalidatePath('/admin/repayments')
    revalidatePath('/admin/loans')
    revalidatePath('/member/loans')
    revalidatePath('/member')
    return { success: true }
  } catch (error) {
    console.error('Repayment verification error:', error)
    return { success: false, error: 'Failed to verify repayment' }
  }
}

export async function processBulkTransactions(data: { staffId: string, amount: number, type: 'LOAN' | 'SAVINGS', goalId?: string }[]) {
  const dbUser = await requireRole(['ADMIN', 'SECRETARY'])
  const results = { success: 0, failed: 0, errors: [] as string[] }

  try {
    for (const entry of data) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Find User by Staff ID
          const user = await tx.user.findUnique({
            where: { staffId: entry.staffId },
            include: { 
              loans: { where: { status: 'ACTIVE' }, take: 1 },
              savings: entry.goalId ? { where: { id: entry.goalId } } : undefined
            }
          })

          if (!user) throw new Error(`User with Staff ID ${entry.staffId} not found`)

          if (entry.type === 'LOAN') {
            const activeLoan = user.loans[0]
            if (!activeLoan) throw new Error(`No active loan found for Staff ID ${entry.staffId}`)

            const repayment = await tx.loanRepayment.create({
              data: {
                loanId: activeLoan.id,
                amount: entry.amount,
                status: 'CONFIRMED',
              }
            })

            const allConfirmed = await tx.loanRepayment.aggregate({
              where: { loanId: activeLoan.id, status: 'CONFIRMED' },
              _sum: { amount: true }
            })
            const totalPaid = Number(allConfirmed._sum.amount || 0)
            const totalOwed = Number(activeLoan.totalRepayment)

            if (totalPaid >= totalOwed) {
              await tx.loan.update({
                where: { id: activeLoan.id },
                data: { status: 'CLOSED' }
              })
              await sendSMSNotification(user.id, `Congratulations ${user.firstName}, your loan has been fully repaid and is now CLOSED.`)
            } else {
              await sendSMSNotification(user.id, `Loan Payment: ₦${entry.amount.toLocaleString()} received via HR deduction.`)
            }
          } else {
            // SAVINGS
            const contribution = await tx.contribution.create({
              data: {
                userId: user.id,
                amount: entry.amount,
                month: new Date(), // Current month deduction
                status: 'CONFIRMED',
                savingsTargetId: entry.goalId || null
              }
            })

            if (entry.goalId) {
              const target = await tx.savingsTarget.findUnique({ where: { id: entry.goalId } })
              await sendSMSNotification(user.id, `Savings Goal Update: ₦${entry.amount.toLocaleString()} credited to your "${target?.goalName}" goal.`)
            } else {
              await sendSMSNotification(user.id, `Contribution Received: ₦${entry.amount.toLocaleString()} added to your total savings.`)
            }
          }

          await logAudit({
            action: 'BULK_TRANSACTION',
            entityId: user.id,
            entityType: 'TRANSACTION',
            details: { adminId: dbUser.id, staffId: entry.staffId, amount: entry.amount, type: entry.type }
          })
        })
        results.success++
      } catch (err: any) {
        results.failed++
        results.errors.push(`${entry.staffId}: ${err.message}`)
      }
    }

    revalidatePath('/admin/repayments')
    revalidatePath('/member/loans')
    revalidatePath('/member/savings')
    revalidatePath('/member')
    return { success: true, results }
  } catch (error) {
    console.error('Bulk processing error:', error)
    return { success: false, error: 'Fatal error during bulk processing' }
  }
}
