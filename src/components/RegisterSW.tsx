'use client'

import { useEffect } from 'react'

export function RegisterSW() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.workbox === undefined) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered successfully:', reg.scope)
          })
          .catch((err) => {
            console.error('[PWA] Service Worker registration failed:', err)
          })
      })
    }
  }, [])

  return null
}
