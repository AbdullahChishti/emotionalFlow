/**
 * Assessment History Component
 * Displays user's assessment history and progress
 */

'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import AssessmentService, { AssessmentHistoryEntry } from '@/lib/assessment-service'
import { ASSESSMENTS } from '@/data/assessments'
import { glassVariants } from '@/styles/glassmorphic-design-system'
import { useRouter } from 'next/navigation'

// Material Symbols icons import
import 'material-symbols/outlined.css'

interface AssessmentHistoryProps {
  className?: string
}

export default function AssessmentHistory({ className = '' }: AssessmentHistoryProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadHistory = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check cache first
      const cacheKey = `assessment-history-${user.id}`
      const cachedData = localStorage.getItem(cacheKey)
      
      if (cachedData) {
        const parsedData = JSON.parse(cachedData)
        // If cache is less than 5 minutes old, use it
        if (Date.now() - parsedData.timestamp < 5 * 60 * 1000) {
          setAssessmentHistory(parsedData.data)
          setLoading(false)
          return
        }
      }

      // Fetch fresh data
      const history = await AssessmentService.getAssessmentHistory(user.id)
      
      // Update cache
      localStorage.setItem(cacheKey, JSON.stringify({
        data: history,
        timestamp: Date.now()
      }))
      
      setAssessmentHistory(history)
    } catch (error) {
      console.error('Error loading assessment history:', error)
      setError('Failed to load assessment history. Please try again.')
      // Auto-retry up to 3 times
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
        }, 2000) // Retry after 2 seconds
      }
    } finally {
      setLoading(false)
    }
  }, [user, retryCount])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

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

  const handleAssessmentClick = (entry: AssessmentHistoryEntry) => {
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

    // Store in localStorage for the results page to access
    localStorage.setItem('assessmentResults', JSON.stringify(assessmentResult))
    
    // Navigate to results page
    router.push('/results')
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
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment History</h2>
        <p className="text-gray-600">
          Track your mental health journey and see how your scores change over time.
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
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-gray-400">assessment</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assessments Yet</h3>
              <p className="text-gray-600 mb-6">
                Complete your first assessment to start tracking your mental health journey.
              </p>
              <motion.button
                onClick={() => window.location.href = '/assessments'}
                className="px-6 py-3 text-white rounded-xl transition-colors duration-200"
                style={{ backgroundColor: '#335f64' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Take Assessment
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {assessmentHistory.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  className="group bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-brand-green-300 cursor-pointer transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAssessmentClick(entry)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200 group-hover:bg-brand-green-50 group-hover:border-brand-green-200 transition-colors duration-200">
                        <span className="material-symbols-outlined text-xl text-gray-600 group-hover:text-brand-green-600 transition-colors duration-200">
                          {getAssessmentIcon(entry.assessmentId)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {entry.assessmentTitle}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Completed on {formatDate(entry.takenAt)}
                        </p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-gray-900">
                              {entry.score}
                            </span>
                            <span className="text-sm text-gray-500">/ 10</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(entry.severity)}`}>
                            {entry.level}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 font-medium mb-2">
                        {entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1)} Severity
                      </div>
                      <div className="flex items-center text-brand-green-600 text-sm font-medium">
                        <span className="material-symbols-outlined text-lg mr-1">visibility</span>
                        View Details
                      </div>
                    </div>
                  </div>
                  
                  {entry.friendlyExplanation && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-700 leading-relaxed">{entry.friendlyExplanation}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
    </div>
  )
}
