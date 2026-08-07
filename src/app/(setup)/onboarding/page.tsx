'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (gateway: 'paystack' | 'stripe') => {
    setLoading(gateway);

    const form = document.getElementById('onboardingForm') as HTMLFormElement;
    const orgName = (form.elements.namedItem('orgName') as HTMLInputElement).value;
    const slug = (form.elements.namedItem('slug') as HTMLInputElement).value;

    if (!orgName || !slug) {
      toast.error('Please fill out all fields.');
      setLoading(null);
      return;
    }

    const loadingToast = toast.loading(`Initializing ${gateway} checkout...`);

    try {
      const endpoint = gateway === 'paystack' 
        ? '/api/billing/paystack/initialize' 
        : '/api/billing/stripe/checkout';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName, slug })
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Create your Workspace
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Set up your organization and initiate your SaaS subscription.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl py-8 px-4 shadow-xl ring-1 ring-black/5 dark:ring-white/10 sm:rounded-2xl sm:px-10 transition-all duration-300">
          <form id="onboardingForm" className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cooperative Name
              </label>
              <div className="mt-1">
                <input
                  id="orgName"
                  name="orgName"
                  type="text"
                  required
                  placeholder="e.g. INEC Cooperative Society"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Workspace URL Slug
              </label>
              <div className="mt-1 flex rounded-lg shadow-sm overflow-hidden">
                <span className="inline-flex items-center px-3 border-y border-l border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 sm:text-sm">
                  kova.app/org/
                </span>
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-900 transition-all"
                  placeholder="my-coop"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-700/50">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 tracking-wider uppercase text-center text-muted-foreground">SaaS Subscription (100,000 NGN / mo)</h3>
              <div className="flex flex-col gap-3">
                <button 
                  type="button" 
                  onClick={() => handleSubscribe('paystack')}
                  disabled={loading !== null}
                  className="w-full bg-[#09A5DB] hover:bg-[#078ab8] text-white py-2.5 rounded-lg font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-blue-500/20"
                >
                  {loading === 'paystack' ? 'Processing...' : 'Subscribe via Paystack'}
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSubscribe('stripe')}
                  disabled={loading !== null}
                  className="w-full bg-[#635BFF] hover:bg-[#524be6] text-white py-2.5 rounded-lg font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-indigo-500/20"
                >
                  {loading === 'stripe' ? 'Processing...' : 'Subscribe via Stripe'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
