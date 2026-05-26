'use client'

import { generatePDF, generateCSV } from '@/lib/reports'
import { FileText, TableProperties } from 'lucide-react'

export default function LoanStatementButton({ loans, userName }: { loans: any[], userName: string }) {
  const getReportData = () => loans.map(loan => [
    new Date(loan.createdAt).toLocaleDateString(),
    `₦${Number(loan.principal).toLocaleString()}`,
    `${loan.durationMonths} Months`,
    `₦${Number(loan.totalRepayment).toLocaleString()}`,
    loan.status
  ])

  const handleDownloadPDF = () => {
    generatePDF({
      title: 'Loan Statement of Account',
      subtitle: `Member: ${userName} | Issued: ${new Date().toLocaleDateString()}`,
      filename: `KOVA_Loan_Statement_${userName.replace(/\s+/g, '_')}`,
      headers: ['Date', 'Principal', 'Duration', 'Total Owed', 'Status'],
      data: getReportData(),
      footer: 'KOVA - Empowering Your Growth'
    })
  }

  const handleDownloadCSV = () => {
    generateCSV({
      title: 'Loan Statement of Account',
      filename: `KOVA_Loan_Statement_${userName.replace(/\s+/g, '_')}`,
      headers: ['Date', 'Principal', 'Duration', 'Total Owed', 'Status'],
      data: getReportData()
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleDownloadPDF}
        className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
      >
        <FileText className="h-3.5 w-3.5" />
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
