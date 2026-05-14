'use client'

import React, { useState } from 'react'
import FinancialStatement from './FinancialStatement'

export default function MemberDashboardClient({ children, user, stats, history }: { 
  children: React.ReactNode,
  user: any,
  stats: any,
  history: any[]
}) {
  const [showStatement, setShowStatement] = useState(false)

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Member Dashboard</h1>
        <button 
          onClick={() => setShowStatement(true)}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Statement
        </button>
      </div>

      {children}

      {showStatement && (
        <FinancialStatement 
          user={user}
          stats={stats}
          history={history}
          onClose={() => setShowStatement(false)}
        />
      )}
    </>
  )
}
