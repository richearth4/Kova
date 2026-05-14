import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { logout } from '@/app/login/actions'
import { prisma } from '@/lib/prisma'
import NotificationBell from '@/components/NotificationBell'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { dbUser } = await requireAuth()

  const notifications = await prisma.notification.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  return (
    <div className="flex h-screen bg-background">
      {/* KOVA Sidebar — Midnight Navy */}
      <aside className="w-56 flex flex-col" style={{ backgroundColor: 'var(--kova-midnight)' }}>
        {/* KOVA Wordmark */}
        <div className="h-14 flex items-center px-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            {/* Geometric K Icon */}
            <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden bg-[#0D1B2A]">
              <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
                <rect x="8" y="7" width="3.5" height="18" rx="1.5" fill="#10B981"/>
                <path d="M11.5 16 L22 7.5" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>
                <path d="M11.5 16 L22 24.5" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <span className="kova-logo-text text-white text-sm tracking-tight">KOVA</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
          {/* Member Section */}
          <div className="px-4 mb-2">
            <p className="px-3 py-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.25em]">Personal</p>
            {[
              { href: '/member', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { href: '/member/savings', label: 'Savings', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
              { href: '/member/loans', label: 'Loans', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { href: '/member/payments', label: 'Payments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 0 012-2h2a2 2 0 012 2' },
              { href: '/member/foodstuffs', label: 'Logistics', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
            ].map((item: { href: string; label: string; icon: string }) => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.03] transition-all group mb-1">
                <svg className="h-4 w-4 flex-shrink-0 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
                </svg>
                <span className="text-[13px] font-medium tracking-tight">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Secretary Section */}
          {(dbUser.role === 'SECRETARY' || dbUser.role === 'ADMIN') && (
            <div className="px-4 mt-6 mb-2">
              <p className="px-3 py-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.25em]">Operations</p>
              {[
                { href: '/secretary', label: 'Command', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' },
                { href: '/secretary/verify-payments', label: 'Verify', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                { href: '/secretary/foodstuff-orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              ].map((item: { href: string; label: string; icon: string }) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.03] transition-all group mb-1">
                  <svg className="h-4 w-4 flex-shrink-0 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
                  </svg>
                  <span className="text-[13px] font-medium tracking-tight">{item.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Admin Section */}
          {dbUser.role === 'ADMIN' && (
            <div className="px-4 mt-6 mb-2">
              <p className="px-3 py-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.25em]">Governance</p>
              {[
                { href: '/admin', label: 'Financial HQ', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                { href: '/admin/members', label: 'Members', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                { href: '/admin/loans', label: 'Credit', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                { href: '/admin/repayments', label: 'Repayments', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                { href: '/admin/foodstuffs', label: 'Catalog', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
                { href: '/admin/audit', label: 'Audit Trail', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
              ].map((link: { href: string; label: string; icon: string }) => (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.03] transition-all group mb-1">
                  <svg className="h-4 w-4 flex-shrink-0 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={link.icon} />
                  </svg>
                  <span className="text-[13px] font-medium tracking-tight">{link.label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* User Footer — Compact */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black uppercase flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #10B981, #1E3A5F)', color: 'white' }}>
              {dbUser.firstName[0]}{dbUser.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <Link href="/profile" className="block group">
                <p className="text-[11px] font-bold text-white group-hover:text-emerald-400 transition-colors truncate leading-tight">
                  {dbUser.firstName} {dbUser.lastName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[8px] font-black uppercase tracking-wider text-white/30">{dbUser.role}</span>
                  <span className="h-1 w-1 rounded-full bg-white/10"></span>
                  <span className="text-[8px] font-black uppercase tracking-wider group-hover:text-amber-500 transition-colors" style={{ color: 'var(--kova-gold)' }}>Settings</span>
                </div>
              </Link>
            </div>
            <form action={logout}>
              <button type="submit" className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* KOVA Top Bar */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">KOVA Network · Secure</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-foreground">{dbUser.firstName} {dbUser.lastName}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--kova-gold)' }}>{dbUser.role}</p>
            </div>
            <NotificationBell notifications={JSON.parse(JSON.stringify(notifications))} userId={dbUser.id} />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 lg:p-10 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
