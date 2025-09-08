/**
 * Overall Assessment Hook
 * Handles overall assessment generation, state management, and error handling
 */

import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { OverallAssessmentService, OverallAssessmentResult } from '@/lib/services/OverallAssessmentService'
import { useAssessmentStore } from '@/stores/assessmentStore'

// Extended type to support error states
export interface ExtendedOverallAssessmentResult extends OverallAssessmentResult {
  isError?: boolean
  errorType?: string
  canRetry?: boolean
}

// Generation error types
type GenerationError =
  | 'NO_USER'
  | 'NO_ASSESSMENTS'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'SERVICE_ERROR'
  | 'AUTH_ERROR'
  | 'DATA_ERROR'
  | 'UNKNOWN_ERROR'

// Error message interface
interface ErrorInfo {
  title: string
  message: string
  canRetry: boolean
}

export function useOverallAssessment() {
  const { user } = useAuthStore()
  const { hasData: hasAssessmentData } = useAssessmentStore()

  // State management
  const [overallAssessment, setOverallAssessment] = useState<ExtendedOverallAssessmentResult | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentOverallAssessment')
      return stored ? JSON.parse(stored) : null
    }
    return null
  })

  const [isGeneratingOverall, setIsGeneratingOverall] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isGeneratingOverall') === 'true'
    }
    return false
  })

  const [showOverallResults, setShowOverallResults] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('showOverallResults') === 'true'
    }
    return false
  })

  const [overallProgress, setOverallProgress] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('overallProgress') || '0')
    }
    return 0
  })

  const [overallRetryCount, setOverallRetryCount] = useState(0)

  // Refresh assessment data from database
  const refreshAssessmentData = useCallback(async () => {
    if (!user?.id) return

    try {
      console.log('🔄 Refreshing assessment data from database...')
      const latest = await OverallAssessmentService.getLatestHolisticAssessment(user.id)

      if (latest && (!overallAssessment || latest.updatedAt > overallAssessment.updatedAt)) {
        console.log('✅ Found newer assessment data, updating state')
        setOverallAssessment(latest)
      } else {
        console.log('ℹ️ Assessment data is up to date')
      }
    } catch (error) {
      console.warn('Failed to refresh assessment data:', error)
    }
  }, [user?.id, overallAssessment])

  // Classify error type for better handling
  const classifyError = useCallback((error: any): GenerationError => {
    if (!error) return 'UNKNOWN_ERROR'

    const errorMessage = error.message?.toLowerCase() || ''
    const errorString = error.toString?.()?.toLowerCase() || ''

    // Check for specific error patterns
    if (errorMessage.includes('no assessments') || errorMessage.includes('assessment history')) {
      return 'NO_ASSESSMENTS'
    }
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return 'TIMEOUT_ERROR'
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
      return 'NETWORK_ERROR'
    }
    if (errorMessage.includes('unauthorized') || errorMessage.includes('auth') || errorMessage.includes('401')) {
      return 'AUTH_ERROR'
    }
    if (errorMessage.includes('service') || errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
      return 'SERVICE_ERROR'
    }
    if (errorMessage.includes('data') || errorMessage.includes('parse') || errorMessage.includes('validation')) {
      return 'DATA_ERROR'
    }

    return 'UNKNOWN_ERROR'
  }, [])

  // Get error message for user display
  const getErrorMessage = useCallback((errorType: GenerationError, retryCount: number): ErrorInfo => {
    switch (errorType) {
      case 'NO_USER':
        return {
          title: 'Authentication Required',
          message: 'Please log in to generate your insights.',
          canRetry: false
        }
      case 'NO_ASSESSMENTS':
        return {
          title: 'No Assessments Found',
          message: 'Complete at least one assessment to generate personalized insights.',
          canRetry: false
        }
      case 'NETWORK_ERROR':
        return {
          title: 'Connection Issue',
          message: retryCount > 0 ? 'Still having connection issues. Please check your internet connection.' : 'Unable to connect to our servers. Please check your internet connection.',
          canRetry: true
        }
      case 'TIMEOUT_ERROR':
        return {
          title: 'Request Timeout',
          message: retryCount > 0 ? 'The analysis is taking longer than expected. This might be due to high server load.' : 'The analysis is taking longer than expected. Let\'s try again.',
          canRetry: true
        }
      case 'SERVICE_ERROR':
        return {
          title: 'Service Temporarily Unavailable',
          message: retryCount > 0 ? 'Our AI analysis service is experiencing issues. Please try again in a few minutes.' : 'Our analysis service is temporarily unavailable.',
          canRetry: true
        }
      case 'AUTH_ERROR':
        return {
          title: 'Authentication Error',
          message: 'Your session has expired. Please refresh the page and try again.',
          canRetry: false
        }
      case 'DATA_ERROR':
        return {
          title: 'Data Processing Error',
          message: 'There was an issue processing your assessment data. Please try again.',
          canRetry: true
        }
      default:
        return {
          title: 'Unexpected Error',
          message: retryCount > 0 ? 'We\'re still experiencing technical difficulties. Please try again later.' : 'Something unexpected happened. Let\'s try again.',
          canRetry: true
        }
    }
  }, [])

  // Generate overall assessment with comprehensive error handling
  const generateOverallAssessment = useCallback(async () => {
    // Guard clauses - prevent execution in invalid states
    if (!user?.id) {
      console.warn('Generate insights called without valid user')
      return
    }

    if (isGeneratingOverall) {
      console.warn('Generate insights called while already generating')
      return
    }

    // Initialize state safely
    setIsGeneratingOverall(true)
    setOverallProgress(0)
    setShowOverallResults(true)
    setOverallAssessment(null)

    let progressInterval: NodeJS.Timeout | null = null
    let timeoutId: NodeJS.Timeout | null = null
    const currentErrorType: GenerationError | null = null

    // Cleanup function to ensure state consistency
    const cleanup = () => {
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    // Error handler that creates appropriate fallback response
    const handleError = (error: any, errorType?: GenerationError) => {
      cleanup()

      const detectedErrorType = errorType || classifyError(error)
      const errorInfo = getErrorMessage(detectedErrorType, overallRetryCount)

      console.error('Overall assessment generation failed:', {
        error,
        errorType: detectedErrorType,
        retryCount: overallRetryCount,
        canRetry: errorInfo.canRetry,
        userId: user.id
      })

      // Create error response that shows in the UI
      const errorResponse: ExtendedOverallAssessmentResult = {
        userId: user.id,
        assessmentData: {
          userId: user.id,
          assessments: [],
          assessmentCount: 0,
          dateRange: {
            earliest: new Date().toISOString(),
            latest: new Date().toISOString()
          },
          totalScore: 0,
          averageScore: 0
        },
        holisticAnalysis: {
          executiveSummary: errorInfo.message,
          manifestations: [
            'We encountered an issue generating your insights',
            errorInfo.canRetry ? 'You can try again using the button below' : 'Please complete an assessment first'
          ],
          unconsciousManifestations: [],
          riskFactors: ['Technical issue'],
          protectiveFactors: ['You\'re taking proactive steps to understand your mental health'],
          overallRiskLevel: 'low' as const,
          confidenceLevel: 0,
          supportiveMessage: errorInfo.canRetry
            ? 'Don\'t worry - this is just a temporary issue. Your data is safe and we\'ll try again.'
            : 'Take a moment to complete an assessment, then we can provide personalized insights.'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isError: true,
        errorType: detectedErrorType,
        canRetry: errorInfo.canRetry
      }

      setOverallAssessment(errorResponse)
      setIsGeneratingOverall(false)
      setOverallProgress(100)
    }

    try {
      // Pre-flight checks
      if (!hasAssessmentData) {
        handleError(new Error('No assessment data available'), 'NO_ASSESSMENTS')
        return
      }

      // Start progress simulation
      progressInterval = setInterval(() => {
        setOverallProgress(prev => {
          // More realistic progress curve
          if (prev >= 90) return prev // Stop at 90% until completion
          if (prev >= 70) return prev + Math.random() * 2 + 0.5 // Slow down near end
          if (prev >= 40) return prev + Math.random() * 4 + 1 // Medium speed
          return prev + Math.random() * 8 + 3 // Fast initial progress
        })
      }, 400)

      // Set multiple timeout layers for robustness
      const GENERATION_TIMEOUT = 60000 // 60 seconds - generous for AI processing

      timeoutId = setTimeout(() => {
        console.warn('Overall assessment generation timeout after 60s')
        handleError(new Error('Request timeout - analysis taking too long'), 'TIMEOUT_ERROR')
      }, GENERATION_TIMEOUT)

      // Attempt generation with timeout race
      const generationPromise = OverallAssessmentService.generateHolisticAssessment(user.id)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Generation timeout')), GENERATION_TIMEOUT - 5000)
      )

      const result = await Promise.race([generationPromise, timeoutPromise])

      // Success path
      cleanup()
      setOverallProgress(100)

      // Brief delay to show completion
      setTimeout(() => {
        setOverallAssessment(result)
        setIsGeneratingOverall(false)
        setOverallRetryCount(0) // Reset retry count on success
      }, 500)

    } catch (error) {
      const errorType = classifyError(error)
      const errorInfo = getErrorMessage(errorType, overallRetryCount)

      // Determine if we should retry
      const shouldRetry = errorInfo.canRetry &&
                         overallRetryCount < 2 &&
                         ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVICE_ERROR', 'UNKNOWN_ERROR'].includes(errorType)

      if (shouldRetry) {
        console.log(`Retrying overall assessment generation (attempt ${overallRetryCount + 1}/3)`)
        cleanup()
        setIsGeneratingOverall(false)
        setOverallRetryCount(prev => prev + 1)

        // Exponential backoff: 2s, 4s, 8s
        const retryDelay = Math.pow(2, overallRetryCount + 1) * 1000

        setTimeout(() => {
          generateOverallAssessment()
        }, retryDelay)
        return
      }

      // Final failure - show error state
      handleError(error, errorType)
    }
  }, [user?.id, isGeneratingOverall, hasAssessmentData, overallRetryCount, classifyError, getErrorMessage])

  // Persist state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (overallAssessment) {
        localStorage.setItem('currentOverallAssessment', JSON.stringify(overallAssessment))
      } else {
        localStorage.removeItem('currentOverallAssessment')
      }
    }
  }, [overallAssessment])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isGeneratingOverall', isGeneratingOverall.toString())
    }
  }, [isGeneratingOverall])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showOverallResults', showOverallResults.toString())
    }
  }, [showOverallResults])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('overallProgress', overallProgress.toString())
    }
  }, [overallProgress])

  // Listen for tab visibility changes and refresh data when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        console.log('👁️ Tab became visible, refreshing assessment data...')
        refreshAssessmentData()
      }
    }

    const handleWindowFocus = () => {
      if (user?.id) {
        console.log('🎯 Window focused, refreshing assessment data...')
        refreshAssessmentData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [user?.id, refreshAssessmentData])

  return {
    // State
    overallAssessment,
    isGeneratingOverall,
    showOverallResults,
    overallProgress,
    overallRetryCount,

    // Actions
    generateOverallAssessment,
    setShowOverallResults,
    setOverallAssessment,
    refreshAssessmentData,

    // Computed
    hasOverallAssessment: !!overallAssessment,
    canGenerateAssessment: !!(user?.id && hasAssessmentData && !isGeneratingOverall)
  }
}
