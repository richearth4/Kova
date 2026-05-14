import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MemberRoleForm from './MemberRoleForm'
import MemberRow from './MemberRow'
import BulkImport from './BulkImport'

export default async function ManageMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string, role?: string, page?: string }>
}) {
  const params = await searchParams
  const query = params.query
  const role = params.role
  const page = Number(params.page) || 1
  const pageSize = 20
  const skip = (page - 1) * pageSize

  await requireRole(['ADMIN'])

  const where: any = {}
  
  if (query) {
    where.OR = [
      { firstName: { contains: query, mode: 'insensitive' } },
      { lastName: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { staffId: { contains: query, mode: 'insensitive' } },
    ]
  }

  if (role && role !== 'ALL') {
    where.role = role
  }

  const [members, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.user.count({ where })
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg font-light tracking-tight text-slate-900 font-display">Identity & Governance</h1>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Registry: <span className="text-emerald-500">{total} Active Profiles</span></p>
        </div>
        <div className="flex gap-2">
          <BulkImport />
        </div>
      </div>

      {/* Search & Filter Bar — Ultra Compact */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-2 items-center">
        <form className="flex-1 w-full flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search registry..."
              className="block w-full pl-9 pr-3 py-1.5 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-primary/20 text-[11px] font-medium placeholder:text-slate-400 transition-all"
            />
          </div>
          <select 
            name="role" 
            defaultValue={role || 'ALL'}
            className="block w-28 pl-3 pr-8 py-1.5 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-primary/20 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="MEMBER">Member</option>
            <option value="SECRETARY">Secretary</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button 
            type="submit"
            className="px-5 py-1.5 bg-kova-midnight text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-sm"
          >
            Filter
          </button>
          { (query || role) && (
            <a 
              href="/admin/members"
              className="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center"
            >
              Reset
            </a>
          )}
        </form>
      </div>
      
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-slate-50/20">
              <th className="pro-table-header px-4 text-left w-[35%]">Member Identity</th>
              <th className="pro-table-header px-4 text-left w-[20%]">System Access</th>
              <th className="pro-table-header px-4 text-left w-[20%]">Status</th>
              <th className="pro-table-header px-4 text-right w-[25%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {members.map((member) => (
              <MemberRow key={member.id} member={JSON.parse(JSON.stringify(member))} />
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-20 text-center text-[9px] font-black text-slate-200 uppercase tracking-widest">
                  No directory matches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls — Compact */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
            {skip + 1}—{Math.min(skip + pageSize, total)} of {total} profiles
          </div>
          <div className="flex gap-2">
            <a 
              href={`/admin/members?page=${page - 1}${query ? `&query=${query}` : ''}${role ? `&role=${role}` : ''}`}
              className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                page <= 1 ? 'bg-slate-50 text-slate-200 pointer-events-none' : 'bg-kova-midnight text-white hover:opacity-90'
              }`}
            >
              Back
            </a>
            <a 
              href={`/admin/members?page=${page + 1}${query ? `&query=${query}` : ''}${role ? `&role=${role}` : ''}`}
              className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                page >= totalPages ? 'bg-slate-50 text-slate-200 pointer-events-none' : 'bg-kova-midnight text-white hover:opacity-90'
              }`}
            >
              Next
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
