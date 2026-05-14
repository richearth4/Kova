export default function MemberLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-pulse">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Balance Card Skeleton */}
        <div className="md:col-span-2 rounded-2xl p-8 bg-slate-800/10 h-[240px]">
          <div className="h-4 w-32 bg-slate-200 rounded-full mb-6"></div>
          <div className="h-12 w-48 bg-slate-200 rounded-xl mb-10"></div>
          <div className="flex gap-10">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded-full"></div>
              <div className="h-6 w-24 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded-full"></div>
              <div className="h-6 w-24 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Action Card Skeleton */}
        <div className="bg-card rounded-2xl border border-border p-6 flex flex-col justify-between h-[240px]">
          <div className="space-y-3">
            <div className="h-3 w-24 bg-slate-100 rounded-full mb-4"></div>
            <div className="h-10 w-full bg-slate-50 rounded-xl"></div>
            <div className="h-10 w-full bg-slate-50 rounded-xl"></div>
          </div>
          <div className="h-4 w-32 bg-slate-50 rounded-full mt-4"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="h-4 w-40 bg-slate-200 rounded-full"></div>
          <div className="h-3 w-20 bg-slate-100 rounded-full"></div>
        </div>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                <div className="flex gap-4 items-center">
                  <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-100 rounded-lg"></div>
                    <div className="h-3 w-20 bg-slate-50 rounded-full"></div>
                  </div>
                </div>
                <div className="h-4 w-24 bg-slate-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
