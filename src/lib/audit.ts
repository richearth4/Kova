import { prisma } from './prisma'

interface AuditOptions {
  action: string
  entityId: string
  entityType: string
  details?: Record<string, unknown> | any

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
