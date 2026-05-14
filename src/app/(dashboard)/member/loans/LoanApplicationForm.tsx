'use client'

import { useState } from 'react'
import { applyForLoan } from './actions'

export default function LoanApplicationForm({ maxEligible }: { maxEligible: number }) {
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('6')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const interestRate = 0.05
  const interestAmount = (parseFloat(amount) || 0) * interestRate
  const totalRepayment = (parseFloat(amount) || 0) + interestAmount
  const monthlyInstallment = totalRepayment / parseInt(duration)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const result = await applyForLoan(formData)
      if (result.success) {
        setMessage({ type: 'success', text: 'Application submitted! Awaiting Admin approval.' })
        setAmount('')
      } else {
        setMessage({ type: 'error', text: result.error || 'Submission failed' })
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
        <div className="h-6 w-6 rounded-lg bg-amber-50 flex items-center justify-center">
          <svg className="h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Credit Application</h2>
      </div>
      
      {message && (
        <div className={`mb-4 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between items-end mb-1 px-1">
            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              Principal (₦)
            </label>
            <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">
              Limit: ₦{maxEligible.toLocaleString()}
            </span>
          </div>
          <input
            type="number"
            name="principal"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-amber-500/20 text-[11px] font-medium placeholder:text-slate-300 transition-all text-slate-900"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Credit Category
          </label>
          <select
            name="loanType"
            className="block w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-amber-500/20 text-[11px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer text-slate-900"
            defaultValue="PERSONAL"
          >
            <option value="PERSONAL">Personal Credit</option>
            <option value="LAND">Land Acquisition</option>
            <option value="ELECTRONIC">Electronic Goods</option>
            <option value="CAR">Vehicle Credit</option>
            <option value="SOFT">Soft Credit</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Duration (Months)
          </label>
          <select
            name="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="block w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-amber-500/20 text-[11px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer text-slate-900"
          >
            <option value="3">03 Months</option>
            <option value="6">06 Months</option>
            <option value="12">12 Months</option>
            <option value="24">24 Months</option>
          </select>
        </div>

        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50 space-y-2">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
            <span>Service Fee (5%):</span>
            <span className="text-slate-900">₦{interestAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
            <span>Repayment Cap:</span>
            <span className="text-slate-900">₦{totalRepayment.toLocaleString()}</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Installment</span>
            <span className="text-lg font-light text-slate-900 font-display tracking-tight">₦{monthlyInstallment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !amount || parseFloat(amount) > maxEligible}
          className={`w-full flex justify-center py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-lg shadow-slate-900/5 ${
            isLoading || !amount || parseFloat(amount) > maxEligible ? 'bg-slate-200' : 'bg-kova-midnight hover:opacity-90 active:scale-[0.98]'
          }`}
        >
          {isLoading ? 'Processing...' : 'Authorize Request'}
        </button>
      </form>
    </div>
  )
}
