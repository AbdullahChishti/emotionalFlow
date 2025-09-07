/**
 * Dashboard Data Hook
 * Handles all dashboard-specific data fetching and state management
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/stores/authStore'
import { AssessmentManager, AssessmentHistoryEntry } from '@/lib/services/AssessmentManager'
import { buildUserSnapshot, Snapshot } from '@/lib/snapshot'
import { AssessmentResult, ASSESSMENTS } from '@/data/assessments'
import { OverallAssessmentService, OverallAssessmentResult } from '@/lib/services/OverallAssessmentService'
import { useAssessmentData } from './useAssessmentData'
import { useProfileData } from './useProfileData'

// Constants
const FETCH_TIMEOUT = 45000 // Increased to 45 seconds
const RETRY_DELAY = 2000
const MAX_RETRIES = 1

export function useDashboardData() {
  const { user } = useAuth()
  const { results: assessmentResults, getAssessmentHistory } = useAssessmentData()
  const { refreshProfile } = useProfileData()

  // Local state for dashboard-specific data
  const [dataFetched, setDataFetched] = useState(false)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [history, setHistory] = useState<AssessmentHistoryEntry[]>([])
  const [latestMeta, setLatestMeta] = useState<Record<string, string>>({})
  const [coverage, setCoverage] = useState<{ assessed: string[]; missing: string[]; stale: string[] }>({
    assessed: [], missing: [], stale: []
  })
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [whyOpen, setWhyOpen] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [profileLoadAttempts, setProfileLoadAttempts] = useState(0)
  const [loadingImpact, setLoadingImpact] = useState(false)
  const [latestOverall, setLatestOverall] = useState<OverallAssessmentResult | null>(null)

  // Refs to track attempts without causing re-renders
  const profileAttemptsRef = useRef(0)

  // Utility function for retry with exponential backoff
  const retryWithBackoff = async function <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    shouldRetry?: (error: any) => boolean
  ): Promise<T> {
    let lastError: any

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error

        // Check if we should retry this error
        if (shouldRetry && !shouldRetry(error)) {
          throw error
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break
        }

        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = baseDelay * Math.pow(2, attempt)
        console.log(`Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`)

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  // Data fetching function
  const fetchAssessmentData = useCallback(async (userId: string): Promise<{
    results: Record<string, AssessmentResult>
    history: AssessmentHistoryEntry[]
    latest: Record<string, string>
  }> => {
    console.log('[Dash] fetchAssessmentData:start', { userId })
    if (!userId) return { results: {}, history: [], latest: {} }

    try {
      // Get assessment history from the hook
      const assessmentHistory = await getAssessmentHistory()

      // Convert history to store format - keep only latest result per assessment
      const results: Record<string, AssessmentResult> = {}
      const latestTimes: Record<string, Date> = {}

      for (const entry of assessmentHistory) {
        const entryTime = new Date(entry.takenAt)
        const currentLatest = latestTimes[entry.assessmentId]

        if (!currentLatest || entryTime > currentLatest) {
          // Extract complete result data if available, otherwise use basic fields
          const resultData = entry.resultData || {}
          
          results[entry.assessmentId] = {
            score: entry.score,
            level: entry.level,
            severity: entry.severity as 'normal' | 'mild' | 'moderate' | 'severe' | 'critical',
            description: resultData.description || entry.friendlyExplanation || `Assessment completed with score ${entry.score}`,
            recommendations: resultData.recommendations || [],
            insights: resultData.insights || (entry.friendlyExplanation ? [entry.friendlyExplanation] : []),
            nextSteps: resultData.nextSteps || [],
            manifestations: resultData.manifestations || [],
            takenAt: entryTime
          }
          latestTimes[entry.assessmentId] = entryTime
        }
      }

      const latest: Record<string, string> = Object.fromEntries(
        Object.entries(latestTimes).map(([k, v]) => [k, v.toISOString()])
      )
      const payload = { results, history: assessmentHistory, latest }
      console.log('[Dash] fetchAssessmentData:done', { resultsCount: Object.keys(results).length })
      return payload
    } catch (error) {
      console.error('Error fetching assessment data:', error)
      // Graceful fallback instead of throwing so UI doesn't hard-fail
      return { results: {}, history: [], latest: {} }
    }
  }, [getAssessmentHistory])

  // Main data fetching effect
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      console.log('[Dash] effect:fetchData:enter', {
        userReady: !!user?.id,
        dataFetched,
        isFetching
      })

      if (!user?.id) {
        console.log('[Dash] effect:skip (no user)')
        return
      }

      if (dataFetched) {
        console.log('[Dash] effect:skip (already fetched)')
        return
      }

      if (isFetching) {
        console.log('[Dash] effect:skip (already fetching)')
        return
      }

      setIsFetching(true)
      console.log('[Dash] effect:fetch:start')

      try {
        // Fetch fresh data from database with timeout and retry
        console.log('[Dash] db:fetch:start')
        const { results: freshResults, history: freshHistory, latest } = await retryWithBackoff(
          async () => {
            const fetchTimeout = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Assessment data fetch timeout')), 20000)
            )

            const fetchPromise = fetchAssessmentData(user.id)
            return await Promise.race([fetchPromise, fetchTimeout])
          },
          2, // max 2 retries
          1500, // base delay 1.5s
          (error) => {
            // Only retry network/timeout errors
            const message = error?.message?.toLowerCase() || ''
            return message.includes('timeout') ||
                   message.includes('network') ||
                   message.includes('fetch') ||
                   message.includes('connection')
          }
        )
        console.log('[Dash] db:fetch:done', { resultsCount: Object.keys(freshResults).length, historyCount: freshHistory.length })

        if (isMounted) {
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
          console.log('[Dash] fetch:error:graceful-empty')
        }
      } finally {
        if (isMounted) {
          setIsFetching(false)
          console.log('[Dash] effect:fetch:finally', { isFetching: false })
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
      setIsFetching(false)
      console.log('[Dash] cleanup')
    }
  }, [user?.id, fetchAssessmentData, dataFetched, retryCount])

  // Profile refresh effect
  useEffect(() => {
    if (!user?.id) return

    if (profileAttemptsRef.current < 3) {
      profileAttemptsRef.current += 1
      setProfileLoadAttempts(profileAttemptsRef.current)

      // Add timeout and retry wrapper around profile refresh
      const refreshWithRetry = async () => {
        try {
          await retryWithBackoff(
            async () => {
              const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Profile refresh timeout')), 15000)
              )

              return await Promise.race([refreshProfile(), timeoutPromise])
            },
            2, // max 2 retries
            2000, // base delay 2s
            (error) => {
              // Only retry network/timeout errors, not auth errors
              const message = error?.message?.toLowerCase() || ''
              return message.includes('timeout') ||
                     message.includes('network') ||
                     message.includes('fetch') ||
                     message.includes('connection')
            }
          )
        } catch (error) {
          console.warn('Profile refresh failed after retries:', error)
          // Continue anyway - user can retry manually
        }
      }

      refreshWithRetry()
    }
  }, [user?.id, refreshProfile])

  // Fetch latest overall assessment
  const loadLatestOverall = useCallback(async () => {
    if (!user?.id) return
    setLoadingImpact(true)

    try {
      const latest = await retryWithBackoff(
        async () => {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Overall assessment fetch timeout')), 15000)
          )

          return await Promise.race([
            OverallAssessmentService.getLatestHolisticAssessment(user.id),
            timeoutPromise
          ])
        },
        2, // max 2 retries
        2000, // base delay 2s
        (error) => {
          // Only retry network/timeout errors
          const message = error?.message?.toLowerCase() || ''
          return message.includes('timeout') ||
                 message.includes('network') ||
                 message.includes('fetch') ||
                 message.includes('connection')
        }
      )

      setLatestOverall(latest)
    } catch (e) {
      console.warn('Failed to load latest overall assessment after retries:', e)
      setLatestOverall(null) // Clear any stale data
    } finally {
      setLoadingImpact(false)
    }
  }, [user?.id])

  // Refresh life impacts
  const refreshLifeImpacts = useCallback(async () => {
    if (!user?.id) return
    setLoadingImpact(true)

    try {
      const freshImpacts = await retryWithBackoff(
        async () => {
          const impactsTimeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Life impacts refresh timeout')), 30000)
          )

          const impactsPromise = OverallAssessmentService.getFreshLifeImpacts(user.id)
          return await Promise.race([impactsPromise, impactsTimeout])
        },
        2, // max 2 retries
        3000, // base delay 3s
        (error) => {
          // Only retry network/timeout errors
          const message = error?.message?.toLowerCase() || ''
          return message.includes('timeout') ||
                 message.includes('network') ||
                 message.includes('fetch') ||
                 message.includes('connection')
        }
      )

      setLatestOverall(freshImpacts)
    } catch (error) {
      console.error('❌ Error refreshing impacts:', error)
      setLatestOverall(null)
    } finally {
      setLoadingImpact(false)
    }
  }, [user?.id])

  // Auto-load latest overall assessment
  useEffect(() => {
    loadLatestOverall()
  }, [loadLatestOverall])

  return {
    // Data
    snapshot,
    history,
    latestMeta,
    coverage,
    latestOverall,

    // State
    dataFetched,
    isFetching,
    error,
    whyOpen,
    retryCount,
    profileLoadAttempts,
    loadingImpact,

    // Actions
    setWhyOpen,
    setRetryCount,
    refreshLifeImpacts,
    loadLatestOverall,

    // Computed
    isLoading: isFetching,
    hasData: dataFetched && Object.keys(assessmentResults).length > 0
  }
}
