'use client'

import { useState } from 'react'
import { uploadLoanRepayment } from './repayment-actions'

export default function RepaymentForm({ loans }: { loans: any[] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const activeLoans = loans.filter(l => l.status === 'ACTIVE')

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage(null)
    try {
      const result = await uploadLoanRepayment(formData)
      if (result.success) {
        setMessage({ type: 'success', text: 'Repayment proof submitted. Awaiting secretary verification.' })
        const form = document.getElementById('repayment-form') as HTMLFormElement
        form?.reset()
      } else {
        setMessage({ type: 'error', text: result.error || 'Upload failed. Please try again.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (activeLoans.length === 0) return null

  return (
    <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm animate-in slide-in-from-left duration-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-6 w-6 rounded-lg bg-kova-midnight/5 flex items-center justify-center">
          <svg className="h-3.5 w-3.5 text-kova-midnight" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Repayment Proof</h2>
      </div>

      {message && (
        <div className={`mb-4 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <form id="repayment-form" action={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Instrument Selection</label>
            <select
              name="loanId"
              required
              className="block w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-[11px] font-black uppercase tracking-[0.1em] text-slate-900 focus:ring-1 focus:ring-kova-midnight/20 transition-all cursor-pointer"
            >
              {activeLoans.map(l => (
                <option key={l.id} value={l.id}>
                  ₦{Number(l.principal).toLocaleString()} — {new Date(l.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Repayment Value (₦)</label>
            <input
              type="number"
              name="amount"
              required
              placeholder="0.00"
              className="block w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-[11px] font-medium placeholder:text-slate-300 focus:ring-1 focus:ring-kova-midnight/20 transition-all text-slate-900"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Document Capture</label>
          <input
            type="file"
            name="file"
            accept="image/*,application/pdf"
            required
            className="block w-full text-[9px] font-bold text-slate-400 bg-slate-50 rounded-xl px-4 py-2.5
              file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0
              file:text-[8px] file:font-black file:uppercase file:tracking-widest
              file:bg-kova-midnight file:text-white hover:file:opacity-90 transition-all cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-lg shadow-slate-900/5 ${
            isLoading ? 'bg-slate-200' : 'bg-kova-midnight hover:opacity-90 active:scale-[0.98]'
          }`}
        >
          {isLoading ? 'Uploading...' : 'Authorize Repayment'}
        </button>
      </form>
    </div>
  )
}
