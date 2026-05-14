import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import LoanReviewList from './LoanReviewList'

export default async function AdminLoansPage() {
  await requireRole(['ADMIN', 'SECRETARY'])

  const pendingLoans = (await prisma.loan.findMany({
    where: { status: 'PENDING' },
    include: { 
      user: {
        include: {
          contributions: {
            where: { status: 'CONFIRMED' },
            select: { amount: true }
          }
        }
      } 
    },
    orderBy: { createdAt: 'asc' },
  })).map(loan => {
    const totalContributions = loan.user.contributions.reduce((acc, c) => acc + Number(c.amount), 0)
    return {
      ...loan,
      principal: loan.principal.toString(),
      interestAmount: loan.interestAmount.toString(),
      totalRepayment: loan.totalRepayment.toString(),
      user: {
        id: loan.user.id,
        firstName: loan.user.firstName,
        lastName: loan.user.lastName,
        email: loan.user.email,
        staffId: loan.user.staffId,
        totalContributions
      }
    }
  })

  // Get Summary Stats
  const activeStats = await prisma.loan.aggregate({ 
    where: { status: 'ACTIVE' }, 
    _sum: { principal: true },
    _count: { id: true }
  })

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-700">
      {/* Refined Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg font-light tracking-tight text-slate-900 font-display">Credit Governance</h1>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            Loan Review: <span className="text-amber-500">{pendingLoans.length} Pending Approval</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Active Exposure</p>
            <p className="text-[12px] font-black text-slate-900 leading-none">₦{Number(activeStats._sum.principal || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Review Queue</h2>
            <div className="h-1 w-1 rounded-full bg-amber-400"></div>
          </div>
          <div className="p-2">
            <LoanReviewList pendingLoans={pendingLoans} />
          </div>
        </div>
      </div>
    </div>
  )
}
