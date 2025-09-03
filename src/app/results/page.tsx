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

export default function ResultsPage() {
  const [results, setResults] = useState<Record<string, AssessmentResult> | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load results from localStorage
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
      // No results found, redirect back to assessments
      router.push('/assessments')
      return
    }

    setLoading(false)
  }, [router])

  const handleContinueToDashboard = () => {
    router.push('/dashboard?personalized=true')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!results || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">No Results Found</h1>
          <p className="text-slate-600 mb-6">Please complete an assessment first.</p>
          <button
            onClick={() => router.push('/assessments')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Take Assessment
          </button>
        </div>
      </div>
    )
  }

  const resultEntries = Object.entries(results)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/assessments')}
              className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Assessments</span>
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Your Assessment Results
              </h1>
              <p className="text-sm text-slate-500">
                Completed {resultEntries.length} assessment{resultEntries.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Overview Card */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Assessment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resultEntries.map(([assessmentId, result]) => {
                const assessment = ASSESSMENTS[assessmentId]
                return (
                  <div key={assessmentId} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {assessment?.shortTitle?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{assessment?.shortTitle || 'Unknown'}</h3>
                        <p className="text-sm text-slate-600">{result.level}</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{result.score}</div>
                  </div>
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
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
              <div className="mb-6">
                <span className="text-4xl">🎯</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Ready for Personalized Support?
              </h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Based on your results, we've personalized your dashboard with tailored recommendations,
                content, and support options to help you on your journey.
              </p>
              <button
                onClick={handleContinueToDashboard}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Continue to Personalized Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
