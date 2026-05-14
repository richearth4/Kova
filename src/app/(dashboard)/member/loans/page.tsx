import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import LoanApplicationForm from './LoanApplicationForm'
import RepaymentForm from './RepaymentForm'
import LoanStatementButton from './LoanStatementButton'

export default async function LoansPage() {
  const { dbUser } = await requireAuth()

  // Calculate max eligible: 2x total contributions
  const contributions = await prisma.contribution.aggregate({
    where: { 
      userId: dbUser.id,
      status: 'CONFIRMED'
    },
    _sum: {
      amount: true
    }
  })

  const totalContributions = Number(contributions._sum.amount || 0)
  const maxEligible = totalContributions * 2

  const loanHistory = (await prisma.loan.findMany({
    where: { userId: dbUser.id },
    include: { repayments: true },
    orderBy: { createdAt: 'desc' },
  })).map(loan => ({
    ...loan,
    principal: loan.principal.toString(),
    interestAmount: loan.interestAmount.toString(),
    totalRepayment: loan.totalRepayment.toString(),
    repayments: loan.repayments.map(r => ({
      ...r,
      amount: r.amount.toString()
    }))
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-700">
      {/* Refined Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-lg font-light tracking-tight text-slate-900 font-display">Financial Leverage</h1>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            Credit Line & Repayment Management
          </p>
        </div>
        <LoanStatementButton 
          loans={loanHistory} 
          userName={`${dbUser.firstName} ${dbUser.lastName}`} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Compact Management Panel */}
        <div className="lg:col-span-5 space-y-6">
          <LoanApplicationForm maxEligible={maxEligible} />
          
          <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                  <svg viewBox="0 0 24 24" className="h-3 w-3 text-emerald-400" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Source Recovery</h3>
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-white/60">
                Loan repayments are now automatically processed at source via HR monthly payout deductions. 
                Your balance will update in real-time as these entries are confirmed by the treasury.
              </p>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">● Active Monitoring Enabled</p>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl"></div>
          </div>
        </div>

        {/* High-Density Ledger */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Credit Ledger</h2>
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">History</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-slate-50/10">
                    <th className="pro-table-header px-4 w-[35%]">Principal</th>
                    <th className="pro-table-header px-4 w-[25%] text-center">Status</th>
                    <th className="pro-table-header px-4 w-[40%] text-right">Repayment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loanHistory.map((loan) => {
                    const confirmedRepayments = loan.repayments
                      .filter(r => r.status === 'CONFIRMED')
                      .reduce((sum, r) => sum + Number(r.amount), 0)
                    
                    const remainingBalance = Number(loan.totalRepayment) - confirmedRepayments

                    return (
                      <tr key={loan.id} className="pro-table-row group hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-700 leading-tight">₦{Number(loan.principal).toLocaleString()}</p>
                          <p className="text-[8px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
                            {loan.durationMonths}M | {new Date(loan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${
                            loan.status === 'ACTIVE' ? 'text-emerald-500 bg-emerald-50/5' :
                            loan.status === 'PENDING' ? 'text-amber-500 bg-amber-50/5' : 
                            'text-slate-400 bg-slate-50'
                          }`}>{loan.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="text-[11px] font-bold text-slate-900 tracking-tight">₦{Number(loan.totalRepayment).toLocaleString()}</p>
                          {loan.status === 'ACTIVE' && (
                            <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-0.5">
                              Left: ₦{remainingBalance.toLocaleString()}
                            </p>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {loanHistory.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-[9px] font-bold text-slate-200 uppercase tracking-[0.3em]">No Credit History</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
