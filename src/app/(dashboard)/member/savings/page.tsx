import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SavingsForm from './SavingsForm'
import SavingsProgress from './SavingsProgress'
import ContributionStatementButton from './ContributionStatementButton'

export default async function SavingsPage() {
  const { dbUser } = await requireAuth()

  const targets = (await prisma.savingsTarget.findMany({
    where: { userId: dbUser.id },
    include: { 
      contributions: {
        where: { status: 'CONFIRMED' },
        select: { amount: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  })).map(target => ({
    id: target.id,
    goalName: target.goalName,
    targetAmount: target.targetAmount.toString(),
    savedAmount: target.contributions.reduce((sum, c) => sum + Number(c.amount), 0).toString(),
  }))

  const contributions = await prisma.contribution.findMany({
    where: { userId: dbUser.id, status: 'CONFIRMED' },
    orderBy: { month: 'desc' }
  })

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
      {/* Refined Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-lg font-light tracking-tight text-slate-900 font-display">Capital Accumulation</h1>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            Goal Tracking & Contribution History
          </p>
        </div>
        <ContributionStatementButton 
          contributions={JSON.parse(JSON.stringify(contributions))} 
          userName={`${dbUser.firstName} ${dbUser.lastName}`} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Compact Form */}
        <div className="lg:col-span-4">
          <SavingsForm />
        </div>

        {/* Dynamic Progress Grid */}
        <div className="lg:col-span-8">
          <div className="flex items-center gap-3 mb-3 ml-1">
            <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Your Goals</h2>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
          <SavingsProgress targets={targets} />
        </div>
      </div>
    </div>
  )
}
