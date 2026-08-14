export interface AmortizationScheduleRow {
  paymentNo: number
  installment: number
  principalPaid: number
  interestPaid: number
  remainingBalance: number
}

export interface LoanCalculationResult {
  principal: number
  interestAmount: number
  totalRepayment: number
  monthlyInstallment: number
  schedule: AmortizationScheduleRow[]
}

/**
 * Calculates a loan using a Flat Interest Rate (simple interest).
 * Total Interest = Principal * flatRate
 */
export function calculateFlatLoan(
  principal: number,
  durationMonths: number,
  annualRate: number = 0.10 // 10% flat rate
): LoanCalculationResult {
  const interestAmount = principal * annualRate
  const totalRepayment = principal + interestAmount
  const monthlyInstallment = totalRepayment / durationMonths

  const schedule: AmortizationScheduleRow[] = []
  let remainingBalance = totalRepayment

  const principalPerMonth = principal / durationMonths
  const interestPerMonth = interestAmount / durationMonths

  for (let i = 1; i <= durationMonths; i++) {
    remainingBalance -= monthlyInstallment
    schedule.push({
      paymentNo: i,
      installment: monthlyInstallment,
      principalPaid: principalPerMonth,
      interestPaid: interestPerMonth,
      remainingBalance: Math.max(0, remainingBalance)
    })
  }

  return {
    principal,
    interestAmount,
    totalRepayment,
    monthlyInstallment,
    schedule
  }
}

/**
 * Calculates a loan using the Reducing Balance Method (standard EMI amortization).
 * Monthly Payment (EMI) = P * [r(1+r)^n] / [(1+r)^n - 1]
 * where r = annualRate / 12
 */
export function calculateReducingBalanceLoan(
  principal: number,
  durationMonths: number,
  annualRate: number = 0.12 // e.g., 12% reducing balance annual rate
): LoanCalculationResult {
  const r = annualRate / 12
  const n = durationMonths

  let monthlyInstallment = 0
  if (r === 0) {
    monthlyInstallment = principal / n
  } else {
    monthlyInstallment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  }

  const schedule: AmortizationScheduleRow[] = []
  let remainingPrincipal = principal
  let totalInterest = 0

  for (let i = 1; i <= durationMonths; i++) {
    const interestPaid = remainingPrincipal * r
    const principalPaid = monthlyInstallment - interestPaid
    remainingPrincipal -= principalPaid
    totalInterest += interestPaid

    schedule.push({
      paymentNo: i,
      installment: monthlyInstallment,
      principalPaid,
      interestPaid,
      remainingBalance: Math.max(0, remainingPrincipal)
    })
  }

  const totalRepayment = principal + totalInterest

  return {
    principal,
    interestAmount: totalInterest,
    totalRepayment,
    monthlyInstallment,
    schedule
  }
}
