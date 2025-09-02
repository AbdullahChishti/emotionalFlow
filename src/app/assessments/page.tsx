/**
 * Assessments Page - Main Page
 * Adapted layout with glassmorphic design matching our app theme
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AssessmentFlow } from '@/components/assessment/AssessmentFlow'
import {
  ASSESSMENTS,
  ASSESSMENT_CATEGORIES,
  ASSESSMENT_FLOW,
  AssessmentResult
} from '@/data/assessments'
import { UserProfile, AssessmentIntegrations } from '@/data/assessment-integration'
import { glassVariants, glassAnimations } from '@/styles/glassmorphic-design-system'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/TestAuthProvider'
import { Navigation } from '@/components/ui/Navigation'
import { BackButton } from '@/components/ui/BackButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useEffect } from 'react'

export default function AssessmentsPage() {
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null)
  const [assessmentResults, setAssessmentResults] = useState<Record<string, AssessmentResult>>({})
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleFlowSelect = (flowId: string) => {
    setSelectedFlow(flowId)
  }

  const handleAssessmentComplete = (results: Record<string, AssessmentResult>, processedUserProfile: UserProfile) => {
    setAssessmentResults(results)
    setUserProfile(processedUserProfile)
    console.log('Assessment results:', results)
    console.log('Processed user profile:', processedUserProfile)

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
      // All assessments completed - redirect to results page to show comprehensive results
      console.log('All assessments completed - showing final results')
      router.push('/results')
    }
  }

  const handleExit = () => {
    // Clear the flow selection
    setSelectedFlow(null)

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

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  if (selectedFlow) {
    return (
      <AssessmentFlow
        assessmentIds={ASSESSMENT_FLOW[selectedFlow as keyof typeof ASSESSMENT_FLOW] || []}
        onComplete={handleAssessmentComplete}
        onExit={handleExit}
        userProfile={userProfile || undefined}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-16 pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <BackButton />
          </div>
          <div className="bg-gradient-to-br from-slate-50/80 via-blue-50/60 to-emerald-50/40 rounded-lg p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        <motion.div
          className="absolute bottom-32 left-16 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
            filter: 'blur(30px)'
          }}
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2
          }}
        />
      </div>

      <div className="relative z-10 px-6 sm:px-10 lg:px-20 xl:px-40 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <span className="text-5xl">🧠</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
              Mental Health Assessments
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Understand your emotional well-being with our curated assessments. Each is designed to provide insights into different aspects of your mental health, helping you identify areas for growth and support.
            </p>
          </motion.div>

          {/* Assessment Categories */}
          <div className="space-y-16">
            {/* Mood & Emotional Well-being */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-8 border-b border-gray-200 pb-4">
                Mood &amp; Emotional Well-being
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                {/* PHQ-9 Depression Assessment */}
                <motion.div
                  className="group relative flex flex-col justify-between p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleFlowSelect('screening')}
                >
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Depression Screening</p>
                    <h4 className="text-xl font-semibold mt-1 text-gray-800">PHQ-9 Assessment</h4>
                    <p className="text-sm text-gray-600 mt-3">
                      Evaluate your depression symptoms over the past 2 weeks. This clinically validated assessment helps identify depression severity and treatment needs.
                    </p>
                  </div>
                  <motion.a
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 mt-6 group-hover:text-blue-700 transition-colors"
                    whileHover={{ x: 2 }}
                  >
                    Start Assessment
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.a>
                </motion.div>

                {/* Background Image Placeholder */}
                <div className="bg-gradient-to-br from-blue-100 to-emerald-100 rounded-lg min-h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🌱</div>
                    <p className="text-sm text-gray-600">Mental Wellness</p>
                  </div>
                </div>

                {/* CD-RISC Resilience Assessment */}
                <motion.div
                  className="group relative flex flex-col justify-between p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleFlowSelect('resilience')}
                >
                  <div>
                    <p className="text-sm text-emerald-600 font-medium">Emotional Resilience</p>
                    <h4 className="text-xl font-semibold mt-1 text-gray-800">CD-RISC Assessment</h4>
                    <p className="text-sm text-gray-600 mt-3">
                      Measure your ability to bounce back from difficult experiences. This assessment evaluates your emotional strength and coping mechanisms.
                    </p>
                  </div>
                  <motion.a
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 mt-6 group-hover:text-emerald-700 transition-colors"
                    whileHover={{ x: 2 }}
                  >
                    Start Assessment
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.a>
                </motion.div>

                {/* Background Image Placeholder */}
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg min-h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">💪</div>
                    <p className="text-sm text-gray-600">Building Strength</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stress & Anxiety */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold mb-8 border-b border-gray-200 pb-4">
                Stress &amp; Anxiety
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                {/* GAD-7 Anxiety Assessment */}
                <motion.div
                  className="group relative flex flex-col justify-between p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleFlowSelect('screening')}
                >
                  <div>
                    <p className="text-sm text-amber-600 font-medium">Anxiety Level</p>
                    <h4 className="text-xl font-semibold mt-1 text-gray-800">GAD-7 Assessment</h4>
                    <p className="text-sm text-gray-600 mt-3">
                      Evaluate your anxiety levels and identify potential symptoms of generalized anxiety disorder. This assessment provides insights into your anxiety patterns.
                    </p>
                  </div>
                  <motion.a
                    className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 mt-6 group-hover:text-amber-700 transition-colors"
                    whileHover={{ x: 2 }}
                  >
                    Start Assessment
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.a>
                </motion.div>

                {/* Background Image Placeholder */}
                <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg min-h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🧘</div>
                    <p className="text-sm text-gray-600">Finding Calm</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Trauma & Recovery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-2xl font-bold mb-8 border-b border-gray-200 pb-4">
                Trauma &amp; Recovery
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                {/* ACE Questionnaire */}
                <motion.div
                  className="group relative flex flex-col justify-between p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleFlowSelect('comprehensive')}
                >
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Childhood Trauma</p>
                    <h4 className="text-xl font-semibold mt-1 text-gray-800">ACE Questionnaire</h4>
                    <p className="text-sm text-gray-600 mt-3">
                      Assess experiences of childhood trauma and adverse events. This assessment helps understand how past experiences may impact current mental health.
                    </p>
                  </div>
                  <motion.a
                    className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 mt-6 group-hover:text-purple-700 transition-colors"
                    whileHover={{ x: 2 }}
                  >
                    Start Assessment
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.a>
                </motion.div>

                {/* Background Image Placeholder */}
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg min-h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🌈</div>
                    <p className="text-sm text-gray-600">Path to Healing</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Assessment Flows Section */}
          <motion.div
            className="mt-16 pt-8 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-2xl font-bold mb-8 text-center">Recommended Assessment Flows</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                className="group relative flex flex-col justify-between p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleFlowSelect('screening')}
              >
                <div>
                  <p className="text-sm text-blue-600 font-medium">Quick Screening</p>
                  <h4 className="text-xl font-semibold mt-1 text-gray-800">Mental Health Check</h4>
                  <p className="text-sm text-gray-600 mt-3">
                    Complete depression and anxiety screening in about 10 minutes. Get immediate insights into your current mental health status.
                  </p>
                </div>
                <motion.a
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 mt-6 group-hover:text-blue-700 transition-colors"
                  whileHover={{ x: 2 }}
                >
                  Start Screening
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.a>
              </motion.div>

              <motion.div
                className="group relative flex flex-col justify-between p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleFlowSelect('comprehensive')}
              >
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Comprehensive Evaluation</p>
                  <h4 className="text-xl font-semibold mt-1 text-gray-800">Complete Assessment Suite</h4>
                  <p className="text-sm text-gray-600 mt-3">
                    Take all assessments for a complete picture of your mental health, including trauma history, current symptoms, and resilience factors.
                  </p>
                </div>
                <motion.a
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 mt-6 group-hover:text-emerald-700 transition-colors"
                  whileHover={{ x: 2 }}
                >
                  Start Comprehensive
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.a>
              </motion.div>
            </div>
          </motion.div>

          {/* Important Information */}
          <motion.div
            className="text-center mt-16 pt-8 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto border border-white/20">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Important Information</h3>
              <div className="text-sm text-gray-600 space-y-3">
                <p>
                  These assessments are for informational purposes and are not a substitute for professional medical advice, diagnosis, or treatment.
                </p>
                <p>
                  All assessments included here are scientifically validated and freely available in the public domain.
                </p>
                <p>
                  If you're experiencing a mental health crisis, please contact emergency services or a crisis hotline immediately.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <motion.button
                onClick={handleBackToDashboard}
                className="px-6 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-gray-700 hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ← Back to Dashboard
              </motion.button>
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
