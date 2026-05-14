import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OrderForm from './OrderForm'

export default async function MemberFoodstuffsPage() {
  const { dbUser } = await requireAuth()

  const [itemsRaw, ordersRaw] = await Promise.all([
    prisma.foodstuffItem.findMany({
      where: { available: true },
      orderBy: { name: 'asc' }
    }),
    prisma.foodstuffOrder.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ])

  const items = itemsRaw.map(item => ({
    ...item,
    price: item.price.toString()
  }))

  const myOrders = ordersRaw.map(order => ({
    ...order,
    totalCost: order.totalCost.toString()
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-700">
      {/* Refined Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-lg font-light tracking-tight text-slate-900 font-display">Logistics & Provisions</h1>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            Cooperative distribution & monthly catalog
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Marketplace Selection */}
        <div className="lg:col-span-8">
          <OrderForm items={items} />
        </div>

        {/* Compact Order History */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3 mb-3 ml-1">
            <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Order History</h2>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
          
          <div className="space-y-3">
            {myOrders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 group hover:border-emerald-100 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                  <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest ${
                    order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                    order.status === 'PROCESSING' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium line-clamp-1 mb-2">{order.description}</p>
                <p className="text-lg font-light text-slate-900 font-display">₦{Number(order.totalCost).toLocaleString()}</p>
              </div>
            ))}
            {myOrders.length === 0 && (
              <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium text-[10px] uppercase tracking-widest">No previous orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
