/**
 * Network Status Indicator
 * Shows network connectivity status and retry information
 */

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNetworkResilience } from '@/hooks/useNetworkResilience'

interface NetworkStatusProps {
  className?: string
}

export function NetworkStatus({ className = '' }: NetworkStatusProps) {
  const { isOnline, isReconnecting, retryCount, lastError } = useNetworkResilience()

  if (isOnline && !isReconnecting) {
    return null // Don't show anything when everything is working
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 right-4 z-50 ${className}`}
      >
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-4 max-w-sm">
          {!isOnline ? (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-medium text-slate-900">Offline</p>
                <p className="text-xs text-slate-600">Check your internet connection</p>
              </div>
            </div>
          ) : isReconnecting ? (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-medium text-slate-900">Reconnecting...</p>
                <p className="text-xs text-slate-600">
                  {retryCount > 0 && `Attempt ${retryCount}`}
                </p>
              </div>
            </div>
          ) : lastError ? (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-slate-900">Connection Error</p>
                <p className="text-xs text-slate-600">
                  {lastError.message || 'Unable to connect'}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
