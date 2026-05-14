'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { uploadPaymentProof } from './actions'

export default function PaymentUploadForm({ savingsTargets = [] }: { savingsTargets?: { id: string, goalName: string }[] }) {
  const searchParams = useSearchParams()
  const targetId = searchParams.get('targetId')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const result = await uploadPaymentProof(formData)
      if (result.success) {
        setMessage({ type: 'success', text: 'Payment proof uploaded successfully! Awaiting verification.' })
        const form = document.getElementById('payment-form') as HTMLFormElement
        form?.reset()
      } else {
        setMessage({ type: 'error', text: result.error || 'Upload failed' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm animate-in slide-in-from-left duration-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-6 w-6 rounded-lg bg-emerald-50 flex items-center justify-center">
          <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Asset Ingress</h2>
      </div>
      
      {message && (
        <div className={`mb-4 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <form id="payment-form" action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="month" className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Fiscal Month
            </label>
            <input
              type="month"
              name="month"
              id="month"
              required
              className="block w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-emerald-500/20 text-[11px] font-black uppercase tracking-[0.1em] text-slate-900 transition-all cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="amount" className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Value (₦)
            </label>
            <input
              type="number"
              name="amount"
              id="amount"
              required
              placeholder="0.00"
              className="block w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-emerald-500/20 text-[11px] font-medium placeholder:text-slate-300 text-slate-900 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="savingsTargetId" className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Target Allocation
          </label>
          <select
            name="savingsTargetId"
            id="savingsTargetId"
            defaultValue={targetId || ''}
            className="block w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-emerald-500/20 text-[11px] font-black uppercase tracking-[0.1em] text-slate-900 transition-all cursor-pointer"
          >
            <option value="">General Savings</option>
            {savingsTargets.map(target => (
              <option key={target.id} value={target.id}>{target.goalName}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="file" className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Documentation Proof
          </label>
          <div className="mt-1 relative group">
            <input 
              id="file" 
              name="file" 
              type="file" 
              required 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="px-6 py-8 border border-dashed border-slate-100 rounded-2xl bg-slate-50/50 group-hover:bg-slate-50 group-hover:border-emerald-200 transition-all text-center">
              <svg className="mx-auto h-6 w-6 text-slate-300 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Receipt</p>
              <p className="text-[7px] text-slate-300 font-black uppercase tracking-widest mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-lg shadow-slate-900/5 ${
            isLoading ? 'bg-slate-200' : 'bg-kova-midnight hover:opacity-90 active:scale-[0.98]'
          }`}
        >
          {isLoading ? 'Uploading...' : 'Authorize Proof'}
        </button>
      </form>
    </div>
  )
}
