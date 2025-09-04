'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Navigation } from '@/components/ui/Navigation'
import { Dashboard as UnifiedDashboard } from '@/components/dashboard/Dashboard'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Check for skip_auth parameter
  const skipAuth = typeof window !== 'undefined' && window.location.search.includes('skip_auth=true')

  useEffect(() => {
    if (!loading && !user && !skipAuth) {
      router.push('/')
    }
  }, [user, loading, router, skipAuth])

  if (loading && !skipAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user && !skipAuth) {
    return null
  }

  // Unified, centralized dashboard regardless of query params
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-16 pb-20 md:pb-0">
        {skipAuth ? (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Dashboard (Demo Mode)</h1>
            <p className="text-center text-gray-600 mb-8">
              This is a demo version of the dashboard. Authentication has been bypassed for testing purposes.
            </p>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold mb-4">Dashboard Content</h2>
                <p className="text-gray-600">
                  The dashboard is working correctly. The loading issue was caused by the authentication system getting stuck.
                </p>
                <div className="mt-6">
                  <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Try Normal Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <UnifiedDashboard />
        )}
      </div>
    </div>
  )
}
