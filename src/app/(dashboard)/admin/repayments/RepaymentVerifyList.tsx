'use client'

import { useState } from 'react'
import { verifyLoanRepayment } from './actions'

export default function RepaymentVerifyList({ pendingRepayments }: { pendingRepayments: any[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null)

  const handleVerify = async (id: string, status: 'CONFIRMED' | 'REJECTED') => {
    setProcessingId(id)
    setStatusMsg(null)
    try {
      const result = await verifyLoanRepayment(id, status)
      if (result.success) {
        setStatusMsg({ id, type: 'success', text: status === 'CONFIRMED' ? 'Repayment approved.' : 'Repayment rejected.' })
      } else {
        setStatusMsg({ id, type: 'error', text: result.error || 'Action failed.' })
      }
    } catch {
      setStatusMsg({ id, type: 'error', text: 'Unexpected error occurred.' })
    } finally {
      setProcessingId(null)
    }
  }

  if (pendingRepayments.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center shadow-sm">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Queue Clear — No Pending Repayments</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      <table className="min-w-full divide-y divide-slate-50">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="pro-table-header">Member</th>
            <th className="pro-table-header">Loan Reference</th>
            <th className="pro-table-header">Amount</th>
            <th className="pro-table-header">Proof</th>
            <th className="pro-table-header text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {pendingRepayments.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4">
                <div className="text-xs font-black text-slate-900">{r.loan.user.firstName} {r.loan.user.lastName}</div>
                <div className="text-[10px] text-slate-400 font-medium uppercase">{r.loan.user.staffId}</div>
              </td>
              <td className="px-4 py-4">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loan ID</div>
                <div className="text-[10px] font-mono text-slate-400">{r.loanId.slice(0, 12)}...</div>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm font-black text-slate-900 tracking-tight">₦{Number(r.amount).toLocaleString()}</div>
                {statusMsg?.id === r.id && (
                  <div className={`text-[9px] font-black mt-1 ${statusMsg?.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {statusMsg?.text}
                  </div>
                )}
              </td>
              <td className="px-4 py-4">
                <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                  View Receipt
                </a>
              </td>
              <td className="px-4 py-4 text-right space-x-2">
                <button
                  onClick={() => handleVerify(r.id, 'CONFIRMED')}
                  disabled={processingId === r.id}
                  className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                >
                  {processingId === r.id ? '...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleVerify(r.id, 'REJECTED')}
                  disabled={processingId === r.id}
                  className="px-4 py-1.5 border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-50 disabled:opacity-40 transition-all"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
