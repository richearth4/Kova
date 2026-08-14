import { describe, it, expect } from 'vitest'
import { calculateFlatLoan, calculateReducingBalanceLoan } from '../amortization'

describe('Amortization Service Tests', () => {
  it('should calculate flat interest loan correctly', () => {
    const principal = 100000
    const duration = 12
    const rate = 0.10 // 10% flat

    const result = calculateFlatLoan(principal, duration, rate)

    expect(result.principal).toBe(principal)
    expect(result.interestAmount).toBe(10000)
    expect(result.totalRepayment).toBe(110000)
    expect(result.monthlyInstallment).toBe(110000 / 12)
    expect(result.schedule).toHaveLength(12)
    expect(result.schedule[0].installment).toBe(110000 / 12)
    expect(result.schedule[11].remainingBalance).toBe(0)
  })

  it('should calculate reducing balance loan correctly', () => {
    const principal = 100000
    const duration = 12
    const rate = 0.12 // 12% reducing rate (1% monthly)

    const result = calculateReducingBalanceLoan(principal, duration, rate)

    expect(result.principal).toBe(principal)
    // EMI = 100000 * 0.01 * (1.01^12) / ((1.01^12) - 1) = ~8884.88
    expect(result.monthlyInstallment).toBeCloseTo(8884.88, 1)
    expect(result.schedule).toHaveLength(12)
    
    // Total interest should be positive
    expect(result.interestAmount).toBeGreaterThan(0)
    expect(result.interestAmount).toBeLessThan(12000) // Reducing balance interest < flat 12% simple interest (12000)
    
    // Final balance must be zero
    expect(result.schedule[11].remainingBalance).toBeCloseTo(0, 1)
  })
})
