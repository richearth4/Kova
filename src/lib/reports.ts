'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ReportOptions {
  title: string
  subtitle?: string
  filename: string
  headers: string[]
  data: (string | number | boolean)[][]
  footer?: string
}

export function generatePDF({ title, subtitle, filename, headers, data, footer }: ReportOptions) {
  const doc = new jsPDF()

  // Branding
  doc.setFontSize(22)
  doc.setTextColor(13, 27, 42) // Midnight Navy
  doc.text('KOVA', 14, 22)
  
  doc.setFontSize(10)
  doc.setTextColor(16, 185, 129) // Emerald
  doc.text('COLLECTIVE WEALTH', 14, 28)

  // Title
  doc.setFontSize(18)
  doc.setTextColor(33, 37, 41)
  doc.text(title, 14, 45)

  if (subtitle) {
    doc.setFontSize(10)
    doc.setTextColor(108, 117, 125)
    doc.text(subtitle, 14, 52)
  }

  // Divider
  doc.setDrawColor(233, 236, 239)
  doc.line(14, 58, 196, 58)

  // Table
  autoTable(doc, {
    startY: 65,
    head: [headers],
    body: data,
    theme: 'striped',
    headStyles: {
      fillColor: [13, 27, 42],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [33, 37, 41]
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    margin: { top: 65 }
  })

  // Footer
  if (footer) {
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(173, 181, 189)
      doc.text(
        `${footer} | Page ${i} of ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      )
    }
  }

  doc.save(`${filename}.pdf`)
}
