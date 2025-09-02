'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { LandingPage } from '@/components/landing/LandingPage'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { OnboardingFlow } from '@/components/auth/OnboardingFlow'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Navigation } from '@/components/ui/Navigation'


export default function Home() {
  const { user, loading, needsOnboarding } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user) {
    // Show onboarding for new users
    if (needsOnboarding || showOnboarding) {
      return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
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

  return <LandingPage />
}
