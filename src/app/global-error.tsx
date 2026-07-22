'use client'

import React, { useEffect } from 'react'

/**
 * Last-resort fallback if the root layout itself throws. It renders its own
 * <html>/<body> and cannot rely on the app's stylesheet, so styles are inline.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
          color: '#f5f3f0',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <p
            style={{
              color: '#f26b0f',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              fontSize: 12,
              fontFamily: 'monospace',
              margin: 0,
            }}
          >
            ◆ Error
          </p>
          <h1 style={{ fontSize: '2.5rem', textTransform: 'uppercase', margin: '12px 0 0', lineHeight: 1.05 }}>
            Something broke.
          </h1>
          <p style={{ color: '#b4b2a9', marginTop: 12, lineHeight: 1.5 }}>
            An unexpected error stopped the page from loading. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 24,
              background: '#f26b0f',
              color: '#1a1a1a',
              border: 'none',
              borderRadius: 6,
              padding: '12px 24px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
