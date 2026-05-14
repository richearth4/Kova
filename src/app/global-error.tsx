'use client'
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
          <h2 style={{ color: 'red' }}>Global Error Caught</h2>
          <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
            {error.message}
          </pre>
          {error.stack && (
            <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px', marginTop: '1rem', overflowX: 'auto', fontSize: '0.8rem' }}>
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
      </body>
    </html>
  )
}
