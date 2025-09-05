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
import { AssessmentManager } from '@/lib/services/AssessmentManager'

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
const FETCH_TIMEOUT = 5000 // 5 seconds
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

  // Memoized navigation handler
  const handleNavigate = useCallback((path: string) => {
    router.push(path)
  }, [router])

  // Memoized data fetching function
  const fetchAssessmentData = useCallback(async (): Promise<Record<string, AssessmentResult>> => {
    if (!user?.id) return {}

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), FETCH_TIMEOUT)
      )

      // Fetch assessment history with timeout
      const dataPromise = AssessmentManager.getAssessmentHistory(user.id)
      const assessmentHistory = await Promise.race([dataPromise, timeoutPromise])

      if (!assessmentHistory || assessmentHistory.length === 0) {
        return {}
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
            nextSteps: []
          }
          latestTimes[entry.assessmentId] = entryTime
        }
      }

      return results
    } catch (error) {
      console.error('Error fetching assessment data:', error)
      throw error
    }
  }, [user?.id])

  // Main data fetching effect
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if (!user?.id || !profile || dataFetched) {
        setLoading(false)
        return
      }

      try {
        // Try to load from localStorage first for immediate display
        const storedResults = localStorage.getItem('assessmentResults')
        if (storedResults) {
          try {
            const parsed = JSON.parse(storedResults)
            if (Object.keys(parsed).length > 0) {
              setAssessmentResults(parsed)
              setHasAssessmentData(true)
            }
          } catch (parseError) {
            console.warn('Failed to parse stored assessment results:', parseError)
            localStorage.removeItem('assessmentResults')
          }
        }

        // Fetch fresh data from database
        const freshResults = await fetchAssessmentData()
        
        if (isMounted) {
          setAssessmentResults(freshResults)
          setHasAssessmentData(Object.keys(freshResults).length > 0)
          setDataFetched(true)

          // Update localStorage with fresh data
          try {
            localStorage.setItem('assessmentResults', JSON.stringify(freshResults))
          } catch (storageError) {
            console.warn('Failed to store assessment results:', storageError)
          }
        }
      } catch (error) {
        if (isMounted && retryCount < MAX_RETRIES) {
          // Retry after delay
          setRetryCount(prev => prev + 1)
          setTimeout(() => {
            if (isMounted) fetchData()
          }, RETRY_DELAY)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [user?.id, profile, fetchAssessmentData, retryCount, dataFetched])

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

  // Assessment results rendering
  const renderAssessmentSummary = useCallback(() => {
    if (!hasAssessmentData) return null

    const resultEntries = Object.entries(assessmentResults)

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
          <button
            onClick={() => handleNavigate('/results')}
            className="text-sm font-medium text-brand-green-700 hover:text-brand-green-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-green-600 rounded"
          >
            View all
          </button>
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
                      <div className={`inline-flex items-center gap-2 text-[11px] mt-1 px-2 py-0.5 rounded-full ${getSeverityColor(result.severity)}`}>
                        {result.level}
                      </div>
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
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-brand-green-500 to-brand-green-600" 
                      style={{ width: `${Math.min(100, (result.score / getMaxScore(assessmentId)) * 100)}%` }} 
                    />
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
  }, [hasAssessmentData, assessmentResults, getSeverityColor, getMaxScore, handleNavigate])

  // Loading state
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
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-40 bg-slate-200 rounded-3xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Profile not ready state
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