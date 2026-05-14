'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Root Error Boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-red-50 text-red-500 shadow-sm border border-red-100">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Interruption</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            A temporary glitch occurred in the KOVA matrix. We've been notified and are investigating.
          </p>
          <div className="p-3 bg-slate-100 rounded-xl text-[10px] font-mono text-slate-400 break-all">
            Ref: {error.digest || 'Internal Error'}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => reset()}
            className="px-8 py-3 bg-kova-midnight text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
          >
            Attempt Recovery
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Go Home
          </button>
        </div>

        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest pt-8">
          KOVA · Collective Wealth Redefined
        </p>
      </div>
    </div>
  )
}
