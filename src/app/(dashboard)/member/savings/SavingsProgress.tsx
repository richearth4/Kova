'use client'

import { deleteSavingsTarget } from './actions'

interface SavingsTarget {
  id: string
  goalName: string
  savedAmount: number | string
  targetAmount: number | string
}

export default function SavingsProgress({ targets }: { targets: SavingsTarget[] }) {
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the goal: ${name}?`)) {
      await deleteSavingsTarget(id)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {targets.map((target) => {
        const percentage = Math.min(
          Math.round((Number(target.savedAmount) / Number(target.targetAmount)) * 100),
          100
        )
        
        return (
          <div key={target.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative group transition-all hover:border-emerald-100">
            <button 
              onClick={() => handleDelete(target.id, target.goalName)}
              className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <h3 className="text-[11px] font-semibold text-slate-900 mb-1 uppercase tracking-tight">{target.goalName}</h3>
            <div className="flex justify-between text-[9px] font-medium text-slate-400 mb-3 uppercase tracking-widest">
              <span className="text-emerald-600">₦{Number(target.savedAmount).toLocaleString()}</span>
              <span>Target: ₦{Number(target.targetAmount).toLocaleString()}</span>
            </div>

            <div className="relative pt-1">
              <div className="overflow-hidden h-1.5 mb-2 text-xs flex rounded-full bg-slate-50">
                <div 
                  style={{ width: `${percentage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-1000"
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">
                  {percentage}% SECURED
                </span>
                <a 
                  href={`/member/payments?targetId=${target.id}`}
                  className="text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  Fund Goal →
                </a>
              </div>
            </div>
          </div>
        )
      })}

      {targets.length === 0 && (
        <div className="col-span-full py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400 font-medium text-[10px] uppercase tracking-widest">No active accumulation goals</p>
        </div>
      )}
    </div>
  )
}
