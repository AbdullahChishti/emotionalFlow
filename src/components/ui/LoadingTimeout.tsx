'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

// Material Symbols icons import
import 'material-symbols/outlined.css'

interface LoadingTimeoutProps {
  timeout?: number // in milliseconds
  onTimeout?: () => void
  children?: React.ReactNode
  fallbackMessage?: string
}

export function LoadingTimeout({ 
  timeout = 10000, // 10 seconds default
  onTimeout,
  children,
  fallbackMessage = "Taking longer than expected. Please refresh the page if this continues."
}: LoadingTimeoutProps) {
  const [hasTimedOut, setHasTimedOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimedOut(true)
      onTimeout?.()
    }, timeout)

    return () => clearTimeout(timer)
  }, [timeout, onTimeout])

  if (hasTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
        <div className="glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md">
          <div className="mb-6">
            <span 
              className="material-symbols-outlined text-4xl mb-4 block"
              style={{ color: '#f59e0b' }}
            >
              warning
            </span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Loading Timeout</h2>
          <p className="text-zinc-600 mb-6 font-medium">{fallbackMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand-green-700 text-white px-6 py-3 rounded-xl hover:bg-brand-green-800 transition-all duration-300 font-semibold"
            style={{ backgroundColor: '#1f3d42' }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {children || (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </>
  )
}
