'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Profile, MoodEntry, ListeningSession } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/data/assessment-integration'
import { AssessmentResult, ASSESSMENTS } from '@/data/assessments'
import { AssessmentManager, AssessmentHistoryEntry } from '@/lib/services/AssessmentManager'
import { buildUserSnapshot, Snapshot } from '@/lib/snapshot'
import { OverallAssessmentService, OverallAssessmentResult } from '@/lib/services/OverallAssessmentService'

// Extended type to support error states
interface ExtendedOverallAssessmentResult extends OverallAssessmentResult {
  isError?: boolean
  errorType?: string
  canRetry?: boolean
}

// Extend window interface for debounce tracking
declare global {
  interface Window {
    lastGenerateInsightsClick?: number
  }
}
import { OverallAssessmentResults, OverallAssessmentLoading } from '@/components/assessment/OverallAssessmentResults'

// Material Symbols icons import
import 'material-symbols/outlined.css'

// Modern, minimal reusable components
interface StatCardProps {
  icon: string
  value: string | number
  label: string
  loading?: boolean
  trend?: 'up' | 'down' | 'neutral'
}

function StatCard({ icon, value, label, loading, trend }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="w-8 h-8 bg-slate-200/60 rounded-2xl"></div>
          <div className="w-16 h-7 bg-slate-200/60 rounded-lg"></div>
          <div className="w-20 h-4 bg-slate-200/60 rounded-md"></div>
        </div>
      </div>
    )
  }

  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-rose-500',
    neutral: 'text-slate-400'
  }

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 hover:bg-white hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 group"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-slate-50/80 rounded-2xl flex items-center justify-center group-hover:bg-slate-100/80 transition-colors duration-300">
          <span className="material-symbols-outlined text-slate-600 text-xl">{icon}</span>
        </div>
        {trend && (
          <span className={`material-symbols-outlined text-sm ${trendColors[trend]}`}>
            {trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat'}
          </span>
        )}
      </div>
      <div className="text-2xl font-light text-slate-900 mb-2 tracking-tight">{value}</div>
      <div className="text-sm text-slate-500 font-light">{label}</div>
    </motion.div>
  )
}

interface ActionCardProps {
  icon: string
  label: string
  description: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
  loading?: boolean
}

function ActionCard({ icon, label, description, onClick, variant = 'primary', disabled, loading }: ActionCardProps) {
  const variants = {
    primary: {
      base: "bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-800",
      hover: "hover:from-slate-800 hover:to-slate-700 hover:shadow-2xl hover:shadow-slate-900/20",
      icon: "bg-white/10 text-white",
      description: "text-white/70"
    },
    secondary: {
      base: "bg-white/80 backdrop-blur-sm text-slate-900 border-slate-200/50",
      hover: "hover:bg-white hover:shadow-xl hover:border-slate-300/60",
      icon: "bg-slate-100/80 text-slate-600",
      description: "text-slate-500"
    },
    outline: {
      base: "bg-transparent text-slate-700 border-slate-300/60",
      hover: "hover:bg-slate-50/80 hover:border-slate-400/60",
      icon: "bg-slate-100/60 text-slate-600",
      description: "text-slate-500"
    }
  }

  const currentVariant = variants[variant]

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center gap-4 p-6 rounded-3xl border transition-all duration-300 w-full min-h-[100px]
        ${currentVariant.base} ${currentVariant.hover}
        ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:ring-offset-2
      `}
      whileHover={!disabled && !loading ? { y: -2, scale: 1.01 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${currentVariant.icon}`}>
        {loading ? (
          <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
        ) : (
          <span className="material-symbols-outlined text-xl">{icon}</span>
        )}
      </div>
      <div className="text-left flex-1 min-w-0">
        <div className="font-medium text-base mb-1 tracking-tight">{label}</div>
        <div className={`text-sm font-light leading-relaxed ${currentVariant.description}`}>
          {description}
        </div>
      </div>
      <span className="material-symbols-outlined text-xl flex-shrink-0 opacity-40">arrow_forward</span>
    </motion.button>
  )
}

// Constants to prevent magic numbers
const FETCH_TIMEOUT = 15000 // 15 seconds to avoid false timeouts
const RETRY_DELAY = 2000 // 2 seconds
const MAX_RETRIES = 1

