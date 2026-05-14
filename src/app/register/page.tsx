import Link from 'next/link'
import { register } from './actions'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-[#0D1B2A] shadow-2xl">
            <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none">
              <rect x="8" y="7" width="3.5" height="18" rx="1.5" fill="#10B981"/>
              <path d="M11.5 16 L22 7.5" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M11.5 16 L22 24.5" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight">
          Join the Collective
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Create your KOVA account to start saving.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 sm:rounded-3xl sm:px-10">
          <form className="space-y-5" action={register}>
            {params?.error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                {params.error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="appearance-none block w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="appearance-none block w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="staffId" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Staff / Member ID
              </label>
              <input
                id="staffId"
                name="staffId"
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                className="appearance-none block w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-4 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-xl"
                style={{ backgroundColor: 'var(--kova-midnight)' }}
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                <span className="px-3 bg-white text-slate-300">Membership has privileges</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-xs font-black transition-colors"
                style={{ color: 'var(--kova-emerald)' }}
              >
                Sign in to existing account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
