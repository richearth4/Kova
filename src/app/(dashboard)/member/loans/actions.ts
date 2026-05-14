'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { LoanType } from '@prisma/client'

export async function applyForLoan(formData: FormData) {
  const { dbUser } = await requireAuth()

  const principal = parseFloat(formData.get('principal') as string)
  const durationMonths = parseInt(formData.get('duration') as string)
  const loanType = formData.get('loanType') as LoanType || 'PERSONAL'

  if (isNaN(principal) || principal <= 0) {
    return { success: false, error: 'Invalid principal amount' }
  }

  // Simple interest calculation: 5% flat rate for now
  const interestRate = 0.05
  const interestAmount = principal * interestRate
  const totalRepayment = principal + interestAmount

  try {
    await prisma.loan.create({
      data: {
        userId: dbUser.id,
        principal,
        interestAmount,
        totalRepayment,
        durationMonths,
        loanType,
        status: 'PENDING',
      },
    })

    revalidatePath('/member/loans')
    revalidatePath('/member')
    return { success: true }
  } catch (error) {
    console.error('Loan application error:', error)
    return { success: false, error: 'Failed to submit loan application' }
  }
}
