'use client'

import { useState } from 'react'
import { updateProfile, updatePassword } from './actions'

export default function ProfilePage({ user }: { user: any }) {
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleProfileSubmit(formData: FormData) {
    setIsProfileLoading(true)
    setProfileMessage(null)
    const result = await updateProfile(formData)
    setIsProfileLoading(false)
    setProfileMessage(result.success ? { type: 'success', text: 'Profile updated!' } : { type: 'error', text: result.error || 'Failed to update profile' })
  }

  async function handlePasswordSubmit(formData: FormData) {
    setIsPasswordLoading(true)
    setPasswordMessage(null)
    const result = await updatePassword(formData)
    setIsPasswordLoading(false)
    setPasswordMessage(result.success ? { type: 'success', text: 'Password changed!' } : { type: 'error', text: result.error || 'Failed to change password' })
    if (result.success) (document.getElementById('password-form') as HTMLFormElement).reset()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage your identity and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Personal Details</h3>
          </div>
          <form className="p-6 space-y-4" action={handleProfileSubmit}>
            {profileMessage && (
              <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {profileMessage.text}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">First Name</label>
                <input name="firstName" defaultValue={user.firstName} required className="block w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Last Name</label>
                <input name="lastName" defaultValue={user.lastName} required className="block w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</label>
              <input name="phoneNumber" defaultValue={user.phoneNumber || ''} className="block w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="+234..." />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Staff ID</label>
              <input disabled value={user.staffId || 'Not Assigned'} className="block w-full px-4 py-2.5 bg-slate-100 border-none rounded-xl text-xs font-bold text-slate-400 cursor-not-allowed" />
            </div>
            <button disabled={isProfileLoading} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-lg mt-2">
              {isProfileLoading ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </div>

        {/* Security / Password */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Security</h3>
          </div>
          <form id="password-form" className="p-6 space-y-4" action={handlePasswordSubmit}>
            {passwordMessage && (
              <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {passwordMessage.text}
              </div>
            )}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">New Password</label>
              <input name="password" type="password" required minLength={8} className="block w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Confirm New Password</label>
              <input name="confirmPassword" type="password" required minLength={8} className="block w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="••••••••" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Use at least 8 characters with a mix of letters and numbers.</p>
            <button disabled={isPasswordLoading} className="w-full py-3 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-300 transition-all shadow-sm mt-2">
              {isPasswordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
