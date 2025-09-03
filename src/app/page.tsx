'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { LandingPage } from '@/components/landing/LandingPage'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { EnhancedOnboardingFlow } from '@/components/auth/EnhancedOnboardingFlow'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { LoadingTimeout } from '@/components/ui/LoadingTimeout'
import { Navigation } from '@/components/ui/Navigation'
// Debug components (only in development)
import { AuthDebugger } from '@/components/debug/AuthDebugger'
import { EnvChecker } from '@/components/debug/EnvChecker'
import { SupabaseTest } from '@/components/debug/SupabaseTest'


export default function Home() {
  const { user, loading, needsOnboarding } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // FOR TESTING: Uncomment the line below to force onboarding
  // const [showOnboarding, setShowOnboarding] = useState(true)

  // Debug logging to help identify the issue
  console.log('Home page render:', {
    user: !!user,
    userId: user?.id,
    loading,
    needsOnboarding
  })

  if (loading) {
    return (
      <LoadingTimeout
        timeout={12000} // 12 seconds timeout
        fallbackMessage="The app is taking longer than expected to load. This might be due to a slow connection or server issue."
      >
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
          <div className="glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-zinc-700 font-medium">Loading MindWell...</p>
            <p className="mt-2 text-sm text-zinc-600">Initializing your wellness journey</p>
          </div>
        </div>
      </LoadingTimeout>
    )
  }

  if (user) {
    // Show enhanced onboarding for new users
    if (needsOnboarding || showOnboarding) {
      return <EnhancedOnboardingFlow onComplete={() => setShowOnboarding(false)} />
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-16 pb-20 md:pb-0">
          <Dashboard />
        </div>
      </div>
    )
  }

  return (
    <>
      <LandingPage />
      <AuthDebugger />
      <EnvChecker />
      <SupabaseTest />
    </>
  )
}
