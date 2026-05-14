'use client'

import React from 'react'

import { User } from '@prisma/client'

export default function MemberDetailsModal({ 
  member, 
  onClose 
}: { 
  member: User, 
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />

        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-blue-200">
                  {member.firstName[0]}{member.lastName[0]}
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Staff ID</p>
                  <p className="text-sm font-semibold text-gray-900 font-mono">{member.staffId || 'Not set'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Role</p>
                  <p className="text-sm font-semibold text-gray-900">{member.role}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Contact Information</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phone Number</span>
                    <span className="font-semibold text-gray-900">{member.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Email Address</span>
                    <span className="font-semibold text-gray-900">{member.email}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">System Metrics</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600/70">Joined Date</span>
                    <span className="font-semibold text-blue-900">{new Date(member.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600/70">Account ID</span>
                    <span className="font-mono text-[10px] text-blue-900">{member.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-bold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
