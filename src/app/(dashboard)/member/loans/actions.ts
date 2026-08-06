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

  // 1. Calculate max eligible: 3x total confirmed contributions (SRS specification)
  const contributions = await prisma.contribution.aggregate({
    where: { 
      userId: dbUser.id,
      status: 'CONFIRMED'
    },
    _sum: {
      amount: true
    }
  })

  const totalContributions = Number(contributions._sum.amount || 0)
  const maxEligible = totalContributions * 3

  if (principal > maxEligible) {
    return { 
      success: false, 
      error: `Requested loan (₦${principal.toLocaleString()}) exceeds your contribution eligibility limit of ₦${maxEligible.toLocaleString()} (3x your ₦${totalContributions.toLocaleString()} total confirmed contributions)` 
    }
  }

  // 2. Simple interest calculation: 10% flat rate (SRS specification)
  const interestRate = 0.10
  const interestAmount = principal * interestRate
  const totalRepayment = principal + interestAmount

  try {
    await prisma.loan.create({
      data: {
        tenantId: dbUser.tenantId,
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
