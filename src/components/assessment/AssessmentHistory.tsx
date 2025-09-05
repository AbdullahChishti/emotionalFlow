/**
 * Assessment History Component
 * Displays user's assessment history and progress
 */

'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { AssessmentManager, AssessmentHistoryEntry } from '@/lib/services/AssessmentManager'
import { ASSESSMENTS } from '@/data/assessments'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Material Symbols icons import
import 'material-symbols/outlined.css'

interface AssessmentHistoryProps {
  className?: string
}

export default function AssessmentHistory({ className = '' }: AssessmentHistoryProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const mountedRef = useRef(false)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Resolve userId from context or Supabase as a fallback
      const ctxUserId = user?.id
      const authUserId = ctxUserId || (await supabase.auth.getUser()).data.user?.id

      if (!authUserId) {
        setLoading(false)
        return
      }

      // Check cache first
      const cacheKey = `assessment-history-${authUserId}`
      const cachedData = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null
      
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData)
          if (Date.now() - parsedData.timestamp < 5 * 60 * 1000) {
            setAssessmentHistory(parsedData.data)
            setLoading(false)
            return
          }
        } catch (_) {
          // Ignore cache parse errors
        }
      }

      // Fetch fresh data
      const history = await AssessmentManager.getAssessmentHistory(authUserId)

      // Update cache
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify({ data: history, timestamp: Date.now() }))
      }

      setAssessmentHistory(history)
    } catch (error) {
      console.error('Error loading assessment history:', error)
      setError('Failed to load assessment history. Please try again.')
      if (retryCount < 3) {
        setTimeout(() => setRetryCount(prev => prev + 1), 2000)
      }
    } finally {
      setLoading(false)
    }
  }, [user, retryCount])

  useEffect(() => {
    mountedRef.current = true
    // Try to load regardless of authLoading, we have an internal fallback
    loadHistory()
    return () => { mountedRef.current = false }
  }, [])

  // Re-run when user resolves or retry requested
  useEffect(() => {
    if (!mountedRef.current) return
    if (!authLoading) {
      loadHistory()
    }
  }, [authLoading, user?.id, retryCount, loadHistory])

  const getAssessmentIcon = (assessmentId: string) => {
    const assessment = ASSESSMENTS[assessmentId]
    if (!assessment) return 'assessment'
    
    switch (assessment.category) {
      case 'depression': return 'mood'
      case 'anxiety': return 'psychology'
      case 'trauma': return 'healing'
      case 'resilience': return 'fitness_center'
      case 'wellbeing': return 'self_improvement'
      default: return 'assessment'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'normal': return 'text-green-600 bg-green-100'
      case 'mild': return 'text-yellow-600 bg-yellow-100'
      case 'moderate': return 'text-orange-600 bg-orange-100'
      case 'severe': return 'text-red-600 bg-red-100'
      case 'critical': return 'text-red-800 bg-red-200'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAssessmentClick = async (entry: AssessmentHistoryEntry) => {
    // Store the specific assessment result in localStorage for the results page
    const assessmentResult = {
      [entry.assessmentId]: {
        score: entry.score,
        level: entry.level,
        severity: entry.severity,
        insights: entry.friendlyExplanation ? [entry.friendlyExplanation] : [],
        responses: {}, // We don't have the raw responses in the history entry
        assessment: ASSESSMENTS[entry.assessmentId]
      }
    }

    try {
      localStorage.setItem('assessmentResults', JSON.stringify(assessmentResult))
      // Record the takenAt timestamp for freshness merging
      const takenAtMap: Record<string, string> = {}
      takenAtMap[entry.assessmentId] = entry.takenAt
      localStorage.setItem('assessmentResultsTakenAt', JSON.stringify(takenAtMap))
      // Persist latest profile for reliable fallback on Results page
      if (user?.id) {
        const latest = await AssessmentManager.getLatestUserProfile(user.id)
        if (latest?.profile_data) {
          localStorage.setItem('userProfile', JSON.stringify(latest.profile_data))
        }
      }
    } catch (err) {
      console.warn('Failed to cache assessment data for results page', err)
    }

    // Navigate to results page, scoping to this assessment
    const target = `/results?assessment=${encodeURIComponent(entry.assessmentId)}`
    try {
      router.push(target)
    } catch {
      window.location.href = target
    }
  }

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-6 h-32">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex space-x-4">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          </div>
        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment History</h2>
          <p className="text-gray-600">Loading your assessment history...</p>
        </div>
        {renderSkeleton()}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <span className="material-symbols-outlined text-red-500 text-4xl mb-3">error</span>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadHistory}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            disabled={loading}
          >
            {loading ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <p className="text-gray-600">Please sign in to view your assessment history.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Minimal Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-light text-gray-900 mb-4 tracking-tight">Previous Assessments</h2>
        <p className="text-gray-600 font-light max-w-md mx-auto">
          Track your progress and revisit past results
        </p>
      </motion.div>

      {/* Assessment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6"
        >
          {assessmentHistory.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-gray-400">assessment</span>
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-3">No assessments yet</h3>
              <p className="text-gray-600 font-light mb-8 max-w-sm mx-auto">
                Take your first assessment to begin tracking your journey
              </p>
              <motion.button
                onClick={() => window.location.href = '/assessments'}
                className="px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Assessment
              </motion.button>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {assessmentHistory.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  className="group bg-white border border-gray-200 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:border-gray-300 hover:shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAssessmentClick(entry)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-6">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
                        <span className="material-symbols-outlined text-xl text-gray-600 transition-colors duration-200">
                          {getAssessmentIcon(entry.assessmentId)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                          {entry.assessmentTitle}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 font-light">
                          {formatDate(entry.takenAt)}
                        </p>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-2xl font-light text-gray-900 mb-1">
                              {entry.score}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">
                              Score
                            </div>
                          </div>
                          <div className="text-center">
                            <div className={`text-sm font-medium mb-1 ${
                              entry.severity === 'normal' ? 'text-green-600' :
                              entry.severity === 'mild' ? 'text-yellow-600' :
                              entry.severity === 'moderate' ? 'text-orange-600' :
                              entry.severity === 'severe' ? 'text-red-600' : 'text-red-800'
                            }`}>
                              {entry.level}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">
                              Level
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
    </div>
  )
}

export { AssessmentHistory }
