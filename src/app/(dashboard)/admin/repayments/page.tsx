import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import RepaymentVerifyList from './RepaymentVerifyList'
import BulkRepaymentUpload from './BulkRepaymentUpload'

export default async function AdminRepaymentsPage() {
  await requireRole(['ADMIN', 'SECRETARY'])

  const pendingRepayments = (await prisma.loanRepayment.findMany({
    where: { status: 'PENDING_VERIFICATION' },
    include: { 
      loan: {
        include: { user: true }
      }
    },
    orderBy: { createdAt: 'asc' },
  })).map(r => ({
    ...r,
    amount: r.amount.toString(),
    loan: {
      ...r.loan,
      principal: r.loan.principal.toString(),
      interestAmount: r.loan.interestAmount.toString(),
      totalRepayment: r.loan.totalRepayment.toString(),
    }
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Refined Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg font-light tracking-tight text-slate-900 font-display">Credit Recovery</h1>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            Queue: <span className={pendingRepayments.length > 0 ? 'text-amber-500' : 'text-emerald-500'}>
              {pendingRepayments.length} Pending
            </span>
          </p>
        </div>
      </div>

      <BulkRepaymentUpload />

      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
          <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Recovery Queue</h2>
          <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
             <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Active Verification</span>
          </div>
        </div>
        <div className="p-2">
          <RepaymentVerifyList pendingRepayments={pendingRepayments} />
        </div>
      </div>
    </div>
  )
}
