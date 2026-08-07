'use client'

import { useState } from 'react'
import { resetPassword } from './actions'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage(null)
    const result = await resetPassword(formData)
    setIsLoading(false)

    if (result.success) {
      setMessage({ type: 'success', text: 'Password reset link sent! Please check your email.' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to send reset link' })
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — KOVA Brand Panel (Consistent with Login) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: 'var(--kova-midnight)' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #10B981 0%, transparent 50%), radial-gradient(circle at 75% 75%, #F59E0B 0%, transparent 50%)' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10B981, #1E3A5F)' }}>
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none">
              <path d="M6 4v16M6 12l8-8M6 12l8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <span className="kova-logo-text text-white text-xl">KOVA</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Account<br/>
            <span style={{ color: 'var(--kova-emerald)' }}>Recovery.</span>
          </h1>
          <p className="mt-6 text-sm text-white/50 leading-relaxed max-w-xs font-medium">
            Don&apos;t worry, it happens to the best of us. Let&apos;s get you back into your KOVA account.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
            © 2026 KOVA · All rights reserved
          </p>
        </div>
      </div>

      {/* Right — Reset Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10B981, #1E3A5F)' }}>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none">
                <path d="M6 4v16M6 12l8-8M6 12l8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="kova-logo-text text-slate-900 text-lg">KOVA</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Enter your email to receive a recovery link</p>
          </div>

          {message && (
            <div className={`mb-6 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          <form className="space-y-6" action={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ '--tw-ring-color': 'var(--kova-emerald)' } as React.CSSProperties}
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg disabled:opacity-50"
              style={{ backgroundColor: 'var(--kova-midnight)' }}
            >
              {isLoading ? 'Sending Link...' : 'Send Recovery Link'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest transition-colors"
              style={{ color: 'var(--kova-emerald)' }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
