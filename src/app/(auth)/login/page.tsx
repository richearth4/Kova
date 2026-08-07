'use client'

import Link from 'next/link'
import { login } from './actions'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = React.use(searchParams)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })
    
    if (error) {
      router.push(`/login?error=${encodeURIComponent(error.message)}`)
      setIsGoogleLoading(false)
    }
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Left — KOVA Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: 'var(--kova-midnight)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #10B981 0%, transparent 50%), radial-gradient(circle at 75% 75%, #F59E0B 0%, transparent 50%)' }} />

        {/* KOVA Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-[#0D1B2A] shadow-2xl">
            <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
              <rect x="8" y="7" width="3.5" height="18" rx="1.5" fill="#10B981"/>
              <path d="M11.5 16 L22 7.5" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M11.5 16 L22 24.5" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <span className="kova-logo-text text-white text-xl">KOVA</span>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Collective<br/>
            <span style={{ color: 'var(--kova-emerald)' }}>Wealth.</span><br/>
            Redefined.
          </h1>
          <p className="mt-6 text-sm text-white/50 leading-relaxed max-w-xs font-medium">
            A secure co-operative financial platform for savings, loans, and logistics — built for the people who built Nigeria.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {['Savings', 'Loans', 'Logistics', 'Secure'].map(f => (
              <span key={f} className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 border border-white/10">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
            © 2026 KOVA · All rights reserved
          </p>
        </div>
      </div>

      {/* Right — Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#0D1B2A] shadow-lg">
              <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
                <rect x="8" y="7" width="3.5" height="18" rx="1.5" fill="#10B981"/>
                <path d="M11.5 16 L22 7.5" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>
                <path d="M11.5 16 L22 24.5" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="kova-logo-text text-slate-900 text-lg">KOVA</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Sign in to your KOVA account</p>
          </div>

          {/* Error */}
          {params?.error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
              {params.error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" action={login}>
            <div>
              <label htmlFor="email" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ '--tw-ring-color': 'var(--kova-emerald)' } as React.CSSProperties}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-widest transition-colors"
                  style={{ color: 'var(--kova-emerald)' }}>
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg mt-2"
              style={{ backgroundColor: 'var(--kova-midnight)' }}
            >
              Sign In to KOVA
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all shadow-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
          </button>

          {/* Register link */}
          <p className="mt-6 text-center text-xs text-slate-500">
            New to KOVA?{' '}
            <Link href="/register" className="font-black transition-colors" style={{ color: 'var(--kova-emerald)' }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
