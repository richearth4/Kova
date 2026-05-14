import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MemberDashboardClient from './MemberDashboardClient'
import Link from 'next/link'

export default async function MemberDashboard() {
  const dbUser = await requireRole(['MEMBER', 'SECRETARY', 'ADMIN'])

  // Parallelize independent data fetching
  const [contributions, activeLoans, savings, recentPayments] = await Promise.all([
    prisma.contribution.aggregate({
      where: { userId: dbUser.id, status: 'CONFIRMED' },
      _sum: { amount: true }
    }),
    prisma.loan.findMany({
      where: { userId: dbUser.id, status: 'ACTIVE' },
      include: {
        repayments: { where: { status: 'CONFIRMED' } }
      }
    }),
    prisma.contribution.aggregate({
      where: { 
        userId: dbUser.id, 
        status: 'CONFIRMED',
        NOT: { savingsTargetId: null }
      },
      _sum: { amount: true }
    }),
    prisma.paymentProof.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      take: 8
    })
  ])

  const totalActiveRepaymentAmount = activeLoans.reduce((sum, loan) => sum + Number(loan.totalRepayment), 0)
  const totalConfirmedRepayments = activeLoans.reduce((sum, loan) => {
    const loanRepayments = (loan.repayments as any[]).reduce((rSum, r) => rSum + Number(r.amount), 0)
    return sum + loanRepayments
  }, 0)

  const remainingLoanBalance = totalActiveRepaymentAmount - totalConfirmedRepayments

  const stats = {
    totalContributions: contributions._sum.amount?.toString() || '0.00',
    activeLoanBalance: remainingLoanBalance.toFixed(2),
    totalTargetedSavings: savings._sum.amount?.toString() || '0.00'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-700">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div>
          <h1 className="text-lg font-light tracking-tight text-slate-900 font-display">Member Dashboard</h1>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Welcome back, {dbUser.firstName}</p>
        </div>
        <Link href="/member/payments" className="px-5 py-2 bg-kova-midnight text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-slate-900/10">Download Statement</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
        {/* Main Balance Card — Enhanced Visibility */}
        <div className="lg:col-span-8 rounded-[1.5rem] p-7 text-white relative overflow-hidden shadow-2xl border border-white/5"
          style={{ background: 'linear-gradient(145deg, #020617 0%, #1E3A5F 100%)' }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-white/10 flex items-center justify-center border border-white/10">
                  <svg viewBox="0 0 32 32" className="h-3 w-3" fill="none">
                    <rect x="8" y="7" width="3.5" height="18" rx="1.5" fill="#10B981"/>
                    <path d="M11.5 16 L22 7.5" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>
                    <path d="M11.5 16 L22 24.5" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/50">Collective Assets</p>
              </div>
              <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <p className="text-[7px] font-black text-emerald-400 uppercase tracking-[0.2em]">Active Portfolio</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="md:col-span-1">
                <p className="text-[9px] font-bold text-white uppercase tracking-[0.2em] mb-1">Total Savings</p>
                <h2 className="tracking-tighter text-white font-display drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">₦{Number(stats.totalContributions).toLocaleString()}</h2>
              </div>
              <div className="md:col-span-1">
                <p className="text-[9px] font-bold text-white uppercase tracking-[0.2em] mb-1">Target Goals</p>
                <h2 className="tracking-tighter text-white font-display">₦{Number(stats.totalTargetedSavings).toLocaleString()}</h2>
              </div>
              <div className="md:col-span-1">
                <p className="text-[9px] font-bold text-white uppercase tracking-[0.2em] mb-1">Loan Debt</p>
                <h2 className="tracking-tighter text-white font-display">₦{Number(stats.activeLoanBalance).toLocaleString()}</h2>
              </div>
            </div>
          </div>
          {/* Enhanced readability glow */}
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]"></div>
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent"></div>
        </div>

        {/* Compact Navigation */}
        <div className="lg:col-span-4 bg-white rounded-[1.5rem] border border-slate-100 p-5 shadow-sm flex flex-col justify-center">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-4 ml-1">Portal Navigation</p>
          <div className="space-y-2">
            {[
              { href: '/member/payments', label: 'Contribution', sub: 'Upload Proof', icon: 'M12 4v16m8-8H4', color: 'text-emerald-500' },
              { href: '/member/loans', label: 'Credit', sub: 'Apply', icon: 'M13 7l5 5m0 0l-5 5m5-5H6', color: 'text-amber-500' },
              { href: '/member/savings', label: 'Targets', sub: 'Set Goal', icon: 'M13 7l5 5m0 0l-5 5m5-5H6', color: 'text-slate-400' },
            ].map((act) => (
              <Link key={act.label} href={act.href} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-all group">
                <div className={`h-6 w-6 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-white transition-all ${act.color}`}>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={act.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-700 leading-none">{act.label}</p>
                  <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">{act.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Activity Ledger — Ultra Compact Font */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden mt-2">
        <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
          <div className="flex items-center gap-3">
            <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Activity Ledger</h2>
            <div className="h-1 w-1 rounded-full bg-slate-200"></div>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">History</span>
          </div>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">● Updates in real-time</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-slate-50/20">
                <th className="pro-table-header px-4 text-left w-[40%]">Description</th>
                <th className="pro-table-header px-4 text-left w-[20%]">Category</th>
                <th className="pro-table-header px-4 text-left w-[20%]">Status</th>
                <th className="pro-table-header px-4 text-right w-[20%]">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentPayments.map((activity) => (
                <tr key={activity.id} className="pro-table-row group hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-left overflow-hidden truncate">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-600 truncate">Monthly Contribution</p>
                      <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest whitespace-nowrap">{new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-left">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.1em]">Savings</span>
                  </td>
                  <td className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1 w-1 rounded-full ${
                        activity.status === 'CONFIRMED' ? 'bg-emerald-500' :
                        activity.status === 'REJECTED' ? 'bg-red-500' : 
                        'bg-amber-500'
                      }`}></div>
                      <span className={`text-[7px] font-black uppercase tracking-widest ${
                        activity.status === 'CONFIRMED' ? 'text-emerald-500' :
                        activity.status === 'REJECTED' ? 'text-red-500' : 
                        'text-amber-500'
                      }`}>{activity.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-[11px] font-medium text-slate-900 tracking-tight">₦{Number(activity.amount).toLocaleString()}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentPayments.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[9px] font-bold text-slate-200 uppercase tracking-[0.3em]">No Activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
