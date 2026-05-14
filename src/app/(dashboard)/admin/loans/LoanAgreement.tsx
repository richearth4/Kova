'use client'

import React from 'react'

export default function LoanAgreement({ loan, onClose }: { loan: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto print:static print:overflow-visible">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0 print:p-0 print:block">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity print:hidden" 
          onClick={onClose}
        />

        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl print:shadow-none print:my-0 print:rounded-none">
          <div className="bg-white px-8 pb-8 pt-10 sm:p-12 print:p-0">
            <div className="flex justify-between items-start mb-10 print:mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl print:h-16 print:w-16">
                  INEC
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Loan Facility Agreement</h2>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Co-operative Management System</p>
                </div>
              </div>
              <div className="flex gap-2 print:hidden">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100"
                >
                  Print Agreement
                </button>
                <button 
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="border-t border-b border-gray-100 py-8 mb-10 space-y-6 print:border-gray-200">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Borrower Details</h4>
                  <p className="text-lg font-bold text-gray-900">{loan.user.firstName} {loan.user.lastName}</p>
                  <p className="text-sm text-gray-600 font-medium mt-1">Staff ID: <span className="font-mono">{loan.user.staffId}</span></p>
                  <p className="text-sm text-gray-600 font-medium">Email: {loan.user.email}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Loan Reference</h4>
                  <p className="text-lg font-bold text-gray-900">#LN-{loan.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-gray-600 font-medium mt-1">Agreement Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 font-medium">Status: {loan.status}</p>
                </div>
              </div>
            </div>

            <div className="space-y-8 mb-16">
              <section>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">1. Financial Terms</h3>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 grid grid-cols-3 gap-6 print:bg-white print:border-gray-200">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Principal Amount</p>
                    <p className="text-xl font-black text-gray-900">₦{Number(loan.principal).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Interest (5%)</p>
                    <p className="text-xl font-black text-gray-900">₦{Number(loan.interestAmount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Repayment</p>
                    <p className="text-xl font-black text-blue-600">₦{Number(loan.totalRepayment).toLocaleString()}</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">2. Repayment Schedule</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The Borrower agrees to repay the total sum of <span className="font-bold text-gray-900">₦{Number(loan.totalRepayment).toLocaleString()}</span> in <span className="font-bold text-gray-900">{loan.durationMonths} consecutive monthly installments</span>. 
                  Each installment will be in the amount of <span className="font-bold text-blue-600">₦{(Number(loan.totalRepayment) / loan.durationMonths).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>, 
                  to be deducted directly from the Borrower's salary through the payroll system or settled via confirmed bank transfers.
                </p>
              </section>

              <section className="print:mt-20">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">3. Authorization</h3>
                <p className="text-xs text-gray-500 leading-relaxed italic">
                  By signing below, the Borrower authorizes the INEC Co-operative Management to perform necessary salary deductions as outlined in this agreement. The Borrower confirms that all information provided in the application is true and accurate.
                </p>
              </section>
            </div>

            <div className="grid grid-cols-2 gap-16 mt-20">
              <div className="border-t border-gray-300 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-8">Borrower Signature</p>
                <p className="text-sm font-bold text-gray-900">{loan.user.firstName} {loan.user.lastName}</p>
              </div>
              <div className="border-t border-gray-300 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-8">Co-operative Secretary Signature</p>
                <p className="text-sm font-bold text-gray-900">__________________________</p>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]">Official INEC Co-operative Document</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
