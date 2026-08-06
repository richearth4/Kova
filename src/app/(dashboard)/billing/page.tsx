import React from 'react';

export default function MemberBillingPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Membership Billing</h1>
      <p className="text-gray-600 mb-8">
        Your active member fee is 5,000 NGN per year. This grants you access to loans, targeted savings, and the foodstuff marketplace.
      </p>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Annual Subscription</h2>
        <p className="text-3xl font-bold text-emerald-600 mb-4">₦5,000 <span className="text-sm font-normal text-gray-500">/ year</span></p>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Select your preferred payment method:</p>
          <div className="flex gap-4">
            <button className="flex-1 bg-[#09A5DB] hover:bg-[#078ab8] text-white py-3 rounded-md font-medium transition-colors">
              Pay with Paystack
            </button>
            <button className="flex-1 bg-[#635BFF] hover:bg-[#524be6] text-white py-3 rounded-md font-medium transition-colors">
              Pay with Stripe
            </button>
            <button className="flex-1 bg-[#003087] hover:bg-[#002569] text-white py-3 rounded-md font-medium transition-colors">
              Pay with PayPal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
