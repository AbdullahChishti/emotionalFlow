'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { AssessmentManager } from '@/lib/services/AssessmentManager'
import AssessmentResults from '@/components/assessment/AssessmentResults'
import { ASSESSMENTS } from '@/data/assessments'
import { AssessmentResult } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Material Symbols icons import
import 'material-symbols/outlined.css'

interface MultipleResultsDisplayProps {
  results: Record<string, AssessmentResult>
  onRetake: () => void
  onNewAssessment: () => void
}

function MultipleResultsDisplay({ results, onRetake, onNewAssessment }: MultipleResultsDisplayProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-green-100 to-brand-green-200 rounded-2xl mb-4">
            <span className="material-symbols-outlined text-2xl text-brand-green-700">analytics</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Your Assessment Results</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Here's a comprehensive overview of your completed assessments and insights.
          </p>
        </motion.div>

        {/* Results Grid */}
        <div className="grid gap-8 max-w-6xl mx-auto">
          {Object.entries(results).map(([assessmentId, result], index) => {
            const assessment = ASSESSMENTS[assessmentId]
            if (!assessment) return null

            return (
              <motion.div
                key={assessmentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-green-100 to-brand-green-200 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-brand-green-700">analytics</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{assessment.title}</h2>
                      <p className="text-sm text-slate-600">{assessment.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <AssessmentResults
                    assessment={assessment}
                    result={result}
                    onRetake={() => router.push(`/assessments?retake=${assessmentId}`)}
                    onContinue={() => router.push('/dashboard')}
                    variant="summary"
                    showActions={true}
                    className="border-0 shadow-none bg-transparent p-0"
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={onRetake}
            className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 font-semibold"
          >
            Retake Assessments
          </button>
          <button
            onClick={onNewAssessment}
            className="px-6 py-3 bg-brand-green-700 text-white rounded-xl hover:bg-brand-green-800 transition-all duration-300 font-semibold shadow-md"
            style={{ backgroundColor: '#1f3d42' }}
          >
            Take New Assessment
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assessmentData, setAssessmentData] = useState<{
    assessment?: any
    result?: AssessmentResult
    results?: Record<string, AssessmentResult>
    mode: 'single' | 'multiple'
  }>({ mode: 'single' })

  const loadAssessmentData = useCallback(async () => {
    if (!user) {
      setError('Please log in to view assessment results.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const assessmentParam = searchParams.get('assessment')
      
      if (assessmentParam) {
        // Single assessment mode
        const assessment = ASSESSMENTS[assessmentParam]
        if (!assessment) {
          throw new Error(`Assessment ${assessmentParam} not found`)
        }

        // Try to get from localStorage first (for fresh completions)
        let result: AssessmentResult | null = null
        try {
          const storedResults = localStorage.getItem('assessmentResults')
          if (storedResults) {
            const parsedResults = JSON.parse(storedResults)
            result = parsedResults[assessmentParam]
          }
        } catch (e) {
          console.warn('Could not parse stored results:', e)
        }

        // If not in localStorage, fetch from database
        if (!result) {
          const history = await AssessmentManager.getAssessmentHistory(user.id)
          const latestEntry = history.find(entry => entry.assessmentId === assessmentParam)
          
          if (latestEntry) {
            result = {
              score: latestEntry.score,
              level: latestEntry.level,
              severity: latestEntry.severity,
              description: `You scored ${latestEntry.score} on the ${assessment.title}`,
              insights: latestEntry.friendlyExplanation ? [latestEntry.friendlyExplanation] : [],
              responses: {}
            }
          }
        }

        if (!result) {
          throw new Error('No results found for this assessment')
        }

        setAssessmentData({
          assessment,
          result,
          mode: 'single'
        })
      } else {
        // Multiple assessments mode - try localStorage first
        let results: Record<string, AssessmentResult> = {}
        
        try {
          const storedResults = localStorage.getItem('assessmentResults')
          if (storedResults) {
            results = JSON.parse(storedResults)
          }
        } catch (e) {
          console.warn('Could not parse stored results:', e)
        }

        // If no stored results, fetch recent from database
        if (Object.keys(results).length === 0) {
          const history = await AssessmentManager.getAssessmentHistory(user.id)
          
          // Group by assessment ID and take the most recent
          const latestResults: Record<string, AssessmentResult> = {}
          history.forEach(entry => {
            if (!latestResults[entry.assessmentId] || 
                new Date(entry.takenAt) > new Date(latestResults[entry.assessmentId].takenAt || 0)) {
              latestResults[entry.assessmentId] = {
                score: entry.score,
                level: entry.level,
                severity: entry.severity,
                description: `You scored ${entry.score} on the ${ASSESSMENTS[entry.assessmentId]?.title || 'Assessment'}`,
                insights: entry.friendlyExplanation ? [entry.friendlyExplanation] : [],
                responses: {},
                takenAt: entry.takenAt
              }
            }
          })
          
          results = latestResults
        }

        if (Object.keys(results).length === 0) {
          throw new Error('No assessment results found. Please complete an assessment first.')
        }

        setAssessmentData({
          results,
          mode: 'multiple'
        })
      }
    } catch (err) {
      console.error('Error loading assessment data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load assessment results')
    } finally {
      setLoading(false)
    }
  }, [user, searchParams])

  useEffect(() => {
    loadAssessmentData()
  }, [loadAssessmentData])

  const handleRetake = useCallback(() => {
    if (assessmentData.mode === 'single' && assessmentData.assessment) {
      router.push(`/assessments?retake=${assessmentData.assessment.id}`)
    } else {
      router.push('/assessments')
    }
  }, [assessmentData, router])

  const handleNewAssessment = useCallback(() => {
    router.push('/assessments')
  }, [router])

  const handleContinue = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="text-slate-600 mt-4">Loading your assessment results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-red-600">error</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Unable to Load Results</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/assessments')}
              className="px-6 py-3 bg-brand-green-700 text-white rounded-xl hover:bg-brand-green-800 transition-all duration-300 font-semibold"
              style={{ backgroundColor: '#1f3d42' }}
            >
              Take Assessment
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render based on mode
  if (assessmentData.mode === 'multiple' && assessmentData.results) {
    return (
      <MultipleResultsDisplay
        results={assessmentData.results}
        onRetake={handleRetake}
        onNewAssessment={handleNewAssessment}
      />
    )
  }

  if (assessmentData.mode === 'single' && assessmentData.assessment && assessmentData.result) {
    return (
      <AssessmentResults
        assessment={assessmentData.assessment}
        result={assessmentData.result}
        onRetake={handleRetake}
        onContinue={handleContinue}
        variant="full"
        showActions={true}
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">No Results Available</h1>
        <p className="text-slate-600 mb-6">No assessment results found.</p>
        <button
          onClick={() => router.push('/assessments')}
          className="px-6 py-3 bg-brand-green-700 text-white rounded-xl hover:bg-brand-green-800 transition-all duration-300 font-semibold"
          style={{ backgroundColor: '#1f3d42' }}
        >
          Take Assessment
        </button>
      </div>
    </div>
  )
}