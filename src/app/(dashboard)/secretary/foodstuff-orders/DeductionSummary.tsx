'use client'

import React from 'react'

interface Order {
  userId: string
  totalCost: number | string
  description: string
  user: {
    firstName: string
    lastName: string
    staffId: string | null
  }
}

interface GroupedUser {
  name: string
  staffId: string
  total: number
  items: string[]
}

export default function DeductionSummary({ orders }: { orders: Order[] }) {
  // Group orders by user
  const grouped = orders.reduce((acc, order) => {
    const key = order.userId
    if (!acc[key]) {
      acc[key] = {
        name: `${order.user.firstName} ${order.user.lastName}`,
        staffId: order.user.staffId || 'N/A',
        total: 0,
        items: []
      }
    }
    acc[key].total += Number(order.totalCost)
    acc[key].items.push(order.description)
    return acc
  }, {} as Record<string, GroupedUser>)

  const summaries = Object.values(grouped)

  const exportToCSV = () => {
    const headers = ['Member Name', 'Staff ID', 'Total Deduction', 'Items']
    const rows = summaries.map((s: GroupedUser) => [
      s.name,
      s.staffId,
      s.total.toString(),
      s.items.join('; ')
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `foodstuff_deductions_${new Date().toISOString().slice(0,7)}.csv`
    a.click()
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Monthly Deduction Summary</h2>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
          >
            Print Report
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Staff ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Deduction</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {summaries.map((s: GroupedUser, idx: number) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{s.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{s.staffId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">
                  ₦{s.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                  {s.items.join('; ')}
                </td>
              </tr>
            ))}
            {summaries.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 italic">
                  No orders found for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
