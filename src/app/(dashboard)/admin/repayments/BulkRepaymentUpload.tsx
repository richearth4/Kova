'use client'

import React, { useState } from 'react'
import { processBulkTransactions } from './actions'
import { toast } from 'sonner'

export default function BulkRepaymentUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [results, setResults] = useState<{ success: number, failed: number, errors: string[] } | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setResults(null)

    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      
      // Format: StaffId, Amount, Type (LOAN/SAVINGS), GoalId (Optional)
      const data = lines.slice(1).map(line => {
        const [staffId, amount, type, goalId] = line.split(',').map(s => s.trim())
        return { 
          staffId, 
          amount: parseFloat(amount), 
          type: (type?.toUpperCase() === 'SAVINGS' ? 'SAVINGS' : 'LOAN') as 'LOAN' | 'SAVINGS',
          goalId: goalId || undefined
        }
      }).filter(row => row.staffId && !isNaN(row.amount))

      if (data.length === 0) {
        toast.error('No valid data found in CSV')
        setIsUploading(false)
        return
      }

      try {
        const res = await processBulkTransactions(data)
        if (res.success && res.results) {
          setResults(res.results)
          toast.success(`Processed ${res.results.success} transactions successfully`)
        } else {
          toast.error(res.error || 'Failed to process bulk upload')
        }
      } catch (err) {
        toast.error('An unexpected error occurred during upload')
      } finally {
        setIsUploading(false)
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Bulk Transaction Upload</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Format: StaffId, Amount, Type (LOAN/SAVINGS), GoalId (Optional)</p>
          </div>
          <a 
            href="/repayment_template.csv" 
            download
            className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
          >
            Download Template
          </a>
        </div>
        <label className={`relative cursor-pointer px-6 py-2 bg-kova-midnight text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-slate-900/10 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isUploading ? 'Processing...' : 'Choose CSV File'}
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {results && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex gap-6 mb-3">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Successful</p>
              <p className="text-lg font-black text-emerald-600">{results.success}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Failed</p>
              <p className="text-lg font-black text-red-500">{results.failed}</p>
            </div>
          </div>
          
          {results.errors.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[8px] font-black text-red-400 uppercase tracking-widest">Error Log</p>
              <div className="max-h-24 overflow-y-auto text-[9px] font-medium text-red-600 space-y-1">
                {results.errors.map((err, i) => (
                  <p key={i} className="px-2 py-1 bg-red-50 rounded border border-red-100">{err}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
