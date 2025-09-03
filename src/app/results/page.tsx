/**
 * Assessment Results Page
 * Shows comprehensive results from completed assessments
 */

'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
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

  useEffect(() => {
    const loadResults = async () => {
      if (!user) {
        // If not authenticated, try to load from localStorage as fallback
        const storedResults = localStorage.getItem('assessmentResults')
        const storedProfile = localStorage.getItem('userProfile')

        if (storedResults && storedProfile) {
          try {
            setResults(JSON.parse(storedResults))
            setUserProfile(JSON.parse(storedProfile))
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

            if (storedResults && storedProfile) {
              setResults(JSON.parse(storedResults))
              setUserProfile(JSON.parse(storedProfile))
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

          if (storedResults && storedProfile) {
            setResults(JSON.parse(storedResults))
            setUserProfile(JSON.parse(storedProfile))
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
      <div className="min-h-screen bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100 flex items-center justify-center">
        <div className="glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-600 mx-auto mb-4"></div>
          <p className="text-zinc-700 font-medium">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!results || !userProfile) {
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

  const resultEntries = Object.entries(results)

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
      {/* Header */}
      <div className="glassmorphic border-b border-white/20 px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => router.push('/assessments')}
              className="group flex items-center gap-2 text-zinc-700 hover:text-zinc-900 transition-colors duration-200"
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
              <h1 className="text-2xl font-semibold text-zinc-900">
                Your Assessment Results
              </h1>
              <p className="text-sm text-zinc-600 font-medium">
                Completed {resultEntries.length} assessment{resultEntries.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Overview Card */}
          <motion.div
            className="glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span
                className="material-symbols-outlined text-2xl"
                style={{ color: '#1f3d42' }}
              >
                summarize
              </span>
              <h2 className="text-xl font-semibold text-zinc-900">Assessment Summary</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="space-y-6">
            {resultEntries.map(([assessmentId, result], index) => {
              const assessment = ASSESSMENTS[assessmentId]
              if (!assessment) return null

              return (
                <motion.div
                  key={assessmentId}
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
            <div className="glassmorphic rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="mb-6">
                <span
                  className="material-symbols-outlined text-5xl"
                  style={{ color: '#1f3d42' }}
                >
                  dashboard
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
                Ready for Personalized Support?
              </h2>
              <p className="text-zinc-700 mb-6 max-w-md mx-auto font-medium">
                Based on your results, we've personalized your dashboard with tailored recommendations,
                content, and support options to help you on your journey.
              </p>
              <motion.button
                onClick={handleContinueToDashboard}
                className="bg-brand-green-700 hover:bg-brand-green-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#1f3d42' }}
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
