'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

function MockCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gateway = searchParams.get('gateway') || 'unknown';
  const reference = searchParams.get('reference');
  const amount = searchParams.get('amount') || '100000';

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!reference) {
      toast.error('Missing payment reference.');
    }
  }, [reference]);

  const simulateSuccess = async () => {
    if (!reference) return;
    setLoading(true);
    const toastId = toast.loading(`Simulating ${gateway} webhook...`);

    try {
      const endpoint = gateway === 'paystack' 
        ? '/api/billing/paystack/webhook' 
        : '/api/billing/stripe/webhook';

      let payload: any = {};
      
      if (gateway === 'paystack') {
        payload = {
          event: 'charge.success',
          data: {
            reference: reference
          }
        };
      } else if (gateway === 'stripe') {
        payload = {
          type: 'checkout.session.completed',
          data: {
            object: {
              client_reference_id: reference
            }
          }
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Webhook failed to process');

      toast.success('Payment Successful! Redirecting...', { id: toastId });
      
      setTimeout(() => {
        router.push('/admin/billing?success=true');
      }, 1500);

    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : String(err)), { id: toastId });
      setLoading(false);
    }
  };

  const simulateFailure = () => {
    toast.error('Payment cancelled.');
    setTimeout(() => {
      router.push('/admin/billing?canceled=true');
    }, 1000);
  };

  if (!reference) {
    return <div className="p-12 text-center text-red-500">Invalid Checkout Link</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        
        <div className="bg-blue-600 p-6 text-white text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-200 mb-1">Testing Mode</h2>
          <h1 className="text-2xl font-bold capitalize">{gateway} Mock Checkout</h1>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-gray-500 dark:text-gray-400 mb-2">Amount Due</p>
            <p className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">₦{Number(amount).toLocaleString()}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-8 text-xs font-mono text-gray-500 break-all border border-gray-200 dark:border-gray-700">
            <strong>Reference:</strong><br />
            {reference}
          </div>

          <div className="space-y-4">
            <button 
              onClick={simulateSuccess}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Simulate Successful Payment'}
            </button>
            <button 
              onClick={simulateFailure}
              disabled={loading}
              className="w-full bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 font-semibold py-3 rounded-xl transition-all"
            >
              Cancel Payment
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function MockCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading checkout...</div>}>
      <MockCheckoutContent />
    </Suspense>
  );
}
