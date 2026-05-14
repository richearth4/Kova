'use client'

import { useState } from 'react'
import { verifyPayment } from './actions'

interface Payment {
  id: string
  amount: number | string
  type: string
  details: string
  fileUrl: string
  user: {
    firstName: string
    lastName: string
    staffId: string | null
  }
}

export default function VerificationList({ 
  pendingPayments 
}: { 
  pendingPayments: Payment[] 
}) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null)

  const handleVerify = async (id: string, status: 'CONFIRMED' | 'REJECTED', type: string) => {
    setProcessingId(id)
    setStatusMsg(null)
    try {
      const result = await verifyPayment(id, status, type)
      if (result.success) {
        setStatusMsg({ id, type: 'success', text: status === 'CONFIRMED' ? 'Approved.' : 'Rejected.' })
      } else {
        setStatusMsg({ id, type: 'error', text: 'Action failed. Try again.' })
      }
    } catch {
      setStatusMsg({ id, type: 'error', text: 'Unexpected error.' })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="bg-white shadow-sm border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      <table className="min-w-full divide-y divide-slate-50">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="pro-table-header">Member</th>
            <th className="pro-table-header">Transaction</th>
            <th className="pro-table-header">Amount</th>
            <th className="pro-table-header">Proof</th>
            <th className="pro-table-header text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {pendingPayments.map((payment) => (
            <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4">
                <div className="text-sm font-bold text-slate-900">{payment.user.firstName} {payment.user.lastName}</div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{payment.user.staffId}</div>
              </td>
              <td className="px-4 py-4">
                <div className="text-xs font-black text-slate-900">{payment.type.replace('_', ' ')}</div>
                <div className="text-[10px] text-slate-400 font-medium italic">{payment.details}</div>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm font-black text-slate-900 tracking-tight">₦{Number(payment.amount).toLocaleString()}</div>
                {statusMsg?.id === payment.id && (
                  <div className={`text-[9px] font-black mt-1 ${statusMsg.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {statusMsg.text}
                  </div>
                )}
              </td>
              <td className="px-4 py-4">
                <a href={payment.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                  View Receipt
                </a>
              </td>
              <td className="px-4 py-4 text-right space-x-2">
                <button
                  onClick={() => handleVerify(payment.id, 'CONFIRMED', payment.type)}
                  disabled={processingId === payment.id}
                  className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleVerify(payment.id, 'REJECTED', payment.type)}
                  disabled={processingId === payment.id}
                  className="px-4 py-1.5 border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-50 disabled:bg-slate-50 disabled:text-slate-300 transition-all"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
          {pendingPayments.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                No pending payments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
