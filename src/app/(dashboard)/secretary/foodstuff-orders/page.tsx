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
      user: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Foodstuff Order Processing</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and export the monthly foodstuff distribution records for salary deductions.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-blue-900">Current Period: {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
          <p className="text-xs text-blue-700">Total Orders: {orders.length}</p>
        </div>
      </div>

      <DeductionSummary orders={JSON.parse(JSON.stringify(orders))} />
    </div>
  )
}
