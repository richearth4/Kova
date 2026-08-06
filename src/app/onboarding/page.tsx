import React from 'react';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Create your Cooperative Workspace
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Set up your organization and initiate your SaaS subscription.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" action="#" method="POST">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Workspace URL Slug
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 sm:text-sm">
                  kova.app/org/
                </span>
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-transparent"
                  placeholder="my-coop"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">SaaS Subscription (100,000 NGN / mo)</h3>
              <div className="flex flex-col gap-3">
                <button type="button" className="w-full bg-[#09A5DB] hover:bg-[#078ab8] text-white py-2 rounded-md font-medium transition-colors">
                  Subscribe via Paystack
                </button>
                <button type="button" className="w-full bg-[#635BFF] hover:bg-[#524be6] text-white py-2 rounded-md font-medium transition-colors">
                  Subscribe via Stripe
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
