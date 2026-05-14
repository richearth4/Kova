'use client'

import { useEffect, useState } from 'react'

export default function KovaLoader({ message = 'Loading...' }: { message?: string }) {
  const [dots, setDots] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d + 1) % 4)
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--kova-midnight)' }}
    >
      {/* Animated K-Icon */}
      <div className="relative mb-8">
        {/* Pulsing background ring */}
        <div
          className="absolute inset-0 rounded-2xl animate-ping opacity-20"
          style={{ backgroundColor: 'var(--kova-emerald)', animationDuration: '2s' }}
        />
        {/* Icon container */}
        <div
          className="relative h-16 w-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--kova-emerald), var(--kova-cobalt))' }}
        >
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-white" fill="none">
            <path
              d="M6 4v16M6 12l8-8M6 12l8 8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-[dash_1.5s_ease-in-out_infinite]"
            />
          </svg>
        </div>
      </div>

      {/* KOVA Wordmark */}
      <div className="text-center mb-6">
        <div
          className="text-2xl font-black text-white tracking-tight mb-1"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}
        >
          KOVA
        </div>
        <div
          className="text-[9px] font-black uppercase tracking-[0.2em]"
          style={{ color: 'var(--kova-gold)' }}
        >
          KOVA
        </div>
      </div>

      {/* Animated progress bar */}
      <div className="w-48 h-0.5 rounded-full overflow-hidden mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full"
          style={{
            backgroundColor: 'var(--kova-emerald)',
            animation: 'kova-progress 1.8s ease-in-out infinite',
            width: '40%',
          }}
        />
      </div>

      {/* Loading text */}
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
        {message}{'.'.repeat(dots)}
      </p>

      <style>{`
        @keyframes kova-progress {
          0% { transform: translateX(-200%); }
          100% { transform: translateX(400%); }
        }
        @keyframes dash {
          0%, 100% { stroke-dashoffset: 100; stroke-dasharray: 100; }
          50% { stroke-dashoffset: 0; stroke-dasharray: 100; }
        }
      `}</style>
    </div>
  )
}
