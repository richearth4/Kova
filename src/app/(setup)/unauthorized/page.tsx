import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-amber-50 text-amber-500 shadow-sm border border-amber-100">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            Your current security clearance does not allow access to this sector of the network.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/member"
            className="px-8 py-3 bg-kova-midnight text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
          >
            Go to Member Portal
          </Link>
          <Link
            href="/"
            className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Return Home
          </Link>
        </div>

        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest pt-8">
          KOVA · Collective Wealth Redefined
        </p>
      </div>
    </div>
  )
}
