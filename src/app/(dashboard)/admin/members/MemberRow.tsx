'use client'

import React, { useState } from 'react'
import MemberRoleForm from './MemberRoleForm'
import MemberDetailsModal from './MemberDetailsModal'
import StaffIdEditor from './StaffIdEditor'

import { User } from '@prisma/client'

export default function MemberRow({ member }: { member: User }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <tr key={member.id} className="hover:bg-muted/50 transition-colors group">
        <td className="px-4 py-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-black text-[10px] uppercase">
              {member.firstName[0]}{member.lastName[0]}
            </div>
            <div className="ml-3">
              <div className="text-xs font-black text-foreground leading-tight">{member.firstName} {member.lastName}</div>
              <div className="text-[10px] text-muted-foreground font-medium tracking-tighter">{member.email}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <StaffIdEditor userId={member.id} initialStaffId={member.staffId} />
          <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest mt-0.5">Employee ID</div>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md ${
              member.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-500' :
              member.role === 'SECRETARY' ? 'bg-emerald-500/10 text-emerald-500' :
              'bg-slate-100 text-slate-500'
            }`}>
              {member.role}
            </span>
            <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${member.active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              <span className={`text-[9px] font-black uppercase tracking-widest ${member.active ? 'text-emerald-500' : 'text-red-500'}`}>
                {member.active ? 'Active' : 'Suspended'}
              </span>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 text-right">
          <div className="flex items-center justify-end gap-3">
            <MemberRoleForm userId={member.id} currentRole={member.role} />
            <div className="h-4 w-px bg-slate-200 hidden lg:block"></div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-[9px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
            >
              Audit
            </button>
            <button 
              onClick={async () => {
                 if (confirm(`Are you sure you want to ${member.active ? 'suspend' : 'reactivate'} this account?`)) {
                   const { toggleUserStatus } = await import('./actions')
                   await toggleUserStatus(member.id)
                 }
              }}
              className={`text-[9px] font-black uppercase tracking-widest transition-colors ${member.active ? 'text-slate-400 hover:text-red-500' : 'text-red-500 hover:text-emerald-500'}`}
            >
              {member.active ? 'Suspend' : 'Activate'}
            </button>
          </div>

          {isModalOpen && (
            <MemberDetailsModal 
              member={member} 
              onClose={() => setIsModalOpen(false)} 
            />
          )}
        </td>
      </tr>
    </>
  )
}
