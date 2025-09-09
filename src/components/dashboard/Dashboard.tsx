'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/hooks/useApp'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useRouter } from 'next/navigation'
import { AssessmentResult, ASSESSMENTS } from '@/data/assessments'
import { AssessmentManager, AssessmentHistoryEntry } from '@/lib/services/AssessmentManager'
import { buildUserSnapshot, Snapshot } from '@/lib/snapshot'
import { OverallAssessmentService, OverallAssessmentResult } from '@/lib/services/OverallAssessmentService'
import { OverallAssessmentResults, OverallAssessmentLoading } from '@/components/assessment/OverallAssessmentResults'
import AssessmentSection from '@/components/dashboard/AssessmentSection'
import { profileService } from '@/services/ProfileService'

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
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200/40 rounded-3xl p-6 shadow-3xl shadow-slate-900/35">
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
      className="group relative overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        borderRadius: '24px'
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        delay: Math.random() * 0.2
      }}
      whileHover={{
        y: -8,
        scale: 1.03,
        rotateY: 2,
        transition: { 
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1],
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Ultra-sophisticated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-transparent to-teal-50/40 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 rounded-3xl pointer-events-none"></div>

      {/* Sophisticated animated background pattern */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-all duration-700">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-200/60 to-transparent rounded-full transform translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-teal-200/60 to-transparent rounded-full transform -translate-x-8 translate-y-8"></div>
      </div>

      {/* Sophisticated shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%)',
          transform: 'translateX(-100%)'
        }}
        animate={{
          transform: ['translateX(-100%)', 'translateX(100%)']
        }}
        transition={{
          duration: 1.5,
          delay: 0.2,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <motion.div
            className="w-12 h-12 bg-gradient-to-br from-slate-50/90 to-slate-100/90 rounded-2xl flex items-center justify-center shadow-sm shadow-slate-200/50 group-hover:shadow-lg group-hover:shadow-slate-300/50 transition-all duration-300"
            whileHover={{
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.2 }
            }}
          >
            <span className="material-symbols-outlined text-slate-600 text-xl group-hover:text-slate-700 transition-colors duration-300">{icon}</span>
          </motion.div>
        {trend && (
            <motion.span
              className={`material-symbols-outlined text-sm px-2 py-1 rounded-full ${trendColors[trend]} bg-white/80 backdrop-blur-sm shadow-sm`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1 }}
            >
            {trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat'}
            </motion.span>
        )}
      </div>

        <motion.div
          className="text-3xl font-light text-slate-900 mb-3 tracking-tight"
          style={{
            fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '-0.01em',
            fontWeight: '300'
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {value}
        </motion.div>

        <motion.div
          className="text-sm text-slate-500 font-medium tracking-wide"
          style={{
            fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '-0.005em',
            fontWeight: '400'
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {label}
        </motion.div>
      </div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out"></div>
      </div>
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
        group relative flex items-center gap-4 p-6 rounded-3xl border transition-all duration-500 w-full min-h-[100px] overflow-hidden
        ${currentVariant.base} ${currentVariant.hover}
        ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:ring-offset-2
        shadow-lg hover:shadow-2xl hover:shadow-slate-900/20
      `}
      style={{
        background: variant === 'primary' 
          ? 'rgba(15, 23, 42, 0.95)' 
          : variant === 'secondary' 
            ? 'rgba(255, 255, 255, 0.95)'
            : 'transparent',
        backdropFilter: 'blur(20px)',
        border: variant === 'outline' 
          ? '1px solid rgba(148, 163, 184, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
      whileHover={!disabled && !loading ? {
        y: -8,
        scale: 1.03,
        rotateY: 2,
        transition: { 
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1],
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        delay: Math.random() * 0.3
      }}
    >
      {/* Ultra-sophisticated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 rounded-3xl pointer-events-none"></div>

      {/* Sophisticated shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%)',
          transform: 'translateX(-100%)'
        }}
        animate={{
          transform: ['translateX(-100%)', 'translateX(100%)']
        }}
        transition={{
          duration: 1.5,
          delay: 0.2,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${currentVariant.icon} group-hover:shadow-lg transition-all duration-300`}
        whileHover={!disabled && !loading ? {
          scale: 1.1,
          rotate: 5,
          transition: { duration: 0.2 }
        } : {}}
      >
        {loading ? (
          <motion.span
            className="material-symbols-outlined text-xl animate-spin"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            refresh
          </motion.span>
        ) : (
          <span className="material-symbols-outlined text-xl">{icon}</span>
        )}
      </motion.div>

      <div className="text-left flex-1 min-w-0 relative z-10">
        <motion.div
          className="font-semibold text-lg mb-2 tracking-tight"
          style={{
            fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '-0.01em',
            fontWeight: '500'
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {label}
        </motion.div>
        <motion.div
          className={`text-sm font-light leading-relaxed ${currentVariant.description}`}
          style={{
            fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '-0.005em',
            fontWeight: '300'
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {description}
        </motion.div>
        </div>

      <motion.span
        className="material-symbols-outlined text-xl flex-shrink-0 opacity-40 group-hover:opacity-60 transition-all duration-300"
        whileHover={!disabled && !loading ? {
          x: 4,
          scale: 1.1,
          transition: { duration: 0.2 }
        } : {}}
      >
        arrow_forward
      </motion.span>
    </motion.button>
  )
}

// Constants to prevent magic numbers
const FETCH_TIMEOUT = 15000 // 15 seconds to avoid false timeouts

export function Dashboard() {
  const { auth, profile } = useApp()
  const { user } = auth
  const router = useRouter()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [hasAssessmentData, setHasAssessmentData] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [dataFetched, setDataFetched] = useState(false)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [whyOpen, setWhyOpen] = useState(false)
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

  // Refresh overall assessment data when tab becomes active
  const refreshOverallAssessment = useCallback(async () => {
    if (!user?.id || !hasAssessmentData) return

    try {
      console.log('🔄 Refreshing overall assessment data...')
      const latest = await OverallAssessmentService.getLatestHolisticAssessment(user.id)

      if (latest && (!overallAssessment || latest.updatedAt > overallAssessment.updatedAt)) {
        console.log('✅ Found newer overall assessment data, updating state')
        setOverallAssessment(latest)
      } else if (!latest && overallAssessment) {
        console.log('⚠️ No assessment data found in database, keeping local state')
      } else {
        console.log('ℹ️ Assessment data is up to date')
      }
    } catch (error) {
      console.warn('Failed to refresh overall assessment:', error)
    }
  }, [user?.id, hasAssessmentData, overallAssessment])
  const [loadingImpact, setLoadingImpact] = useState(false)
  const [isAutoLoading, setIsAutoLoading] = useState(false)

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

  // Production-safe logger utility
  const logger = {
    debug: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Dashboard] ${message}`, data || '')
      }
    },
    warn: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Dashboard] ${message}`, data || '')
      }
    },
    error: (message: string, error?: any) => {
      console.error(`[Dashboard] ${message}`, error || '')
    }
  }

  // COMPREHENSIVE HISTORICAL ANALYSIS - Enhanced with detailed logging
  const handleGenerateOverallAssessment = useCallback(async () => {
    // Log the button click and input parameters
    console.log('🔘 [ANALYZE COMPLETE HISTORY BUTTON] Clicked!')
    console.log('📥 [BUTTON INPUT] User object:', {
      id: user?.id,
      email: user?.email,
      hasUserData: !!user,
      userType: typeof user
    })

    // Guard clauses - prevent execution in invalid states
    if (!user?.id) {
      logger.warn('Life impact analysis called without valid user')
      console.log('❌ [BUTTON GUARD] No valid user ID, returning early')
      return
    }

    console.log('🚀 [COMPREHENSIVE ANALYSIS] Starting comprehensive historical analysis for user:', user.id)

    // Use functional state updates to prevent race conditions
    const canProceed = await new Promise<boolean>((resolve) => {
      setIsGeneratingOverall(currentGenerating => {
        if (currentGenerating) {
          console.log('⚠️ [COMPREHENSIVE ANALYSIS] Race condition detected: already generating')
          logger.warn('Race condition detected: already generating')
          resolve(false)
          return true // Don't change the state
        }
        console.log('✅ [COMPREHENSIVE ANALYSIS] Proceeding with analysis')
        resolve(true)
        return true
      })
    })

    if (!canProceed) return

    // Initialize state safely
    setOverallProgress(0)
    setShowOverallResults(true)
    setOverallAssessment(null)

    let progressInterval: NodeJS.Timeout | null = null
    let timeoutId: NodeJS.Timeout | null = null

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

      console.error('❌ [COMPREHENSIVE ANALYSIS] Generation failed:', {
        error: error instanceof Error ? error.message : error,
        errorType: detectedErrorType,
        retryCount: overallRetryCount,
        canRetry: errorInfo.canRetry,
        userId: user.id
      })

      logger.error('Overall assessment generation failed:', {
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
        console.log('⚠️ [COMPREHENSIVE ANALYSIS] No assessment data available')
        handleError(new Error('No assessment data available'), 'NO_ASSESSMENTS')
        return
      }

      console.log('📊 [COMPREHENSIVE ANALYSIS] Starting data collection for user:', user.id)

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

      // Set extended timeout for comprehensive analysis
      const GENERATION_TIMEOUT = 90000 // 90 seconds for comprehensive historical analysis

      console.log('⏱️ [COMPREHENSIVE ANALYSIS] Setting timeout:', GENERATION_TIMEOUT + 'ms')

      timeoutId = setTimeout(() => {
        console.log('⏰ [COMPREHENSIVE ANALYSIS] Timeout reached after:', GENERATION_TIMEOUT + 'ms')
        logger.warn('Overall assessment generation timeout after 90s')
        handleError(new Error('Request timeout - comprehensive analysis taking too long'), 'TIMEOUT_ERROR')
      }, GENERATION_TIMEOUT)

      // Collect ALL assessment data first with detailed logging
      console.log('📋 [COMPREHENSIVE ANALYSIS] Collecting ALL assessment data...')
      const allAssessmentData = await OverallAssessmentService.collectAllAssessmentsData(user.id)

      console.log('📊 [COMPREHENSIVE ANALYSIS] Assessment data collected:', {
        userId: allAssessmentData.userId,
        totalAssessments: allAssessmentData.assessments.length,
        assessmentTypes: [...new Set(allAssessmentData.assessments.map(a => a.assessmentId))],
        dateRange: allAssessmentData.dateRange,
        totalScore: allAssessmentData.totalScore,
        averageScore: allAssessmentData.averageScore.toFixed(2)
      })

      // Log detailed assessment breakdown
      const assessmentBreakdown = allAssessmentData.assessments.reduce((acc, assessment) => {
        if (!acc[assessment.assessmentId]) {
          acc[assessment.assessmentId] = []
        }
        acc[assessment.assessmentId].push({
          score: assessment.score,
          level: assessment.level,
          severity: assessment.severity,
          takenAt: assessment.takenAt,
          responseCount: assessment.responses.length
        })
        return acc
      }, {} as Record<string, any[]>)

      console.log('📈 [COMPREHENSIVE ANALYSIS] Assessment breakdown by type:', assessmentBreakdown)

      // Transform data for AI analysis with detailed logging
      const transformedData = OverallAssessmentService['toComprehensiveHistoricalPayload'](allAssessmentData)

      console.log('🔄 [COMPREHENSIVE ANALYSIS] Data transformed for AI analysis:', {
        userId: transformedData.userId,
        assessmentCount: transformedData.assessmentCount,
        historicalAnalysis: transformedData.summary.historicalAnalysis,
        assessmentTypes: Object.keys(transformedData.allAssessments),
        dateRange: transformedData.dateRange,
        summary: transformedData.summary
      })

      // Log what we're sending to the AI
      console.log('🚀 [COMPREHENSIVE ANALYSIS] SENDING TO AI:', {
        endpoint: 'daily-life-impacts',
        dataSize: JSON.stringify(transformedData).length + ' bytes',
        assessmentCount: transformedData.assessmentCount,
        userId: transformedData.userId,
        historicalFlag: transformedData.summary.historicalAnalysis,
        timeRange: `${transformedData.dateRange.earliest} to ${transformedData.dateRange.latest}`
      })

      // Log sample of assessment data being sent
      const sampleAssessments = Object.entries(transformedData.allAssessments).slice(0, 2).map(([type, assessments]) => ({
        type,
        count: assessments.length,
        firstAssessment: assessments[0],
        lastAssessment: assessments[assessments.length - 1]
      }))

      console.log('📋 [COMPREHENSIVE ANALYSIS] Sample assessment data being sent:', sampleAssessments)

      // Attempt comprehensive historical analysis
      const generationPromise = OverallAssessmentService.generateComprehensiveHistoricalAnalysis(user.id)

      const result = await Promise.race([
        generationPromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Generation timeout')), GENERATION_TIMEOUT - 5000)
        )
      ])

      console.log('✅ [COMPREHENSIVE ANALYSIS] AI Analysis completed successfully!')
      console.log('📊 [COMPREHENSIVE ANALYSIS] AI Response received:', {
        userId: result.userId,
        hasAssessmentData: !!result.assessmentData,
        totalAssessmentsAnalyzed: result.assessmentData?.assessmentCount,
        hasHolisticAnalysis: !!result.holisticAnalysis,
        riskLevel: result.holisticAnalysis?.overallRiskLevel,
        confidenceLevel: result.holisticAnalysis?.confidenceLevel,
        manifestationsCount: result.holisticAnalysis?.manifestations?.length,
        unconsciousManifestationsCount: result.holisticAnalysis?.unconsciousManifestations?.length,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      })

      // Log the COMPLETE return value from the Analyze Complete History button
      console.log('🎯 [ANALYZE COMPLETE HISTORY BUTTON RETURN VALUE]:', {
        fullResult: result,
        assessmentData: {
          userId: result.assessmentData?.userId,
          assessmentCount: result.assessmentData?.assessmentCount,
          totalScore: result.assessmentData?.totalScore,
          averageScore: result.assessmentData?.averageScore,
          dateRange: result.assessmentData?.dateRange
        },
        holisticAnalysis: {
          executiveSummary: result.holisticAnalysis?.executiveSummary,
          manifestations: result.holisticAnalysis?.manifestations,
          unconsciousManifestations: result.holisticAnalysis?.unconsciousManifestations,
          riskFactors: result.holisticAnalysis?.riskFactors,
          protectiveFactors: result.holisticAnalysis?.protectiveFactors,
          overallRiskLevel: result.holisticAnalysis?.overallRiskLevel,
          confidenceLevel: result.holisticAnalysis?.confidenceLevel,
          supportiveMessage: result.holisticAnalysis?.supportiveMessage
        },
        metadata: {
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          isError: result.isError,
          errorType: result.errorType,
          canRetry: result.canRetry
        }
      })

      // Log detailed AI insights
      if (result.holisticAnalysis) {
        console.log('🧠 [COMPREHENSIVE ANALYSIS] AI Insights:', {
          executiveSummary: result.holisticAnalysis.executiveSummary?.substring(0, 200) + '...',
          manifestations: result.holisticAnalysis.manifestations,
          unconsciousManifestations: result.holisticAnalysis.unconsciousManifestations,
          riskFactors: result.holisticAnalysis.riskFactors,
          protectiveFactors: result.holisticAnalysis.protectiveFactors,
          supportiveMessage: result.holisticAnalysis.supportiveMessage,
          // New comprehensive fields
          personalizedSummary: result.holisticAnalysis.personalizedSummary?.substring(0, 200) + '...',
          patternsAndTriggers: result.holisticAnalysis.patternsAndTriggers?.substring(0, 200) + '...',
          psychologicalFramework: result.holisticAnalysis.psychologicalFramework?.substring(0, 200) + '...',
          strengthsAndProtectiveFactors: result.holisticAnalysis.strengthsAndProtectiveFactors?.substring(0, 200) + '...',
          actionableSteps: result.holisticAnalysis.actionableSteps?.substring(0, 200) + '...',
          severityGuidance: result.holisticAnalysis.severityGuidance?.substring(0, 200) + '...',
          trendAnalysis: result.holisticAnalysis.trendAnalysis?.substring(0, 200) + '...',
          personalizedRoadmap: result.holisticAnalysis.personalizedRoadmap?.substring(0, 200) + '...'
        })
      }

      // Success path
      cleanup()
      setOverallProgress(100)

      console.log('🎉 [COMPREHENSIVE ANALYSIS] Complete! Setting final results')

      // Brief delay to show completion
      setTimeout(() => {
        console.log('📤 [FINAL BUTTON RETURN] Setting result in UI state:', {
          resultToUI: result,
          resultType: typeof result,
          hasHolisticAnalysis: !!result.holisticAnalysis,
          assessmentCount: result.assessmentData?.assessmentCount,
          riskLevel: result.holisticAnalysis?.overallRiskLevel,
          // Check for new comprehensive fields
          hasPersonalizedSummary: !!result.holisticAnalysis?.personalizedSummary,
          hasPatternsAndTriggers: !!result.holisticAnalysis?.patternsAndTriggers,
          hasPsychologicalFramework: !!result.holisticAnalysis?.psychologicalFramework,
          hasActionableSteps: !!result.holisticAnalysis?.actionableSteps,
          hasPersonalizedRoadmap: !!result.holisticAnalysis?.personalizedRoadmap
        })

        setOverallAssessment(result)
        setIsGeneratingOverall(false)
        setIsAutoLoading(false) // Reset auto-loading state
        setOverallRetryCount(0) // Reset retry count on success
        console.log('✅ [COMPREHENSIVE ANALYSIS] UI updated with results')
      }, 500)

    } catch (error) {
      const errorType = classifyError(error)
      const errorInfo = getErrorMessage(errorType, overallRetryCount)

      console.error('❌ [COMPREHENSIVE ANALYSIS] Analysis failed:', {
        error: error instanceof Error ? error.message : error,
        errorType,
        retryCount: overallRetryCount,
        canRetry: errorInfo.canRetry
      })

      // Determine if we should retry
      const shouldRetry = errorInfo.canRetry &&
                         overallRetryCount < 2 &&
                         ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVICE_ERROR', 'UNKNOWN_ERROR'].includes(errorType)

      if (shouldRetry) {
        console.log(`🔄 [COMPREHENSIVE ANALYSIS] Retrying (attempt ${overallRetryCount + 1}/3)`)
        logger.debug(`Retrying overall assessment generation (attempt ${overallRetryCount + 1}/3)`)
        cleanup()
        setIsGeneratingOverall(false)
        setIsAutoLoading(false)
        setOverallRetryCount(prev => prev + 1)

        // Exponential backoff: 2s, 4s, 8s
        const retryDelay = Math.pow(2, overallRetryCount + 1) * 1000

        setTimeout(() => {
          handleGenerateOverallAssessment()
        }, retryDelay)
        return
      }

      // Final failure - show error state
      console.error('💥 [COMPREHENSIVE ANALYSIS] Final failure - showing error state')
      handleError(error, errorType)
    }
  }, [user?.id, isGeneratingOverall, hasAssessmentData, overallRetryCount])

  // Data fetching function (explicit userId to avoid stale closures)
  const fetchAssessmentData = useCallback(async (userId: string): Promise<{ results: Record<string, AssessmentResult>; history: AssessmentHistoryEntry[]; latest: Record<string, string> }> => {
    logger.debug('fetchAssessmentData:start', { userId })
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
      logger.debug('getAssessmentHistory:ms', dur)
      logger.debug('fetchAssessmentData:history', { count: assessmentHistory?.length || 0 })

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
      logger.debug('fetchAssessmentData:done', { resultsCount: Object.keys(results).length })
      return payload
    } catch (error) {
      logger.error('Error fetching assessment data:', error)
      // Graceful fallback instead of throwing so UI doesn't hard-fail
      return { results: {}, history: [], latest: {} }
    }
  }, [])

  // Main data fetching effect
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
    logger.debug('effect:fetchData:enter', {
      userId: user?.id,
      hasProfile: !!profile,
      profileId: profile?.id,
      dataFetched,
      isFetching,
      timestamp: new Date().toISOString()
    })

    if (!user?.id) {
      logger.debug('effect:skip (no user)')
      setLoading(false)
      return
    }

    // Only skip if profile is explicitly null AND user exists (not just undefined)
    if (profile === null) {
      logger.debug('effect:skip (profile is null, waiting for profile load)')
      // Don't set loading to false here - let it keep loading until profile is available
      // But add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        // Use functional update to avoid stale closure issues
        setLoading(currentLoading => {
          if (currentLoading && isMounted) {
            logger.warn('Profile loading timeout - proceeding without profile')
            return false
          }
          return currentLoading
        })
      }, 8000) // 8 second timeout

      // Store timeout ID for cleanup
      return () => {
        clearTimeout(timeoutId)
        isMounted = false
      }
    }

    if (!profile) {
      logger.debug('effect:skip (profile undefined)')
      setLoading(false)
      return
    }

    if (dataFetched) {
      logger.debug('effect:skip (already fetched)')
      setLoading(false)
      return
    }

    if (isFetching) {
      logger.debug('effect:skip (already fetching)')
      setLoading(false)
      return
    }

    setIsFetching(true)
    logger.debug('effect:fetch:start')

      try {
        // Try to load from localStorage first for immediate display
        const storedResults = localStorage.getItem('assessmentResults')
        if (storedResults) {
          try {
            const parsed = JSON.parse(storedResults)
            if (Object.keys(parsed).length > 0) {
              setHasAssessmentData(true)
              logger.debug('localStorage:used', { keys: Object.keys(parsed).length })
            }
          } catch (parseError) {
            console.warn('Failed to parse stored assessment results:', parseError)
            localStorage.removeItem('assessmentResults')
          }
        }

        // Fetch fresh data from database
        logger.debug('db:fetch:start')
        const { results: freshResults, history: freshHistory, latest } = await fetchAssessmentData(user.id)
        logger.debug('db:fetch:done', { resultsCount: Object.keys(freshResults).length, historyCount: freshHistory.length })

        if (isMounted) {
          setHasAssessmentData(Object.keys(freshResults).length > 0)
          setDataFetched(true)
          setLatestMeta(latest)
          logger.debug('state:update:complete')

          // Build snapshot (non-blocking)
          if (user?.id) {
            Promise.resolve(buildUserSnapshot(user.id))
              .then(snap => { setSnapshot(snap); logger.debug('snapshot:ready') })
              .catch(err => logger.warn('Snapshot build failed:', err))
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
            logger.debug('localStorage:updated')
          } catch (storageError) {
            logger.warn('Failed to store assessment results:', storageError)
          }
        }
      } catch (error) {
        logger.error('Dashboard fetch error:', error)
        if (isMounted) {
          // Do not hard-fail on errors; show empty state instead
          setError(null)
          setDataFetched(true)
          setHasAssessmentData(false)
          logger.debug('fetch:error:graceful-empty')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setIsFetching(false)
          logger.debug('effect:fetch:finally', { loading: false, isFetching: false })
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
      setIsFetching(false)
      logger.debug('cleanup')
    }
  }, [user?.id, profile?.id, retryCount, dataFetched]) // Use profile.id instead of profile object to stabilize dependencies

  // Debug effect to track profile loading
  useEffect(() => {
    if (user?.id && profile !== null) {
      logger.debug('Profile loaded successfully', {
        userId: user.id,
        profileId: profile?.id,
        timestamp: new Date().toISOString()
      })
    }
  }, [user?.id, profile])

  // Auto-load life impact analysis when user logs in and has assessment data
  useEffect(() => {
    if (user?.id && hasAssessmentData && !loadingImpact && dataFetched) {
      // Check if we haven't already auto-loaded for this session
      const autoLoadKey = `auto_loaded_life_impacts_${user.id}_${new Date().toDateString()}`
      const alreadyAutoLoaded = sessionStorage.getItem(autoLoadKey)

      if (!alreadyAutoLoaded) {
        console.log('🔄 [AUTO_LOAD] Automatically loading fresh life impact analysis for user:', user.id)
        sessionStorage.setItem(autoLoadKey, 'true')
        setIsAutoLoading(true)

        // Use getFreshLifeImpacts for automatic loading, not comprehensive historical analysis
        const loadLifeImpacts = async () => {
          try {
            console.log('🔄 [AUTO_LOAD] Starting fresh life impacts analysis with most recent assessments...')
            const freshImpacts = await OverallAssessmentService.getFreshLifeImpacts(user.id)
            console.log('✅ [AUTO_LOAD] Life impacts loaded successfully:', {
              hasResult: !!freshImpacts,
              totalAssessmentsAnalyzed: freshImpacts?.assessmentData?.assessmentCount || 0,
              manifestationsCount: freshImpacts?.holisticAnalysis?.manifestations?.length || 0,
              unconsciousCount: freshImpacts?.holisticAnalysis?.unconsciousManifestations?.length || 0,
              riskLevel: freshImpacts?.holisticAnalysis?.overallRiskLevel,
              confidenceLevel: freshImpacts?.holisticAnalysis?.confidenceLevel
            })
            setLatestOverall(freshImpacts)
          } catch (error) {
            console.error('❌ [AUTO_LOAD] Error loading life impacts:', {
              error,
              message: error instanceof Error ? error.message : 'Unknown error',
              userId: user.id
            })
          } finally {
            setIsAutoLoading(false)
          }
        }

        loadLifeImpacts()
      } else {
        console.log('🔄 [AUTO_LOAD] Fresh life impacts already loaded today for user:', user.id)
      }
    }
  }, [user?.id, hasAssessmentData, loadingImpact, dataFetched])

  // Profile loading timeout effect - prevent infinite loading if profile fails to load
  useEffect(() => {
    if (!user?.id || profile !== null) return // Only run if user exists but profile is still null

    const timeout = setTimeout(() => {
      logger.warn('Profile loading timeout - forcing profile load attempt')
      // Try to refresh the profile
      const refreshProfile = async () => {
        if (user?.id) {
          try {
            logger.debug('Profile loading timeout - attempting to load/create profile')
            await profile.loadProfile(user.id)
            logger.debug('Profile loaded successfully via timeout')
          } catch (error) {
            logger.error('Failed to load profile via timeout:', error)
            // If profile loading fails, try to create a basic profile
            try {
              await profile.createProfile(user.id, {
                email: user.email,
                display_name: user.email?.split('@')[0] || 'New User'
              })
              logger.debug('Profile created successfully via timeout')
            } catch (createError) {
              logger.error('Failed to create profile via timeout:', createError)
            }
          }
        }
      }
      refreshProfile()
    }, 5000) // 5 second timeout

    return () => clearTimeout(timeout)
  }, [user?.id, profile, auth])

  // Page visibility effect - refresh data when user returns to tab
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id && profile) {
        logger.debug('Page became visible - checking for data refresh')

        // Reset assessment data if not fetched
        if (!dataFetched && !isFetching) {
          setDataFetched(false)
        }

        // Check if Life Impact Analysis data is missing and auto-reload if needed
        if (hasAssessmentData && !latestOverall && !loadingImpact && !isAutoLoading) {
          console.log('🔄 [VISIBILITY] Life Impact Analysis data missing, auto-reloading...')
          // Use the same auto-load logic but without the daily session check
          const loadLifeImpacts = async () => {
            setIsAutoLoading(true)
            try {
              console.log('🔄 [VISIBILITY] Starting fresh life impacts analysis...')
              const freshImpacts = await OverallAssessmentService.getFreshLifeImpacts(user.id)
              console.log('✅ [VISIBILITY] Life impacts reloaded successfully:', {
                hasResult: !!freshImpacts,
                totalAssessmentsAnalyzed: freshImpacts?.assessmentData?.assessmentCount || 0,
                manifestationsCount: freshImpacts?.holisticAnalysis?.manifestations?.length || 0,
                unconsciousCount: freshImpacts?.holisticAnalysis?.unconsciousManifestations?.length || 0
              })
              setLatestOverall(freshImpacts)
            } catch (error) {
              console.error('❌ [VISIBILITY] Error reloading life impacts:', {
                error,
                message: error instanceof Error ? error.message : 'Unknown error',
                userId: user.id
              })
            } finally {
              setIsAutoLoading(false)
            }
          }
          loadLifeImpacts()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user?.id, profile, dataFetched, isFetching, hasAssessmentData, latestOverall, loadingImpact, isAutoLoading])

  // URL parameter handling effect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('personalized') === 'true') {
      // Clean URL and refresh data
      window.history.replaceState({}, document.title, window.location.pathname)
      setDataFetched(false)
      setRetryCount(0)
    }
  }, []) // No cleanup needed for URL parameter effect

  // Loading timeout effect - prevent infinite loading and stuck navigation
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        logger.warn('Dashboard loading timeout - forcing loaded state')
        setLoading(false)
        setIsFetching(false)
      }, 8000) // 8 second timeout to avoid perceived hang

      return () => clearTimeout(timeout)
    }
  }, [loading])

  // Persist overall assessment state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (overallAssessment) {
          localStorage.setItem('currentOverallAssessment', JSON.stringify(overallAssessment))
        } else {
          localStorage.removeItem('currentOverallAssessment')
        }
      } catch (error) {
        console.warn('Failed to persist overall assessment to localStorage:', error)
      }
    }
  }, [overallAssessment])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('isGeneratingOverall', isGeneratingOverall.toString())
      } catch (error) {
        console.warn('Failed to persist generation state to localStorage:', error)
      }
    }
  }, [isGeneratingOverall])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('showOverallResults', showOverallResults.toString())
      } catch (error) {
        console.warn('Failed to persist results state to localStorage:', error)
      }
    }
  }, [showOverallResults])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('overallProgress', overallProgress.toString())
      } catch (error) {
        console.warn('Failed to persist progress to localStorage:', error)
      }
    }
  }, [overallProgress])

  // Listen for tab visibility changes and refresh data when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id && hasAssessmentData) {
        console.log('👁️ Tab became visible, checking for updated assessment data...')
        refreshOverallAssessment()
      }
    }

    // Also check on window focus (more reliable for some browsers)
    const handleWindowFocus = () => {
      if (user?.id && hasAssessmentData) {
        console.log('🎯 Window focused, checking for updated assessment data...')
        refreshOverallAssessment()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [user?.id, hasAssessmentData, refreshOverallAssessment])

  // Enhanced cleanup effect for overall assessment generation
  useEffect(() => {
    const cleanupTimeouts: NodeJS.Timeout[] = []
    
    return () => {
      // Cleanup any running intervals or timeouts when component unmounts
      if (isGeneratingOverall || showOverallResults) {
        logger.warn('Dashboard unmounting during overall assessment:', {
          isGeneratingOverall,
          showOverallResults,
          hasOverallAssessment: !!overallAssessment,
          timestamp: new Date().toISOString()
        })

        // If we're generating, save the state for recovery
        if (isGeneratingOverall && typeof window !== 'undefined') {
          try {
            localStorage.setItem('dashboardUnmountedDuringGeneration', 'true')
            localStorage.setItem('unmountTimestamp', Date.now().toString())
          } catch (error) {
            logger.warn('Failed to save unmount recovery data:', error)
          }
        }
      }

      // Clear any pending cleanup timeouts
      cleanupTimeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [isGeneratingOverall, showOverallResults, overallAssessment])

  // Recovery effect - handle cases where component unmounted during generation
  useEffect(() => {
    let recoveryTimeout: NodeJS.Timeout | null = null

    if (typeof window !== 'undefined') {
      const unmountedDuringGeneration = localStorage.getItem('dashboardUnmountedDuringGeneration')
      const unmountTimestamp = localStorage.getItem('unmountTimestamp')

      if (unmountedDuringGeneration === 'true' && unmountTimestamp) {
        const timeSinceUnmount = Date.now() - parseInt(unmountTimestamp)

        // If less than 2 minutes have passed, we might still be generating
        if (timeSinceUnmount < 120000) {
          logger.warn('🔄 Recovering from unmount during generation')
          setIsGeneratingOverall(false) // Reset generation state
          setIsAutoLoading(false) // Reset auto-loading state
          setShowOverallResults(false) // Hide results modal
          setOverallProgress(0) // Reset progress

          // Show a brief recovery message
          recoveryTimeout = setTimeout(() => {
            // Could show a toast notification here if we had one
            logger.debug('✅ Dashboard state recovered after unmount')
          }, 1000)
        }

        // Clean up old recovery data
        try {
          localStorage.removeItem('dashboardUnmountedDuringGeneration')
          localStorage.removeItem('unmountTimestamp')
        } catch (error) {
          console.warn('Failed to clean up recovery data from localStorage:', error)
        }
      }
    }

    return () => {
      if (recoveryTimeout) {
        clearTimeout(recoveryTimeout)
      }
    }
  }, [])



  // Map level bands to badge styles, with domain-aware polarity
  // Negative-risk domains: anxiety, depression, stress, trauma_exposure
  // Positive-wellness domains: wellbeing, resilience (invert colors)
  const getLevelBadgeClasses = useCallback((domainOrLevel: string, maybeLevel?: string) => {
    const domain = (maybeLevel ? domainOrLevel : '').toLowerCase()
    const level = (maybeLevel ? maybeLevel : domainOrLevel)?.toLowerCase()

    const negativeMap: Record<string, string> = {
      low: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
      mild: 'text-amber-700 bg-amber-50 border border-amber-200',
      moderate: 'text-orange-700 bg-orange-50 border border-orange-200',
      high: 'text-rose-700 bg-rose-50 border border-rose-200',
      critical: 'text-red-700 bg-red-50 border border-red-200'
    }

    const positiveMap: Record<string, string> = {
      // Inverted: low wellbeing/resilience = red, high = green
      low: 'text-rose-700 bg-rose-50 border border-rose-200',
      mild: 'text-amber-700 bg-amber-50 border border-amber-200',
      moderate: 'text-orange-700 bg-orange-50 border border-orange-200',
      high: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
      very_high: 'text-emerald-800 bg-emerald-50 border border-emerald-200',
      critical: 'text-red-700 bg-red-50 border border-red-200'
    }

    const isPositive = ['wellbeing', 'resilience'].includes(domain)
    const palette = isPositive ? positiveMap : negativeMap
    return palette[level] || 'text-slate-700 bg-slate-50 border border-slate-200'
  }, [])

  // Stronger border + shadow for wellness dimension pills
  const getPillClasses = useCallback(() => {
    // Neutral, minimal styling only (grey/white)
    return 'border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md'
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


  // Fetch latest overall assessment for the impact card
  useEffect(() => {
    let isMounted = true
    let abortController: AbortController | null = null

    const loadLatestOverall = async () => {
      if (!user?.id || !hasAssessmentData) return

      // Check if we already auto-loaded fresh data today
      const autoLoadKey = `auto_loaded_life_impacts_${user.id}_${new Date().toDateString()}`
      const alreadyAutoLoaded = sessionStorage.getItem(autoLoadKey)

      if (alreadyAutoLoaded) {
        console.log('🔄 [CACHED_LOAD] Skipping cached data load - fresh data already loaded today for user:', user.id)
        return
      }

      abortController = new AbortController()
      setLoadingImpact(true)

      try {
        const latest = await OverallAssessmentService.getLatestHolisticAssessment(user.id)
        if (isMounted && !abortController.signal.aborted) {
          setLatestOverall(latest)
        }
      } catch (e) {
        if (isMounted && !abortController.signal.aborted) {
          console.warn('Failed to load latest overall assessment:', e)
          setLatestOverall(null)
        }
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setLoadingImpact(false)
        }
      }
    }

    // Small delay to allow auto-load to run first
    setTimeout(() => {
      loadLatestOverall()
    }, 100)

    return () => {
      isMounted = false
      if (abortController) {
        abortController.abort()
      }
    }
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

  const titleCase = useCallback((s: string) => s
    ?.replace(/_/g, ' ')
    ?.toLowerCase()
    ?.replace(/\b\w/g, c => c.toUpperCase()) || '', [])

  // Evidence strings look like: "PHQ-9:10/27"; parse into pieces for tooltip
  const parseEvidence = useCallback((ev?: string) => {
    if (!ev) return null
    const [name, scorePart] = ev.split(':')
    if (!scorePart) return { name: ev }
    const [scoreStr, maxStr] = scorePart.split('/')
    const score = Number(scoreStr)
    const max = Number(maxStr)
    return { name, score: isNaN(score) ? undefined : score, max: isNaN(max) ? undefined : max }
  }, [])

  const renderHeroSection = () => (
    <div className="relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white to-emerald-50/30 rounded-[2rem]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(148,163,184,0.05),transparent_50%)] rounded-[2rem]"></div>
      
      <div className="relative bg-white border border-slate-200 rounded-3xl p-12 md:p-16 shadow-lg shadow-slate-900/10">
        

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-8"
            >
              <div className="relative">
                {/* Refined background accent */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/20 via-slate-50/10 to-teal-50/20 rounded-xl blur-lg -z-10"></div>

                <motion.h1
                  className="relative text-4xl md:text-5xl font-extralight text-slate-900 mb-6 leading-tight tracking-tight"
                  style={{
                    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.02em',
                    fontWeight: '200'
                  }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  Your{' '}
                  <span 
                    className="relative inline-block"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontWeight: '300'
                    }}
                  >
                    Wellness Journey
                  </span>
                  
                  {/* Sophisticated underline accent */}
                  <motion.div
                    className="absolute -bottom-2 left-0 h-px bg-gradient-to-r from-emerald-400/60 via-teal-400/80 to-emerald-400/60"
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                  />
                </motion.h1>
                <motion.div
                  className="mt-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
              <p 
                className="text-slate-700 text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto font-light"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.01em',
                  fontWeight: '300'
                }}
              >
                {hasAssessmentData
                  ? "Discover insights from your assessments and create a personalized path forward."
                  : "Begin your journey to better mental health with a personalized assessment."
                }
              </p>
                </motion.div>

                {/* Sophisticated accent line */}
                <motion.div
                  className="mt-8 mx-auto"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div className="relative">
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-slate-400/60 to-transparent"></div>
                    <motion.div
                      className="absolute top-0 left-0 h-px bg-gradient-to-r from-emerald-500/80 via-teal-500/60 to-emerald-500/80"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.0, delay: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-12 justify-center max-w-2xl mx-auto"
          >
            {/* Primary Action */}
            <motion.div
              className="relative group"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <button
                onClick={() => router.push('/assessments')}
                className="group relative overflow-hidden px-8 py-4 rounded-3xl font-semibold text-base
                  transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-emerald-400/20 focus:ring-offset-2
                  transform hover:scale-[1.02] active:scale-[0.98] border border-transparent
                  bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 text-white shadow-3xl hover:shadow-3xl hover:shadow-emerald-900/50 hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-700 border-emerald-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-xl">psychology</span>
                  <span>Take Assessments</span>
                </div>
              </button>

              {/* Enhanced tooltip */}
                <div className="absolute left-1/2 top-full mt-3 -translate-x-1/2 w-72 p-3 bg-white/95 backdrop-blur-sm border border-slate-200/40 rounded-2xl shadow-3xl shadow-slate-900/35 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
                  <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-emerald-600 text-base">psychology</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 leading-relaxed font-light">
                      Take evidence-based assessments to understand your mental health and get personalized insights.
                      </p>
                    </div>
                  </div>
                </div>
            </motion.div>
            
            {/* Secondary Actions */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => handleNavigate('/session')}
                className="group px-6 py-4 rounded-3xl bg-white/95 backdrop-blur-sm border border-emerald-200 text-emerald-600 font-semibold transition-all duration-300 ease-out hover:bg-emerald-50/80 hover:border-emerald-300 hover:shadow-3xl hover:shadow-emerald-200/40 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]"
                whileHover={{ y: -1 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">spa</span>
                  <span className="hidden sm:inline">Wellness Session</span>
                </div>
              </motion.button>
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
                    className="group relative overflow-visible"
                  >
                    <motion.div
                      className={`inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/95 backdrop-blur-sm border ${getPillClasses()} transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-200/60 focus:ring-offset-2`}
                      whileHover={{ y: -1, scale: 1.01 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                       <span className="text-sm text-slate-700 font-medium flex items-center gap-1">
                         {keyLabel(d.key)}
                         <motion.a
                           href="/help#bands"
                           className="opacity-60 hover:opacity-100 transition-opacity duration-200"
                           aria-label="Band definitions"
                           title="Band definitions"
                           whileHover={{ scale: 1.1 }}
                           transition={{ duration: 0.2 }}
                         >
                           <span className="material-symbols-outlined text-[16px] align-middle">info</span>
                         </motion.a>
                       </span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium transition-colors duration-300 ${getLevelBadgeClasses(d.key, d.level)}`} title={`${titleCase(d.level)}`}>
                        {titleCase(d.level)}
                      </span>
                    </motion.div>

                    {/* Tooltip */}
                    {d.evidence?.[0] && (
                      <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
                        <div className="px-3 py-2 text-[12px] rounded-xl bg-white/95 border border-slate-200 shadow-lg text-slate-700 whitespace-nowrap">
                          {(() => { const e = parseEvidence(d.evidence?.[0]); return e ? `${e.name}${e.score !== undefined ? ` • ${e.score}${e.max?`/${e.max}`:''}`:''}` : '' })()}
                        </div>
                      </div>
                    )}
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
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/40 rounded-3xl p-8 shadow-3xl shadow-slate-900/35">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-lg animate-spin">psychology</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">
                {isAutoLoading ? 'Analyzing Your Mental Health Journey' : 'Refreshing Analysis'}
              </h3>
              <p className="text-sm text-slate-600">
                {isAutoLoading ? 'Automatically loading your personalized insights...' : 'Updating your mental health analysis...'}
              </p>
            </div>
          </div>
          <div className="animate-pulse space-y-4">
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
        <motion.div
          className="relative bg-white/98 backdrop-blur-xl rounded-[2rem] p-12 border border-slate-200/30 shadow-2xl shadow-slate-900/[0.08] overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          whileHover={{ 
            scale: 1.005,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12)"
          }}
        >
          {/* Johnny Ive inspired minimal background layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/40 via-white/20 to-slate-50/40 rounded-[2rem]"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent rounded-[2rem]"></div>

          {/* Subtle geometric accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-100/20 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>

          <div className="relative z-10 text-center max-w-xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Refined Icon Container - Johnny Ive minimal approach */}
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                <motion.div
                  className="w-24 h-24 bg-gradient-to-b from-white via-slate-50/90 to-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-slate-900/[0.08] border border-slate-200/50 relative overflow-hidden"
                  whileHover={{ 
                    scale: 1.08,
                    rotate: 2,
                    boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)"
                  }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                  {/* Subtle inner highlight - signature Ive detail */}
                  <div className="absolute inset-[1px] bg-gradient-to-b from-white/80 via-transparent to-white/40 rounded-full"></div>
                  
                  <motion.span
                    className="material-symbols-outlined text-slate-700 text-4xl relative z-10 font-light"
                    animate={{
                      scale: [1, 1.02, 1]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    psychology
                  </motion.span>
                </motion.div>
              </motion.div>

              {/* Johnny Ive's Design Philosophy: Simplicity, Depth, and Refinement */}
              <motion.div
                className="relative mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
              >
                {/* Ultra-refined background with depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 rounded-3xl blur-3xl -z-10 opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-emerald-50/10 rounded-3xl -z-10"></div>

                {/* Subtle accent pattern */}
                <div className="absolute top-6 right-6 w-20 h-20 border border-emerald-200/30 rounded-full opacity-20"></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 border border-teal-200/20 rounded-full opacity-15"></div>

                <div className="relative px-8 py-6">
                  {/* Ultra-polished title with gradient refinement */}
                  <motion.div
                    className="text-center mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <h3 className="text-3xl md:text-4xl font-light text-slate-900 tracking-[-0.015em] leading-[1.05] mb-2">
                      Discover Your{' '}
                      <span className="relative">
                        <span className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 bg-clip-text text-transparent font-normal">
                          Unconscious
                        </span>
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse opacity-60"></span>
                      </span>
                      <br />
                      <span className="text-2xl md:text-3xl font-light text-slate-700 tracking-[-0.01em]">
                        Patterns
                      </span>
                    </h3>

                    {/* Minimalist accent line */}
                    <motion.div
                      className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent mx-auto mt-4"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                    ></motion.div>
                  </motion.div>

                  {/* Refined description with perfect typography */}
                  <motion.p
                    className="text-slate-600 text-lg font-light leading-relaxed max-w-2xl mx-auto tracking-[-0.005em] text-center"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    Unlock AI-powered insights that reveal how your mental wellness{' '}
                    <span className="text-emerald-700 font-normal">manifests</span>{' '}
                    in daily life, relationships, and personal growth.
                    <br />
                    <span className="text-slate-500 text-base font-light mt-2 block">
                      Understanding these patterns helps you recognize and address them proactively.
                    </span>
                  </motion.p>
                </div>

                {/* Ultra-refined shadow system */}
                <div className="absolute -inset-2 bg-gradient-to-br from-emerald-100/5 via-transparent to-teal-100/5 rounded-3xl blur-xl opacity-40 -z-20"></div>
                <div className="absolute -inset-4 bg-gradient-to-br from-slate-100/3 via-transparent to-slate-100/3 rounded-4xl blur-2xl opacity-30 -z-20"></div>
              </motion.div>

              {/* Johnny Ive inspired CTA Button */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                <motion.button
                  disabled={loadingImpact}
                  className={`group relative inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-b from-white via-slate-50/95 to-white border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-900/[0.08] overflow-hidden ${
                    loadingImpact ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                  }`}
                  whileHover={loadingImpact ? {} : {
                    scale: 1.02,
                    y: -2,
                    boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)"
                  }}
                  whileTap={loadingImpact ? {} : { scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  onClick={async () => {
                    try {
                      console.log('🔘 [DAILY IMPACTS BUTTON] Clicked - calling daily-life-impacts edge function!')

                      // Clear any previous comprehensive analysis data
                      setOverallAssessment(null)
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('currentOverallAssessment')
                      }

                      // Set loading state
                      setLoadingImpact(true)

                      console.log('🚀 [DAILY IMPACTS] Calling getFreshLifeImpacts (daily-life-impacts edge function)...')
                      const result = await OverallAssessmentService.getFreshLifeImpacts(user.id)
                      console.log('✅ [DAILY IMPACTS] Daily impacts analysis completed:', {
                        hasResult: !!result,
                        manifestationsCount: result?.holisticAnalysis?.manifestations?.length || 0,
                        unconsciousCount: result?.holisticAnalysis?.unconsciousManifestations?.length || 0,
                        riskLevel: result?.holisticAnalysis?.overallRiskLevel
                      })

                      if (result) {
                        setLatestOverall(result)
                        setOverallAssessment(result)
                        // Scroll to the analysis section after a delay
                        setTimeout(() => {
                          document.getElementById('unconscious-patterns-section')?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                          })
                        }, 1000)
                      }
                      } catch (error) {
                      console.error('❌ [DAILY IMPACTS] Error generating daily life impacts:', error)
                      setLatestOverall(null)
                      setOverallAssessment(null)
                      } finally {
                        setLoadingImpact(false)
                      }
                    }
                  }
                >
                  {/* Subtle hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-50/0 via-slate-50/40 to-slate-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Inner highlight border - Ive detail */}
                  <div className="absolute inset-[1px] bg-gradient-to-b from-white/60 via-transparent to-white/20 rounded-2xl opacity-60"></div>
                  
                  <motion.div
                    className="w-6 h-6 bg-gradient-to-b from-slate-600 to-slate-700 rounded-full flex items-center justify-center relative z-10"
                    animate={loadingImpact ? { rotate: 360 } : { scale: [1, 1.05, 1] }}
                    transition={loadingImpact ? {
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    } : {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <span className="material-symbols-outlined text-white text-sm font-light">
                      {loadingImpact ? 'refresh' : 'psychology'}
                    </span>
                  </motion.div>

                  <span className="text-slate-800 font-medium text-lg tracking-[-0.01em] relative z-10">
                    {loadingImpact ? 'Analyzing...' : 'Analyze Unconscious Patterns'}
                  </span>

                  {/* Loading dots when analyzing */}
                  {loadingImpact && (
                    <motion.div
                      className="flex gap-1 relative z-10"
                      animate={{
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                    </motion.div>
                  )}

                  {/* Minimal activity indicator when not loading */}
                  {!loadingImpact && (
                    <motion.div
                      className="flex gap-1 relative z-10"
                      animate={{
                        opacity: [0.4, 0.8, 0.4]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    </motion.div>
                  )}
                </motion.button>

                {/* Subtle descriptive text */}
                <motion.p
                  className="text-slate-500 text-sm font-light mt-4 tracking-[-0.01em]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  AI-powered analysis of your complete wellness journey
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )
    }

    return (
        <motion.div
        className="bg-white/80 backdrop-blur-sm border border-slate-200/40 rounded-3xl p-8 shadow-3xl shadow-slate-900/35 hover:shadow-3xl hover:shadow-slate-900/45 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        whileHover={{ y: -1 }}
      >
        {/* Ultra-Sophisticated Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative bg-gradient-to-br from-white via-slate-50/50 to-white rounded-3xl p-8 mb-8 border border-slate-200/40 shadow-lg shadow-slate-900/5 overflow-hidden"
          whileHover={{ scale: 1.01 }}
        >
          {/* Multi-layered sophisticated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-indigo-50/20 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-50/30 to-transparent rounded-3xl"></div>

          {/* Floating decorative elements */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full transform translate-x-6 -translate-y-6"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-indigo-100/40 to-transparent rounded-full transform -translate-x-4 translate-y-4"></div>

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Enhanced Icon Container */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-100 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200/50 relative overflow-hidden"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl"></div>

                  <motion.span
                    className="material-symbols-outlined text-blue-600 text-3xl relative z-10"
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    psychology
                  </motion.span>
                </motion.div>

                {/* Decorative animated ring */}
                <motion.div
                  className="absolute left-1/2 top-1/2 w-16 h-16 border-2 border-blue-200/50 rounded-3xl transform -translate-x-1/2 -translate-y-1/2"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                ></motion.div>
              </motion.div>

              <div className="flex-1">
                {/* Enhanced Typography */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h3 className="text-2xl md:text-3xl font-light text-slate-900 mb-3 tracking-tight leading-tight">
                    Analyze Your <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent font-normal">Unconscious Patterns</span>
                  </h3>
                </motion.div>

                {/* Enhanced Description with AI Badge */}
                <motion.div
                  className="mb-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
              <div className="relative group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/40 rounded-2xl">
                        <motion.span
                          className="material-symbols-outlined text-emerald-600 text-sm"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          auto_mode
                        </motion.span>
                        <span className="text-xs font-semibold text-emerald-700">AI-Powered</span>
                      </div>
                      <p className="text-slate-600 text-base cursor-help hover:text-slate-800 transition-colors duration-300 font-light">
                        Insights from your complete assessment history
                      </p>
                      <motion.span
                        className="material-symbols-outlined text-emerald-500 text-base opacity-60 group-hover:opacity-100 transition-opacity cursor-help"
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        transition={{ duration: 0.2 }}
                      >
                        info
                      </motion.span>
                    </div>

                    {/* Ultra-Sophisticated Enhanced Tooltip */}
                    <motion.div
                      className="absolute left-0 top-full mt-4 w-96 p-5 bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-3xl shadow-3xl shadow-slate-900/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-50 pointer-events-none"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="material-symbols-outlined text-emerald-600 text-xl">psychology</span>
                        </motion.div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-slate-900 mb-2">Unconscious Pattern Analysis</h4>
                          <p className="text-sm text-slate-600 leading-relaxed font-light">
                            Explore AI-powered insights that reveal how your mental health patterns manifest unconsciously in your daily life, relationships, and overall well-being. Understanding these patterns helps you recognize and address them proactively.
                      </p>
                    </div>
                  </div>

                      {/* Decorative accent line */}
                      <motion.div
                        className="border-t border-emerald-200/40 pt-4"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        <div className="flex items-center justify-center gap-3 text-sm text-emerald-600 font-medium">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                          Powered by advanced AI algorithms
                          <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></span>
                    </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Enhanced Update Timestamp */}
              {updatedAt && (
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <motion.span
                      className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.span>
                    <p className="text-sm text-slate-500 font-light">
                      Updated {formatRelative(updatedAt)}
                    </p>
                  </motion.div>
              )}
            </div>
          </div>

            {/* Enhanced Risk Badge */}
          {risk && (
              <motion.div
                className="flex-shrink-0"
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
            <motion.span
                  className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-lg ${getLevelBadgeClasses(risk)}`}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.span
                    className="w-2 h-2 rounded-full bg-current animate-pulse"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  ></motion.span>
              {risk} risk
                  <motion.span
                    className="material-symbols-outlined text-xs"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    trending_flat
            </motion.span>
                </motion.span>
              </motion.div>
          )}
          </div>
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex gap-4"
        >
          <motion.button
            onClick={async () => {
              if (!user?.id) return
              console.log('🔄 Refreshing life impacts for user:', user.id)
              setLoadingImpact(true)
              try {
                console.log('🔄 [REFRESH] Starting fresh life impacts analysis with most recent assessments...')
                const freshImpacts = await OverallAssessmentService.getFreshLifeImpacts(user.id)
                console.log('✅ [REFRESH] Fresh analysis completed:', {
                  hasResult: !!freshImpacts,
                  totalAssessmentsAnalyzed: freshImpacts?.assessmentData?.assessmentCount || 0,
                  manifestationsCount: freshImpacts?.holisticAnalysis?.manifestations?.length || 0,
                  unconsciousCount: freshImpacts?.holisticAnalysis?.unconsciousManifestations?.length || 0,
                  riskLevel: freshImpacts?.holisticAnalysis?.overallRiskLevel,
                  confidenceLevel: freshImpacts?.holisticAnalysis?.confidenceLevel
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
            className={`flex-1 group px-5 py-3 rounded-3xl font-semibold text-sm transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-emerald-400/20 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] ${
              loadingImpact
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-sm border-slate-200'
                : 'bg-white/95 backdrop-blur-sm border border-emerald-200 text-emerald-600 hover:bg-emerald-50/80 hover:border-emerald-300 hover:shadow-3xl hover:shadow-emerald-200/40'
            }`}
            whileHover={!loadingImpact ? { y: -1 } : {}}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center justify-center gap-2">
              <span className={`material-symbols-outlined text-base ${loadingImpact ? 'animate-spin' : ''}`}>
                {loadingImpact ? 'refresh' : 'refresh'}
              </span>
              <span>{loadingImpact ? 'Refreshing...' : 'Refresh'}</span>
            </div>
          </motion.button>

          <motion.button
            onClick={() => { if (latestOverall) setOverallAssessment(latestOverall); setShowOverallResults(true) }}
            className="flex-1 group px-5 py-3 rounded-3xl font-semibold text-sm bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 text-white transition-all duration-300 ease-out hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-700 hover:shadow-3xl hover:shadow-emerald-900/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] shadow-3xl border border-emerald-500/20"
            whileHover={{ y: -1 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">open_in_new</span>
              <span>Explore Unconscious Insights</span>
            </div>
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  // Recent assessments section intentionally removed to declutter

  // Loading state
  if (loading) {
    return (
      <motion.div
        className="bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40 min-h-screen relative overflow-hidden"
        style={{
          fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Sophisticated floating animated elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-emerald-100/25 to-teal-50/15 rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-teal-100/20 to-emerald-50/12 rounded-full blur-3xl"
            animate={{
              y: [0, 25, 0],
              x: [0, -25, 0],
              scale: [1, 0.9, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 2
            }}
          />
        </div>
        <div className="container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-16">
          <motion.div
            className="space-y-8 md:space-y-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-teal-200/30"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  className="material-symbols-outlined text-teal-600 text-3xl"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  psychology
                </motion.span>
              </motion.div>

              <motion.h1
                className="text-3xl md:text-4xl font-extralight text-slate-900 mb-4 tracking-tight"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.02em',
                  fontWeight: '200'
                }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                Loading your{' '}
                <span 
                  className="relative inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: '300'
                  }}
                >
                  dashboard
                </span>
              </motion.h1>

              <motion.p
                className="text-slate-600 font-light text-lg"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.01em',
                  fontWeight: '300'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                Personalizing your wellness experience...
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="lg:col-span-8 xl:col-span-9 space-y-8">
                <motion.div
                  className="h-64 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl shadow-sm"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    backgroundSize: '200% 200%'
                  }}
                />
                <motion.div
                  className="h-48 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl shadow-sm"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.5
                  }}
                  style={{
                    backgroundSize: '200% 200%'
                  }}
                />
              </div>
              <div className="lg:col-span-4 xl:col-span-3">
                <motion.div
                  className="h-96 bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-50 rounded-3xl shadow-sm"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 1
                  }}
                  style={{
                    backgroundSize: '200% 200%'
                  }}
                />
              </div>
            </motion.div>

            {/* Enhanced progress indicator */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <div className="flex gap-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                ))}
            </div>
            </motion.div>
          </motion.div>
          </div>
      </motion.div>
    )
  }

  // Error state
  if (error && !loading) {
    return (
      <motion.div
        className="bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40 min-h-screen relative overflow-hidden"
        style={{
          fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Sophisticated floating animated elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-rose-100/25 to-pink-50/15 rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-red-100/20 to-rose-50/12 rounded-full blur-3xl"
            animate={{
              y: [0, 25, 0],
              x: [0, -25, 0],
              scale: [1, 0.9, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 2
            }}
          />
        </div>
        <div className="container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-16">
          <motion.div
            className="text-center py-12 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-200/30 relative">
                <motion.span
                  className="material-symbols-outlined text-rose-500 text-3xl"
                  animate={{
                    rotate: [0, -10, 10, 0],
                    scale: [1, 0.95, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  error
                </motion.span>
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400/5 to-pink-500/5 rounded-3xl"></div>
            </div>
            </motion.div>

            <motion.h2
              className="text-3xl font-extralight text-slate-800 mb-6 tracking-tight"
              style={{
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.02em',
                fontWeight: '200'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              Something went{' '}
              <span 
                className="relative inline-block"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '300'
                }}
              >
                wrong
              </span>
            </motion.h2>

            <motion.p
              className="text-slate-600 font-light mb-8 leading-relaxed text-lg"
              style={{
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.01em',
                fontWeight: '300'
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {error}
            </motion.p>

            <motion.button
              onClick={() => {
                setError(null)
                setDataFetched(false)
                setRetryCount(0)
                setLoading(true)
              }}
              className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold transition-all duration-300 ease-out text-base focus:outline-none focus:ring-4 focus:ring-slate-400/20 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] shadow-3xl hover:shadow-3xl hover:shadow-slate-900/50 hover:from-slate-700 hover:to-slate-800 border border-slate-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="material-symbols-outlined mr-3 text-lg">refresh</span>
              Try again
            </motion.button>

            {/* Subtle error indicator */}
            <motion.div
              className="flex justify-center gap-2 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-rose-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
          </div>
      </motion.div>
    )
  }

  // Profile not ready state
  if (!profile) {
    return (
      <motion.div
        className="bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40 min-h-screen relative overflow-hidden"
        style={{
          fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Sophisticated floating animated elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-emerald-100/25 to-teal-50/15 rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-teal-100/20 to-emerald-50/12 rounded-full blur-3xl"
            animate={{
              y: [0, 25, 0],
              x: [0, -25, 0],
              scale: [1, 0.9, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 2
            }}
          />
        </div>
        <div className="container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-16">
          <motion.div
            className="text-center py-12 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-teal-200/30 relative">
                <motion.span
                  className="material-symbols-outlined text-teal-600 text-3xl"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  person
                </motion.span>
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-emerald-500/5 rounded-3xl"></div>
            </div>
            </motion.div>

            <motion.h2
              className="text-3xl font-extralight text-slate-800 mb-6 tracking-tight"
              style={{
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.02em',
                fontWeight: '200'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              Preparing your{' '}
              <span 
                className="relative inline-block"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '300'
                }}
              >
                space
              </span>
            </motion.h2>

            <motion.p
              className="text-slate-600 font-light leading-relaxed text-lg mb-8"
              style={{
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.01em',
                fontWeight: '300'
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              We're setting up your personalized wellness dashboard with care and attention.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
            >
            <LoadingSpinner size="lg" className="mt-8" />
            </motion.div>

            {/* Subtle progress dots */}
            <motion.div
              className="flex justify-center gap-2 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-teal-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
          </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40 min-h-screen relative overflow-hidden"
      style={{
        fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Ultra-sophisticated multi-layered background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-50/10 to-transparent"></div>
      
      {/* Sophisticated floating animated elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-emerald-100/25 to-teal-50/15 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-teal-100/20 to-emerald-50/12 rounded-full blur-3xl"
          animate={{
            y: [0, 25, 0],
            x: [0, -25, 0],
            scale: [1, 0.9, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-slate-100/15 via-emerald-50/8 to-slate-100/15 rounded-full blur-3xl"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-teal-100/10 rounded-full blur-2xl"
          animate={{
            y: [0, -15, 0],
            x: [0, 12, 0],
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 1
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-16">
        <motion.div
          className="space-y-10 md:space-y-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Enhanced Main Content Grid */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-8xl mx-auto"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
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
        className="bg-white border border-slate-200/40 rounded-3xl p-8 shadow-3xl shadow-slate-900/35 h-fit lg:sticky lg:top-24"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Assessments Section (minimal, modern) */}
                <AssessmentSection coverage={coverage} className="mt-2" />
              </motion.div>
            </div>
          </motion.div>




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
                className="bg-white rounded-3xl shadow-3xl shadow-slate-900/40 max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-200/40"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Enhanced Header */}
                <motion.div
                  className="relative flex items-center justify-between p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-100/40 to-transparent rounded-full transform -translate-x-16 -translate-y-16"></div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-100/40 to-transparent rounded-full transform translate-x-12 -translate-y-12"></div>
                  </div>

                  <div className="relative z-10 flex items-center gap-4">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center shadow-sm"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="material-symbols-outlined text-emerald-600 text-lg">
                        {isGeneratingOverall ? 'psychology' : 'analytics'}
                      </span>
                    </motion.div>
                    <div>
                      <motion.h2
                        className="text-2xl font-light text-slate-900 tracking-tight"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                    {isGeneratingOverall ? 'Analyzing Daily Life Impacts' : 'Daily Life Impact Analysis'}
                      </motion.h2>
                  {!isGeneratingOverall && (
                        <motion.p
                          className="text-sm text-slate-600 font-light mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          How your mental wellness affects your daily experiences
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {!isGeneratingOverall && (
                    <motion.button
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
                      className="relative z-10 p-2 hover:bg-slate-100/80 rounded-xl transition-all duration-200 group"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="material-symbols-outlined text-slate-500 text-lg group-hover:text-slate-700 transition-colors">close</span>
                    </motion.button>
                  )}
                </motion.div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
                  {isGeneratingOverall ? (
                    <div className="p-8 text-center">
                      <div className="mb-8">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                          <span className="material-symbols-outlined text-2xl text-emerald-600 animate-spin">psychology</span>
                        </div>
                        <h3 className="text-xl font-light text-slate-900 mb-3 tracking-tight">Analyzing Daily Life Impacts</h3>
                        <p className="text-slate-600 text-base leading-relaxed font-light max-w-md mx-auto">
                          We're analyzing how your mental wellness patterns affect your daily life...
                        </p>
                      </div>

                      {/* Enhanced Progress Bar */}
                      <motion.div
                        className="max-w-sm mx-auto"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <div className="flex justify-between text-sm text-slate-600 mb-6 font-medium">
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                          >
                            Analysis Progress
                          </motion.span>
                          <motion.span
                            className="font-semibold text-emerald-600"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                          >
                            {Math.round(overallProgress)}%
                          </motion.span>
                        </div>

                        {/* Enhanced progress container */}
                        <div className="relative w-full bg-slate-100/80 rounded-2xl h-3 overflow-hidden shadow-inner">
                          {/* Animated background */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-emerald-200/30 via-teal-200/30 to-emerald-200/30 rounded-2xl"
                            animate={{
                              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            style={{
                              backgroundSize: '200% 200%'
                            }}
                          />

                          {/* Main progress bar */}
                          <motion.div
                            className="relative h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl shadow-sm"
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                          >
                            {/* Animated shine effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-2xl"
                              animate={{
                                x: ['-100%', '100%']
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                              }}
                            />
                          </motion.div>

                          {/* Pulsing effect at the end */}
                          {overallProgress > 0 && (
                            <motion.div
                              className="absolute top-0 h-full w-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl opacity-60"
                              animate={{
                                x: `${overallProgress - 8}%`,
                                scale: [1, 1.2, 1],
                                opacity: [0.6, 1, 0.6]
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              style={{
                                left: `${overallProgress}%`,
                                transform: 'translateX(-100%)'
                              }}
                            />
                          )}
                        </div>

                        <motion.p
                          className="text-sm text-slate-500 mt-6 font-light text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                        >
                          ✨ AI is analyzing your daily life impact patterns...
                        </motion.p>
                      </motion.div>
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
                                className="px-4 py-2.5 text-sm font-semibold bg-white/95 backdrop-blur-sm border border-emerald-200 text-emerald-600 rounded-3xl hover:bg-emerald-50/80 hover:border-emerald-300 hover:shadow-3xl hover:shadow-emerald-200/40 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:ring-offset-2 transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98]"
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
                                className="inline-flex items-center px-4 py-2.5 rounded-3xl text-white font-semibold transition-all duration-300 ease-out text-sm focus:outline-none focus:ring-4 focus:ring-emerald-400/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] border border-emerald-500/20"
                                style={{
                                  backgroundColor: isGeneratingOverall ? '#9CA3AF' : '#059669',
                                  boxShadow: isGeneratingOverall ? 'none' : '0 2px 6px rgba(16, 24, 40, 0.06)',
                                  minHeight: '44px'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isGeneratingOverall) {
                                    e.currentTarget.style.backgroundColor = '#047857'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isGeneratingOverall) {
                                    e.currentTarget.style.backgroundColor = '#059669'
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
                                className="px-4 py-2.5 text-sm font-semibold bg-white/95 backdrop-blur-sm border border-emerald-200 text-emerald-600 rounded-3xl hover:bg-emerald-50/80 hover:border-emerald-300 hover:shadow-3xl hover:shadow-emerald-200/40 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:ring-offset-2 transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98]"
                              >
                                Close
                              </button>
                              <button
                                onClick={() => {
                                  setShowOverallResults(false)
                                  handleNavigate('/assessments')
                                }}
                                className="inline-flex items-center px-4 py-2.5 rounded-xl text-white font-medium transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                                style={{
                                  backgroundColor: '#059669',
                                  boxShadow: '0 2px 6px rgba(16, 24, 40, 0.06)',
                                  minHeight: '44px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
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
                        className="inline-flex items-center px-4 py-2.5 rounded-3xl text-white font-semibold transition-all duration-300 ease-out text-sm focus:outline-none focus:ring-4 focus:ring-emerald-400/20 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] border-2 border-emerald-500/20"
                        style={{
                          backgroundColor: '#059669',
                          boxShadow: '0 2px 6px rgba(16, 24, 40, 0.06)',
                          minHeight: '44px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                        onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#065f46'}
                        onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#047857'}
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

        </motion.div>
        </div>
    </motion.div>
  )
}

