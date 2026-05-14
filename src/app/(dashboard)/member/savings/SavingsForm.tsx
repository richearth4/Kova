'use client'

import { useState } from 'react'
import { createSavingsTarget } from './actions'

export default function SavingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const result = await createSavingsTarget(formData)
      if (result.success) {
        setMessage({ type: 'success', text: 'New savings goal created!' })
        const form = document.getElementById('savings-form') as HTMLFormElement
        form?.reset()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create goal' })
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">New Goal</h2>
      </div>
      
      {message && (
        <div className={`mb-4 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <form id="savings-form" action={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="goalName" className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Goal Identifier
          </label>
          <input
            type="text"
            name="goalName"
            id="goalName"
            required
            placeholder="e.g. Real Estate Fund"
            className="block w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-emerald-500/20 text-[11px] font-medium placeholder:text-slate-300 transition-all text-slate-900"
          />
        </div>
        
        <div className="space-y-1">
          <label htmlFor="targetAmount" className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Capital Target (₦)
          </label>
          <input
            type="number"
            name="targetAmount"
            id="targetAmount"
            required
            placeholder="0.00"
            className="block w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-emerald-500/20 text-[11px] font-medium placeholder:text-slate-300 transition-all text-slate-900"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-lg shadow-slate-900/5 ${
            isLoading ? 'bg-slate-200' : 'bg-kova-midnight hover:opacity-90 active:scale-[0.98]'
          }`}
        >
          {isLoading ? 'Processing...' : 'Authorize Goal'}
        </button>
      </form>
    </div>
  )
}
