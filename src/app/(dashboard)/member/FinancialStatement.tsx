'use client'

import React from 'react'

export default function FinancialStatement({ user, stats, history, onClose }: { 
  user: any, 
  stats: any, 
  history: any[],
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto print:static print:overflow-visible">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0 print:p-0 print:block">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity print:hidden" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl print:shadow-none print:my-0 print:rounded-none">
          <div className="bg-white px-8 pb-8 pt-10 sm:p-12 print:p-0">
            <div className="flex justify-between items-start mb-10 print:mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl">
                  INEC
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Financial Statement</h2>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Co-operative Management System</p>
                </div>
              </div>
              <div className="flex gap-2 print:hidden">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100"
                >
                  Print Statement
                </button>
                <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200">
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10 border-b border-gray-100 pb-8 print:border-gray-200">
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Member Information</h4>
                <p className="text-lg font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-600 font-medium">Staff ID: <span className="font-mono">{user.staffId}</span></p>
                <p className="text-sm text-gray-600 font-medium italic">Statement as at {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Account Summary</h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Net Balance: <span className="text-gray-900 font-black">₦{(Number(stats.totalContributions) - Number(stats.activeLoanBalance)).toLocaleString()}</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 print:bg-white print:border-gray-200">
                <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Total Contributions</p>
                <p className="text-xl font-black text-blue-700">₦{Number(stats.totalContributions).toLocaleString()}</p>
              </div>
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 print:bg-white print:border-gray-200">
                <p className="text-[10px] font-bold text-red-400 uppercase mb-1">Outstanding Loan</p>
                <p className="text-xl font-black text-red-700">₦{Number(stats.activeLoanBalance).toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 print:bg-white print:border-gray-200">
                <p className="text-[10px] font-bold text-purple-400 uppercase mb-1">Targeted Savings</p>
                <p className="text-xl font-black text-purple-700">₦{Number(stats.totalTargetedSavings).toLocaleString()}</p>
              </div>
            </div>

            <section>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2 print:border-gray-200">Transaction History</h3>
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr>
                    <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest py-3">Date</th>
                    <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest py-3">Type</th>
                    <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest py-3">Status</th>
                    <th className="text-right text-[10px] font-black text-gray-400 uppercase tracking-widest py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td className="py-4 text-sm text-gray-600">{new Date(h.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 text-sm font-bold text-gray-900">Contribution</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                          h.status === 'CONFIRMED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="py-4 text-right text-sm font-black text-gray-900">₦{Number(h.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <div className="mt-20 pt-8 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.5em]">End of Official Statement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
