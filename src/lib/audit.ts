import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

interface AuditOptions {
  action: string
  entityId: string
  entityType: string
  details?: Prisma.InputJsonValue
}

export async function logAudit({ action, entityId, entityType, details }: AuditOptions) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityId,
        entityType,
        details: details || {},
      }
    })
  } catch (error) {
    console.error('Audit logging failed:', error)
  }
}
