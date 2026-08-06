import React from 'react';

export default function SuperAdminDashboard() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Platform Command Center</h1>
      <p className="text-gray-600 mb-8">
        Manage SaaS operations, view MRR, and monitor all active Cooperatives.
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 font-medium">Monthly Recurring Revenue (MRR)</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">₦4,200,000</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 font-medium">Active Cooperatives</p>
          <p className="text-3xl font-bold mt-2">42</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 font-medium">Total Paid Members (Platform)</p>
          <p className="text-3xl font-bold mt-2">1,840</p>
        </div>
      </div>

      {/* Cooperatives Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Registered Organizations</h2>
          <button className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Export CSV
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRR (Members)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium">INEC Cooperative</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">inec</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">320</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-red-600 hover:text-red-900 dark:hover:text-red-400">Suspend</button>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium">Teachers Union Thrift</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">teachers</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Past Due
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">142</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-red-600 hover:text-red-900 dark:hover:text-red-400">Suspend</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
