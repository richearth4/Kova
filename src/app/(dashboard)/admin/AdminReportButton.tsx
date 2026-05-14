'use client'

import { generatePDF } from '@/lib/reports'
import { FileDown } from 'lucide-react'

export default function AdminReportButton({ stats }: { stats: any }) {
  const handleDownload = () => {
    const data = [
      ['Total Members', stats.userCount.toString()],
      ['Total Capital Pool', `₦${stats.capital.toLocaleString()}`],
      ['Total Outstanding Loans', `₦${stats.outstanding.toLocaleString()}`],
      ['Total Repayments Collected', `₦${stats.repaid.toLocaleString()}`],
      ['Recovery Rate', `${stats.recoveryRate}%`]
    ]

    generatePDF({
      title: 'Executive Financial Summary',
      subtitle: `Reporting Period: ${new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`,
      filename: `KOVA_Executive_Report_${new Date().toISOString().split('T')[0]}`,
      headers: ['Metric', 'Value'],
      data,
      footer: 'KOVA - Confidential Administrative Report'
    })
  }

  return (
    <button 
      onClick={handleDownload}
      className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
    >
      <FileDown className="h-3 w-3" />
      Generate Master Report
    </button>
  )
}
