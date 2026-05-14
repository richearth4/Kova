'use client'
 
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Caught by route error handler:', error)
  }, [error])

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', minHeight: '100vh', background: 'white' }}>
      <h2 style={{ color: 'red' }}>Route Error Caught</h2>
      <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px', overflowX: 'auto', color: 'black' }}>
        {error.message}
      </pre>
      {error.stack && (
        <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px', marginTop: '1rem', overflowX: 'auto', fontSize: '0.8rem', color: 'black' }}>
          {error.stack}
        </pre>
      )}
      <button 
        onClick={() => reset()}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'black', color: 'white', borderRadius: '4px' }}
      >
        Try again
      </button>
    </div>
  )
}
