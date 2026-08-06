import React from 'react';

export default function AdminBillingDashboard() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Organization Billing & Subscriptions</h1>
      <p className="text-gray-600 mb-8">
        Manage your Cooperative&apos;s platform subscription and view billing history.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Platform Fee */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Platform Fee (SaaS)</h2>
          <p className="text-3xl font-bold text-emerald-600 mb-4">₦100,000 <span className="text-sm font-normal text-gray-500">/ month</span></p>
          <p className="text-sm text-gray-600 mb-6">Your current cycle ends on Oct 1st, 2026.</p>
          
          <div className="space-y-4">
            <p className="text-sm font-medium">Renew or Change Payment Method:</p>
            <div className="flex flex-col gap-3">
              <button className="w-full bg-[#09A5DB] hover:bg-[#078ab8] text-white py-2 rounded-md font-medium transition-colors">
                Pay with Paystack
              </button>
              <button className="w-full bg-[#635BFF] hover:bg-[#524be6] text-white py-2 rounded-md font-medium transition-colors">
                Pay with Stripe
              </button>
            </div>
          </div>
        </div>

        {/* Member Stats */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Member Subscription Status</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded">
              <span className="text-gray-700 dark:text-gray-300">Total Active Members</span>
              <span className="font-bold">142</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded">
              <span>Paid (Yearly)</span>
              <span className="font-bold">120</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded">
              <span>Past Due</span>
              <span className="font-bold">22</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
