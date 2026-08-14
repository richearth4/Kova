import { describe, it, expect, vi } from 'vitest'
import { getOrCreateMemberDVA } from '../paystack'
import { scanReceipt } from '../ocr'
import { prisma } from '../prisma'

vi.mock('../prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
}))

describe('Paystack & OCR Service Tests', () => {
  describe('Paystack DVA Service', () => {
    it('should retrieve existing DVA if already assigned', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        dvaAccountNumber: '9920192812',
        dvaBankName: 'Wema Bank',
        dvaAccountName: 'KOVA - John Doe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe'
      } as any)

      const dva = await getOrCreateMemberDVA('user-123')
      expect(dva.accountNumber).toBe('9920192812')
      expect(dva.bankName).toBe('Wema Bank')
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it('should generate mock DVA when no account exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-456',
        dvaAccountNumber: null,
        dvaBankName: null,
        dvaAccountName: null,
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith'
      } as any)

      vi.mocked(prisma.user.update).mockResolvedValue({} as any)

      const dva = await getOrCreateMemberDVA('user-456')
      expect(dva.accountNumber).toHaveLength(10)
      expect(dva.bankName).toContain('Wema Bank')
      expect(prisma.user.update).toHaveBeenCalled()
    })
  })

  describe('AI OCR Engine Heuristics', () => {
    it('should extract amount and date from typical bank transfer receipt text', async () => {
      const receiptText = `
        ACCESS BANK TRANSFER RECEIPT
        Transaction ID: tx-9281729
        Date: Aug 14 2026
        Amount: NGN 25000.00
        Status: SUCCESSFUL
      `
      const ocrResult = await scanReceipt(receiptText)
      expect(ocrResult.success).toBe(true)
      expect(ocrResult.amount).toBe(25000)
      expect(ocrResult.confidence).toBeGreaterThanOrEqual(0.8)
    })

    it('should fail gracefully if no amount pattern matches', async () => {
      const badText = `Random document text without any payment figures or invoice details.`
      const ocrResult = await scanReceipt(badText)
      expect(ocrResult.success).toBe(false)
      expect(ocrResult.amount).toBeNull()
    })
  })
})
