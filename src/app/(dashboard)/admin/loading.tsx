export default function AdminLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-slate-200 rounded-xl"></div>
          <div className="h-4 w-48 bg-slate-100 rounded-full"></div>
        </div>
        <div className="h-10 w-40 bg-slate-200 rounded-xl"></div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-32">
            <div className="h-3 w-20 bg-slate-100 rounded-full mb-3"></div>
            <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
            <div className="h-3 w-24 bg-slate-50 rounded-full mt-3"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-[320px]">
          <div className="px-5 py-4 border-b border-slate-50">
            <div className="h-4 w-32 bg-slate-100 rounded-full"></div>
          </div>
          <div className="p-5 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-40 bg-slate-50 rounded-lg"></div>
                <div className="h-6 w-8 bg-slate-100 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-[320px]">
          <div className="p-5">
             <div className="h-4 w-32 bg-slate-100 rounded-full mb-6"></div>
             <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-slate-50 rounded-xl"></div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
