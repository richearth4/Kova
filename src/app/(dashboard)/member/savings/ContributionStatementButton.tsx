'use client'

import { generatePDF } from '@/lib/reports'
import { Download } from 'lucide-react'

export default function ContributionStatementButton({ contributions, userName }: { contributions: any[], userName: string }) {
  const handleDownload = () => {
    const data = contributions.map(c => [
      new Date(c.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      `₦${Number(c.amount).toLocaleString()}`,
      c.status,
      new Date(c.createdAt).toLocaleDateString()
    ])

    generatePDF({
      title: 'Contribution History',
      subtitle: `Member: ${userName} | Issued: ${new Date().toLocaleDateString()}`,
      filename: `KOVA_Contributions_${userName.replace(' ', '_')}`,
      headers: ['Period', 'Amount', 'Status', 'Verified Date'],
      data,
      footer: 'KOVA - Wealth Through Collaboration'
    })
  }

  return (
    <button 
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
    >
      <Download className="h-3 w-3" />
      Export Contributions
    </button>
  )
}
