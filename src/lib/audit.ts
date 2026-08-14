import { prisma } from './prisma'
import crypto from 'crypto'

interface AuditOptions {
  action: string
  entityId: string
  entityType: string
  details?: Record<string, unknown> | any
  tenantId?: string
}

/**
 * Computes the SHA-256 hash of an audit log block.
 */
export function computeAuditHash(entry: {
  tenantId: string
  action: string
  entityId: string
  entityType: string
  details: any
  previousHash: string | null
}): string {
  const serialized = JSON.stringify({
    tenantId: entry.tenantId,
    action: entry.action,
    entityId: entry.entityId,
    entityType: entry.entityType,
    details: entry.details,
    previousHash: entry.previousHash
  })
  return crypto.createHash('sha256').update(serialized).digest('hex')
}

/**
 * Creates a cryptographically-secured audit log entry.
 */
export async function logAudit({ action, entityId, entityType, details, tenantId }: AuditOptions) {
  try {
    let resolvedTenantId = tenantId
    if (!resolvedTenantId && entityId) {
      const user = await prisma.user.findFirst({ where: { id: entityId }, select: { tenantId: true } })
      resolvedTenantId = user?.tenantId
    }

    const tenantToLog = resolvedTenantId || 'unassigned'
    const cleanDetails = details || {}

    // Find the latest block in the audit chain to link to
    const lastLog = await prisma.auditLog.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    const previousHash = lastLog?.hash || null
    const hash = computeAuditHash({
      tenantId: tenantToLog,
      action,
      entityId,
      entityType,
      details: cleanDetails,
      previousHash
    })

    await prisma.auditLog.create({
      data: {
        tenantId: tenantToLog,
        action,
        entityId,
        entityType,
        details: cleanDetails,
        previousHash,
        hash
      }
    })
  } catch (error) {
    console.error('Audit logging failed:', error)
  }
}

/**
 * Traverses the entire audit log database to verify chain integrity.
 * Returns a list of tampered audit log IDs if database tempering is detected.
 */
export async function verifyAuditChain(): Promise<{ healthy: boolean; tamperedLogIds: string[] }> {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'asc' }
    })

    let previousHash: string | null = null
    const tamperedLogIds: string[] = []

    for (const log of logs) {
      // 1. Verify previous hash matching link
      if (log.previousHash !== previousHash) {
        tamperedLogIds.push(log.id)
      }

      // 2. Recalculate block hash to check content modifications
      const calculatedHash = computeAuditHash({
        tenantId: log.tenantId,
        action: log.action,
        entityId: log.entityId,
        entityType: log.entityType,
        details: log.details,
        previousHash: log.previousHash
      })

      if (log.hash !== calculatedHash) {
        tamperedLogIds.push(log.id)
      }

      previousHash = log.hash
    }

    return {
      healthy: tamperedLogIds.length === 0,
      tamperedLogIds
    }
  } catch (error) {
    console.error('Audit verification failed:', error)
    return { healthy: false, tamperedLogIds: [] }
  }
}
