import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logAudit, verifyAuditChain, computeAuditHash } from '../audit'
import { prisma } from '../prisma'

vi.mock('../prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn()
    },
    auditLog: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn()
    }
  }
}))

describe('Cryptographic Audit Ledger Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should create audit logs linked by hashes', async () => {
    // 1. Mock first log finding (none exists)
    vi.mocked(prisma.auditLog.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ tenantId: 'tenant-1' } as any)

    await logAudit({
      action: 'USER_LOGIN',
      entityId: 'user-1',
      entityType: 'USER',
      details: { ip: '127.0.0.1' },
      tenantId: 'tenant-1'
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          previousHash: null,
          hash: expect.any(String)
        })
      })
    )
  })

  it('should detect tampering in audit log chain', async () => {
    // Mock database contents with a tampered block
    const mockLogs = [
      {
        id: 'log-1',
        tenantId: 'tenant-1',
        action: 'USER_LOGIN',
        entityId: 'user-1',
        entityType: 'USER',
        details: { ip: '127.0.0.1' },
        previousHash: null,
        hash: ''
      },
      {
        id: 'log-2',
        tenantId: 'tenant-1',
        action: 'LOAN_APPROVED',
        entityId: 'loan-1',
        entityType: 'LOAN',
        details: { amount: 50000 },
        previousHash: '', // Will calculate correctly
        hash: 'invalid-tampered-hash' // Force mismatch!
      }
    ]

    mockLogs[0].hash = computeAuditHash(mockLogs[0])
    mockLogs[1].previousHash = mockLogs[0].hash

    vi.mocked(prisma.auditLog.findMany).mockResolvedValue(mockLogs as any)

    const verification = await verifyAuditChain()
    expect(verification.healthy).toBe(false)
    expect(verification.tamperedLogIds).toContain('log-2')
  })
})
