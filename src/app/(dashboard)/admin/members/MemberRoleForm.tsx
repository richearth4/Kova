'use client'

import { useState } from 'react'
import { updateUserRole } from './actions'
import { Role } from '@prisma/client'

export default function MemberRoleForm({ 
  userId, 
  currentRole 
}: { 
  userId: string, 
  currentRole: Role 
}) {
  const [role, setRole] = useState(currentRole)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    setIsLoading(true)
    try {
      const result = await updateUserRole(userId, role)
      if (result.success) {
        // Subtle feedback instead of alert
      } else {
        alert('Failed to update role')
      }
    } catch (err) {
      alert('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <select 
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        disabled={isLoading}
        className="text-[9px] font-black uppercase tracking-widest bg-slate-50 border-none rounded-lg focus:ring-1 focus:ring-primary/20 py-1 px-2 text-slate-700 cursor-pointer"
      >
        <option value="MEMBER">MEMBER</option>
        <option value="SECRETARY">SECRETARY</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <button 
        onClick={handleUpdate}
        disabled={isLoading || role === currentRole}
        className={`text-[9px] font-black uppercase tracking-widest transition-all ${
          isLoading || role === currentRole 
            ? 'text-slate-200 cursor-not-allowed' 
            : 'text-primary hover:text-slate-900'
        }`}
      >
        {isLoading ? '...' : 'SAVE'}
      </button>
    </div>
  )
}
