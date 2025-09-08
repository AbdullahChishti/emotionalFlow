'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from '@/hooks/useApp'
import { AssessmentManager } from '@/lib/services/AssessmentManager'
import AssessmentResults from '@/components/assessment/AssessmentResults'
import { ASSESSMENTS } from '@/data/assessments'
import { AssessmentResult } from '@/data/assessments'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Extended interface for results with timestamp
interface AssessmentResultWithTimestamp extends AssessmentResult {
  takenAt?: string
}

// Material Symbols icons import
import 'material-symbols/outlined.css'

// Safe localStorage operations
const safeGetFromStorage = (key: string): any => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.warn(`Failed to parse ${key} from localStorage:`, error)
    return null
  }
}

const safeRemoveFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to remove ${key} from localStorage:`, error)
  }
}

const clearAssessmentData = (): void => {
  const keys = ['assessmentResults', 'assessmentResultsTakenAt', 'userProfile']
  keys.forEach(key => safeRemoveFromStorage(key))
}

interface MultipleResultsDisplayProps {
  results: Record<string, AssessmentResultWithTimestamp>
  onRetake: () => void
  onNewAssessment: () => void
}

function MultipleResultsDisplay({ results, onRetake, onNewAssessment }: MultipleResultsDisplayProps) {
  const router = useRouter()
  const entries = Object.entries(results)

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        {/* Minimal header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-slate-800 tabular-nums">
            {entries.length}<span className="text-slate-400"> results</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onRetake} className="text-xs text-slate-500 hover:text-slate-700">Retake</button>
            <button onClick={onNewAssessment} className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700">
              <span className="material-symbols-outlined text-[16px]">add</span>
              New
            </button>
          </div>
        </div>

        {/* Minimal divided list */}
        <div className="rounded-lg border border-slate-200/60 bg-white/50 divide-y divide-slate-100 overflow-hidden max-w-3xl mx-auto">
          {entries.map(([assessmentId, result], index) => {
            const assessment = ASSESSMENTS[assessmentId]
            if (!assessment) return null
            const max = assessment.scoring.ranges[assessment.scoring.ranges.length - 1].max
            return (
              <motion.button
                key={assessmentId}
                type="button"
                className="w-full text-left px-3 py-3 flex items-center gap-3 hover:bg-slate-50/60 transition-colors"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + index * 0.03 }}
                onClick={() => router.push(`/results?assessment=${assessmentId}`)}
              >
                <span className="material-symbols-outlined text-slate-600 text-base">analytics</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[13px] text-slate-800 truncate">{assessment.shortTitle || assessment.title}</span>
                    <span className="text-[10px] text-slate-400">{result.level}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Score {result.score} / {max}
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const { auth } = useApp()
  const { user } = auth
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false) // true when showing local data
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [assessmentData, setAssessmentData] = useState<{
    assessment?: any
    result?: AssessmentResult
    results?: Record<string, AssessmentResultWithTimestamp>
    mode: 'single' | 'multiple'
  }>({ mode: 'single' })
  const [dataLoaded, setDataLoaded] = useState(false) // Prevent duplicate loads for same param
  const [lastParam, setLastParam] = useState<string | null>(null)

  const createAssessmentResult = useCallback((entry: any, assessmentId: string): AssessmentResult => {
    const assessment = ASSESSMENTS[assessmentId]

    // Extract AI-generated content from resultData if available
    const resultData = entry.resultData || {}
    const recommendations = resultData.recommendations || entry.recommendations || []
    const manifestations = resultData.manifestations || entry.manifestations || []
    const nextSteps = resultData.nextSteps || entry.nextSteps || []
    const insights = resultData.insights || (entry.friendlyExplanation ? [entry.friendlyExplanation] : (entry.insights || []))

    console.log(`🔍 Processing ${assessmentId} result:`, {
      hasResultData: !!entry.resultData,
      recommendationsCount: recommendations.length,
      manifestationsCount: manifestations.length,
      insightsCount: insights.length
    })

    return {
      score: entry.score || 0,
      level: entry.level || 'Unknown',
      severity: (entry.severity || 'normal') as 'normal' | 'mild' | 'moderate' | 'severe' | 'critical',
      description: entry.description || resultData.description || `You scored ${entry.score || 0} on the ${assessment?.title || 'Assessment'}`,
      insights,
      recommendations,
      nextSteps,
      manifestations
    }
  }, [])

  const fetchFromDatabase = useCallback(async (assessmentId?: string, userId?: string): Promise<any> => {
    console.log('🔍 ResultsPage: fetchFromDatabase called', { assessmentId })
    const effectiveUserId = userId || user?.id
    if (!effectiveUserId) throw new Error('No user ID available')

    console.log('🔍 ResultsPage: Fetching assessment history...')

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database fetch timeout')), 8000)
    })

    const fetchPromise = AssessmentManager.getAssessmentHistory(effectiveUserId)

    let history
    try {
      history = await Promise.race([fetchPromise, timeoutPromise])
      console.log('✅ ResultsPage: Got assessment history', { count: Array.isArray(history) ? history.length : 0 })
    } catch (error) {
      console.error('❌ ResultsPage: Database fetch failed or timed out', error)
      throw error
    }

    // If no results, try to get data from user profile as fallback
    if (!history || (Array.isArray(history) && history.length === 0)) {
      try {
        const profile = await AssessmentManager.getLatestUserProfile(effectiveUserId)
        if (profile?.profile_data) {
          const profileData = profile.profile_data as any
          const extractedResults: any[] = []

          // Extract each assessment type
          if (profileData.currentSymptoms?.depression?.score > 0) {
            extractedResults.push({
              id: 'profile-phq9',
              assessmentId: 'phq9',
              assessmentTitle: 'PHQ-9 Depression Assessment',
              score: profileData.currentSymptoms.depression.score,
              level: profileData.currentSymptoms.depression.level || 'Unknown',
              severity: profileData.currentSymptoms.depression.needsIntervention ? 'moderate' : 'normal',
              takenAt: profile.last_assessed || new Date().toISOString(),
              friendlyExplanation: profileData.currentSymptoms.depression.friendlyExplanation
            })
          }

          if (profileData.currentSymptoms?.anxiety?.score > 0) {
            extractedResults.push({
              id: 'profile-gad7',
              assessmentId: 'gad7',
              assessmentTitle: 'GAD-7 Anxiety Assessment',
              score: profileData.currentSymptoms.anxiety.score,
              level: profileData.currentSymptoms.anxiety.level || 'Unknown',
              severity: profileData.currentSymptoms.anxiety.needsIntervention ? 'moderate' : 'normal',
              takenAt: profile.last_assessed || new Date().toISOString(),
              friendlyExplanation: profileData.currentSymptoms.anxiety.friendlyExplanation
            })
          }

          if (profileData.currentSymptoms?.stress?.score > 0) {
            extractedResults.push({
              id: 'profile-pss10',
              assessmentId: 'pss10',
              assessmentTitle: 'PSS-10 Perceived Stress Scale',
              score: profileData.currentSymptoms.stress.score,
              level: profileData.currentSymptoms.stress.level || 'Unknown',
              severity: profileData.currentSymptoms.stress.needsIntervention ? 'moderate' : 'normal',
              takenAt: profile.last_assessed || new Date().toISOString(),
              friendlyExplanation: profileData.currentSymptoms.stress.friendlyExplanation
            })
          }

          if (profileData.currentSymptoms?.wellbeing?.score > 0) {
            extractedResults.push({
              id: 'profile-who5',
              assessmentId: 'who5',
              assessmentTitle: 'WHO-5 Well-Being Index',
              score: profileData.currentSymptoms.wellbeing.score,
              level: profileData.currentSymptoms.wellbeing.level || 'Unknown',
              severity: profileData.currentSymptoms.wellbeing.needsEnhancement ? 'moderate' : 'normal',
              takenAt: profile.last_assessed || new Date().toISOString(),
              friendlyExplanation: profileData.currentSymptoms.wellbeing.friendlyExplanation
            })
          }

          if (profileData.resilience?.score > 0) {
            extractedResults.push({
              id: 'profile-cd-risc',
              assessmentId: 'cd-risc',
              assessmentTitle: 'CD-RISC Resilience Scale',
              score: profileData.resilience.score,
              level: profileData.resilience.level || 'Unknown',
              severity: 'normal',
              takenAt: profile.last_assessed || new Date().toISOString(),
              friendlyExplanation: profileData.resilience.friendlyExplanation
            })
          }

          if (extractedResults.length > 0) {
            history = extractedResults
          } else {
            return null
          }
        } else {
          return null
        }
      } catch (profileError) {
        console.warn('Error fetching user profile:', profileError)
        return null
      }
    }

    if (assessmentId) {
      // Single assessment mode
      const entry = Array.isArray(history) ? history
        .filter((h: any) => h.assessmentId === assessmentId)
        .sort((a: any, b: any) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())[0] : null

      return entry ? createAssessmentResult(entry, assessmentId) : null
    } else {
      // Multiple assessments mode
      const latest: Record<string, any> = {}
      if (Array.isArray(history)) {
        history.forEach((entry: any) => {
        const existing = latest[entry.assessmentId]
        if (!existing || new Date(entry.takenAt) > new Date(existing.takenAt)) {
          latest[entry.assessmentId] = {
            ...createAssessmentResult(entry, entry.assessmentId),
            takenAt: entry.takenAt
          }
        }
      })
      }
      return latest
    }
  }, [user?.id, createAssessmentResult])

  const fetchFromStorage = useCallback((assessmentId?: string): any => {
    console.log('🔍 ResultsPage: fetchFromStorage called with assessmentId:', assessmentId)
    const storedResults = safeGetFromStorage('assessmentResults')
    console.log('🔍 ResultsPage: storedResults from localStorage:', storedResults)
    
    if (!storedResults || typeof storedResults !== 'object') {
      console.log('❌ ResultsPage: No valid stored results found')
      return null
    }

    if (assessmentId) {
      const result = storedResults[assessmentId] || null
      console.log(`🔍 ResultsPage: Single assessment result for ${assessmentId}:`, result)
      return result
    } else {
      const results = Object.keys(storedResults).length > 0 ? storedResults : null
      console.log('🔍 ResultsPage: Multiple assessment results:', results)
      return results
    }
  }, [])

  const loadAssessmentData = useCallback(async (targetParam?: string | null) => {
    console.log('🔄 ResultsPage: Starting loadAssessmentData')
    // Skip only if we already loaded for the same param
    if (dataLoaded && targetParam === lastParam) {
      console.log('⚠️ ResultsPage: Data already loaded for this param, skipping')
      return
    }

    if (!user) {
      console.log('❌ ResultsPage: No user, setting error')
      setError('Please log in to view assessment results.')
      setLoading(false)
      setDataLoaded(true)
      return
    }

    try {
      console.log('🔄 ResultsPage: Setting loading to true')
      setLoading(true)
      setError(null)

      const assessmentParam = targetParam ?? searchParams.get('assessment')
      let result: any = null
      
      // Check localStorage first for immediate results, then try database
      console.log('🔍 ResultsPage: Checking localStorage first...')
      result = fetchFromStorage(assessmentParam || undefined)
      
      if (result) {
        console.log('✅ ResultsPage: Found results in localStorage, using them immediately')
        setUsingFallback(true)
        setSyncError(null)
      } else {
        console.log('🔍 ResultsPage: No localStorage results, trying database fetch...')
        try {
          // Add a small delay to allow background database operations to complete
          await new Promise(resolve => setTimeout(resolve, 1000))
          result = await fetchFromDatabase(assessmentParam || undefined, user.id)
          console.log('✅ ResultsPage: Database fetch successful:', result)
          setUsingFallback(false)
          setSyncError(null)
        } catch (dbError) {
          console.error('❌ ResultsPage: Database fetch failed:', dbError)
          console.log('🔄 ResultsPage: No results found in database or localStorage')
          result = null
        }
      }

      if (assessmentParam) {
        // Single assessment mode
        console.log('📊 ResultsPage: Single assessment mode')
        const assessment = ASSESSMENTS[assessmentParam]
        if (!assessment) {
          throw new Error(`Assessment "${assessmentParam}" not found`)
        }

        if (!result) {
          throw new Error(`No results found for "${assessment.title}". Please complete this assessment first.`)
        }

        console.log('✅ ResultsPage: Setting single assessment data')
        setAssessmentData({
          assessment,
          result,
          mode: 'single'
        })
      } else {
        // Multiple assessments mode
        console.log('📊 ResultsPage: Multiple assessments mode')
        if (!result || Object.keys(result).length === 0) {
          throw new Error('No assessment results found. Please complete an assessment first.')
        }

        console.log('✅ ResultsPage: Setting multiple assessment data')
        setAssessmentData({
          results: result,
          mode: 'multiple'
        })
      }
    } catch (err) {
      console.error('❌ ResultsPage: Error loading assessment data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load assessment results')
      setDataLoaded(true)
    } finally {
      console.log('🏁 ResultsPage: Finally block - setting loading to false')
      setLoading(false)
      setDataLoaded(true)
      setLastParam(targetParam ?? searchParams.get('assessment'))
    }
  }, [dataLoaded, lastParam, searchParams])

  const retrySync = useCallback(async () => {
    if (!user) return
    setSyncing(true)
    setSyncError(null)
    try {
      const assessmentParam = searchParams.get('assessment')
      const fresh = await fetchFromDatabase(assessmentParam || undefined, user.id)
      if (!fresh || (typeof fresh === 'object' && Object.keys(fresh).length === 0)) {
        setSyncError('Still syncing your results. Please try again shortly.')
      } else {
        // Update state with fresh DB data
        if (assessmentParam) {
          const assessment = ASSESSMENTS[assessmentParam]
          if (!assessment) throw new Error(`Assessment "${assessmentParam}" not found`)
          setAssessmentData({ assessment, result: fresh, mode: 'single' })
        } else if (typeof fresh === 'object') {
          setAssessmentData({ results: fresh, mode: 'multiple' })
        }
        setUsingFallback(false)
        // Clear cached local version to avoid stale data
        safeRemoveFromStorage('assessmentResults')
      }
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }, [user, searchParams, fetchFromDatabase])

  useEffect(() => {
    console.log('🔄 ResultsPage: useEffect triggered')
    const param = searchParams.get('assessment')
    loadAssessmentData(param)

    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      console.log('⏰ ResultsPage: Safety timeout triggered - forcing loading to false as safety measure')
      // Try device data as last resort
      const assessmentParam = searchParams.get('assessment')
      const local = fetchFromStorage(assessmentParam || undefined)
      if (local) {
        console.log('✅ ResultsPage: Using device data due to safety timeout')
        if (assessmentParam) {
          const assessment = ASSESSMENTS[assessmentParam]
          if (assessment) {
            setAssessmentData({ assessment, result: local, mode: 'single' })
          }
        } else if (typeof local === 'object') {
          setAssessmentData({ results: local, mode: 'multiple' })
        }
        setUsingFallback(true)
      }
      setLoading(false)
    }, 12000) // 12 seconds

    return () => clearTimeout(safetyTimeout)
  }, [searchParams, user])

  const handleRetake = useCallback(() => {
    if (assessmentData.mode === 'single' && assessmentData.assessment) {
      router.push(`/assessments?retake=${assessmentData.assessment.id}`)
    } else {
      router.push('/assessments')
    }
  }, [assessmentData, router])

  const handleNewAssessment = useCallback(() => {
    router.push('/assessments')
  }, [router])

  const handleContinue = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  const handleClearDataAndRetry = useCallback(() => {
    clearAssessmentData()
    setError(null)
    loadAssessmentData()
  }, [loadAssessmentData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-slate-600 mt-4">Loading your assessment results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-red-600">error</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Unable to Load Results</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/assessments')}
              className="px-6 py-3 bg-brand-green-700 text-white rounded-xl hover:bg-brand-green-800 transition-all duration-300 font-semibold"
              style={{ backgroundColor: '#1f3d42' }}
            >
              Take Assessment
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 font-semibold"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleClearDataAndRetry}
              className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-300"
            >
              Clear & Retry
            </button>
            {/* Use device data fallback if present */}
            {safeGetFromStorage('assessmentResults') && (
              <button
                onClick={() => {
                  const stored = fetchFromStorage(searchParams.get('assessment') || undefined)
                  if (stored) {
                    if (searchParams.get('assessment')) {
                      const assessment = ASSESSMENTS[searchParams.get('assessment') as string]
                      if (assessment) setAssessmentData({ assessment, result: stored, mode: 'single' })
                    } else if (typeof stored === 'object') {
                      setAssessmentData({ results: stored, mode: 'multiple' })
                    }
                    setUsingFallback(true)
                    setError(null)
                  }
                }}
                className="px-4 py-2 text-sm bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-300"
              >
                Use Device Data
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Inline banner for fallback/sync status
  const SyncBanner = usingFallback ? (
    <div className="max-w-4xl mx-auto mb-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-4 rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm text-slate-700 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600">cloud_sync</span>
          </div>
          <div>
            <div className="text-sm font-light">
              Showing results from your device while we finish saving to the cloud.
            </div>
            {syncError && (
              <div className="text-xs text-slate-500 mt-1">{syncError}</div>
            )}
          </div>
        </div>
        <button
          onClick={retrySync}
          disabled={syncing}
          className={`px-4 py-2 text-sm rounded-xl border transition-all duration-300 ${
            syncing
              ? 'opacity-60 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
              : 'hover:bg-slate-50 border-slate-200 bg-white text-slate-700 hover:shadow-sm'
          }`}
        >
          {syncing ? 'Syncing…' : 'Retry Sync'}
        </button>
      </motion.div>
    </div>
  ) : null

  // Render based on mode
  if (assessmentData.mode === 'multiple' && assessmentData.results) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-6">{SyncBanner}</div>
        <MultipleResultsDisplay
          results={assessmentData.results}
          onRetake={handleRetake}
          onNewAssessment={handleNewAssessment}
        />
      </div>
    )
  }

  if (assessmentData.mode === 'single' && assessmentData.assessment && assessmentData.result) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-6">{SyncBanner}</div>
        <AssessmentResults
          assessment={assessmentData.assessment}
          result={assessmentData.result}
          onRetake={handleRetake}
          onContinue={handleContinue}
          variant="full"
          showActions={true}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">No Results Available</h1>
        <p className="text-slate-600 mb-6">No assessment results found.</p>
        <button
          onClick={() => router.push('/assessments')}
          className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
        >
          Take Assessment
        </button>
      </div>
    </div>
  )
}
