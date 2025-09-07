'use client'

import { useAuth } from '@/stores/authStore'

export function AuthDebug() {
  const { user, profile, loading } = useAuth()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>User: {user ? user.email : 'null'}</div>
        <div>Profile: {profile ? 'exists' : 'null'}</div>
        <div>User ID: {user?.id || 'null'}</div>
      </div>
    </div>
  )
}
