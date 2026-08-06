import { prisma } from './prisma'

interface AuditOptions {
  action: string
  entityId: string
  entityType: string
  details?: Record<string, unknown> | any
  tenantId?: string
}

export async function logAudit({ action, entityId, entityType, details, tenantId }: AuditOptions) {
  try {
    let resolvedTenantId = tenantId
    if (!resolvedTenantId && entityId) {
      // Best-effort lookup if not provided
      const user = await prisma.user.findFirst({ where: { id: entityId }, select: { tenantId: true } })
      resolvedTenantId = user?.tenantId
    }

    await prisma.auditLog.create({
      data: {
        tenantId: resolvedTenantId || 'unassigned',
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
