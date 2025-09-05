'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Profile, MoodEntry, ListeningSession } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/data/assessment-integration'
import { AssessmentResult } from '@/data/assessments'
import { ASSESSMENTS } from '@/data/assessments'
import AssessmentService, { AssessmentHistoryEntry } from '@/lib/assessment-service'

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

interface SectionCardProps {
  title: string
  icon: string
  children: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  loading?: boolean
}

function SectionCard({ title, icon, children, action, loading }: SectionCardProps) {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-6 bg-slate-200 rounded"></div>
            <div className="w-6 h-6 bg-slate-200 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="w-full h-16 bg-slate-200 rounded-xl"></div>
            <div className="w-full h-16 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-shadow"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-secondary-900">{title}</h3>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-brand-green-600">{icon}</span>
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm font-medium text-brand-green-700 hover:text-brand-green-800 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
      {children}
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

  const secondaryStyle = variant === 'secondary' ? {
    boxShadow: '0 10px 15px -3px rgba(51, 95, 100, 0.2)'
  } : {}

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={variant === 'primary' ? primaryStyle : secondaryStyle}
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

export function Dashboard() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hydratingAssessments, setHydratingAssessments] = useState(false)
  const [assessmentRetryAttempts, setAssessmentRetryAttempts] = useState(0)
  const [recentSessions, setRecentSessions] = useState<ListeningSession[]>([])
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([])
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null)
  const [assessmentResults, setAssessmentResults] = useState<Record<string, AssessmentResult> | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [hasAssessmentData, setHasAssessmentData] = useState(false)

  useEffect(() => {
    if (user && profile) {
      fetchDashboardData()
    }
  }, [user, profile])

  // Check for personalized parameter (when coming back from assessment completion)
  useEffect(() => {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    if (urlParams.get('personalized') === 'true') {
      console.log('Personalized dashboard requested, ensuring fresh data...')
      // Clean URL
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname)
      }
      // Force refresh
      if (user && profile) {
        fetchDashboardData()
      }
    }
  }, [user, profile])

  // Check for fresh data indicators (when navigating back from assessments)
  useEffect(() => {
    if (user && profile) {
      // Check for assessment completion flags
      const assessmentCompleted = localStorage.getItem('assessmentCompleted')
      const storedResults = localStorage.getItem('assessmentResults')
      const storedProfile = localStorage.getItem('userProfile')

      // If recent completion and we have results, refresh immediately (profile optional)
      if (assessmentCompleted === 'true' && storedResults) {
        try {
          console.log('Assessment completion detected, refreshing dashboard data...')
          localStorage.removeItem('assessmentCompleted') // Clear the flag
          fetchDashboardData()
          return
        } catch (error) {
          console.error('Error handling assessment completion:', error)
        }
      }

      // Fallback: Check if we have fresh assessment data that wasn't loaded yet
      if (storedResults && storedProfile) {
        try {
          const parsedResults = JSON.parse(storedResults)

          // If we don't have assessment data yet, or if the stored data is different/newer
          if (!assessmentResults || Object.keys(assessmentResults).length === 0 ||
              Object.keys(parsedResults).length > Object.keys(assessmentResults).length) {
            console.log('Detected fresh assessment data, reloading dashboard...')
            fetchDashboardData()
          }
        } catch (error) {
          console.error('Error checking for fresh assessment data:', error)
        }
      }
    }
  }, [user, profile, assessmentResults])

  // Add a safety timeout to prevent infinite loading
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Dashboard loading taking too long, forcing completion')
        setLoading(false)
      }
    }, 10000) // 10 second safety timeout

    return () => clearTimeout(safetyTimeout)
  }, [loading])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Load assessment data from localStorage immediately (quick display), then hydrate with DB.
      // We'll merge by freshness using a per-assessment takenAt map.
      if (typeof window !== 'undefined') {
        try {
          const storedResults = localStorage.getItem('assessmentResults')
          const storedProfile = localStorage.getItem('userProfile')
          const storedTakenAt = localStorage.getItem('assessmentResultsTakenAt')

          if (storedResults) {
            const parsedResults = JSON.parse(storedResults)
            const takenAtMap: Record<string, string> = storedTakenAt ? JSON.parse(storedTakenAt) : {}
            console.log('📱 Using local assessment cache for immediate display', { ids: Object.keys(parsedResults) })
            setAssessmentResults(parsedResults)
            setHasAssessmentData(Object.keys(parsedResults).length > 0)
            if (storedProfile) {
              try { setUserProfile(JSON.parse(storedProfile)) } catch {}
            }
          }
        } catch (error) {
          console.error('Error parsing stored assessment data:', error)
        }
      }

      // DATABASE FIRST: Load from database if authenticated (takes precedence over localStorage)
      if (user) {
        try {
          console.log('🗄️ DATABASE FIRST: Fetching assessment history from database...')
          setHydratingAssessments(true)
          // Add timeout for assessment history fetch
          const assessmentPromise = AssessmentService.getAssessmentHistory(user.id)
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Assessment fetch timeout')), 8000) // Increased timeout
          )

          const assessmentHistory = await Promise.race([assessmentPromise, timeoutPromise]) as any
          console.log('Database assessment history result:', assessmentHistory)

          if (assessmentHistory && assessmentHistory.length > 0) {
            // Convert database results to the format expected by the UI (+ map of times)
            const dbMap: Record<string, any> = {}
            const dbTimes: Record<string, string> = {}
            for (const entry of assessmentHistory) {
              const prev = dbTimes[entry.assessmentId]
              if (!prev || new Date(entry.takenAt) > new Date(prev)) {
                dbMap[entry.assessmentId] = {
                  score: entry.score,
                  level: entry.level,
                  description: '',
                  severity: entry.severity as any,
                  recommendations: [],
                  insights: entry.friendlyExplanation ? [entry.friendlyExplanation] : [],
                  nextSteps: []
                }
                dbTimes[entry.assessmentId] = entry.takenAt
              }
            }

            // Merge with any local cache by freshness
            let localMap: Record<string, any> = {}
            let localTimes: Record<string, string> = {}
            try {
              const storedResults = localStorage.getItem('assessmentResults')
              const storedTakenAt = localStorage.getItem('assessmentResultsTakenAt')
              localMap = storedResults ? JSON.parse(storedResults) : {}
              localTimes = storedTakenAt ? JSON.parse(storedTakenAt) : {}
            } catch {}

            const merged: Record<string, any> = {}
            const mergedTimes: Record<string, string> = {}
            const ids = new Set([...Object.keys(dbMap), ...Object.keys(localMap)])
            ids.forEach((id) => {
              const dbTime = dbTimes[id] ? new Date(dbTimes[id]).getTime() : -1
              const lcTime = localTimes[id] ? new Date(localTimes[id]).getTime() : -1
              if (dbTime >= lcTime) {
                if (dbMap[id]) {
                  merged[id] = dbMap[id]
                  if (dbTimes[id]) mergedTimes[id] = dbTimes[id]
                }
              } else {
                merged[id] = localMap[id]
                if (localTimes[id]) mergedTimes[id] = localTimes[id]
              }
            })

            console.log('✅ DATABASE SUCCESS: Merged assessment results from DB+local:', merged)
            setAssessmentResults(merged)
            setHasAssessmentData(Object.keys(merged).length > 0)

            // Update localStorage with merged data
            localStorage.setItem('assessmentResults', JSON.stringify(merged))
            localStorage.setItem('assessmentResultsTakenAt', JSON.stringify(mergedTimes))

          } else {
            console.log('No assessment history found in database')
            // If no database data, keep localStorage data if it exists
            const storedResults = localStorage.getItem('assessmentResults')
            if (storedResults) {
              try {
                const parsedResults = JSON.parse(storedResults)
                setAssessmentResults(parsedResults)
                setHasAssessmentData(Object.keys(parsedResults).length > 0)
              } catch (error) {
                console.error('Error parsing stored results:', error)
              }
            }

            // If we recently completed an assessment, retry DB fetch briefly to catch late writes
            try {
              const completedAt = localStorage.getItem('assessmentCompletedAt')
              const recent = completedAt ? (Date.now() - new Date(completedAt).getTime() < 2 * 60 * 1000) : false
              if (recent && assessmentRetryAttempts < 2) {
                const nextAttempt = assessmentRetryAttempts + 1
                setAssessmentRetryAttempts(nextAttempt)
                console.log(`⏳ No DB results yet; scheduling retry ${nextAttempt}/2`)
                setTimeout(() => {
                  // Only retry if still mounted and user present
                  fetchDashboardData().catch(() => {})
                }, nextAttempt === 1 ? 1200 : 2500)
              }
            } catch {}
          }
          setHydratingAssessments(false)
        } catch (error) {
          console.warn('Error fetching assessment data from database:', error)
          // Fallback: try to use localStorage data if database fails
          const storedResults = localStorage.getItem('assessmentResults')
          if (storedResults) {
            try {
              console.log('💾 DATABASE FAILED: Falling back to localStorage data')
              const parsedResults = JSON.parse(storedResults)
              setAssessmentResults(parsedResults)
              setHasAssessmentData(Object.keys(parsedResults).length > 0)
            } catch (parseError) {
              console.error('❌ Error parsing localStorage fallback:', parseError)
            }
          }
          setHydratingAssessments(false)
        }
      }

      // Fetch recent sessions (handle missing table gracefully)
      try {
        const sessionsPromise = supabase
          .from('listening_sessions')
          .select(`
            *,
            listener:profiles!listening_sessions_listener_id_fkey(display_name, avatar_url),
            speaker:profiles!listening_sessions_speaker_id_fkey(display_name, avatar_url)
          `)
          .or(`listener_id.eq.${user.id},speaker_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(3)
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Sessions fetch timeout')), 3000)
        )
        
        const { data: sessions, error: sessionsError } = await Promise.race([sessionsPromise, timeoutPromise]) as any

        if (sessionsError) {
          console.warn('Listening sessions table not available:', sessionsError.message)
          setRecentSessions([])
        } else if (sessions) {
          setRecentSessions(sessions)
        }
      } catch (sessionsError: any) {
        console.warn('Error fetching listening sessions:', sessionsError?.message || sessionsError)
        setRecentSessions([])
      }

      // Fetch recent mood entries (handle missing table gracefully)
      try {
        const moodsPromise = supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(7)
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Moods fetch timeout')), 3000)
        )
        
        const { data: moods, error: moodsError } = await Promise.race([moodsPromise, timeoutPromise]) as any

        if (moodsError) {
          console.warn('Mood entries table not available:', moodsError.message)
          setRecentMoods([])
          setCurrentMood(null)
        } else if (moods) {
          setRecentMoods(moods)
          setCurrentMood(moods[0] || null)
        }
      } catch (moodsError: any) {
        console.warn('Error fetching mood entries:', moodsError?.message || moodsError)
        setRecentMoods([])
        setCurrentMood(null)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = (path: string) => {
    console.log('Dashboard: Navigating to:', path)
    router.push(path)
  }

  const handleMoodUpdate = () => {
    fetchDashboardData()
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return '😊'
    if (score >= 6) return '🙂'
    if (score >= 4) return '😐'
    if (score >= 2) return '😔'
    return '😢'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'normal': return 'text-green-600 bg-green-100'
      case 'mild': return 'text-emerald-600 bg-emerald-100'
      case 'moderate': return 'text-amber-600 bg-amber-100'
      case 'severe': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-slate-600 bg-slate-100'
    }
  }

  const renderAssessmentSummary = () => {
    if (!assessmentResults || !hasAssessmentData) return null

    const resultEntries = Object.entries(assessmentResults)
    const getMaxScore = (assessmentId: string) => {
      const assessment = ASSESSMENTS[assessmentId]
      if (!assessment) return 100
      const last = assessment.scoring.ranges[assessment.scoring.ranges.length - 1]
      return last?.max ?? 100
    }

    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">Your Assessment Results</h2>
            <p className="text-secondary-600">Based on your recent assessments</p>
          </div>
          <div className="flex items-center gap-3">
            {hydratingAssessments && (
              <div className="flex items-center gap-2 text-secondary-600 text-xs">
                <LoadingSpinner size="sm" />
                <span>Refreshing</span>
              </div>
            )}
            <button
              onClick={() => handleNavigate('/results')}
              className="text-sm font-medium text-brand-green-700 hover:text-brand-green-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-green-600 rounded"
            >
              View all
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resultEntries.map(([assessmentId, result]) => {
            const assessment = ASSESSMENTS[assessmentId]
            if (!assessment) return null

            return (
              <motion.button
                key={assessmentId}
                onClick={() => handleNavigate(`/results?assessment=${assessmentId}`)}
                className="text-left bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-green-600"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-600">analytics</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-secondary-900">{assessment.shortTitle}</div>
                      <div className={`inline-flex items-center gap-2 text-[11px] mt-1 px-2 py-0.5 rounded-full ${getSeverityColor(result.severity)}`}>{result.level}</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </div>
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-bold text-secondary-900">{result.score}</div>
                  <div className="text-sm text-secondary-600">/ {getMaxScore(assessmentId)}</div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full bg-gradient-to-r from-brand-green-500 to-brand-green-600" style={{ width: `${Math.min(100, (result.score / getMaxScore(assessmentId)) * 100)}%` }} />
                  </div>
                </div>
                {result.insights && result.insights.length > 0 && (
                  <p className="text-sm text-secondary-600 leading-relaxed mt-3 line-clamp-2">
                    {result.insights[0]}
                  </p>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    )
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 w-2/3 bg-slate-200 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-20 bg-slate-200 rounded-full" />
                <div className="h-20 bg-slate-200 rounded-full" />
              </div>
              <div className="h-6 w-40 bg-slate-200 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 bg-slate-200 rounded-3xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
        <div className="text-center">
          <h2 className="text-2xl font-light text-secondary-700 mb-4">Setting up your profile...</h2>
          <p className="text-secondary-600 font-light">This will only take a moment.</p>
          <LoadingSpinner size="lg" className="mt-6" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="space-y-8 md:space-y-12 lg:space-y-16">
          {/* Header Section */}
          <motion.div
            className="text-center space-y-3 md:space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative divider removed for a cleaner hero */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 leading-tight px-4">
              {getGreeting()}, {profile.display_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-secondary-600 max-w-2xl mx-auto px-4">
              {getFormattedDate()} • {hasAssessmentData ? 'Your personalized dashboard is ready' : "You're doing your best today."}
            </p>
          </motion.div>

          {/* Action Band */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto px-4">
              <ActionPill
                icon="chat"
                label="Start Session"
                description="Connect with a listener or offer support"
                onClick={() => handleNavigate('/session')}
                variant="primary"
              />
              <ActionPill
                icon="psychology"
                label="Take Assessments"
                description="Complete personalized mental health assessments"
                onClick={() => handleNavigate('/assessments')}
                variant="secondary"
              />
            </div>
          </motion.div>

          {/* Assessment Results Section */}
          {hasAssessmentData && (
            <div className="max-w-7xl mx-auto px-4">
              {renderAssessmentSummary()}
            </div>
          )}


          {/* Main Content - Centered SVG (only show if no assessment data) */}
          {!hasAssessmentData && (
            <motion.div
              className="max-w-7xl mx-auto px-4 -mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                className="h-[31rem] flex items-start justify-center pt-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <img
                  src="/assets/Mental_health-bro_2.svg"
                  alt="Mental wellness illustration"
                  className="w-full h-full max-h-[31rem] object-contain"
                />
              </motion.div>
            </motion.div>
          )}

          {/* Quick Actions for Assessment Users */}
          {hasAssessmentData && (
            <motion.div
              className="max-w-7xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-secondary-900 mb-2">Continue Your Journey</h2>
                <p className="text-secondary-600">Explore personalized resources and support</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ActionPill
                  icon="wellness"
                  label="Wellness Plan"
                  description="Your personalized wellness activities"
                  onClick={() => handleNavigate('/wellness')}
                  variant="secondary"
                />
                <ActionPill
                  icon="self_improvement"
                  label="Meditation"
                  description="Guided sessions for your needs"
                  onClick={() => handleNavigate('/meditation')}
                  variant="secondary"
                />
                <ActionPill
                  icon="groups"
                  label="Community"
                  description="Connect with supportive peers"
                  onClick={() => handleNavigate('/community')}
                  variant="secondary"
                />
                <ActionPill
                  icon="support"
                  label="Crisis Support"
                  description="24/7 mental health resources"
                  onClick={() => handleNavigate('/crisis-support')}
                  variant="secondary"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
