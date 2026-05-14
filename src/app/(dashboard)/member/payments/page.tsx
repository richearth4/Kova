import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PaymentUploadForm from './PaymentUploadForm'

export default async function PaymentsPage() {
  const { dbUser } = await requireAuth()

  const paymentHistory = (await prisma.paymentProof.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
  })).map(payment => ({
    ...payment,
    amount: payment.amount.toString(),
  }))

  const savingsTargets = await prisma.savingsTarget.findMany({
    where: { userId: dbUser.id },
    select: { id: true, goalName: true }
  })

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
      {/* Refined Header */}
      <div className="flex justify-between items-center px-1 mb-2">
        <div>
          <h1 className="text-lg font-light tracking-tight text-slate-900 font-display">Contribution Portal</h1>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            Document monthly wealth accumulation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Compact Upload Card */}
        <div className="lg:col-span-5">
          <PaymentUploadForm savingsTargets={savingsTargets} />
        </div>

        {/* High-Density Verification History */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Verification Log</h2>
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">History</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-slate-50/10">
                    <th className="pro-table-header px-4 w-[40%]">Contribution</th>
                    <th className="pro-table-header px-4 w-[30%] text-center">Status</th>
                    <th className="pro-table-header px-4 w-[30%] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} className="pro-table-row group hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-700 leading-tight">₦{Number(payment.amount).toLocaleString()}</p>
                        <p className="text-[8px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
                          {new Date(payment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${
                          payment.status === 'CONFIRMED' ? 'text-emerald-500 bg-emerald-500/5' :
                          payment.status === 'REJECTED' ? 'text-red-500 bg-red-500/5' : 
                          'text-amber-500 bg-amber-500/5'
                        }`}>{payment.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a 
                          href={payment.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                        >
                          View Receipt
                        </a>
                      </td>
                    </tr>
                  ))}
                  {paymentHistory.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-[9px] font-bold text-slate-200 uppercase tracking-[0.3em]">No Uploads Found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
