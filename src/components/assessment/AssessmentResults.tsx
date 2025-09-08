'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/hooks/useApp'
import { getAIAssessmentExplanation, AssessmentData, AIExplanation } from '../../lib/assessment-ai'
import { useEffect, useState, memo, useMemo } from 'react'

// Material Symbols icons import
import 'material-symbols/outlined.css'

interface AssessmentResultsProps {
  assessment: any
  result: any
  onRetake: () => void
  onContinue: () => void
  variant?: 'full' | 'summary' | 'compact'
  showActions?: boolean
  className?: string
  aiExplanation?: any // Pre-generated AI explanation to avoid internal loading
}

// Memoized static left panel for results
const ResultsLeftPanel = memo(() => (
  <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
    {/* Minimal background removed for modern, clean look */}

    {/* SVG Illustration */}
    <div className="relative z-10 flex items-center justify-center w-full p-12">
      {/* Illustration removed to keep layout minimal */}
    </div>

    {/* Inspirational Text Overlay */}
    {/* Removed overlay text for cleaner aesthetic */}
  </div>
))

ResultsLeftPanel.displayName = 'ResultsLeftPanel'

// Score Card Component with severity color + circular meter
const ScoreCard = memo(({ assessment, result }: { assessment: any, result: any }) => {
  const max = assessment.scoring.ranges[assessment.scoring.ranges.length - 1].max
  const score = result.score
  const pct = Math.max(0, Math.min(100, Math.round((score / max) * 100)))
  const r = 60
  const c = 2 * Math.PI * r

  const severityColors: Record<string, string> = {
    normal: '#10b981',
    mild: '#34d399',
    moderate: '#f59e0b',
    severe: '#f97316',
    critical: '#ef4444'
  }
  const stroke = severityColors[result?.severity || 'normal']

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-slate-200 p-6"
    >
      <div className="text-center">
        {/* Circular progress meter */}
        <div className="relative w-28 h-28 mx-auto mb-4">
          <svg width="112" height="112" viewBox="0 0 160 160" className="rotate-[-90deg]">
            <circle cx="80" cy="80" r={r} stroke="#e2e8f0" strokeWidth="8" fill="none" />
            <circle
              cx="80" cy="80" r={r}
              stroke={stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${c} ${c}`}
              strokeDashoffset={`${c - (pct / 100) * c}`}
              fill="none"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-medium text-slate-800">{score}</div>
            <div className="text-xs text-slate-500">/ {max}</div>
          </div>
        </div>

        {/* Score details */}
        <div className="space-y-2">
          <div className="text-xs text-slate-500">Overall Score</div>
          <div className="text-2xl font-semibold text-slate-800">{pct}%</div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stroke }} />
            <span className="text-xs text-slate-700">{result.level}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

ScoreCard.displayName = 'ScoreCard'

// Compact Summary Card Component for overview displays
const CompactSummaryCard = memo(({ assessment, result }: { assessment: any, result: any }) => (
  <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-10 h-10 rounded-lg bg-brand-green-100 flex items-center justify-center">
        <span className="text-sm font-semibold text-brand-green-700">
          {assessment?.shortTitle?.charAt(0) || '?'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 truncate">{assessment?.shortTitle || 'Unknown'}</h3>
        <p className="text-sm text-slate-600 font-medium">{result.level}</p>
      </div>
    </div>
    <div className="text-3xl font-bold text-brand-green-700">
      {result.score}
      <span className="text-sm font-normal text-slate-500 ml-1">
        / {assessment?.scoring?.ranges?.[assessment.scoring.ranges.length - 1]?.max || '?'}
      </span>
    </div>
  </div>
))

CompactSummaryCard.displayName = 'CompactSummaryCard'

// AI Insights Component (actionable side)
const AIInsights = memo(({ aiExplanation, isLoading }: { aiExplanation: any | null, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-brand-green-100 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-green-600"></div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Generating personalized insights...</h3>
        </div>
        <p className="text-slate-600 text-sm">We're creating tailored recommendations and coping strategies just for you.</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <span className="material-symbols-outlined text-sm">info</span>
          <span>This usually takes 5-10 seconds</span>
        </div>
      </div>
    )
  }

  // If we have no AI explanation at all, show a placeholder
  if (!aiExplanation) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400">psychology</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Personalized Insights</h3>
        </div>
        <p className="text-slate-600 text-sm">Your personalized recommendations and coping strategies will appear here shortly.</p>
      </div>
    )
  }

  const e = aiExplanation?.explanation ?? aiExplanation
  if (!e) return null

  return (
    <div className="space-y-6 mb-8">
      {/* Recommendations */}
      {Array.isArray(e.recommendations) && e.recommendations.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-green-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-lg text-brand-green-700">recommend</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Recommendations</h3>
          </div>
          <div className="space-y-3">
            {e.recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200">
                <div className="w-6 h-6 bg-brand-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {e.nextSteps && (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-green-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-lg text-brand-green-700">flag</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Next Steps</h3>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">{e.nextSteps}</p>
        </div>
      )}

      {/* Supportive Message */}
      {e.supportiveMessage && (
        <div className="bg-brand-green-50 rounded-xl p-6 border border-brand-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-brand-green-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-lg text-brand-green-700">favorite</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">A Caring Note</h3>
          </div>
          <p className="text-slate-700 italic leading-relaxed">"{e.supportiveMessage}"</p>
        </div>
      )}
    </div>
  )
})

AIInsights.displayName = 'AIInsights'

// Action Buttons Component
const ActionButtons = memo(({ onRetake, onContinue }: { onRetake: () => void, onContinue: () => void }) => (
  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
    <Button variant="outline" size="md" className="px-5" onClick={onRetake}>
      Retake
    </Button>
    <Button variant="primary" size="md" className="px-5 gap-1" onClick={onContinue}>
      Continue
      <span className="material-symbols-outlined text-sm">arrow_forward</span>
    </Button>
  </div>
))

ActionButtons.displayName = 'ActionButtons'

export default function AssessmentResults({
  assessment,
  result,
  onRetake,
  onContinue,
  variant = 'full',
  showActions = true,
  className = '',
  aiExplanation: preGeneratedAI
}: AssessmentResultsProps) {
  // Guard against undefined assessment or result
  if (!assessment || !result) {
    console.warn('AssessmentResults: Missing assessment or result data', { assessment, result })
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading assessment results...</p>
      </div>
    )
  }

  const { auth } = useApp()
  const { user } = auth
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(preGeneratedAI || null)
  const [isAILoading, setIsAILoading] = useState(false) // Loading state specifically for AI content
  const [hasAIData, setHasAIData] = useState(!!preGeneratedAI)
  const [isLoading, setIsLoading] = useState(false) // Overall component loading state

  // Debug loading state changes
  const setAILoadingWithLog = (loading: boolean) => {
    console.log('AssessmentResults AI loading state change:', loading, {
      assessmentId: assessment?.id,
      hasResult: !!result,
      hasAIData,
      preGeneratedAI: !!preGeneratedAI
    })
    setIsAILoading(loading)
  }
  const [error, setError] = useState<string | null>(null)

  console.log('AssessmentResults mounted:', {
    assessmentId: assessment?.id,
    hasResult: !!result,
    resultKeys: result ? Object.keys(result) : [],
    variant
  })

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout
    
          // Quick timeout to ensure we don't get stuck in loading state
    const quickTimeoutId = setTimeout(() => {
      if (isMounted && isAILoading) {
        console.warn('Quick timeout - forcing AI loading to false')
        setAILoadingWithLog(false)
      }
    }, 2000) // 2 seconds
    // Hard cap timeout as ultimate fallback
    const hardTimeoutId = setTimeout(() => {
      if (isMounted && isAILoading) {
        console.warn('Hard timeout - disabling AI loading and proceeding with base results')
        setAILoadingWithLog(false)
      }
    }, 10000) // 10 seconds

    const generateAIExplanation = async () => {
      if (!assessment || !result) {
        if (isMounted) setAILoadingWithLog(false)
        return
      }

      // If we already have a pre-generated AI explanation, use it and skip loading
      if (preGeneratedAI) {
        console.log('Using pre-generated AI explanation, skipping internal generation')
        if (isMounted) {
          setAiExplanation(preGeneratedAI)
          setHasAIData(true)
          setAILoadingWithLog(false)
        }
        return
      }

      // Check specifically for AI-generated content (recommendations, manifestations, etc.)
      const hasAIContent = result && (
        (result.recommendations && result.recommendations.length > 0) ||
        (result.manifestations && result.manifestations.length > 0) ||
        (result.unconsciousManifestations && result.unconsciousManifestations.length > 0) ||
        (result.nextSteps && result.nextSteps.length > 0) ||
        (result.insights && result.insights.length > 0)
      )

      console.log('AssessmentResults - checking AI data availability:', {
        hasResult: !!result,
        hasRecommendations: !!(result?.recommendations && result.recommendations.length > 0),
        hasManifestations: !!(result?.manifestations && result.manifestations.length > 0),
        hasAIContent,
        hasAIData
      })

      // If we already have AI content, use it and don't show loading
      if (hasAIContent) {
        console.log('AI content already available, no need to generate')
        if (isMounted) {
          setHasAIData(true)
          setAILoadingWithLog(false)
        }
        return
      }

      // If we don't have AI content, start loading and generate it
      console.log('AI content missing, starting generation...')
      if (isMounted) {
        setAILoadingWithLog(true)
      }

      // If user is not authenticated, skip AI explanation but still show results
      if (!user) {
        if (isMounted) setAILoadingWithLog(false)
        return
      }

      try {
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('AI explanation timeout - forcing loading to complete')
            setAILoadingWithLog(false)
          }
        }, 10000) // 10 second timeout (reduced from 30)

        const assessmentData: AssessmentData = {
          assessmentName: assessment.title,
          score: result.score,
          maxScore: assessment.scoring.ranges[assessment.scoring.ranges.length - 1].max,
          responses: result.responses || {},
          category: assessment.category
        }

        console.groupCollapsed('[AI] Requesting explanation')
        console.log('assessment:', assessment)
        console.log('result:', result)
        console.log('assembled assessmentData:', assessmentData)
        console.groupEnd()

        const explanation = await getAIAssessmentExplanation(assessmentData, user)

        // Clear the timeout since we got a response
        if (timeoutId) clearTimeout(timeoutId)

        // Log a completeness check so we can verify every field is present
        if (explanation) {
          const completeness = {
            hasSummary: !!explanation.summary,
            hasWhatItMeans: !!explanation.whatItMeans,
            hasManifestations: Array.isArray(explanation.manifestations) && explanation.manifestations.length > 0,
            hasUnconsciousManifestations: Array.isArray(explanation.unconsciousManifestations) && explanation.unconsciousManifestations.length > 0,
            hasRecommendations: Array.isArray(explanation.recommendations) && explanation.recommendations.length > 0,
            hasNextSteps: !!explanation.nextSteps,
            hasSupportiveMessage: !!explanation.supportiveMessage,
          }
          console.groupCollapsed('[AI] Explanation received (completeness check)')
          console.table(completeness)
          console.log('full explanation:', explanation)
          console.log('manifestations array:', explanation.manifestations)
          console.log('unconsciousManifestations array:', explanation.unconsciousManifestations)
          console.groupEnd()
        }

        if (isMounted) {
          console.log('[AI] Setting explanation and stopping loading...')
          setAiExplanation(explanation)
          setHasAIData(true)
          setAILoadingWithLog(false)
          console.log('[AI] AI loading state set to false, hasAIData set to true')
        }
      } catch (err) {
        console.error('Error generating AI explanation:', err)
        if (timeoutId) clearTimeout(timeoutId)
        if (isMounted) {
          setError('Failed to generate explanation')
          setAILoadingWithLog(false)
        }
      }
    }

    generateAIExplanation()

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      if (quickTimeoutId) clearTimeout(quickTimeoutId)
      clearTimeout(hardTimeoutId)
    }
  }, [user, assessment, result, preGeneratedAI])

  // Memoized header content with category and severity chips
  const headerContent = useMemo(() => {
    // Guard against undefined assessment
    if (!assessment) {
      return null
    }

    const severityColor: Record<string, string> = {
      normal: '#10b981',
      mild: '#34d399',
      moderate: '#f59e0b',
      severe: '#f97316',
      critical: '#ef4444'
    }
    const dot = severityColor[result?.severity || 'normal']
    const categoryLabel = assessment.category.charAt(0).toUpperCase() + assessment.category.slice(1)

    return (
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-2xl mb-4">
          <span className="material-symbols-outlined text-lg text-slate-700">analytics</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-light text-slate-800 mb-3 text-center md:text-left">{assessment.title}</h1>
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-2xl text-sm font-light border border-slate-200/50 shadow-sm">
            <span className="material-symbols-outlined text-base text-slate-600">category</span>
            {categoryLabel}
          </span>
          <span className="inline-flex items-center gap-3 px-4 py-2 bg-white text-slate-700 rounded-2xl text-sm font-light border border-slate-200/50 shadow-sm">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: dot }} />
            {result?.severity || 'normal'}
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-2xl text-sm font-light border border-slate-200/50 shadow-sm">
            Level: {result?.level}
          </span>
        </div>
      </div>
    )
  }, [assessment?.title, assessment?.category, result?.severity, result?.level])

  // Handle compact variant for summary displays
  if (variant === 'compact') {
    return (
      <div className={className}>
        <CompactSummaryCard assessment={assessment} result={result} />
      </div>
    )
  }

  // Handle summary variant for overview pages
  if (variant === 'summary') {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-5 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-base text-slate-700">analytics</span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900">{assessment.shortTitle}</h3>
              <p className="text-xs text-zinc-600 font-medium">{result.level}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-brand-green-700" style={{ color: '#1f3d42' }}>
              {result.score}
            </div>
            <div className="text-xs text-zinc-600">
              out of {assessment.scoring.ranges[assessment.scoring.ranges.length - 1].max}
            </div>
          </div>
        </div>
        {showActions && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={onRetake}
              className="flex-1 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors text-sm font-medium"
            >
              Retake
            </button>
            <button
              onClick={onContinue}
              className="flex-1 px-4 py-2 bg-brand-green-600 text-white rounded-lg hover:bg-brand-green-700 transition-colors text-sm font-medium"
              style={{ backgroundColor: '#1f3d42' }}
            >
              View Details
            </button>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-10 h-10 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-slate-900 font-medium">Analyzing your results…</div>
          <div className="text-slate-500 text-sm mt-1">Generating personalized insights</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onContinue}
            className="px-6 py-2 bg-brand-green-500 text-white rounded-lg hover:bg-brand-green-600 transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    )
  }


  // Minimal, modern full-view
  if (variant === 'full') {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-6 py-8 max-w-5xl">
          {/* Minimal header */}
          <div className="flex items-start justify-between mb-4">
            <div className="min-w-0">
              <h1 className="text-lg font-medium text-slate-900 truncate">{assessment.shortTitle || assessment.title}</h1>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-white">
                  <span className="material-symbols-outlined text-[14px] text-slate-600">category</span>
                  {assessment.category}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-white">
                  Level: {result.level}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-white capitalize">
                  Severity: {result.severity}
                </span>
              </div>
            </div>
          </div>

          {/* Top grid: score and summary */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <ScoreCard assessment={assessment} result={result} />
            </div>
            <div className="md:col-span-2">
              <div className="rounded-lg border border-slate-200 p-5 bg-white">
                <div className="flex items-center gap-2 mb-2 text-slate-800 text-sm">
                  <span className="material-symbols-outlined text-base text-slate-600">lightbulb</span>
                  Summary
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{(aiExplanation && aiExplanation.summary) || result.description}</p>
              </div>
            </div>
          </div>

          {/* Details list */}
          <div className="grid md:grid-cols-2 gap-6">
            {result.insights && result.insights.length > 0 && (
              <div className="rounded-lg border border-slate-200 p-5 bg-white">
                <div className="flex items-center gap-2 mb-2 text-slate-800 text-sm">
                  <span className="material-symbols-outlined text-base text-slate-600">lightbulb</span>
                  Key Insights
                </div>
                <ul className="space-y-2">
                  {result.insights.map((insight: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-600 text-sm">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.nextSteps && result.nextSteps.length > 0 && (
              <div className="rounded-lg border border-slate-200 p-5 bg-white">
                <div className="flex items-center gap-2 mb-2 text-slate-800 text-sm">
                  <span className="material-symbols-outlined text-base text-slate-600">flag</span>
                  Next Steps
                </div>
                <ul className="space-y-2">
                  {result.nextSteps.map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-600 text-sm">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(aiExplanation || result.description) && (
              <div className="rounded-lg border border-slate-200 p-5 bg-white md:col-span-2">
                <div className="flex items-center gap-2 mb-2 text-slate-800 text-sm">
                  <span className="material-symbols-outlined text-base text-slate-600">psychology</span>
                  {aiExplanation ? 'AI-Generated Explanation' : 'Assessment Explanation'}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{aiExplanation?.whatItMeans || result.description}</p>
              </div>
            )}

            {aiExplanation && aiExplanation.whyItMatters && (
              <div className="rounded-lg border border-slate-200 p-5 bg-white md:col-span-2">
                <div className="flex items-center gap-2 mb-2 text-slate-800 text-sm">
                  <span className="material-symbols-outlined text-base text-slate-600">sentiment_satisfied</span>
                  Why this matters
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{aiExplanation.whyItMatters}</p>
              </div>
            )}

            {((aiExplanation?.manifestations && aiExplanation.manifestations.length > 0) || (result.manifestations && result.manifestations.length > 0)) && (
              <div className="rounded-lg border border-slate-200 p-5 bg-white md:col-span-2">
                <div className="flex items-center gap-2 mb-2 text-slate-800 text-sm">
                  <span className="material-symbols-outlined text-base text-slate-600">visibility</span>
                  How these symptoms might show up
                </div>
                <ul className="space-y-2">
                  {(aiExplanation?.manifestations || result.manifestations || []).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-600 text-sm">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {((aiExplanation?.unconsciousManifestations && aiExplanation.unconsciousManifestations.length > 0) || (result.unconsciousManifestations && result.unconsciousManifestations.length > 0)) && (
              <div className="rounded-lg border border-slate-200 p-5 bg-white md:col-span-2">
                <div className="flex items-center gap-2 mb-2 text-slate-800 text-sm">
                  <span className="material-symbols-outlined text-base text-slate-600">psychology_alt</span>
                  Unconscious patterns that may show up
                </div>
                <ul className="space-y-2">
                  {(aiExplanation?.unconsciousManifestations || result.unconsciousManifestations || []).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-600 text-sm">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="md:col-span-2">
              <ActionButtons onRetake={onRetake} onContinue={onContinue} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-50/50 to-white min-h-screen">
      <div className="container mx-auto px-6 py-16">
        {/* Section 1: Card on the left, content on the right */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          {/* Left: Score Card as a featured card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <ScoreCard assessment={assessment} result={result} />
          </motion.div>

          {/* Right: Header + brief summary */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-8"
          >
            {headerContent}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/80 rounded-3xl p-8 border border-slate-200/60 shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-base text-slate-700">verified</span>
                </div>
                <span className="text-base font-light text-slate-700">{result.level}</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-base font-light">
                {(aiExplanation && aiExplanation.summary) || result.description}
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Section 2: Content on the left, Card on the right */}
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left: Deeper explanation */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Original Assessment Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/60 rounded-3xl p-8 border border-slate-200/40 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-base text-slate-700">description</span>
                </div>
                <h3 className="text-lg font-light text-slate-800">Assessment Description</h3>
              </div>
              <p className="text-slate-600 leading-relaxed text-base font-light">{result.description}</p>
            </motion.div>

            {result.recommendations && result.recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/60 rounded-3xl p-8 border border-slate-200/40 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-base text-slate-700">recommend</span>
                  </div>
                  <h3 className="text-lg font-light text-slate-800">Clinical Recommendations</h3>
                </div>
                <ul className="space-y-3">
                  {result.recommendations.map((recommendation: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 text-base font-light">
                      <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {result.insights && result.insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/60 rounded-3xl p-8 border border-slate-200/40 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-base text-slate-700">lightbulb</span>
                  </div>
                  <h3 className="text-lg font-light text-slate-800">Key Insights</h3>
                </div>
                <ul className="space-y-3">
                  {result.insights.map((insight: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 text-base font-light">
                      <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">{insight}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {result.nextSteps && result.nextSteps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/60 rounded-3xl p-8 border border-slate-200/40 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-base text-slate-700">flag</span>
                  </div>
                  <h3 className="text-lg font-light text-slate-800">Next Steps</h3>
                </div>
                <ul className="space-y-3">
                  {result.nextSteps.map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 text-base font-light">
                      <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* User Responses (Collapsible) */}
            {result.responses && Object.keys(result.responses).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white/60 rounded-3xl p-8 border border-slate-200/40 shadow-sm"
              >
                <details className="group">
                  <summary className="text-lg font-light text-slate-800 mb-6 cursor-pointer list-none flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-base text-slate-700 group-open:rotate-90 transition-transform duration-200">chevron_right</span>
                    </div>
                    <span>Your Responses</span>
                  </summary>
                  <div className="mt-6 space-y-4">
                    {Object.entries(result.responses).map(([questionId, response]) => {
                      const question = assessment.questions.find((q: any) => q.id === questionId)
                      return (
                        <div key={questionId} className="p-6 bg-white/80 rounded-2xl border border-slate-200/50">
                          <p className="text-base font-light text-slate-700 mb-3">
                            {question?.text || `Question ${questionId}`}
                          </p>
                          <p className="text-slate-600 text-sm font-light">
                            {typeof response === 'number' ? `Score: ${response}` : String(response)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </details>
              </motion.div>
            )}

            {/* AI-Generated Explanation */}
            {(aiExplanation || result.description) && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-white/60 rounded-3xl p-8 border border-slate-200/40 shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-base text-slate-700">psychology</span>
                    </div>
                    <h3 className="text-lg font-light text-slate-800">
                      {aiExplanation ? 'AI-Generated Explanation' : 'Assessment Explanation'}
                    </h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-base font-light">
                    {aiExplanation?.whatItMeans || result.description}
                  </p>
                </motion.div>

                {((aiExplanation?.manifestations && aiExplanation.manifestations.length > 0) || (result.manifestations && result.manifestations.length > 0)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="bg-white/60 rounded-3xl p-8 border border-slate-200/40 shadow-sm"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-base text-slate-700">visibility</span>
                      </div>
                      <h3 className="text-lg font-light text-slate-800">How these symptoms might show up in your daily life</h3>
                    </div>
                    <ul className="space-y-3">
                      {(aiExplanation?.manifestations || result.manifestations || []).map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-600 text-base font-light">
                          <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {((aiExplanation?.unconsciousManifestations && aiExplanation.unconsciousManifestations.length > 0) || (result.unconsciousManifestations && result.unconsciousManifestations.length > 0)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="bg-white/60 rounded-3xl p-8 border border-slate-200/40 shadow-sm"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-base text-slate-700">psychology_alt</span>
                      </div>
                      <h3 className="text-lg font-light text-slate-800">Unconscious patterns that may show up</h3>
                    </div>
                    <ul className="space-y-3">
                      {(aiExplanation?.unconsciousManifestations || result.unconsciousManifestations || []).map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-600 text-base font-light">
                          <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>

          {/* Right: AI Insights card + actions */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative space-y-6"
          >
            <div className="bg-white/60 rounded-3xl p-8 border border-slate-200/40 shadow-sm">
              <AIInsights aiExplanation={aiExplanation} isLoading={isAILoading} />
            </div>
            {aiExplanation && aiExplanation.recommendations?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/60 rounded-3xl p-8 border border-slate-200/40 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-base text-slate-700">list_alt</span>
                  </div>
                  <h4 className="text-lg font-light text-slate-800">Recommended next steps</h4>
                </div>
                <ul className="space-y-3">
                  {aiExplanation.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 text-base font-light">
                      <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
            {showActions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/60 rounded-3xl p-8 border border-slate-200/40 shadow-sm"
              >
                <ActionButtons onRetake={onRetake} onContinue={onContinue} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
