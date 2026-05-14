import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full"></div>
          <h1 className="relative text-9xl font-black text-slate-200 tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
            404
          </h1>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pathway Not Found</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            The page you are looking for has been moved or does not exist in the KOVA directory.
          </p>
        </div>

        <div className="pt-4">
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-kova-midnight text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
          >
            Return to Command
          </Link>
        </div>

        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest pt-8">
          KOVA · Collective Wealth Redefined
        </p>
      </div>
    </div>
  )
}
