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
  const [showScreenDemo, setShowScreenDemo] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (showScreenDemo) {
    return (
      <div>
        <ScreenRouter />
        <button
          onClick={() => setShowScreenDemo(false)}
          className="fixed top-4 left-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors z-50"
        >
          ← Back to Landing
        </button>
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

  return (
    <>
      <LandingPage />

      {/* Demo Controls */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
        {/* Complete Flow Demo */}
        <div className="group relative">
          <button
            onClick={() => setShowScreenDemo(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-full shadow-lg hover:shadow-xl shadow-violet-300/50 hover:from-violet-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View Complete Flow
          </button>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            See the entire user journey from start to finish
          </div>
        </div>

        {/* Individual Screens Demo */}
        <div className="group relative">
          <button
            onClick={() => setShowScreenDemo(true)}
            className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/30 text-foreground rounded-full shadow-lg hover:bg-white/90 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Screen Navigator
          </button>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Navigate between individual screens manually
          </div>
        </div>
      </div>

      {showScreenDemo && <ScreenDemo onClose={() => setShowScreenDemo(false)} />}
    </>
  )
}
