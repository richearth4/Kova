'use client'

import { generatePDF, generateCSV } from '@/lib/reports'
import { Download, TableProperties } from 'lucide-react'

export default function ContributionStatementButton({ contributions, userName }: { contributions: any[], userName: string }) {
  const getReportData = () => contributions.map(c => [
    new Date(c.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    `₦${Number(c.amount).toLocaleString()}`,
    c.status,
    new Date(c.createdAt).toLocaleDateString()
  ])

  const handleDownloadPDF = () => {
    generatePDF({
      title: 'Contribution History',
      subtitle: `Member: ${userName} | Issued: ${new Date().toLocaleDateString()}`,
      filename: `KOVA_Contributions_${userName.replace(/\s+/g, '_')}`,
      headers: ['Period', 'Amount', 'Status', 'Verified Date'],
      data: getReportData(),
      footer: 'KOVA - Wealth Through Collaboration'
    })
  }

  const handleDownloadCSV = () => {
    generateCSV({
      title: 'Contribution History',
      filename: `KOVA_Contributions_${userName.replace(/\s+/g, '_')}`,
      headers: ['Period', 'Amount', 'Status', 'Verified Date'],
      data: getReportData()
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleDownloadPDF}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
      >
        <Download className="h-3.5 w-3.5" />
        PDF Statement
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
