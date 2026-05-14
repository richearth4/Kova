'use client'

import { generatePDF } from '@/lib/reports'
import { FileText } from 'lucide-react'

export default function LoanStatementButton({ loans, userName }: { loans: any[], userName: string }) {
  const handleDownload = () => {
    const data = loans.map(loan => [
      new Date(loan.createdAt).toLocaleDateString(),
      `₦${Number(loan.principal).toLocaleString()}`,
      `${loan.durationMonths} Months`,
      `₦${Number(loan.totalRepayment).toLocaleString()}`,
      loan.status
    ])

    generatePDF({
      title: 'Loan Statement of Account',
      subtitle: `Member: ${userName} | Issued: ${new Date().toLocaleDateString()}`,
      filename: `KOVA_Loan_Statement_${userName.replace(' ', '_')}`,
      headers: ['Date', 'Principal', 'Duration', 'Total Owed', 'Status'],
      data,
      footer: 'KOVA - Empowering Your Growth'
    })
  }

  return (
    <button 
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
    >
      <FileText className="h-3 w-3" />
      Export Statement
    </button>
  )
}
