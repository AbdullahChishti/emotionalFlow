'use client'

import React, { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Navigation } from '@/components/ui/Navigation'
import LandingPage from '@/components/landing/LandingPage'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { EnhancedOnboardingFlow } from '@/components/auth/EnhancedOnboardingFlow'
import { LoginScreen } from '@/components/screens/LoginScreen'
import { SignupScreen } from '@/components/screens/SignupScreen'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { LoadingTimeout } from '@/components/ui/LoadingTimeout'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Import all screen components
import { ProfileScreen } from '@/components/screens/ProfileScreen'
import { AssessmentFlow } from '@/components/assessment/AssessmentFlow'
import { ModernSessionScreen } from '@/components/session/ModernSessionScreen'
import { BackButton } from '@/components/ui/BackButton'

// Import assessment data
import {
  ASSESSMENTS,
  ASSESSMENT_CATEGORIES,
  ASSESSMENT_FLOW,
  AssessmentResult
} from '@/data/assessments'
import { UserProfile, AssessmentIntegrations } from '@/data/assessment-integration'

// Debug components removed - only show in development when needed

export function AppLayout() {
  const { user, loading, needsOnboarding } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showOnboarding, setShowOnboarding] = useState(false)
  
  // Assessment state
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null)
  const [assessmentResults, setAssessmentResults] = useState<Record<string, AssessmentResult>>({})
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Debug logging to help identify the issue
  console.log('AppLayout render:', {
    user: !!user,
    userId: user?.id,
    loading,
    needsOnboarding,
    pathname
  })

  // Force re-render when pathname changes
  useEffect(() => {
    console.log('Pathname changed to:', pathname)
  }, [pathname])

  // For login and signup pages, don't wait for auth to load
  if (loading && !['/login', '/signup'].includes(pathname)) {
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

  // Handle unauthenticated routes
  if (!user) {
    // Show specific pages for unauthenticated users
    if (pathname === '/login') {
      return <LoginScreen />
    }
    if (pathname === '/signup') {
      return <SignupScreen />
    }
    // Default to landing page for other routes
    return <LandingPage />
  }

  // Show enhanced onboarding for new users
  if (needsOnboarding || showOnboarding) {
    return <EnhancedOnboardingFlow onComplete={() => setShowOnboarding(false)} />
  }

  // Assessment flow handlers
  const handleFlowSelect = (flowId: string) => {
    setSelectedFlow(flowId)
  }

  const handleSingleAssessment = (assessmentId: string) => {
    setSelectedFlow('single')
    // Store the single assessment ID in a way AssessmentFlow can access it
    localStorage.setItem('singleAssessmentId', assessmentId)
  }

  const handleAssessmentComplete = (results: Record<string, AssessmentResult>, processedUserProfile: UserProfile) => {
    setAssessmentResults(results)
    setUserProfile(processedUserProfile)
    console.log('Assessment results:', results)
    console.log('Processed user profile:', processedUserProfile)

    // Clear single assessment ID
    localStorage.removeItem('singleAssessmentId')

    // Store results for later use (after user reviews them)
    localStorage.setItem('assessmentResults', JSON.stringify(results))
    localStorage.setItem('userProfile', JSON.stringify(processedUserProfile))

    // Generate personalized platform recommendations (store for later)
    const therapyPersonalization = AssessmentIntegrations.personalizeTherapy(processedUserProfile)
    const contentRecommendations = AssessmentIntegrations.recommendContent(processedUserProfile)
    const communityMatching = AssessmentIntegrations.matchCommunity(processedUserProfile)
    const wellnessPlan = AssessmentIntegrations.createWellnessPlan(processedUserProfile)
    const crisisDetection = AssessmentIntegrations.crisisDetection(processedUserProfile)

    console.log('Personalization:', {
      therapy: therapyPersonalization,
      content: contentRecommendations,
      community: communityMatching,
      wellness: wellnessPlan,
      crisis: crisisDetection
    })

    // Store personalization data for dashboard
    localStorage.setItem('personalizationData', JSON.stringify({
      therapy: therapyPersonalization,
      content: contentRecommendations,
      community: communityMatching,
      wellness: wellnessPlan,
      crisis: crisisDetection
    }))

    // Check for crisis - this should override everything
    if (crisisDetection.triggerImmediate) {
      console.warn('🚨 CRISIS DETECTED - Immediate intervention needed!')
      router.push('/crisis-support')
    } else {
      // All assessments completed - redirect to results page for the last assessment
      console.log('All assessments completed - showing final results')
      const assessmentIds = Object.keys(results)
      const lastAssessmentId = assessmentIds[assessmentIds.length - 1]
      router.push(`/results?assessment=${lastAssessmentId}`)
    }
  }

  const handleExit = () => {
    // Clear the flow selection
    setSelectedFlow(null)
    
    // Clear single assessment ID if it exists
    localStorage.removeItem('singleAssessmentId')

    // Check if we have stored assessment results (meaning user completed assessments)
    const storedResults = localStorage.getItem('assessmentResults')
    if (storedResults) {
      // Redirect to dashboard with personalized flag
      router.push('/dashboard?personalized=true')
    } else {
      // No results, just return to dashboard normally
      router.push('/dashboard')
    }
  }

  const handleNavigate = (screen: string, params?: any) => {
    router.push(`/${screen.toLowerCase()}`)
  }

  // Render assessment flow if selected
  if (selectedFlow) {
    let assessmentIds: string[] = []
    
    if (selectedFlow === 'single') {
      // Get the single assessment ID from localStorage
      const singleAssessmentId = localStorage.getItem('singleAssessmentId')
      if (singleAssessmentId) {
        assessmentIds = [singleAssessmentId]
      }
    } else {
      // Use the flow-based assessment IDs
      assessmentIds = ASSESSMENT_FLOW[selectedFlow as keyof typeof ASSESSMENT_FLOW] || []
    }

    return (
      <AssessmentFlow
        assessmentIds={assessmentIds}
        onComplete={handleAssessmentComplete}
        onExit={handleExit}
        userProfile={userProfile || undefined}
      />
    )
  }

  // Main app layout with persistent navigation
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20 pb-20 md:pb-0" key={pathname}>
        {renderCurrentScreen()}
      </div>
    </div>
  )

  function renderCurrentScreen() {
    switch (pathname) {
      case '/':
      case '/dashboard':
        return <Dashboard />
      
      case '/profile':
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
              <BackButton />
            </div>
            <ProfileScreen />
          </div>
        )
      
      case '/session':
        return (
          <ModernSessionScreen
            onNavigate={handleNavigate}
            matchedUser={{ name: 'Alex' }}
          />
        )
      
      case '/assessments':
        return <AssessmentsScreen />
      
      case '/crisis-support':
        return <CrisisSupportScreen />
      
      case '/community':
        return <CommunityScreen />
      
      case '/meditation':
        return <MeditationScreen />
      
      case '/wellness':
        return <WellnessScreen />
      
      case '/help':
        return <HelpScreen />
      
      case '/wallet':
        return <WalletScreen />
      
      case '/check-in':
        return <CheckInScreen />
      
      case '/results':
        return <ResultsScreen />
      
      default:
        return <Dashboard />
    }
  }

  // Screen components
  function AssessmentsScreen() {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <BackButton />
        </div>
        <div className="bg-gradient-to-br from-slate-50/80 via-blue-50/60 to-emerald-50/40 rounded-lg p-6 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gradient-to-r from-emerald-200/20 to-blue-200/20 blur-3xl animate-pulse" />
            <div className="absolute bottom-32 left-16 w-64 h-64 rounded-full bg-gradient-to-r from-blue-200/20 to-purple-200/20 blur-2xl animate-pulse" />
          </div>

          <div className="relative z-10 px-6 sm:px-10 lg:px-20 xl:px-40 py-6">
            <div className="max-w-5xl mx-auto">
              {/* Hero Section */}
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                  Mental Health Assessments
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
                  Understand your emotional well-being with our curated assessments. Each is designed to provide insights into different aspects of your mental health, helping you identify areas for growth and support.
                </p>
                
                {/* Professional Grade Info Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-full text-sm font-medium text-blue-800 shadow-sm">
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>Professional-grade assessments used by world's top psychologists</span>
                  <span className="material-symbols-outlined text-base">psychology</span>
                </div>
              </div>

              {/* Assessment Categories */}
              <div className="space-y-12">
                {/* Mood & Emotional Well-being */}
                <div>
                  <h3 className="text-2xl font-bold mb-8 border-b border-gray-200 pb-4">
                    Mood &amp; Emotional Well-being
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* PHQ-9 Depression Assessment */}
                    <div
                      className="group relative flex flex-col justify-between p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 cursor-pointer"
                      onClick={() => handleSingleAssessment('phq9')}
                    >
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Depression Screening</p>
                        <h4 className="text-xl font-semibold mt-1 text-gray-800">PHQ-9 Assessment</h4>
                        <p className="text-sm text-gray-600 mt-3">
                          Evaluate your depression symptoms over the past 2 weeks. This clinically validated assessment helps identify depression severity and treatment needs.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 mt-6 group-hover:text-blue-700 transition-colors">
                        Start Assessment
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* CD-RISC Resilience Assessment */}
                    <div
                      className="group relative flex flex-col justify-between p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 cursor-pointer"
                      onClick={() => handleSingleAssessment('cd-risc')}
                    >
                      <div>
                        <p className="text-sm text-emerald-600 font-medium">Emotional Resilience</p>
                        <h4 className="text-xl font-semibold mt-1 text-gray-800">CD-RISC Assessment</h4>
                        <p className="text-sm text-gray-600 mt-3">
                          Measure your ability to bounce back from difficult experiences. This assessment evaluates your emotional strength and coping mechanisms.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 mt-6 group-hover:text-emerald-700 transition-colors">
                        Start Assessment
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assessment Flows Section */}
                <div className="mt-12 pt-6 border-t border-gray-200">
                  <h3 className="text-2xl font-bold mb-8 text-center">Recommended Assessment Flows</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div
                      className="group relative flex flex-col justify-between p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 cursor-pointer"
                      onClick={() => handleFlowSelect('screening')}
                    >
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Quick Screening</p>
                        <h4 className="text-xl font-semibold mt-1 text-gray-800">Mental Health Check</h4>
                        <p className="text-sm text-gray-600 mt-3">
                          Complete depression and anxiety screening in about 10 minutes. Get immediate insights into your current mental health status.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 mt-6 group-hover:text-blue-700 transition-colors">
                        Start Screening
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    <div
                      className="group relative flex flex-col justify-between p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 cursor-pointer"
                      onClick={() => handleFlowSelect('comprehensive')}
                    >
                      <div>
                        <p className="text-sm text-emerald-600 font-medium">Comprehensive Evaluation</p>
                        <h4 className="text-xl font-semibold mt-1 text-gray-800">Complete Assessment Suite</h4>
                        <p className="text-sm text-gray-600 mt-3">
                          Take all assessments for a complete picture of your mental health, including trauma history, current symptoms, and resilience factors.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 mt-6 group-hover:text-emerald-700 transition-colors">
                        Start Comprehensive
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Information Pill */}
                <div className="flex justify-center mt-8 mb-6">
                  <div className="bg-amber-50/80 backdrop-blur-sm text-amber-800 text-sm px-4 py-2.5 rounded-full border border-amber-200 shadow-sm inline-flex items-center">
                    <svg className="w-4 h-4 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>For informational purposes only • Not a substitute for professional medical advice</span>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-gray-700 hover:bg-white/20 transition-all duration-300"
                  >
                    ← Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Placeholder screen components - these would be implemented based on existing components
  function CrisisSupportScreen() {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Crisis Support</h1>
        <p className="text-center text-gray-600">Crisis support content would go here</p>
      </div>
    )
  }

  function CommunityScreen() {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Community</h1>
        <p className="text-center text-gray-600">Community content would go here</p>
      </div>
    )
  }

  function MeditationScreen() {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Meditation</h1>
        <p className="text-center text-gray-600">Meditation content would go here</p>
      </div>
    )
  }

  function WellnessScreen() {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Wellness</h1>
        <p className="text-center text-gray-600">Wellness content would go here</p>
      </div>
    )
  }

  function HelpScreen() {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Help</h1>
        <p className="text-center text-gray-600">Help content would go here</p>
      </div>
    )
  }

  function WalletScreen() {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Wallet</h1>
        <p className="text-center text-gray-600">Wallet content would go here</p>
      </div>
    )
  }

  function CheckInScreen() {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Check In</h1>
        <p className="text-center text-gray-600">Check-in content would go here</p>
      </div>
    )
  }

  function ResultsScreen() {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Results</h1>
        <p className="text-center text-gray-600">Assessment results would go here</p>
      </div>
    )
  }
}