export function Dashboard() {
  const { user, profile } = useAuth()
  const router = useRouter()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [assessmentResults, setAssessmentResults] = useState<Record<string, AssessmentResult>>({})
  const [hasAssessmentData, setHasAssessmentData] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [dataFetched, setDataFetched] = useState(false)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [whyOpen, setWhyOpen] = useState(false)
  const [history, setHistory] = useState<AssessmentHistoryEntry[]>([])
  const [latestMeta, setLatestMeta] = useState<Record<string, string>>({})
  const [coverage, setCoverage] = useState<{ assessed: string[]; missing: string[]; stale: string[] }>({ assessed: [], missing: [], stale: [] })

  // Overall assessment state with persistence
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
  // Latest saved overall assessment for impact card
  const [latestOverall, setLatestOverall] = useState<OverallAssessmentResult | null>(null)
  const [loadingImpact, setLoadingImpact] = useState(false)

  // Prevent multiple simultaneous fetches
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized navigation handler
  const handleNavigate = useCallback((path: string) => {
    try {
      router.push(path)
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback to window.location if router fails
      window.location.href = path
    }
  }, [router])

  // Enhanced error types for better user feedback
  type GenerationError = 
    | 'NO_USER'
    | 'NO_ASSESSMENTS' 
    | 'NETWORK_ERROR'
    | 'TIMEOUT_ERROR'
    | 'SERVICE_ERROR'
    | 'AUTH_ERROR'
    | 'DATA_ERROR'
    | 'UNKNOWN_ERROR'

  const getErrorMessage = (errorType: GenerationError, retryCount: number): { title: string; message: string; canRetry: boolean } => {
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
  }

  // Classify error type for better handling
  const classifyError = (error: any): GenerationError => {
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
  }

  // Watertight generate overall assessment with comprehensive error handling
  const handleGenerateOverallAssessment = useCallback(async () => {
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
    let currentErrorType: GenerationError | null = null
    
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
          handleGenerateOverallAssessment()
        }, retryDelay)
        return
      }
      
      // Final failure - show error state
      handleError(error, errorType)
    }
  }, [user?.id, isGeneratingOverall, hasAssessmentData, overallRetryCount])

  // Data fetching function (explicit userId to avoid stale closures)
  const fetchAssessmentData = useCallback(async (userId: string): Promise<{ results: Record<string, AssessmentResult>; history: AssessmentHistoryEntry[]; latest: Record<string, string> }> => {
    console.log('[Dash] fetchAssessmentData:start', { userId })
    if (!userId) return { results: {}, history: [], latest: {} }

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<AssessmentHistoryEntry[]>((resolve) =>
        setTimeout(() => resolve([]), FETCH_TIMEOUT)
      )

      // Fetch assessment history with timeout
      const dataPromise = AssessmentManager.getAssessmentHistory(userId)
      const t0 = performance.now()
      const assessmentHistory = await Promise.race([dataPromise, timeoutPromise]) as AssessmentHistoryEntry[]
      const dur = Math.round(performance.now() - t0)
      console.log('[Dash] getAssessmentHistory:ms', dur)
      console.log('[Dash] fetchAssessmentData:history', { count: assessmentHistory?.length || 0 })

      if (!assessmentHistory || assessmentHistory.length === 0) {
        return { results: {}, history: [], latest: {} }
      }

      // Convert to expected format - keep only latest result per assessment
      const results: Record<string, AssessmentResult> = {}
      const latestTimes: Record<string, Date> = {}

      for (const entry of assessmentHistory) {
        const entryTime = new Date(entry.takenAt)
        const currentLatest = latestTimes[entry.assessmentId]

        if (!currentLatest || entryTime > currentLatest) {
          results[entry.assessmentId] = {
            score: entry.score,
            level: entry.level,
            description: '',
            severity: entry.severity as any,
            recommendations: [],
            insights: entry.friendlyExplanation ? [entry.friendlyExplanation] : [],
            nextSteps: [],
            manifestations: []
          }
          latestTimes[entry.assessmentId] = entryTime
        }
      }

      const latest: Record<string, string> = Object.fromEntries(Object.entries(latestTimes).map(([k, v]) => [k, v.toISOString()]))
      const payload = { results, history: assessmentHistory, latest }
      console.log('[Dash] fetchAssessmentData:done', { resultsCount: Object.keys(results).length })
      return payload
    } catch (error) {
      console.error('Error fetching assessment data:', error)
      // Graceful fallback instead of throwing so UI doesn't hard-fail
      return { results: {}, history: [], latest: {} }
    }
  }, [])

  // Main data fetching effect
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      console.log('[Dash] effect:fetchData:enter', { userReady: !!user?.id, profileReady: !!profile, dataFetched, isFetching })
      if (!user?.id) {
        console.log('[Dash] effect:skip (no user)')
        setLoading(false)
        return
      }
      if (!profile) {
        console.log('[Dash] effect:skip (no profile)')
        setLoading(false)
        return
      }
      if (dataFetched) {
        console.log('[Dash] effect:skip (already fetched)')
        setLoading(false)
        return
      }
      if (isFetching) {
        console.log('[Dash] effect:skip (already fetching)')
        setLoading(false)
        return
      }

      setIsFetching(true)
      console.log('[Dash] effect:fetch:start')

      try {
        // Try to load from localStorage first for immediate display
        const storedResults = localStorage.getItem('assessmentResults')
        if (storedResults) {
          try {
            const parsed = JSON.parse(storedResults)
            if (Object.keys(parsed).length > 0) {
              setAssessmentResults(parsed)
              setHasAssessmentData(true)
              console.log('[Dash] localStorage:used', { keys: Object.keys(parsed).length })
            }
          } catch (parseError) {
            console.warn('Failed to parse stored assessment results:', parseError)
            localStorage.removeItem('assessmentResults')
          }
        }

        // Fetch fresh data from database
        console.log('[Dash] db:fetch:start')
        const { results: freshResults, history: freshHistory, latest } = await fetchAssessmentData(user.id)
        console.log('[Dash] db:fetch:done', { resultsCount: Object.keys(freshResults).length, historyCount: freshHistory.length })

        if (isMounted) {
          setAssessmentResults(freshResults)
          setHasAssessmentData(Object.keys(freshResults).length > 0)
          setDataFetched(true)
          setHistory(freshHistory)
          setLatestMeta(latest)
          console.log('[Dash] state:update:complete')

          // Build snapshot (non-blocking)
          if (user?.id) {
            Promise.resolve(buildUserSnapshot(user.id))
              .then(snap => { setSnapshot(snap); console.log('[Dash] snapshot:ready') })
              .catch(err => console.warn('Snapshot build failed:', err))
          }

          // Compute coverage
          const allIds = Object.keys(ASSESSMENTS)
          const now = Date.now()
          const staleCutoffDays = 30
          const assessed: string[] = []
          const missing: string[] = []
          const stale: string[] = []
          for (const id of allIds) {
            const dt = latest[id]
            if (!dt) {
              missing.push(id)
              continue
            }
            const ageDays = Math.floor((now - new Date(dt).getTime()) / (1000 * 60 * 60 * 24))
            if (ageDays > staleCutoffDays) stale.push(id)
            else assessed.push(id)
          }
          setCoverage({ assessed, missing, stale })

          // Update localStorage with fresh data
          try {
            localStorage.setItem('assessmentResults', JSON.stringify(freshResults))
            console.log('[Dash] localStorage:updated')
          } catch (storageError) {
            console.warn('Failed to store assessment results:', storageError)
          }
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error)
        if (isMounted) {
          // Do not hard-fail on errors; show empty state instead
          setError(null)
          setDataFetched(true)
          setHasAssessmentData(false)
          console.log('[Dash] fetch:error:graceful-empty')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setIsFetching(false)
          console.log('[Dash] effect:fetch:finally', { loading: false, isFetching: false })
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
      setIsFetching(false)
      console.log('[Dash] cleanup')
    }
  }, [user?.id, profile, retryCount, dataFetched]) // Stable dependencies to prevent infinite loops

  // URL parameter handling effect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('personalized') === 'true') {
      // Clean URL and refresh data
      window.history.replaceState({}, document.title, window.location.pathname)
      setDataFetched(false)
      setRetryCount(0)
    }
  }, [])

  // Loading timeout effect - prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('Dashboard loading timeout - forcing loaded state')
        setLoading(false)
        setIsFetching(false)
      }, 30000) // 30 second timeout

      return () => clearTimeout(timeout)
    }
  }, [loading])

  // Persist overall assessment state to localStorage
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

  // Enhanced cleanup effect for overall assessment generation
  useEffect(() => {
    let cleanupTimeouts: NodeJS.Timeout[] = []
    
    return () => {
      // Cleanup any running intervals or timeouts when component unmounts
      if (isGeneratingOverall || showOverallResults) {
        console.log('🚨 Dashboard unmounting during overall assessment:', {
          isGeneratingOverall,
          showOverallResults,
          hasOverallAssessment: !!overallAssessment,
          timestamp: new Date().toISOString()
        })
        
        // If we're generating, save the state for recovery
        if (isGeneratingOverall && typeof window !== 'undefined') {
          localStorage.setItem('dashboardUnmountedDuringGeneration', 'true')
          localStorage.setItem('unmountTimestamp', Date.now().toString())
        }
      }
      
      // Clear any pending cleanup timeouts
      cleanupTimeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [isGeneratingOverall, showOverallResults, overallAssessment])

  // Recovery effect - handle cases where component unmounted during generation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const unmountedDuringGeneration = localStorage.getItem('dashboardUnmountedDuringGeneration')
      const unmountTimestamp = localStorage.getItem('unmountTimestamp')
      
      if (unmountedDuringGeneration === 'true' && unmountTimestamp) {
        const timeSinceUnmount = Date.now() - parseInt(unmountTimestamp)
        
        // If less than 2 minutes have passed, we might still be generating
        if (timeSinceUnmount < 120000) {
          console.log('🔄 Recovering from unmount during generation')
          setIsGeneratingOverall(false) // Reset generation state
          setShowOverallResults(false) // Hide results modal
          setOverallProgress(0) // Reset progress
          
          // Show a brief recovery message
          const recoveryTimeout = setTimeout(() => {
            // Could show a toast notification here if we had one
            console.log('✅ Dashboard state recovered after unmount')
          }, 1000)
          
          return () => clearTimeout(recoveryTimeout)
        }
        
        // Clean up old recovery data
        localStorage.removeItem('dashboardUnmountedDuringGeneration')
        localStorage.removeItem('unmountTimestamp')
      }
    }
  }, [])

  // Utility functions
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const getFormattedDate = useCallback(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [])

  const getSeverityColor = useCallback((severity: string) => {
    const colors = {
      normal: 'text-green-600 bg-green-100',
      mild: 'text-emerald-600 bg-emerald-100',
      moderate: 'text-amber-600 bg-amber-100',
      severe: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100'
    }
    return colors[severity as keyof typeof colors] || 'text-slate-600 bg-slate-100'
  }, [])

  // Map level bands (low/mild/moderate/high) to badge styles
  const getLevelBadgeClasses = useCallback((level: string) => {
    const map: Record<string, string> = {
      low: 'text-slate-700 bg-slate-50 border border-slate-200',
      mild: 'text-amber-800 bg-amber-50 border border-amber-200',
      moderate: 'text-amber-800 bg-amber-50 border border-amber-200',
      high: 'text-red-700 bg-red-50 border border-red-200',
      critical: 'text-red-700 bg-red-50 border border-red-200'
    }
    return map[level?.toLowerCase()] || 'text-slate-700 bg-slate-50 border border-slate-200'
  }, [])

  const getMaxScore = useCallback((assessmentId: string) => {
    const assessment = ASSESSMENTS[assessmentId]
    if (!assessment) return 100
    const lastRange = assessment.scoring.ranges[assessment.scoring.ranges.length - 1]
    return lastRange?.max ?? 100
  }, [])

  const formatRelative = useCallback((iso?: string) => {
    if (!iso) return ''
    const diffMs = Date.now() - new Date(iso).getTime()
    const d = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (d <= 0) {
      const h = Math.floor(diffMs / (1000 * 60 * 60))
      if (h > 0) return `${h}h ago`
      const m = Math.max(1, Math.floor(diffMs / (1000 * 60)))
      return `${m}m ago`
    }
    if (d < 7) return `${d}d ago`
    const w = Math.floor(d / 7)
    if (w < 8) return `${w}w ago`
    const mo = Math.floor(d / 30)
    return `${mo}mo ago`
  }, [])

  const truncate = useCallback((text: string, len = 120) => {
    if (!text) return ''
    return text.length > len ? `${text.slice(0, len).trim()}…` : text
  }, [])

  // Fetch latest overall assessment for the impact card
  useEffect(() => {
    const loadLatestOverall = async () => {
      if (!user?.id || !hasAssessmentData) return
      setLoadingImpact(true)
      try {
        const latest = await OverallAssessmentService.getLatestHolisticAssessment(user.id)
        setLatestOverall(latest)
      } catch (e) {
        console.warn('Failed to load latest overall assessment:', e)
      } finally {
        setLoadingImpact(false)
      }
    }
    loadLatestOverall()
  }, [user?.id, hasAssessmentData])


  const keyLabel = (key: string) => {
    switch (key) {
      case 'anxiety': return 'Anxiety'
      case 'depression': return 'Depression'
      case 'stress': return 'Stress'
      case 'wellbeing': return 'Well-being'
      case 'resilience': return 'Resilience'
      case 'trauma_exposure': return 'Trauma exposure'
      default: return key
    }
  }

  const renderHeroSection = () => (
    <div className="relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white to-emerald-50/30 rounded-[2rem]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(148,163,184,0.05),transparent_50%)] rounded-[2rem]"></div>
      
      <div className="relative bg-white/70 backdrop-blur-sm border border-slate-200/40 rounded-[2rem] p-12 md:p-16 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <h1 className="text-3xl md:text-4xl font-extralight text-slate-900 mb-6 leading-tight tracking-tight">
                Your Wellness Journey
              </h1>
              <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
                {hasAssessmentData
                  ? "Discover insights from your assessments and create a personalized path forward."
                  : "Begin your journey to better mental health with a personalized assessment."
                }
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-12 justify-center max-w-2xl mx-auto"
          >
            {/* Primary Action */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                
                if (isGeneratingOverall || !hasAssessmentData || !user?.id) return
                
                if (window.lastGenerateInsightsClick && Date.now() - window.lastGenerateInsightsClick < 2000) return
                
                window.lastGenerateInsightsClick = Date.now()
                handleGenerateOverallAssessment()
              }}
              disabled={isGeneratingOverall || !hasAssessmentData || !user?.id}
              className={`
                group relative overflow-hidden px-8 py-4 rounded-2xl font-medium text-base 
                transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:ring-offset-2
                ${isGeneratingOverall || !hasAssessmentData || !user?.id 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 hover:shadow-xl hover:shadow-slate-900/20'
                }
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <span className={`material-symbols-outlined text-xl ${
                  isGeneratingOverall ? 'animate-spin' : ''
                }`}>
                  {isGeneratingOverall ? 'hourglass_empty' : 'psychology'}
                </span>
                <span>{isGeneratingOverall ? 'Creating insights...' : 'Generate insights'}</span>
              </div>
            </button>
            
            {/* Secondary Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => handleNavigate('/session')}
                className="group px-6 py-4 rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm text-slate-700 font-medium transition-all duration-300 hover:bg-white hover:border-slate-300/60 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:ring-offset-2"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">self_care</span>
                  <span className="hidden sm:inline">Session</span>
                </div>
              </button>
              
              <button
                onClick={() => handleNavigate('/results')}
                className="group px-6 py-4 rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm text-slate-700 font-medium transition-all duration-300 hover:bg-white hover:border-slate-300/60 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:ring-offset-2"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">insights</span>
                  <span className="hidden sm:inline">Progress</span>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Wellness Dimensions */}
          {snapshot?.dimensions && snapshot.dimensions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-12 justify-center"
            >
              {snapshot.dimensions
                .filter(d => ['anxiety','trauma_exposure','wellbeing','stress','depression','resilience'].includes(d.key))
                .slice(0, 4)
                .map((d, index) => (
                  <motion.div
                    key={d.key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="group relative overflow-hidden"
                  >
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-slate-200/60 hover:border-slate-300/80 transition-all duration-300 hover:shadow-sm">
                      <span className="text-sm text-slate-700 font-medium">{keyLabel(d.key)}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium transition-colors duration-300 ${getLevelBadgeClasses(d.level)}`}>
                        {d.level}
                      </span>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="border-t border-slate-200/50 pt-8"
          >
            <button
              onClick={() => setWhyOpen(v => !v)}
              className="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-300 font-light mx-auto"
            >
              <span>{whyOpen ? 'Hide details' : 'How do we know this?'}</span>
              <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${
                whyOpen ? 'rotate-180' : ''
              }`}>expand_more</span>
            </button>
            
            <AnimatePresence>
              {whyOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 rounded-2xl bg-slate-50/40 border border-slate-200/50">
                    <div className="text-sm text-slate-700 mb-4 font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">verified</span>
                      Based on your assessments
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(snapshot?.explainability.assessments_used || []).map((name, index) => {
                        const pair = Object.entries(ASSESSMENTS).find(([id, def]) => {
                          const display = def?.shortTitle || def?.title || id.toUpperCase()
                          return name === display || name.includes(def?.shortTitle || '')
                        })
                        const id = pair?.[0]
                        const when = id ? formatRelative(latestMeta[id]) : ''
                        return (
                          <motion.span
                            key={name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="inline-flex items-center px-4 py-2 rounded-xl bg-white/80 border border-slate-200/50 text-slate-600 text-sm font-medium"
                          >
                            {name}{when ? ` • ${when}` : ''}
                          </motion.span>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )

  // renderNextActions function removed



  const renderImpactCard = () => {
    const risk = latestOverall?.holisticAnalysis?.overallRiskLevel
    const updatedAt = latestOverall?.updatedAt
    const lines = (latestOverall?.holisticAnalysis?.manifestations && latestOverall.holisticAnalysis.manifestations.length > 0)
      ? latestOverall.holisticAnalysis.manifestations
      : (latestOverall?.holisticAnalysis?.unconsciousManifestations && latestOverall.holisticAnalysis.unconsciousManifestations.length > 0)
        ? latestOverall.holisticAnalysis.unconsciousManifestations
        : []

    if (loadingImpact) {
      return (
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-slate-200/60 rounded-2xl"></div>
              <div className="h-6 w-48 bg-slate-200/60 rounded-lg"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-slate-200/60 rounded"></div>
              <div className="h-4 w-4/5 bg-slate-200/60 rounded"></div>
              <div className="h-4 w-3/4 bg-slate-200/60 rounded"></div>
            </div>
          </div>
        </div>
      )
    }

    if (!latestOverall) {
      return (
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 shadow-sm">
          <div className="text-center max-w-sm mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="material-symbols-outlined text-slate-400 text-2xl">psychology</span>
              </div>
              <h3 className="text-xl font-light text-slate-900 mb-4 tracking-tight">Life Impact Analysis</h3>
              <p className="text-slate-500 text-base mb-8 leading-relaxed font-light">
                Get personalized insights about how your mental health might be affecting your daily life.
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()

                  if (isGeneratingOverall || !hasAssessmentData || !user?.id) return

                  if (window.lastGenerateInsightsClick && Date.now() - window.lastGenerateInsightsClick < 2000) return

                  window.lastGenerateInsightsClick = Date.now()
                  handleGenerateOverallAssessment()
                }}
                disabled={isGeneratingOverall || !hasAssessmentData || !user?.id}
                className={`group px-6 py-3 rounded-2xl font-medium text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:ring-offset-2 ${
                  isGeneratingOverall || !hasAssessmentData || !user?.id
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 hover:shadow-xl hover:shadow-slate-900/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-lg ${
                    isGeneratingOverall ? 'animate-spin' : ''
                  }`}>
                    {isGeneratingOverall ? 'hourglass_empty' : 'auto_awesome'}
                  </span>
                  <span>{isGeneratingOverall ? 'Generating...' : 'Generate insights'}</span>
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-slate-600 text-xl">psychology</span>
            </div>
            <div>
              <h3 className="text-xl font-light text-slate-900 mb-2 tracking-tight">Life Impact Analysis</h3>
              <div className="relative group">
                <p className="text-sm text-slate-500 cursor-help hover:text-slate-700 transition-colors duration-300 font-light flex items-center gap-1">
                  <span>Based on all your assessments</span>
                  <span className="material-symbols-outlined text-sm opacity-60 group-hover:opacity-100 transition-opacity">info</span>
                </p>
                {/* Modern tooltip */}
                <div className="absolute left-0 top-full mt-3 w-80 p-4 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-blue-600 text-lg">psychology</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-1">Comprehensive Analysis</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-light">
                        We analyze every assessment you've completed to create a personalized summary of how your mental health patterns might be impacting your daily life, relationships, work, and overall well-being.
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-slate-200/50 pt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      AI-powered insights from your complete assessment history
                    </div>
                  </div>
                </div>
              </div>
              {updatedAt && (
                <p className="text-sm text-slate-400 mt-2 font-light">Updated {formatRelative(updatedAt)}</p>
              )}
            </div>
          </div>
          {risk && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className={`text-sm font-medium px-3 py-1.5 rounded-xl ${getLevelBadgeClasses(risk)}`}
            >
              {risk} risk
            </motion.span>
          )}
        </motion.div>

        {/* Content */}
        {lines && lines.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-4 mb-8"
          >
            {lines.slice(0, 4).map((impact: string, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
                className="flex items-start gap-4 group"
              >
                <div className="flex-shrink-0 w-2 h-2 bg-slate-300 rounded-full mt-3 group-hover:bg-slate-400 transition-colors duration-300"></div>
                <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300 font-light">
                  {impact}
                </p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-8 mb-8"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-slate-400 text-lg">search_off</span>
            </div>
            <p className="text-sm text-slate-500 font-light">
              No specific impacts identified. Try refreshing for updated insights.
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex gap-4"
        >
          <button
            onClick={async () => {
              if (!user?.id) return
              console.log('🔄 Refreshing life impacts for user:', user.id)
              setLoadingImpact(true)
              try {
                const freshImpacts = await OverallAssessmentService.getFreshLifeImpacts(user.id)
                console.log('✅ Fresh impacts received:', {
                  hasResult: !!freshImpacts,
                  manifestationsCount: freshImpacts?.holisticAnalysis?.manifestations?.length || 0,
                  unconsciousCount: freshImpacts?.holisticAnalysis?.unconsciousManifestations?.length || 0
                })
                setLatestOverall(freshImpacts)
              } catch (error) {
                console.error('❌ Error refreshing impacts:', {
                  error,
                  message: error instanceof Error ? error.message : 'Unknown error',
                  userId: user.id
                })
              } finally {
                setLoadingImpact(false)
              }
            }}
            disabled={loadingImpact}
            className={`flex-1 group px-5 py-3 rounded-2xl font-medium text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:ring-offset-2 ${
              loadingImpact
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-white/60 backdrop-blur-sm border border-slate-200/60 text-slate-700 hover:bg-white hover:border-slate-300/60 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className={`material-symbols-outlined text-base ${loadingImpact ? 'animate-spin' : ''}`}>
                {loadingImpact ? 'refresh' : 'refresh'}
              </span>
              <span>{loadingImpact ? 'Refreshing...' : 'Refresh'}</span>
            </div>
          </button>

          <button
            onClick={() => { if (latestOverall) setOverallAssessment(latestOverall); setShowOverallResults(true) }}
            className="flex-1 group px-5 py-3 rounded-2xl font-medium text-sm bg-gradient-to-r from-slate-900 to-slate-800 text-white transition-all duration-300 hover:from-slate-800 hover:to-slate-700 hover:shadow-xl hover:shadow-slate-900/20 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">open_in_new</span>
              <span>View details</span>
            </div>
          </button>
        </motion.div>
      </div>
    )
  }

  // Recent assessments section intentionally removed to declutter

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-teal-50/30 via-white to-emerald-50/20 min-h-screen font-poppins">
        <div className="container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="animate-pulse space-y-8 md:space-y-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl mx-auto mb-4"></div>
              <div className="h-8 w-80 bg-teal-50 rounded-lg mx-auto mb-3" />
              <div className="h-4 w-64 bg-teal-50 rounded mx-auto" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto">
              <div className="lg:col-span-8 xl:col-span-9 space-y-8">
                <div className="h-64 bg-teal-50 rounded-2xl" />
                <div className="h-48 bg-teal-50 rounded-2xl" />
              </div>
              <div className="lg:col-span-4 xl:col-span-3">
                <div className="h-96 bg-teal-50 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="bg-gradient-to-br from-teal-50/30 via-white to-emerald-50/20 min-h-screen font-poppins">
        <div className="container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="text-center py-12 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-rose-500 text-2xl">error</span>
            </div>
            <h2 className="text-2xl font-light text-slate-800 mb-4">Something went wrong</h2>
            <p className="text-slate-600 font-light mb-8 leading-relaxed">{error}</p>
            <button
              onClick={() => {
                setError(null)
                setDataFetched(false)
                setRetryCount(0)
                setLoading(true)
              }}
              className="inline-flex items-center px-5 py-3 rounded-xl text-white font-medium transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:ring-[#FED7AA] focus:ring-offset-2"
              style={{
                backgroundColor: '#B45309',
                boxShadow: '0 2px 6px rgba(16, 24, 40, 0.06)',
                minHeight: '44px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#92400E'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B45309'}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#78350F'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#92400E'}
            >
              <span className="material-symbols-outlined mr-3 text-xl">refresh</span>
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Profile not ready state
  if (!profile) {
    return (
      <div className="bg-gradient-to-br from-teal-50/30 via-white to-emerald-50/20 min-h-screen font-poppins">
        <div className="container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="text-center py-12 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-teal-600 text-2xl animate-pulse">person</span>
            </div>
            <h2 className="text-2xl font-light text-slate-800 mb-4">Preparing your space...</h2>
            <p className="text-slate-600 font-light leading-relaxed">We're setting up your personalized wellness dashboard.</p>
            <LoadingSpinner size="lg" className="mt-8" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-teal-50/30 via-white to-emerald-50/20 min-h-screen font-poppins">
      <div className="container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="space-y-8 md:space-y-10">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">
            {/* Left Column - Main Content (70%) */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-8">
              {/* Snapshot Hero */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {renderHeroSection()}
              </motion.div>

              {/* Impact card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {renderImpactCard()}
              </motion.div>
            </div>

            {/* Right Column - Unified Welcome & Assessments Card */}
            <div className="lg:col-span-4 xl:col-span-3">
      <motion.div
        className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm h-fit lg:sticky lg:top-24"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Greeting Section */}
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
                    <span className="material-symbols-outlined text-blue-600 text-2xl">wb_sunny</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-xl font-medium text-slate-800 leading-tight">
                      {getGreeting()}, {profile.display_name?.split(' ')[0] || 'there'}
                    </h2>
                  </div>
                </div>

                {/* Elegant Divider */}
                <div className="flex items-center mb-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                  <div className="px-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center shadow-sm border border-emerald-100">
                      <span className="material-symbols-outlined text-emerald-600 text-base">assignment_turned_in</span>
                    </div>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                </div>

                {/* Assessments Section */}
                <div>
                  <div className="text-center mb-6">
                    <div className="text-lg font-medium text-slate-800 mb-2">Your Assessments</div>
                    <div className="text-sm text-slate-500 font-light">Track your wellness journey</div>
                  </div>

                  <div className="space-y-4">
                    {coverage.assessed.map(id => (
                      <div key={`ok-${id}`} className="group flex items-center gap-4 px-5 py-4 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 transition-all duration-200 cursor-pointer">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: '#22C55E' }}>
                          <span className="material-symbols-outlined text-white text-base">check</span>
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-800">{(ASSESSMENTS[id]?.shortTitle || id.toUpperCase())}</span>
                      </div>
                    ))}

                    {coverage.stale.map(id => (
                      <div key={`stale-${id}`} className="group flex items-center gap-4 px-5 py-4 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 transition-all duration-200 cursor-pointer">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: '#B45309' }}>
                          <span className="material-symbols-outlined text-white text-base">schedule</span>
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-800">{(ASSESSMENTS[id]?.shortTitle || id.toUpperCase())}</span>
                      </div>
                    ))}

                    {coverage.missing.map(id => (
                      <div key={`miss-${id}`} className="group flex items-center gap-4 px-5 py-4 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 transition-all duration-200 cursor-pointer">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: '#9CA3AF' }}>
                          <span className="material-symbols-outlined text-slate-600 text-base">radio_button_unchecked</span>
                        </div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-700">{(ASSESSMENTS[id]?.shortTitle || id.toUpperCase())}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>



          {/* Empty state if no assessments */}
          {!hasAssessmentData && (
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-white border border-slate-100 rounded-2xl p-10 shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-blue-600 text-2xl">self_care</span>
                </div>
                <h3 className="text-2xl font-light text-slate-800 mb-4">Let's begin your wellness journey</h3>
                <p className="text-slate-600 text-lg mb-8 font-light max-w-lg mx-auto leading-relaxed">Take a moment to check in with yourself. A brief assessment helps us understand how you're feeling today.</p>
                {/* Primary button */}
                <button
                  onClick={() => handleNavigate('/assessments')}
                  className="inline-flex items-center px-5 py-3 rounded-xl text-white font-medium transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:ring-offset-2"
                  style={{
                    backgroundColor: '#0F766E',
                    boxShadow: '0 2px 6px rgba(16, 24, 40, 0.06)',
                    minHeight: '44px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#115E59'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0F766E'}
                  onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#0D4F4B'}
                  onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#115E59'}
                >
                  <span className="material-symbols-outlined mr-3 text-xl">psychology</span>
                  Begin assessment
                </button>
                <p className="text-slate-500 text-sm mt-4 font-light">Takes about 3-5 minutes</p>
              </div>
            </motion.div>
          )}

          {/* Recent assessments removed for declutter */}

          {/* Overall Assessment Results Modal/Overlay */}
          {showOverallResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                if (!isGeneratingOverall) {
                  setShowOverallResults(false)
                  setOverallAssessment(null)
                  // Clear localStorage
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('currentOverallAssessment')
                    localStorage.removeItem('showOverallResults')
                    localStorage.removeItem('isGeneratingOverall')
                    localStorage.removeItem('overallProgress')
                  }
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200">
                  <h2 className="text-xl font-medium text-slate-900">
                    {isGeneratingOverall ? 'Generating Your Insights' : 'Your Personalized Mental Health Profile'}
                  </h2>
                  {!isGeneratingOverall && (
                    <button
                      onClick={() => {
                        setShowOverallResults(false)
                        setOverallAssessment(null)
                        // Clear localStorage
                        if (typeof window !== 'undefined') {
                          localStorage.removeItem('currentOverallAssessment')
                          localStorage.removeItem('showOverallResults')
                          localStorage.removeItem('isGeneratingOverall')
                          localStorage.removeItem('overallProgress')
                        }
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-slate-500 text-lg">close</span>
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
                  {isGeneratingOverall ? (
                    <div className="p-6 text-center">
                      <div className="mb-5">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <span className="material-symbols-outlined text-xl text-slate-600 animate-spin">psychology</span>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Analyzing Your Assessments</h3>
                        <p className="text-slate-600 text-sm">
                          We're using AI to create a comprehensive analysis of all your mental health assessments.
                        </p>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="max-w-sm mx-auto">
                        <div className="flex justify-between text-xs text-slate-600 mb-2">
                          <span>Progress</span>
                          <span>{Math.round(overallProgress)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          This usually takes 10-30 seconds...
                        </p>
                      </div>
                    </div>
                  ) : overallAssessment ? (
                    overallAssessment.isError ? (
                      // Error state with retry option
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 mb-3">
                          {overallAssessment.errorType === 'NO_ASSESSMENTS' ? 'No Assessments Found' : 'Unable to Generate Insights'}
                        </h3>
                        <div className="max-w-md mx-auto mb-8">
                          <p className="text-slate-600 mb-4 leading-relaxed">
                            {overallAssessment.holisticAnalysis.executiveSummary}
                          </p>
                          {overallAssessment.holisticAnalysis.manifestations.map((item, idx) => (
                            <p key={idx} className="text-sm text-slate-500 mb-2">• {item}</p>
                          ))}
                        </div>
                        
                        <div className="flex gap-3 justify-center">
                          {overallAssessment.canRetry ? (
                            <>
                              <button
                                onClick={() => {
                                  setShowOverallResults(false)
                                  setOverallAssessment(null)
                                  // Clear localStorage
                                  if (typeof window !== 'undefined') {
                                    localStorage.removeItem('currentOverallAssessment')
                                    localStorage.removeItem('showOverallResults')
                                    localStorage.removeItem('isGeneratingOverall')
                                    localStorage.removeItem('overallProgress')
                                  }
                                }}
                                className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
                              >
                                Close
                              </button>
                              <button
                                onClick={() => {
                                  setOverallAssessment(null)
                                  setOverallRetryCount(0)
                                  handleGenerateOverallAssessment()
                                }}
                                disabled={isGeneratingOverall}
                                className="inline-flex items-center px-4 py-2.5 rounded-xl text-white font-medium transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  backgroundColor: isGeneratingOverall ? '#9CA3AF' : '#0F766E',
                                  boxShadow: isGeneratingOverall ? 'none' : '0 2px 6px rgba(16, 24, 40, 0.06)',
                                  minHeight: '44px'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isGeneratingOverall) {
                                    e.currentTarget.style.backgroundColor = '#115E59'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isGeneratingOverall) {
                                    e.currentTarget.style.backgroundColor = '#0F766E'
                                  }
                                }}
                              >
                                <span className="material-symbols-outlined mr-2 text-base">
                                  {isGeneratingOverall ? 'hourglass_empty' : 'refresh'}
                                </span>
                                {isGeneratingOverall ? 'Retrying...' : 'Try Again'}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setShowOverallResults(false)
                                  setOverallAssessment(null)
                                  // Clear localStorage
                                  if (typeof window !== 'undefined') {
                                    localStorage.removeItem('currentOverallAssessment')
                                    localStorage.removeItem('showOverallResults')
                                    localStorage.removeItem('isGeneratingOverall')
                                    localStorage.removeItem('overallProgress')
                                  }
                                }}
                                className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
                              >
                                Close
                              </button>
                              <button
                                onClick={() => {
                                  setShowOverallResults(false)
                                  handleNavigate('/assessments')
                                }}
                                className="inline-flex items-center px-4 py-2.5 rounded-xl text-white font-medium transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:ring-offset-2"
                                style={{
                                  backgroundColor: '#0F766E',
                                  boxShadow: '0 2px 6px rgba(16, 24, 40, 0.06)',
                                  minHeight: '44px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#115E59'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0F766E'}
                              >
                                <span className="material-symbols-outlined mr-2 text-base">psychology</span>
                                Take Assessment
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <OverallAssessmentResults
                        overallAssessment={overallAssessment}
                        onRetake={() => {
                          setShowOverallResults(false)
                          handleNavigate('/assessments')
                        }}
                      />
                    )
                  ) : (
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <span className="material-symbols-outlined text-xl text-slate-400">error</span>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Unable to Generate Insights</h3>
                      <p className="text-slate-600 text-sm mb-4">
                        There was an error creating your personalized profile. Please try again.
                      </p>
                      <button
                        onClick={handleGenerateOverallAssessment}
                        className="inline-flex items-center px-4 py-2.5 rounded-xl text-white font-medium transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:ring-offset-2"
                        style={{
                          backgroundColor: '#0F766E',
                          boxShadow: '0 2px 6px rgba(16, 24, 40, 0.06)',
                          minHeight: '44px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#115E59'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0F766E'}
                        onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#0D4F4B'}
                        onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#115E59'}
                      >
                        <span className="material-symbols-outlined mr-2 text-base">refresh</span>
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}
