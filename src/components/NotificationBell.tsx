'use client'

import { useEffect, useState } from 'react'
import { handleMarkAsRead, handleMarkAllAsRead } from '@/app/notifications/actions'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: Date | string
}

export default function NotificationBell({ 
  notifications: initialNotifications,
  userId 
}: { 
  notifications: Notification[],
  userId: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(initialNotifications)
  const unreadCount = localNotifications.filter(n => !n.read).length

  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Notification',
        filter: `userId=eq.${userId}`
      }, (payload) => {
        const newNotif = payload.new as Notification
        setLocalNotifications(prev => [newNotif, ...prev])
        
        // Trigger Toast
        toast.info(newNotif.title, {
          description: newNotif.message,
          icon: <div className="h-2 w-2 rounded-full bg-primary" />
        })
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Notification',
        filter: `userId=eq.${userId}`
      }, (payload) => {
        setLocalNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as Notification : n))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Sync with initial notifications when they change (e.g. on navigation)
  useEffect(() => {
    setLocalNotifications(initialNotifications)
  }, [initialNotifications])

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 focus:outline-none transition-all relative"
      >
        <span className="sr-only">View notifications</span>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl bg-white ring-1 ring-slate-100 focus:outline-none z-50 overflow-hidden">
          <div className="">
            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => handleMarkAllAsRead()}
                  className="text-[9px] font-black text-primary hover:text-blue-700 uppercase tracking-tighter"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {localNotifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`px-4 py-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 relative ${!n.read ? 'bg-primary/5' : ''}`}
                  onClick={async () => {
                    if (!n.read) await handleMarkAsRead(n.id)
                  }}
                >
                  {!n.read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full"></div>}
                  <p className="text-[11px] font-black text-slate-900 leading-tight">{n.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium">{n.message}</p>
                  <p className="text-[8px] font-black text-slate-300 mt-2 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))}
              {localNotifications.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Inbox Zero</p>
                  <p className="text-[9px] text-slate-400 mt-1">No operational notifications yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
