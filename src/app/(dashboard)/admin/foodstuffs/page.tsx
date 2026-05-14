import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import InventoryList from './InventoryList'

export default async function AdminFoodstuffsPage() {
  await requireRole(['ADMIN', 'SECRETARY'])

  const items = (await prisma.foodstuffItem.findMany({
    orderBy: { name: 'asc' }
  })).map(item => ({
    ...item,
    price: item.price.toString()
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-700">
      {/* Refined Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg font-light tracking-tight text-slate-900 font-display">Logistics Registry</h1>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            Catalog Management & Stock Availability
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
          <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Inventory Desk</h2>
          <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{items.length} Active SKUs</span>
        </div>
        <div className="p-1">
          <InventoryList initialItems={items} />
        </div>
      </div>
    </div>
  )
}
