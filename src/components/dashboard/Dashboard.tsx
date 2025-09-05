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
import { buildUserSnapshot, Snapshot, NextBestAction } from '@/lib/snapshot'

// Material Symbols icons import
import 'material-symbols/outlined.css'

// Reusable Components
interface StatCardProps {
  icon: string
  value: string | number
  label: string
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
}

function StatCard({ icon, value, label, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-white/50 shadow-lg">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-slate-200 rounded-lg mb-4"></div>
          <div className="w-16 h-8 bg-slate-200 rounded mb-2"></div>
          <div className="w-20 h-4 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-white/50 shadow-lg hover:shadow-xl transition-shadow h-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-green-100 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-brand-green-600 text-lg sm:text-xl">{icon}</span>
        </div>
        {trend && (
          <span className={`material-symbols-outlined text-sm ${
            trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'
          }`}>
            {trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat'}
          </span>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-1">{value}</div>
      <div className="text-xs sm:text-sm text-secondary-600 leading-relaxed">{label}</div>
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
  const baseClasses = "flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-full transition-all duration-300 transform w-full min-h-[100px]"
  const variantClasses = variant === 'primary'
    ? "text-white shadow-lg hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900"
    : "bg-white/80 backdrop-blur-sm border-2 border-brand-green-300 text-secondary-900 shadow-lg hover:shadow-xl hover:scale-105 hover:border-brand-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-green-600"

  const primaryStyle = variant === 'primary' ? {
    backgroundColor: '#335f64',
    boxShadow: '0 10px 15px -3px rgba(51, 95, 100, 0.3)'
  } : {}

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={variant === 'primary' ? primaryStyle : {}}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label={label}
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
        variant === 'primary' ? 'bg-white/20' : 'bg-brand-green-100'
      }`}>
        <span className={`material-symbols-outlined text-lg sm:text-xl ${
          variant === 'primary' ? 'text-white' : 'text-brand-green-600'
        }`}>{icon}</span>
      </div>
      <div className="text-left flex-1 min-w-0 py-1">
        <div className="font-bold text-sm sm:text-base leading-tight break-words">{label}</div>
        <div className={`text-xs sm:text-sm ${variant === 'primary' ? 'text-white/80' : 'text-secondary-600'} leading-relaxed mt-1 break-words`}>
          {description}
        </div>
      </div>
      <span className={`material-symbols-outlined text-lg sm:text-xl flex-shrink-0 ${
        variant === 'primary' ? 'text-white/60' : 'text-secondary-400'
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
    <motion.div
      className="bg-gradient-to-br from-white via-slate-50/30 to-white border border-slate-200/40 rounded-3xl p-8 md:p-10 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-light text-slate-700 mb-3">Your wellness snapshot</h2>
          <p className="text-slate-600 text-base leading-relaxed max-w-2xl font-light">
            Your personalized insights are ready. We're here to support your mental wellness journey with tailored recommendations and resources.
          </p>
        </div>
        <div className="hidden md:block flex-shrink-0">
          <a href="/crisis-support" className="text-sm text-slate-400 hover:text-slate-600 transition-colors duration-300 font-light">
            Need immediate support?
          </a>
        </div>
      </div>

      {snapshot?.dimensions && snapshot.dimensions.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8">
          {snapshot.dimensions
            .filter(d => ['anxiety','trauma_exposure','wellbeing','stress','depression','resilience'].includes(d.key))
            .slice(0, 4)
            .map(d => (
              <div key={d.key} className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/70 border border-slate-200/40 shadow-sm">
                <span className="text-sm font-light text-slate-700">{keyLabel(d.key)}</span>
                <span className="text-sm font-light text-slate-500">{d.level}</span>
              </div>
            ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={() => handleNavigate('/session')}
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-slate-800 text-white font-light shadow-sm hover:shadow-md transition-all duration-300 hover:bg-slate-700"
        >
          <span className="material-symbols-outlined mr-3 text-lg">play_arrow</span>
          Start session
        </button>
        <button
          onClick={() => handleNavigate('/results')}
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl border border-slate-300/60 bg-white/80 text-slate-700 font-light shadow-sm hover:shadow-md hover:border-slate-400/60 transition-all duration-300"
        >
          <span className="material-symbols-outlined mr-3 text-lg">lightbulb</span>
          Personalized next steps
        </button>
      </div>

      <div className="border-t border-slate-200/40 pt-6">
        <button
          onClick={() => setWhyOpen(v => !v)}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors duration-300 font-light"
        >
          {whyOpen ? 'Hide details' : 'Why this?'}
        </button>
        {whyOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 rounded-2xl bg-white/50 border border-slate-200/30"
          >
            <div className="text-sm font-light text-slate-700 mb-3">Informed by</div>
            <div className="flex flex-wrap gap-2">
              {(snapshot?.explainability.assessments_used || []).map((name) => {
                const pair = Object.entries(ASSESSMENTS).find(([id, def]) => {
                  const display = def?.shortTitle || def?.title || id.toUpperCase()
                  return name === display || name.includes(def?.shortTitle || '')
                })
                const id = pair?.[0]
                const when = id ? formatRelative(latestMeta[id]) : ''
                return (
                  <span key={name} className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white/60 border border-slate-200/40 text-slate-600 text-sm font-light">
                    {name}{when ? ` • ${when}` : ''}
                  </span>
                )
              })}
            </div>
          </motion.div>
        )}
        <div className="mt-6 text-xs text-slate-400 leading-relaxed font-light">
          This information is for your awareness only, not a clinical diagnosis.{' '}
          <a href="/crisis-support" className="text-slate-500 hover:text-slate-700 transition-colors duration-300">Need immediate support?</a>
          <span className="mx-2 text-slate-300">•</span>
          <a href="/profile" className="text-slate-500 hover:text-slate-700 transition-colors duration-300">Manage personalization</a>
        </div>
      </div>
    </motion.div>
  )

  const renderNextActions = () => {
    const actions: NextBestAction[] = snapshot?.next_best_actions?.slice(0, 3) || []
    if (actions.length === 0) return null
    return (
      <div className="space-y-4">
        <h3 className="text-base font-light text-slate-700">Next best actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((a, idx) => (
            <div key={idx} className="bg-white/60 border border-slate-200/40 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <div className="font-light text-slate-700 text-sm">{a.title}</div>
                <div className="text-xs text-slate-500 font-light mt-1">{a.duration_min} min</div>
              </div>
              <button
                onClick={() => handleNavigate('/session')}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-700 text-white text-sm font-light hover:bg-slate-600 transition-colors duration-300"
                style={{ backgroundColor: '#335f64' }}
              >
                Start
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const buildSparklinePath = (points: number[], width = 160, height = 30) => {
    if (points.length === 0) return ''
    const step = width / Math.max(1, points.length - 1)
    const path = points.map((p, i) => {
      const x = i * step
      const y = height - (p / 100) * height
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
    return path
  }

  const renderTrends = () => {
    const dims: { label: string; id: string }[] = [
      { label: 'Anxiety', id: 'gad7' },
      { label: 'Well-being', id: 'who5' },
      { label: 'Stress', id: 'pss10' }
    ]
    const byId = history.filter(Boolean).reduce((acc: Record<string, AssessmentHistoryEntry[]>, h) => {
      acc[h.assessmentId] = acc[h.assessmentId] || []
      acc[h.assessmentId].push(h)
      return acc
    }, {})
    return (
      <div className="space-y-4">
        <h3 className="text-base font-light text-slate-700">Trends</h3>
        <div className="space-y-3">
          {dims.map(d => {
            const series = (byId[d.id] || [])
              .slice(0, 12)
              .reverse()
              .map(e => {
                const max = getMaxScore(d.id)
                return Math.min(100, (e.score / max) * 100)
              })
            const path = buildSparklinePath(series)
            const lastThree = (byId[d.id] || []).slice(0, 3).map(e => e.level)
            return (
              <div key={d.id} className="bg-white/60 border border-slate-200/40 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-light text-slate-700">{d.label}</div>
                  <div className="text-xs text-slate-500 font-light">{lastThree.join(' → ')}</div>
                </div>
                <svg viewBox="0 0 160 30" width="100%" height="30" className="mt-2">
                  <path d={path} fill="none" stroke="#64748b" strokeWidth="1.5" />
                </svg>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Recent assessments section intentionally removed to declutter

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50/50 to-white min-h-screen">
        <div className="container mx-auto px-6 py-16">
          <div className="animate-pulse space-y-8 pt-16 md:pt-20">
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
      <div className="bg-gradient-to-br from-slate-50/50 to-white min-h-screen">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center py-12 pt-28 md:pt-32">
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
      <div className="bg-gradient-to-br from-slate-50/50 to-white min-h-screen">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center py-12 pt-28 md:pt-32">
            <h2 className="text-2xl font-light text-slate-600 mb-4">Setting up your profile...</h2>
            <p className="text-slate-500 font-light">This will only take a moment.</p>
            <LoadingSpinner size="lg" className="mt-6" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-50/50 to-white min-h-screen">
      <div className="container mx-auto px-6 py-16">
        <div className="space-y-6 md:space-y-8 lg:space-y-10">
          {/* Header Section */}
          <motion.div
            className="text-center space-y-3 md:space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light text-slate-800 leading-relaxed px-4">
              {getGreeting()}, {profile.display_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-base text-slate-500 max-w-2xl mx-auto px-4 font-light">
              {getFormattedDate()} • {hasAssessmentData ? 'Your personalized dashboard is ready' : "You're doing your best today."}
            </p>
          </motion.div>

          {/* Snapshot Hero */}
          {renderSnapshotHero()}

          {/* Row 2: Next actions (left) and Trends (right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-7xl mx-auto">
            <div>{renderNextActions()}</div>
            <div>{renderTrends()}</div>
          </div>

          {/* Coverage row */}
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/60 border border-slate-200/40 rounded-2xl p-6 shadow-sm">
              <div className="text-base font-light text-slate-700 mb-4">Coverage</div>
              <div className="flex flex-wrap gap-3 text-sm">
                {coverage.assessed.map(id => (
                  <span key={`ok-${id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50/80 text-emerald-700 border border-emerald-200/60">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    {(ASSESSMENTS[id]?.shortTitle || id.toUpperCase())}
                  </span>
                ))}
                {coverage.stale.map(id => (
                  <span key={`stale-${id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50/80 text-amber-700 border border-amber-200/60">
                    <span className="material-symbols-outlined text-base">error</span>
                    {(ASSESSMENTS[id]?.shortTitle || id.toUpperCase())}
                  </span>
                ))}
                {coverage.missing.map(id => (
                  <span key={`miss-${id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50/80 text-slate-600 border border-slate-200/60">
                    <span className="material-symbols-outlined text-base">check_box_outline_blank</span>
                    {(ASSESSMENTS[id]?.shortTitle || id.toUpperCase())}
                  </span>
                ))}
              </div>
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
              <div className="bg-white/60 border border-slate-200/40 rounded-3xl p-10 shadow-sm">
                <h3 className="text-xl font-light text-slate-700 mb-3">Complete a quick check-in to personalize your support.</h3>
                <p className="text-slate-500 text-base font-light mb-6">It takes about 3 minutes.</p>
                <button
                  onClick={() => handleNavigate('/assessments')}
                  className="inline-flex items-center px-6 py-3 rounded-2xl text-white font-light shadow-sm hover:shadow-md transition-all duration-300"
                  style={{ backgroundColor: '#335f64' }}
                >
                  Take a 3-min screener
                </button>
              </div>
            </motion.div>
          )}

          {/* Recent assessments removed for declutter */}

        </div>
      </div>
    </div>
  )
}
