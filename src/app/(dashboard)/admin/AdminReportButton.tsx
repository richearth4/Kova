'use client'

import { generatePDF, generateCSV } from '@/lib/reports'
import { FileDown, TableProperties } from 'lucide-react'

export default function AdminReportButton({ stats }: { stats: any }) {
  const getReportData = () => [
    ['Total Members', stats.userCount.toString()],
    ['Total Capital Pool', `₦${stats.capital.toLocaleString()}`],
    ['Total Outstanding Loans', `₦${stats.outstanding.toLocaleString()}`],
    ['Total Repayments Collected', `₦${stats.repaid.toLocaleString()}`],
    ['Recovery Rate', `${stats.recoveryRate}%`]
  ]

  const handleDownloadPDF = () => {
    generatePDF({
      title: 'Executive Financial Summary',
      subtitle: `Reporting Period: ${new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`,
      filename: `KOVA_Executive_Report_${new Date().toISOString().split('T')[0]}`,
      headers: ['Metric', 'Value'],
      data: getReportData(),
      footer: 'KOVA - Confidential Administrative Report'
    })
  }

  const handleDownloadCSV = () => {
    generateCSV({
      title: 'Executive Financial Summary',
      filename: `KOVA_Executive_Report_${new Date().toISOString().split('T')[0]}`,
      headers: ['Metric', 'Value'],
      data: getReportData()
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleDownloadPDF}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
      >
        <FileDown className="h-3.5 w-3.5" />
        PDF Report
      </button>
      <button 
        onClick={handleDownloadCSV}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
      >
        <TableProperties className="h-3.5 w-3.5" />
        Excel Export
      </button>
    </div>
  )
}
