/**
 * Assessment Results Page
 * Shows comprehensive results from completed assessments
 */

'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { AssessmentResult } from '@/data/assessments'
import { UserProfile } from '@/data/assessment-integration'
import AssessmentResults from '@/components/assessment/AssessmentResults'
import { ASSESSMENTS } from '@/data/assessments'
import AssessmentService from '@/lib/assessment-service'
import { useAuth } from '@/components/providers/AuthProvider'

// Material Symbols icons import
import 'material-symbols/outlined.css'

export default function ResultsPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<Record<string, AssessmentResult> | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const loadResults = async () => {
      if (!user) {
        // If not authenticated, try to load from localStorage as fallback
        const storedResults = localStorage.getItem('assessmentResults')
        const storedProfile = localStorage.getItem('userProfile')

        if (storedResults) {
          try {
            setResults(JSON.parse(storedResults))
            // Try to load user profile, but don't require it for single assessment viewing
            if (storedProfile) {
              setUserProfile(JSON.parse(storedProfile))
            }
          } catch (error) {
            console.error('Error parsing stored results:', error)
            router.push('/assessments')
            return
          }
        } else {
          router.push('/assessments')
          return
        }
      } else {
        // If authenticated, load from database
        try {
          const latestProfile = await AssessmentService.getLatestUserProfile(user.id)
          const assessmentHistory = await AssessmentService.getAssessmentHistory(user.id)
          
          if (latestProfile && assessmentHistory.length > 0) {
            // Convert database results to the format expected by the UI
            const resultsMap: Record<string, AssessmentResult> = {}
            
            for (const entry of assessmentHistory) {
              // Get the most recent result for each assessment type
              if (!resultsMap[entry.assessmentId]) {
                resultsMap[entry.assessmentId] = {
                  score: entry.score,
                  level: entry.level,
                  description: '', // Will be filled from result_data
                  severity: entry.severity as any,
                  recommendations: [],
                  insights: entry.friendlyExplanation ? [entry.friendlyExplanation] : [],
                  nextSteps: []
                }
              }
            }
            
            setResults(resultsMap)
            setUserProfile(latestProfile.profile_data as unknown as UserProfile)
          } else {
            // Fallback to localStorage if no database data
            const storedResults = localStorage.getItem('assessmentResults')
            const storedProfile = localStorage.getItem('userProfile')

            if (storedResults) {
              setResults(JSON.parse(storedResults))
              if (storedProfile) {
                setUserProfile(JSON.parse(storedProfile))
              }
            } else {
              router.push('/assessments')
              return
            }
          }
        } catch (error) {
          console.error('Error loading results from database:', error)
          // Fallback to localStorage
          const storedResults = localStorage.getItem('assessmentResults')
          const storedProfile = localStorage.getItem('userProfile')

          if (storedResults) {
            setResults(JSON.parse(storedResults))
            if (storedProfile) {
              setUserProfile(JSON.parse(storedProfile))
            }
          } else {
            router.push('/assessments')
            return
          }
        }
      }

      setLoading(false)
    }

    loadResults()
  }, [user, router])

  const handleContinueToDashboard = () => {
    router.push('/dashboard?personalized=true')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Animated Results Icon */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-brand-green-100 to-brand-green-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <motion.span
                className="material-symbols-outlined text-4xl text-brand-green-700"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                analytics
              </motion.span>
            </div>
            
            {/* Floating Elements */}
            <motion.div
              className="absolute -top-2 -right-2 w-4 h-4 bg-brand-green-500 rounded-full"
              animate={{
                y: [0, -12, 0],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: 0.3
              }}
            />
            <motion.div
              className="absolute -bottom-2 -left-2 w-3 h-3 bg-brand-green-400 rounded-full"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.7
              }}
            />
          </motion.div>

          {/* Main Text */}
          <motion.h2
            className="text-2xl font-bold text-slate-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Loading your results...
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="text-slate-600 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Preparing your personalized assessment insights and recommendations.
          </motion.p>

          {/* Loading Bar */}
          <motion.div
            className="bg-slate-200 rounded-full h-2 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-brand-green-500 to-brand-green-600 rounded-full"
              animate={{
                width: ["0%", "30%", "60%", "90%", "100%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100 flex items-center justify-center">
        <div className="glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md">
          <span
            className="material-symbols-outlined text-4xl mb-4 block"
            style={{ color: '#ef4444' }}
          >
            warning
          </span>
          <h1 className="text-2xl font-semibold text-zinc-900 mb-2">No Results Found</h1>
          <p className="text-zinc-600 mb-6 font-medium">Please complete an assessment first.</p>
          <motion.button
            onClick={() => router.push('/assessments')}
            className="bg-brand-green-700 text-white px-6 py-3 rounded-xl hover:bg-brand-green-800 transition-all duration-300 font-semibold"
            style={{ backgroundColor: '#1f3d42' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Take Assessment
          </motion.button>
        </div>
      </div>
    )
  }

  const filterId = searchParams.get('assessment')
  const resultEntries = Object.entries(results).filter(([id]) => !filterId || id === filterId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => router.push('/assessments')}
              className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
              whileHover={{ x: -2 }}
            >
              <span
                className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform duration-200"
              >
                arrow_back
              </span>
              <span className="font-semibold">Back to Assessments</span>
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Your Assessment Results
              </h1>
              <p className="text-slate-600 font-medium">
                Completed {resultEntries.length} assessment{resultEntries.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Overview Card */}
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-brand-green-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-brand-green-700">
                  summarize
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Assessment Summary</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {resultEntries.map(([assessmentId, result]) => {
                const assessment = ASSESSMENTS[assessmentId]
                if (!assessment) return null

                return (
                  <AssessmentResults
                    key={assessmentId}
                    assessment={assessment}
                    result={result}
                    variant="compact"
                    showActions={false}
                    onRetake={() => {}}
                    onContinue={() => {}}
                  />
                )
              })}
            </div>
          </motion.div>

          {/* Individual Results */}
          <div className="space-y-8">
            {resultEntries.map(([assessmentId, result], index) => {
              const assessment = ASSESSMENTS[assessmentId]
              if (!assessment) return null

              return (
                <motion.div
                  key={assessmentId}
                  className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <AssessmentResults
                    assessment={assessment}
                    result={result}
                    onRetake={() => router.push('/assessments')}
                    onContinue={handleContinueToDashboard}
                  />
                </motion.div>
              )
            })}
          </div>

          {/* Continue to Dashboard */}
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-lg">
              <div className="mb-8">
                <div className="w-16 h-16 bg-brand-green-100 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl text-brand-green-700">
                    dashboard
                  </span>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Ready for Personalized Support?
              </h2>
              <p className="text-slate-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                Based on your results, we've personalized your dashboard with tailored recommendations,
                content, and support options to help you on your journey.
              </p>
              <motion.button
                onClick={handleContinueToDashboard}
                className="bg-brand-green-700 hover:bg-brand-green-800 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue to Personalized Dashboard
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
