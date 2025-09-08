'use client'

import React from 'react'
import { useApp } from '@/hooks/useApp'

export function AuthDebugPanel() {
  const { auth } = useApp()
  const { user, profile, isAuthenticated, isLoading, isInitialized } = auth

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm font-mono z-50 max-w-md">
      <h3 className="font-bold mb-2">🔐 Auth Debug</h3>
      <div className="space-y-1">
        <div>Initialized: <span className={isInitialized ? 'text-green-400' : 'text-red-400'}>
          {isInitialized ? '✅' : '❌'}
        </span></div>
        <div>Loading: <span className={isLoading ? 'text-yellow-400' : 'text-green-400'}>
          {isLoading ? '⏳' : '✅'}
        </span></div>
        <div>Authenticated: <span className={isAuthenticated ? 'text-green-400' : 'text-gray-400'}>
          {isAuthenticated ? '✅' : '❌'}
        </span></div>
        <div>User: <span className="text-blue-400">
          {user ? user.email : 'null'}
        </span></div>
        <div>Profile: <span className="text-purple-400">
          {profile ? profile.display_name : 'null'}
        </span></div>
      </div>
    </div>
  )
}
