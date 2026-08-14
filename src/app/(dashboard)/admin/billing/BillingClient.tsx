'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

interface BillingClientProps {
  stats: {
    totalActiveMembers: number
    paidMembers: number
    pastDueMembers: number
  }
  cycleEnd: string
}

export default function BillingClient({ stats, cycleEnd }: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleRenew = async (gateway: 'paystack' | 'stripe') => {
    setLoading(gateway);

    const loadingToast = toast.loading(`Initializing ${gateway} checkout...`);

    try {
      const endpoint = gateway === 'paystack' 
        ? '/api/billing/paystack/initialize' 
        : '/api/billing/stripe/checkout';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Backend will extract orgId from current session
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment initialization failed');

      toast.success('Redirecting to secure checkout...', { id: loadingToast });

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : String(err)), { id: loadingToast });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Platform Fee */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-lg rounded-2xl p-6 border border-white/20 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/10 transition-all hover:shadow-xl">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Platform Fee (SaaS)</h2>
        <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-4 tracking-tight">₦100,000 <span className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-normal">/ month</span></p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">Your current cycle ends on <span className="font-semibold text-gray-900 dark:text-white">{cycleEnd}</span>.</p>
        
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider text-xs">Renew or Change Payment Method</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleRenew('paystack')}
              disabled={loading !== null}
              className="w-full bg-[#09A5DB] hover:bg-[#078ab8] text-white py-2.5 rounded-xl font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {loading === 'paystack' ? 'Processing...' : 'Pay with Paystack'}
            </button>
            <button 
              onClick={() => handleRenew('stripe')}
              disabled={loading !== null}
              className="w-full bg-[#635BFF] hover:bg-[#524be6] text-white py-2.5 rounded-xl font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              {loading === 'stripe' ? 'Processing...' : 'Pay with Stripe'}
            </button>
          </div>
        </div>
      </div>

      {/* Member Stats */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-lg rounded-2xl p-6 border border-white/20 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/10 transition-all hover:shadow-xl flex flex-col">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Member Subscription Status</h2>
        
        <div className="space-y-3 flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-center p-4 bg-gray-50/80 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Total Active Members</span>
            <span className="font-bold text-lg">{stats.totalActiveMembers}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <span className="font-medium">Paid (Yearly)</span>
            <span className="font-bold text-lg">{stats.paidMembers}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-red-50/80 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30">
            <span className="font-medium">Past Due</span>
            <span className="font-bold text-lg">{stats.pastDueMembers}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
