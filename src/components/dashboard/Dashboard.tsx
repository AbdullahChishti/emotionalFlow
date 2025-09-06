'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
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
import { OverallAssessmentResults, OverallAssessmentLoading } from '@/components/assessment/OverallAssessmentResults'

// Material Symbols icons import
import 'material-symbols/outlined.css'

// Reusable Components
interface StatCardProps {
  icon: string
  value: string | number
  label: string
  loading?: boolean
}

function StatCard({ icon, value, label, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
        <div className="animate-pulse">
          <div className="w-7 h-7 bg-slate-200 rounded-lg mb-3"></div>
          <div className="w-14 h-6 bg-slate-200 rounded mb-2"></div>
          <div className="w-16 h-3 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300/60 transition-all duration-200 h-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-slate-600 text-lg">{icon}</span>
        </div>
      </div>
      <div className="text-xl font-semibold text-slate-900 mb-1">{value}</div>
      <div className="text-sm text-slate-600 leading-snug">{label}</div>
    </motion.div>
  )
}

interface ActionPillProps {
  icon: string
  label: string
  description: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

function ActionPill({ icon, label, description, onClick, variant = 'primary', disabled }: ActionPillProps) {
  const baseClasses = "flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 w-full min-h-[80px]"
  const variantClasses = variant === 'primary'
    ? "text-white shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
    : "bg-white border border-slate-200/60 text-slate-900 shadow-sm hover:shadow-md hover:border-slate-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-600"

  const primaryStyle = variant === 'primary' ? {
    backgroundColor: '#334155',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
  } : {}

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={variant === 'primary' ? primaryStyle : {}}
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label={label}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        variant === 'primary' ? 'bg-white/15' : 'bg-slate-100'
      }`}>
        <span className={`material-symbols-outlined text-lg ${
          variant === 'primary' ? 'text-white' : 'text-slate-600'
        }`}>{icon}</span>
      </div>
      <div className="text-left flex-1 min-w-0">
        <div className="font-medium text-sm leading-tight break-words">{label}</div>
        <div className={`text-xs ${variant === 'primary' ? 'text-white/75' : 'text-slate-500'} leading-relaxed mt-0.5 break-words`}>
          {description}
        </div>
      </div>
      <span className={`material-symbols-outlined text-lg flex-shrink-0 ${
        variant === 'primary' ? 'text-white/60' : 'text-slate-400'
      }`}>arrow_forward</span>
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
  const [overallAssessment, setOverallAssessment] = useState<OverallAssessmentResult | null>(() => {
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

  // Generate overall assessment with progress tracking
  const handleGenerateOverallAssessment = useCallback(async () => {
    if (!user?.id || isGeneratingOverall) return

    setIsGeneratingOverall(true)
    setOverallProgress(0)
    setShowOverallResults(true)
    setOverallAssessment(null) // Reset previous results
    setOverallRetryCount(0) // Reset retry count

    let progressInterval: NodeJS.Timeout | null = null
    let timeoutId: NodeJS.Timeout | null = null

    try {
      // Simulate progress updates with more realistic progression
      progressInterval = setInterval(() => {
        setOverallProgress(prev => {
          if (prev >= 85) return prev // Stop at 85% until completion
          return prev + Math.random() * 8 + 2 // Slower, more realistic progress
        })
      }, 300)

      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        console.warn('Overall assessment generation timeout - forcing completion')
        if (progressInterval) clearInterval(progressInterval)
        setOverallProgress(100)
        setIsGeneratingOverall(false)
        setShowOverallResults(false)
        // Show error state
        setOverallAssessment({
          userId: user.id,
          assessmentData: {
            userId: user.id,
            assessments: [],
            assessmentCount: 0,
            dateRange: { earliest: new Date().toISOString(), latest: new Date().toISOString() },
            totalScore: 0,
            averageScore: 0
          },
          holisticAnalysis: {
          executiveSummary: 'We encountered an issue analyzing how your mental health might be affecting your daily life.',
          manifestations: ['Unable to analyze potential impacts at this time'],
          unconsciousManifestations: [],
          riskFactors: ['Technical issue'],
          protectiveFactors: ['You\'re taking steps to understand your experiences'],
          overallRiskLevel: 'low',
          confidenceLevel: 0,
          supportiveMessage: 'Don\'t worry - this is just a technical hiccup. We\'ll try again to understand how you might be feeling.'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }, 45000) // 45 second timeout

      // Generate overall assessment
      const result = await OverallAssessmentService.generateHolisticAssessment(user.id)
      
      // Clear intervals and timeouts
      if (progressInterval) clearInterval(progressInterval)
      if (timeoutId) clearTimeout(timeoutId)
      
      setOverallProgress(100)
      
      // Small delay to show 100% progress
      setTimeout(() => {
        setOverallAssessment(result)
        setIsGeneratingOverall(false)
      }, 800)

    } catch (error) {
      console.error('Error generating overall assessment:', error)
      
      // Clear intervals and timeouts
      if (progressInterval) clearInterval(progressInterval)
      if (timeoutId) clearTimeout(timeoutId)
      
      setIsGeneratingOverall(false)
      
      // Check if we should retry (max 2 retries)
      if (overallRetryCount < 2) {
        console.log(`Retrying overall assessment generation (attempt ${overallRetryCount + 1}/2)`)
        setOverallRetryCount(prev => prev + 1)
        
        // Retry after a short delay
        setTimeout(() => {
          handleGenerateOverallAssessment()
        }, 2000)
        return
      }
      
      // Show error state with helpful message after max retries
      setOverallAssessment({
        userId: user.id,
        assessmentData: {
          userId: user.id,
          assessments: [],
          assessmentCount: 0,
          dateRange: { earliest: new Date().toISOString(), latest: new Date().toISOString() },
          totalScore: 0,
          averageScore: 0
        },
        holisticAnalysis: {
          executiveSummary: 'We encountered an issue analyzing how your mental health might be affecting your daily life. This might be due to a temporary service issue.',
          manifestations: ['Unable to analyze potential impacts at this time', 'Please try again in a few moments'],
          unconsciousManifestations: [],
          riskFactors: ['Technical issue'],
          protectiveFactors: ['You\'re taking steps to understand your experiences'],
          overallRiskLevel: 'low',
          confidenceLevel: 0,
          supportiveMessage: 'Don\'t worry - this is just a technical hiccup. We\'ll try again to understand how you might be feeling.'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
  }, [user?.id, isGeneratingOverall])

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

  // Cleanup effect for overall assessment generation
  useEffect(() => {
    return () => {
      // Cleanup any running intervals or timeouts when component unmounts
      if (isGeneratingOverall || showOverallResults) {
        console.log('🚨 Dashboard unmounting during overall assessment:', {
          isGeneratingOverall,
          showOverallResults,
          hasOverallAssessment: !!overallAssessment,
          stackTrace: new Error().stack?.split('\n').slice(0, 5).join('\n')
        })
        // Don't cleanup if we're in the middle of generation or showing results
        // This prevents the modal from disappearing due to component remounts
      }
    }
  }, [isGeneratingOverall, showOverallResults, overallAssessment])

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
      low: 'text-green-700 bg-green-50 border border-green-200/60',
      mild: 'text-emerald-700 bg-emerald-50 border border-emerald-200/60',
      moderate: 'text-amber-700 bg-amber-50 border border-amber-200/60',
      high: 'text-red-700 bg-red-50 border border-red-200/60',
      critical: 'text-red-800 bg-red-50 border border-red-300'
    }
    return map[level?.toLowerCase()] || 'text-slate-600 bg-slate-50 border border-slate-200/60'
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

  const renderSnapshotHero = () => (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="max-w-none">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-medium text-slate-800 mb-3">Your wellness snapshot</h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            {hasAssessmentData
              ? "Your personalized insights are ready. Generate a comprehensive mental health profile using all your assessments."
              : "Complete assessments to unlock personalized insights and tailored recommendations for your mental wellness journey."
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center">
          <button
            onClick={() => handleNavigate('/session')}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-800 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:bg-slate-700 text-sm"
          >
            <span className="material-symbols-outlined mr-2 text-lg">play_arrow</span>
            Start session
          </button>
          <button
            onClick={handleGenerateOverallAssessment}
            disabled={isGeneratingOverall || !hasAssessmentData}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <span className="material-symbols-outlined mr-2 text-lg">
              {isGeneratingOverall ? 'hourglass_empty' : 'psychology'}
            </span>
            {isGeneratingOverall ? 'Generating insights...' : 'Get personalized insights'}
          </button>
          <button
            onClick={() => handleNavigate('/results')}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-200/60 bg-white text-slate-700 font-medium shadow-sm hover:shadow-md hover:border-slate-300/60 transition-all duration-200 text-sm"
          >
            <span className="material-symbols-outlined mr-2 text-lg">lightbulb</span>
            View results
          </button>
        </div>

        <div className="text-center">
          <a href="/crisis-support" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors duration-200">
            <span className="material-symbols-outlined text-sm">help</span>
            Need immediate support?
          </a>
        </div>
      </div>

      {/* Dimension buttons */}
      {snapshot?.dimensions && snapshot.dimensions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {snapshot.dimensions
            .filter(d => ['anxiety','trauma_exposure','wellbeing','stress','depression','resilience'].includes(d.key))
            .slice(0, 4)
            .map(d => (
              <div key={d.key} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/60 shadow-sm">
                <span className="text-xs text-slate-700">{keyLabel(d.key)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-lg ${getLevelBadgeClasses(d.level)}`}>
                  {d.level}
                </span>
              </div>
            ))}
        </div>
      )}

      <div className="border-t border-slate-200/60 pt-4">
        <button
          onClick={() => setWhyOpen(v => !v)}
          className="text-xs text-slate-500 hover:text-slate-700 transition-colors duration-200"
        >
          {whyOpen ? 'Hide details' : 'How do we know this?'}
        </button>
        {whyOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/40"
          >
            <div className="text-xs text-slate-700 mb-2">Informed by</div>
            <div className="flex flex-wrap gap-1.5">
              {(snapshot?.explainability.assessments_used || []).map((name) => {
                const pair = Object.entries(ASSESSMENTS).find(([id, def]) => {
                  const display = def?.shortTitle || def?.title || id.toUpperCase()
                  return name === display || name.includes(def?.shortTitle || '')
                })
                const id = pair?.[0]
                const when = id ? formatRelative(latestMeta[id]) : ''
                return (
                  <span key={name} className="inline-flex items-center px-2 py-1 rounded-lg bg-white border border-slate-200/40 text-slate-600 text-xs">
                    {name}{when ? ` • ${when}` : ''}
                  </span>
                )
              })}
            </div>
          </motion.div>
        )}
        <div className="mt-4 text-xs text-slate-400 leading-relaxed">
          This information is for your awareness only, not a clinical diagnosis.{' '}
          <a href="/crisis-support" className="text-slate-500 hover:text-slate-700 transition-colors duration-200">Need immediate support?</a>
          <span className="mx-2 text-slate-300">•</span>
          <a href="/profile" className="text-slate-500 hover:text-slate-700 transition-colors duration-200">Manage personalization</a>
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
        <div className="relative bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-blue-50/5 rounded-3xl"></div>
          <div className="relative z-10 animate-pulse space-y-3">
            <div className="h-4 w-2/3 bg-white/40 rounded-lg" />
            <div className="h-3 w-full bg-white/40 rounded" />
            <div className="h-3 w-5/6 bg-white/40 rounded" />
            <div className="h-3 w-4/6 bg-white/40 rounded" />
          </div>
        </div>
      )
    }

    if (!latestOverall) {
      return (
        <div className="relative bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-blue-50/5 rounded-3xl"></div>
          <div className="relative z-10 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100/80 to-blue-100/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/30">
              <span className="material-symbols-outlined text-purple-600 text-xl">psychology</span>
            </div>
            <div className="text-lg font-bold text-slate-900 mb-2">How this might impact your life</div>
            <div className="text-sm text-slate-600/80 font-medium mb-5 max-w-md mx-auto">Generate a personalized analysis to see possible day-to-day impacts.</div>
            <button
              onClick={handleGenerateOverallAssessment}
              disabled={isGeneratingOverall || !hasAssessmentData}
              className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
            >
              <span className="material-symbols-outlined mr-2 text-base">sparkles</span>
              Get personalized insights
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="relative bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-50/5 rounded-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-lg font-bold text-slate-900">How this might impact your life</div>
              {updatedAt && (
                <div className="text-xs text-slate-500/80 font-medium mt-1">Updated {formatRelative(updatedAt)}</div>
              )}
            </div>
            {risk && (
              <div className="flex-shrink-0">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl ${getLevelBadgeClasses(risk)} shadow-sm`}>
                  {risk}
                </span>
              </div>
            )}
          </div>

          {lines && lines.length > 0 ? (
            <div className="space-y-3 mb-5">
              {lines.slice(0, 5).map((l: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-all duration-200 group">
                  <div className="flex-shrink-0 w-2 h-2 bg-slate-400 rounded-full mt-2 group-hover:bg-slate-600 transition-colors duration-200"></div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 leading-relaxed">{l}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm font-medium text-slate-500/80 mb-5 px-4 py-3 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20">
              No specific impacts identified. Try refreshing your insights.
            </div>
          )}

          <div className="flex gap-3">
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
              className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/30 text-slate-700 text-sm font-medium hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg"
            >
              <span className="material-symbols-outlined mr-2 text-base">refresh</span>
              {loadingImpact ? 'Refreshing...' : 'Refresh insights'}
            </button>
            <button
              onClick={() => { if (latestOverall) setOverallAssessment(latestOverall); setShowOverallResults(true) }}
              className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 text-white text-sm font-medium hover:from-slate-900 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="material-symbols-outlined mr-2 text-base">open_in_new</span>
              View full profile
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Recent assessments section intentionally removed to declutter

  // Loading state
  if (loading) {
    return (
      <div className="bg-slate-50/30 min-h-screen">
        <div className="container mx-auto px-4 pt-20 pb-12 md:pt-24 md:pb-16">
          <div className="animate-pulse space-y-6 md:space-y-8">
            <div className="h-6 w-2/3 bg-slate-200/60 rounded-lg mx-auto" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl mx-auto">
              <div className="h-16 bg-slate-200/60 rounded-2xl" />
              <div className="h-16 bg-slate-200/60 rounded-2xl" />
            </div>
            <div className="h-4 w-32 bg-slate-200/60 rounded mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-32 bg-slate-200/60 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="bg-slate-50/30 min-h-screen">
        <div className="container mx-auto px-4 pt-20 pb-12 md:pt-24 md:pb-16">
          <div className="text-center py-8">
            <h2 className="text-2xl font-light text-slate-600 mb-4">Unable to load dashboard</h2>
            <p className="text-slate-500 font-light mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => {
                setError(null)
                setDataFetched(false)
                setRetryCount(0)
                setLoading(true)
              }}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-slate-700 text-white font-light hover:bg-slate-600 transition-colors duration-300"
            >
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
      <div className="bg-slate-50/30 min-h-screen">
        <div className="container mx-auto px-4 pt-20 pb-12 md:pt-24 md:pb-16">
          <div className="text-center py-8">
            <h2 className="text-2xl font-light text-slate-600 mb-4">Setting up your profile...</h2>
            <p className="text-slate-500 font-light">This will only take a moment.</p>
            <LoadingSpinner size="lg" className="mt-6" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50/30 min-h-screen">
      <div className="container mx-auto px-4 pt-20 pb-12 md:pt-24 md:pb-16 transform scale-110 origin-top">
        <div className="space-y-6 md:space-y-8">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
            {/* Left Column - Main Content (70%) */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              {/* Snapshot Hero */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {renderSnapshotHero()}
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
                className="relative bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl h-fit overflow-hidden lg:sticky lg:top-24"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-blue-50/5 rounded-3xl"></div>

                {/* Greeting Section */}
                <div className="relative z-10 text-center mb-6">
                  <div className="w-12 h-12 bg-slate-100/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg border border-white/30">
                    <span className="material-symbols-outlined text-slate-600 text-xl">wb_sunny</span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">
                      {getGreeting()}, {profile.display_name?.split(' ')[0] || 'there'}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {getFormattedDate()}
                    </p>
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto my-3"></div>
                    <p className="text-xs text-slate-500/80 leading-relaxed font-medium">
                      {hasAssessmentData ? 'Your personalized dashboard is ready' : "You're doing your best today."}
                    </p>
                  </div>
                </div>

                {/* Elegant Divider */}
                <div className="relative z-10 flex items-center mb-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent"></div>
                  <div className="px-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100/80 to-indigo-100/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-white/30">
                      <span className="material-symbols-outlined text-blue-600 text-sm">assignment_turned_in</span>
                    </div>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent"></div>
                </div>

                {/* Assessments Section */}
                <div className="relative z-10">
                  <div className="text-center mb-4">
                    <div className="text-sm font-semibold text-slate-800 mb-1">Your Assessments</div>
                    <div className="text-xs text-slate-600/80 font-medium">Track your mental health journey</div>
                  </div>

                  <div className="space-y-3">
                    {coverage.assessed.map(id => (
                      <div key={`ok-${id}`} className="group flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer">
                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-white/20">
                          <span className="material-symbols-outlined text-white text-sm">check</span>
                        </div>
                        <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900">{(ASSESSMENTS[id]?.shortTitle || id.toUpperCase())}</span>
                      </div>
                    ))}

                    {coverage.stale.map(id => (
                      <div key={`stale-${id}`} className="group flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer">
                        <div className="flex-shrink-0 w-6 h-6 bg-amber-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-white/20">
                          <span className="material-symbols-outlined text-white text-sm">schedule</span>
                        </div>
                        <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900">{(ASSESSMENTS[id]?.shortTitle || id.toUpperCase())}</span>
                      </div>
                    ))}

                    {coverage.missing.map(id => (
                      <div key={`miss-${id}`} className="group flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20 hover:bg-white/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer">
                        <div className="flex-shrink-0 w-6 h-6 bg-slate-400/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-white/20">
                          <span className="material-symbols-outlined text-slate-600 text-sm">radio_button_unchecked</span>
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-800">{(ASSESSMENTS[id]?.shortTitle || id.toUpperCase())}</span>
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
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-medium text-slate-700 mb-2">Complete a quick check-in to personalize your support.</h3>
                <p className="text-slate-500 text-sm mb-5">It takes about 3 minutes.</p>
                <button
                  onClick={() => handleNavigate('/assessments')}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 text-sm"
                  style={{ backgroundColor: '#334155' }}
                >
                  Take a 3-min screener
                </button>
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
                    <OverallAssessmentResults
                      overallAssessment={overallAssessment}
                      onRetake={() => {
                        setShowOverallResults(false)
                        handleNavigate('/assessments')
                      }}
                    />
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
                        className="inline-flex items-center px-5 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors text-sm"
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
