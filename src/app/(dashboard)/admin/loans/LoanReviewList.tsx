'use client'

import React, { useState } from 'react'
import { reviewLoan } from './actions'
import LoanAgreement from './LoanAgreement'

export default function LoanReviewList({ pendingLoans }: { pendingLoans: any[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejecting, setIsRejecting] = useState<string | null>(null)
  const [showAgreement, setShowAgreement] = useState<any | null>(null)

  const handleReview = async (id: string, status: 'ACTIVE' | 'REJECTED') => {
    setProcessingId(id)
    try {
      const result = await reviewLoan(id, status, status === 'REJECTED' ? rejectionReason : undefined)
      if (result.success) {
        setRejectionReason('')
        setIsRejecting(null)
      } else {
        alert('Failed to update loan: ' + result.error)
      }
    } catch (err) {
      alert('An unexpected error occurred')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      <table className="min-w-full divide-y divide-slate-50">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="pro-table-header">Member</th>
            <th className="pro-table-header">Request Details</th>
            <th className="pro-table-header">Eligibility</th>
            <th className="pro-table-header text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {pendingLoans.map((loan) => {
            const isEligible = Number(loan.principal) <= (loan.user.totalContributions * 2)
            const isExpanded = expandedId === loan.id

            return (
              <React.Fragment key={loan.id}>
                <tr className={`hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                        {loan.user.firstName[0]}{loan.user.lastName[0]}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-bold text-slate-900">{loan.user.firstName} {loan.user.lastName}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{loan.user.staffId || 'No Staff ID'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-black text-slate-900 tracking-tight">₦{Number(loan.principal).toLocaleString()}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-widest">{loan.loanType}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{loan.durationMonths}M @ 5%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                      isEligible ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {isEligible ? 'Eligible' : 'Over Limit'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-medium italic">
                      Cap: ₦{(loan.user.totalContributions * 2).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : loan.id)}
                      className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest mr-4"
                    >
                      {isExpanded ? 'Collapse' : 'Review'}
                    </button>
                    <button
                      onClick={() => handleReview(loan.id, 'ACTIVE')}
                      disabled={processingId === loan.id || !isEligible}
                      className="inline-flex items-center px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-sm"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 bg-slate-50/30 border-y border-slate-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Repayment Structure</h4>
                          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Interest (Total)</span>
                              <span className="text-sm font-bold text-slate-900">₦{Number(loan.interestAmount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Repayment</span>
                              <span className="text-sm font-bold text-slate-900">₦{Number(loan.totalRepayment).toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                              <span className="text-[10px] font-black text-primary uppercase">Monthly Installment</span>
                              <span className="text-lg font-black text-primary tracking-tighter">
                                ₦{(Number(loan.totalRepayment) / loan.durationMonths).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Verification Actions</h4>
                          {isRejecting === loan.id ? (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                              <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Mandatory rejection note..."
                                className="w-full text-xs border-slate-200 rounded-xl focus:ring-red-500 focus:border-red-500 p-4 bg-white"
                                rows={3}
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleReview(loan.id, 'REJECTED')}
                                  disabled={processingId === loan.id || !rejectionReason}
                                  className="flex-1 bg-red-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                                >
                                  Reject Facility
                                </button>
                                <button
                                  onClick={() => { setIsRejecting(null); setRejectionReason(''); }}
                                  className="px-6 py-2 border border-slate-200 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                                >
                                  Back
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowAgreement(loan)}
                                className="flex-1 bg-slate-50 text-slate-600 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors border border-slate-100"
                              >
                                View Agreement
                              </button>
                              <button
                                onClick={() => setIsRejecting(loan.id)}
                                className="flex-1 border border-red-100 text-red-500 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
          {pendingLoans.length === 0 && (
            <tr>
              <td colSpan={4} className="py-24 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No pending applications</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showAgreement && (
        <LoanAgreement 
          loan={showAgreement} 
          onClose={() => setShowAgreement(null)} 
        />
      )}
    </div>
  )
}
