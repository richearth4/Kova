'use client'

import React, { useState, useTransition } from 'react'
import { updateFoodstuffOrderStatus, type OrderStatus } from './actions'

interface Order {
  id: string
  userId: string
  totalCost: number | string
  description: string
  status: string
  createdAt: string | Date
  user: {
    firstName: string
    lastName: string
    staffId: string | null
  }
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  PENDING:    { label: 'Pending',    dot: 'bg-amber-400',  text: 'text-amber-500',  bg: 'bg-amber-50' },
  PROCESSING: { label: 'Processing', dot: 'bg-blue-400',   text: 'text-blue-600',   bg: 'bg-blue-50' },
  COMPLETED:  { label: 'Completed',  dot: 'bg-emerald-400',text: 'text-emerald-600',bg: 'bg-emerald-50' },
  CANCELLED:  { label: 'Cancelled',  dot: 'bg-red-400',    text: 'text-red-500',    bg: 'bg-red-50' },
}

function OrderRow({ order, onStatusUpdate }: { order: Order; onStatusUpdate: (id: string, status: string) => void }) {
  const [isPending, startTransition] = useTransition()
  const [localStatus, setLocalStatus] = useState(order.status)
  const cfg = STATUS_CONFIG[localStatus] || STATUS_CONFIG.PENDING

  const handleAction = (newStatus: OrderStatus) => {
    startTransition(async () => {
      const result = await updateFoodstuffOrderStatus(order.id, newStatus)
      if (result.success) {
        setLocalStatus(newStatus)
        onStatusUpdate(order.id, newStatus)
      }
    })
  }

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase flex-shrink-0">
            {order.user.firstName[0]}{order.user.lastName[0]}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-900 leading-tight">{order.user.firstName} {order.user.lastName}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{order.user.staffId || 'No ID'}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 max-w-[200px]">
        <p className="text-[11px] text-slate-600 font-medium line-clamp-2 leading-tight">{order.description}</p>
      </td>
      <td className="px-4 py-4">
        <p className="text-[13px] font-light text-slate-900 font-display tracking-tight">₦{Number(order.totalCost).toLocaleString()}</p>
        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </p>
      </td>
      <td className="px-4 py-4">
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${cfg.bg}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${isPending ? 'animate-pulse' : ''}`}></span>
          <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.text}`}>
            {isPending ? 'Updating...' : cfg.label}
          </span>
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {localStatus === 'PENDING' && (
            <button
              onClick={() => handleAction('PROCESSING')}
              disabled={isPending}
              className="px-3 py-1.5 bg-kova-midnight text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-40 transition-all"
            >
              Process
            </button>
          )}
          {localStatus === 'PROCESSING' && (
            <button
              onClick={() => handleAction('COMPLETED')}
              disabled={isPending}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-40 transition-all"
            >
              Complete
            </button>
          )}
          {(localStatus === 'PENDING' || localStatus === 'PROCESSING') && (
            <button
              onClick={() => handleAction('CANCELLED')}
              disabled={isPending}
              className="px-3 py-1.5 border border-red-100 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-50 disabled:opacity-40 transition-all"
            >
              Cancel
            </button>
          )}
          {(localStatus === 'COMPLETED' || localStatus === 'CANCELLED') && (
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Finalized</span>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function DeductionSummary({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders)

  const handleStatusUpdate = (id: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
  }

  // Group for totals summary
  const grouped = orders.reduce((acc, order) => {
    const key = order.userId
    if (!acc[key]) {
      acc[key] = {
        name: `${order.user.firstName} ${order.user.lastName}`,
        staffId: order.user.staffId || 'N/A',
        total: 0,
        items: [] as string[]
      }
    }
    acc[key].total += Number(order.totalCost)
    acc[key].items.push(order.description)
    return acc
  }, {} as Record<string, { name: string; staffId: string; total: number; items: string[] }>)

  const summaries = Object.values(grouped)

  const totalValue = orders.reduce((sum, o) => sum + Number(o.totalCost), 0)
  const completedValue = orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + Number(o.totalCost), 0)

  const exportToCSV = () => {
    const headers = ['Member Name', 'Staff ID', 'Total Deduction', 'Items']
    const rows = summaries.map(s => [
      s.name,
      s.staffId,
      s.total.toString(),
      `"${s.items.join('; ')}"`
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kova_logistics_${new Date().toISOString().slice(0, 7)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', val: orders.length, color: 'text-slate-900' },
          { label: 'Total Value', val: `₦${totalValue.toLocaleString()}`, color: 'text-amber-500' },
          { label: 'Fulfilled', val: `₦${completedValue.toLocaleString()}`, color: 'text-emerald-500' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            <p className={`text-xl font-light tracking-tight mt-1 font-display ${kpi.color}`}>{kpi.val}</p>
          </div>
        ))}
      </div>

      {/* Order Management Table */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
          <div className="flex items-center gap-3">
            <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Order Queue</h2>
            <div className="h-1 w-1 rounded-full bg-slate-200"></div>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{orders.length} Orders This Cycle</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors flex items-center gap-2 border border-emerald-100"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
            >
              Print
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="pro-table-header px-4 text-left">Member</th>
                <th className="pro-table-header px-4 text-left">Items Ordered</th>
                <th className="pro-table-header px-4 text-left">Amount</th>
                <th className="pro-table-header px-4 text-left">Status</th>
                <th className="pro-table-header px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map(order => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">No orders this cycle</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payroll Deduction Summary */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/20">
          <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Payroll Deduction Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="pro-table-header px-4 text-left">Member</th>
                <th className="pro-table-header px-4 text-left">Staff ID</th>
                <th className="pro-table-header px-4 text-left">Total Deduction</th>
                <th className="pro-table-header px-4 text-left">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {summaries.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-[11px] font-bold text-slate-900">{s.name}</td>
                  <td className="px-4 py-3 text-[10px] font-mono text-slate-400">{s.staffId}</td>
                  <td className="px-4 py-3 text-[13px] font-light text-slate-900 font-display">₦{s.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[10px] text-slate-500 max-w-xs truncate">{s.items.join('; ')}</td>
                </tr>
              ))}
              {summaries.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[9px] font-black text-slate-200 uppercase tracking-widest">
                    No orders found for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
