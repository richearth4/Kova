import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AdminReportButton from './AdminReportButton'

export default async function AdminDashboard() {
  await requireRole(['ADMIN', 'SECRETARY'])

  // Parallelize aggregates
  const stats = await Promise.all([
    prisma.user.count(),
    prisma.contribution.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { amount: true }
    }),
    prisma.loan.aggregate({
      where: { status: { in: ['ACTIVE', 'APPROVED'] } },
      _sum: { totalRepayment: true }
    }),
    prisma.loanRepayment.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { amount: true }
    }),
    prisma.loan.count({ where: { status: 'PENDING' } }),
    prisma.loanRepayment.count({ where: { status: 'PENDING_VERIFICATION' } }),
    prisma.contribution.count({ where: { status: 'PENDING_VERIFICATION' } })
  ])

  const [
    userCount, totalContributions, totalLoans, totalRepaid,
    pendingLoans, pendingRepayments, pendingContributions
  ] = stats

  const capital = Number(totalContributions._sum.amount || 0)
  const loans = Number(totalLoans._sum.totalRepayment || 0)
  const repaid = Number(totalRepaid._sum.amount || 0)
  const outstanding = loans - repaid

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-700">
      {/* Refined Mini Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-kova-midnight shadow-lg">
            <svg viewBox="0 0 32 32" className="h-4 w-4" fill="none">
              <rect x="8" y="7" width="3.5" height="18" rx="1.5" fill="#10B981"/>
              <path d="M11.5 16 L22 7.5" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M11.5 16 L22 24.5" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-light tracking-tight text-slate-900 font-display">Financial Command</h1>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
              Network: <span className="text-emerald-500">Secure</span> | {userCount} Active Members
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest hidden md:block">{new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
          <AdminReportButton stats={{ 
            userCount, capital, outstanding, repaid, 
            recoveryRate: loans > 0 ? Math.round((repaid / loans) * 100) : 100 
          }} />
        </div>
      </div>

      {/* KPI Grid — High Density */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Capital Pool', val: capital, sub: 'Assets', color: 'text-slate-900' },
          { label: 'Active Debt', val: outstanding, sub: 'Exposure', color: 'text-amber-500' },
          { label: 'Total Repaid', val: repaid, sub: 'Recovery', color: 'text-emerald-500' },
          { label: 'Recovery', val: `${loans > 0 ? Math.round((repaid / loans) * 100) : 100}%`, sub: 'Rate', color: 'text-kova-midnight' }
        ].map((kpi: { label: string; val: string | number; sub: string; color: string }) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-emerald-100 transition-all">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{kpi.label}</p>
            <p className={`text-xl font-light tracking-tighter mt-2 font-display ${kpi.color}`}>
              {typeof kpi.val === 'number' ? `₦${kpi.val.toLocaleString()}` : kpi.val}
            </p>
            <div className="h-px w-full bg-slate-50 mt-3 mb-2"></div>
            <p className="text-[7px] text-slate-300 font-black uppercase tracking-[0.2em]">{kpi.sub} sync successful</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Action Queue — Dot Status Style */}
        <div className="lg:col-span-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Action Queue</h3>
            <div className="flex items-center gap-1.5">
               <div className={`h-1.5 w-1.5 rounded-full ${(pendingLoans + pendingRepayments + pendingContributions) > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{pendingLoans + pendingRepayments + pendingContributions} Active</span>
            </div>
          </div>
          <div className="p-2 space-y-1">
            {[
              { label: 'Loan Applications', count: pendingLoans, href: '/admin/loans', color: 'text-amber-500', dot: 'bg-amber-400' },
              { label: 'Repayment Proofs', count: pendingRepayments, href: '/admin/repayments', color: 'text-emerald-500', dot: 'bg-emerald-400' },
              { label: 'Contribution Logs', count: pendingContributions, href: '/secretary/verify-payments', color: 'text-emerald-500', dot: 'bg-emerald-400' },
            ].map((item: { label: string; count: number; href: string; color: string; dot: string }) => (
              <Link key={item.label} href={item.href} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className={`h-1 w-1 rounded-full ${item.count > 0 ? item.dot : 'bg-slate-100'}`}></div>
                  <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900">{item.label}</span>
                </div>
                <span className={`text-[11px] font-black tracking-tight ${item.count > 0 ? item.color : 'text-slate-200'}`}>{item.count || '—'}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Global Governance */}
        <div className="lg:col-span-7 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4 ml-1">
            <h3 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Governance Desk</h3>
            <div className="h-px flex-1 bg-slate-50"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/members', label: 'Identity Registry', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
              { href: '/admin/loans', label: 'Credit Control', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { href: '/admin/repayments', label: 'Asset Recovery', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { href: '/admin/audit', label: 'Security Audit', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            ].map((link: { href: string; label: string; icon: string }) => (
              <Link key={link.href} href={link.href} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl hover:bg-kova-midnight group transition-all border border-slate-50">
                <div className="h-7 w-7 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-white/10 transition-colors">
                  <svg className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={link.icon} />
                  </svg>
                </div>
                <p className="text-[11px] font-semibold text-slate-700 group-hover:text-white leading-tight">{link.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
