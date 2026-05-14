'use client'

import { useState } from 'react'
import { updateStaffId } from './actions'

export default function StaffIdEditor({ 
  userId, 
  initialStaffId 
}: { 
  userId: string, 
  initialStaffId: string | null 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [staffId, setStaffId] = useState(initialStaffId || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    if (!staffId.trim()) return
    setIsLoading(true)
    try {
      const result = await updateStaffId(userId, staffId)
      if (result.success) {
        setIsEditing(false)
      } else {
        alert('Failed to update staff ID')
      }
    } catch (err) {
      alert('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 animate-in slide-in-from-left-1 duration-200">
        <input
          type="text"
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          placeholder="Enter ID..."
          className="text-xs font-black w-24 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg focus:ring-1 focus:ring-primary/20 outline-none"
          autoFocus
        />
        <button 
          onClick={handleUpdate}
          disabled={isLoading}
          className="p-1 hover:text-emerald-500 transition-colors"
        >
          {isLoading ? '...' : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <button 
          onClick={() => setIsEditing(false)}
          className="p-1 hover:text-red-500 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="group/staff flex items-center gap-2">
      <div className={`text-xs font-black tracking-tighter ${!initialStaffId ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
        {initialStaffId || 'UNREGISTERED'}
      </div>
      <button 
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover/staff:opacity-100 p-1 text-slate-400 hover:text-primary transition-all"
        title="Edit Staff ID"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  )
}
