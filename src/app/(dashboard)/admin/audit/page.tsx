import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AuditLog } from '@prisma/client'

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string, entity?: string, page?: string }>
}) {
  const params = await searchParams
  const action = params.action
  const entity = params.entity
  const page = Number(params.page) || 1
  const pageSize = 50
  const skip = (page - 1) * pageSize

  await requireRole(['ADMIN'])

  const where: { action?: { contains: string }, entityType?: string } = {}
  if (action && action !== 'ALL') where.action = { contains: action }
  if (entity && entity !== 'ALL') where.entityType = entity

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.auditLog.count({ where })
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">System Transparency</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Audit Trail: <span className="text-primary">{logs.length} Recent Events</span></p>
        </div>
        
        <form className="bg-card p-1.5 rounded-2xl border border-border shadow-sm flex flex-wrap gap-2 items-center">
          <select 
            name="action" 
            defaultValue={action || 'ALL'}
            className="block pl-3 pr-8 py-1.5 bg-muted/50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer text-foreground"
          >
            <option value="ALL">All Actions</option>
            <option value="APPROVE">Approvals</option>
            <option value="REJECT">Rejections</option>
            <option value="UPDATE">Updates</option>
            <option value="CREATE">Creation</option>
          </select>
          <select 
            name="entity" 
            defaultValue={entity || 'ALL'}
            className="block pl-3 pr-8 py-1.5 bg-muted/50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer text-foreground"
          >
            <option value="ALL">All Entities</option>
            <option value="USER">User</option>
            <option value="LOAN">Loan</option>
            <option value="REPAYMENT">Repayment</option>
            <option value="CONTRIBUTION">Contribution</option>
            <option value="FOODSTUFF">Foodstuff</option>
          </select>
          <button 
            type="submit"
            className="px-4 py-1.5 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-sm"
          >
            Filter
          </button>
          {(action || entity) && (
            <a href="/admin/audit" className="px-3 py-1.5 bg-muted text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all">
              Reset
            </a>
          )}
        </form>
      </div>
      
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="bg-muted/50">
              <th className="pro-table-header">Timestamp</th>
              <th className="pro-table-header">Operation</th>
              <th className="pro-table-header">Target Entity</th>
              <th className="pro-table-header">System Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(logs as AuditLog[]).map((log: AuditLog) => (
              <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-[10px] font-black text-foreground">
                    {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-[9px] text-muted-foreground font-medium tracking-tighter">
                    {new Date(log.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md ${
                    log.action.includes('REJECT') ? 'bg-red-500/10 text-red-500' :
                    log.action.includes('APPROVE') || log.action.includes('VERIFY') ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {log.action.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-tighter">{log.entityType}</div>
                  <div className="text-[9px] text-muted-foreground font-mono">ID: {log.entityId.slice(0, 12)}...</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-[9px] text-muted-foreground font-mono line-clamp-1 max-w-xs hover:line-clamp-none transition-all cursor-help">
                    {JSON.stringify(log.details)}
                  </div>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  No operational records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-card px-4 py-3 rounded-2xl border border-border shadow-sm">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Showing {skip + 1} to {Math.min(skip + pageSize, total)} of {total} events
          </div>
          <div className="flex gap-2">
            <a 
              href={`/admin/audit?page=${page - 1}${action ? `&action=${action}` : ''}${entity ? `&entity=${entity}` : ''}`}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                page <= 1 ? 'bg-muted text-muted-foreground pointer-events-none' : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              Previous
            </a>
            <a 
              href={`/admin/audit?page=${page + 1}${action ? `&action=${action}` : ''}${entity ? `&entity=${entity}` : ''}`}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                page >= totalPages ? 'bg-muted text-muted-foreground pointer-events-none' : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              Next
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
