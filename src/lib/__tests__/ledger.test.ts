import { describe, it, expect, vi } from 'vitest'
import { postJournalEntry } from '../ledger'
import { AccountType, Prisma } from '@prisma/client'

describe('Double-Entry Ledger Service Tests', () => {
  it('should validate that total debits equal total credits', async () => {
    const mockTx = {
      journalEntry: {
        create: vi.fn().mockResolvedValue({ id: 'journal-123' })
      },
      ledgerEntry: {
        create: vi.fn().mockResolvedValue({ id: 'ledger-entry-1' })
      },
      account: {
        findUnique: vi.fn().mockResolvedValue({ id: 'acc-1', type: AccountType.ASSET }),
        update: vi.fn().mockResolvedValue({})
      }
    } as unknown as Prisma.TransactionClient

    const postings = [
      { accountId: 'acc-cash', debit: 1500, credit: 0 },
      { accountId: 'acc-savings', debit: 0, credit: 1500 }
    ]

    const result = await postJournalEntry(
      'tenant-123',
      'ref-001',
      'Test transaction',
      postings,
      mockTx
    )

    expect(result.id).toBe('journal-123')
    expect(mockTx.journalEntry.create).toHaveBeenCalled()
    expect(mockTx.ledgerEntry.create).toHaveBeenCalledTimes(2)
  })

  it('should throw an error if debits and credits do not balance', async () => {
    const mockTx = {} as Prisma.TransactionClient
    const postings = [
      { accountId: 'acc-cash', debit: 1500, credit: 0 },
      { accountId: 'acc-savings', debit: 0, credit: 1000 } // Unbalanced!
    ]

    await expect(
      postJournalEntry('tenant-123', 'ref-002', 'Unbalanced transaction', postings, mockTx)
    ).rejects.toThrow('Double-entry integrity check failed')
  })
})
