import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function SecretaryDashboard() {
  await requireRole(['SECRETARY', 'ADMIN'])

  const [
    pendingContributions,
    pendingRepayments,
    pendingLoans,
    pendingFoodOrders
  ] = await Promise.all([
    prisma.paymentProof.count({ where: { status: 'PENDING_VERIFICATION' } }),
    prisma.loanRepayment.count({ where: { status: 'PENDING_VERIFICATION' } }),
    prisma.loan.count({ where: { status: 'PENDING' } }),
    prisma.foodstuffOrder.count({ 
      where: { 
        status: 'PENDING',
        month: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } 
      } 
    })
  ])

  const totalPendingVerifications = pendingContributions + pendingRepayments

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
            <h1 className="text-lg font-light tracking-tight text-slate-900 font-display">Operational Command</h1>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
              Role: <span className="text-emerald-500 font-black">Secretary</span> | System Fully Online
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
          <p className="text-[10px] font-black text-slate-900 leading-none mt-1">Sess: {new Date().getHours()}:00</p>
        </div>
      </div>
      
      {/* KPI Grid — High Density */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Pending Verifications', count: totalPendingVerifications, sub: 'Vault', href: '/secretary/verify-payments', color: totalPendingVerifications > 0 ? 'text-amber-500' : 'text-slate-400', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Loan Applications', count: pendingLoans, sub: 'Credit', href: '/admin/loans', color: pendingLoans > 0 ? 'text-amber-500' : 'text-slate-400', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1' },
          { label: 'Logistics Orders', count: pendingFoodOrders, sub: 'Supply', href: '/secretary/foodstuff-orders', color: pendingFoodOrders > 0 ? 'text-emerald-500' : 'text-slate-400', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-emerald-100 transition-all flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={kpi.icon} />
                </svg>
              </div>
              <span className="text-[8px] font-black text-slate-200 uppercase tracking-widest">{kpi.sub}</span>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{kpi.label}</p>
              <h3 className={`text-2xl font-light tracking-tighter mt-2 font-display ${kpi.color}`}>{kpi.count}</h3>
            </div>
            <Link href={kpi.href} className="mt-4 w-full flex items-center justify-center py-2 bg-slate-50 text-[8px] font-black text-slate-400 uppercase tracking-widest rounded-xl hover:bg-kova-midnight hover:text-white transition-all">
              Process Desk
            </Link>
          </div>
        ))}
      </div>

      {/* Monthly Closing — Refined Banner */}
      <div className="rounded-[1.5rem] p-8 text-white relative overflow-hidden shadow-2xl mt-2"
        style={{ background: 'linear-gradient(135deg, #020617 0%, #1E3A5F 100%)' }}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">KOVA Operational Desk</p>
            </div>
            <h2 className="text-xl font-light tracking-tight font-display">Cycle Reconciliation</h2>
            <p className="text-[11px] text-white/50 font-medium max-w-sm leading-relaxed">Execute the monthly cycle closure to freeze contribution logs and generate payroll deduction artifacts.</p>
          </div>
          <Link href="/secretary/foodstuff-orders"
            className="flex-shrink-0 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-900 transition-all shadow-xl bg-white hover:scale-[1.02] active:scale-[0.98]">
            Authorize Closing
          </Link>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent"></div>
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl"></div>
      </div>
    </div>
  )
}
