'use client'

import React, { useState } from 'react'
import MemberRoleForm from './MemberRoleForm'
import MemberDetailsModal from './MemberDetailsModal'

export default function MemberRow({ member }: { member: any }) {
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
          <div className="text-xs font-black text-foreground tracking-tighter">{member.staffId || 'UNREGISTERED'}</div>
          <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">Employee ID</div>
        </td>
        <td className="px-4 py-4">
          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md ${
            member.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-500' :
            member.role === 'SECRETARY' ? 'bg-primary/10 text-primary' :
            'bg-muted text-muted-foreground'
          }`}>
            {member.role}
          </span>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${member.active ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${member.active ? 'text-emerald-500' : 'text-red-500'}`}>
              {member.active ? 'Active' : 'Suspended'}
            </span>
          </div>
        </td>
        <td className="px-4 py-4 text-right space-x-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors"
          >
            Audit
          </button>
          <MemberRoleForm userId={member.id} currentRole={member.role} />
          <button 
            onClick={async () => {
               if (confirm(`Are you sure you want to ${member.active ? 'suspend' : 'reactivate'} this account?`)) {
                 const { toggleUserStatus } = await import('./actions')
                 await toggleUserStatus(member.id)
               }
            }}
            className={`text-[10px] font-black uppercase tracking-widest transition-colors ${member.active ? 'text-muted-foreground hover:text-red-500' : 'text-red-500 hover:text-emerald-500'}`}
          >
            {member.active ? 'Suspend' : 'Activate'}
          </button>
        </td>
      </tr>
      
      {isModalOpen && (
        <MemberDetailsModal 
          member={member} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  )
}
