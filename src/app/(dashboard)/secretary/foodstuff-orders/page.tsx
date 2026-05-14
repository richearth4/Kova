import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DeductionSummary from './DeductionSummary'

export default async function SecretaryFoodstuffsPage() {
  await requireRole(['SECRETARY', 'ADMIN'])

  // Get orders for the current month
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  
  const orders = await prisma.foodstuffOrder.findMany({
    where: {
      month: {
        gte: startOfMonth
      }
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          staffId: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const serializedOrders = orders.map(o => ({
    id: o.id,
    userId: o.userId,
    description: o.description,
    totalCost: o.totalCost.toString(),
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    user: o.user,
  }))

  const pendingCount = orders.filter(o => o.status === 'PENDING').length

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg font-light tracking-tight text-slate-900 font-display">Logistics Operations</h1>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            Current Period: <span className="text-emerald-500">{new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-500">&bull; {pendingCount} Awaiting Action</span>
            )}
          </p>
        </div>
      </div>

      <DeductionSummary orders={serializedOrders} />
    </div>
  )
}

