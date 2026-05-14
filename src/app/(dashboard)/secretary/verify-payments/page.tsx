import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import VerificationList from './VerificationList'

export default async function VerifyPaymentsPage() {
  await requireRole(['SECRETARY', 'ADMIN'])

  const [contributionProofs, loanRepayments] = await Promise.all([
    prisma.paymentProof.findMany({
      where: { status: 'PENDING_VERIFICATION' },
      include: { user: true, contribution: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.loanRepayment.findMany({
      where: { status: 'PENDING_VERIFICATION' },
      include: { loan: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    })
  ])

  // Map to unified structure
  const pendingVerifications = [
    ...contributionProofs.map(p => ({
      id: p.id,
      type: 'CONTRIBUTION',
      userId: p.userId,
      user: p.user,
      amount: p.amount.toString(),
      fileUrl: p.fileUrl,
      createdAt: p.createdAt,
      details: p.contribution ? `Contribution: ${new Date(p.contribution.month).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}` : 'Contribution'
    })),
    ...loanRepayments.map(r => ({
      id: r.id,
      type: 'LOAN_REPAYMENT',
      userId: r.loan.userId,
      user: r.loan.user,
      amount: r.amount.toString(),
      fileUrl: r.fileUrl,
      createdAt: r.createdAt,
      details: `Loan Repayment (#${r.loan.id.slice(0, 4)})`
    }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
      {/* Refined Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg font-light tracking-tight text-slate-900 font-display">Treasury Verification</h1>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            Action Queue: <span className="text-emerald-500 font-black">{pendingVerifications.length} Proofs Pending</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
          <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Verification Desk</h2>
          <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Real-time monitoring</span>
          </div>
        </div>
        
        <div className="p-2">
          <VerificationList pendingPayments={pendingVerifications} />
        </div>
      </div>
    </div>
  )
}
