'use client'

import { motion } from 'framer-motion'
import { useAuth } from '../providers/AuthProvider'
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
}

// Memoized static left panel for results
const ResultsLeftPanel = memo(() => (
  <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
    {/* Glassmorphic Background Elements */}
    <div className="absolute inset-0 bg-gradient-to-br from-brand-green-100/50 to-brand-green-200/30"></div>
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-green-200/20 rounded-full blur-3xl"></div>
    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-green-300/15 rounded-full blur-3xl"></div>

    {/* SVG Illustration */}
    <div className="relative z-10 flex items-center justify-center w-full p-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <img
          src="/assets/Contemplating-bro_1.svg"
          alt="Assessment completed illustration"
          className="w-full h-auto drop-shadow-2xl"
        />
      </motion.div>
    </div>

    {/* Inspirational Text Overlay */}
    <div className="absolute bottom-12 left-12 right-12 z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glassmorphic rounded-2xl p-6 text-center"
      >
        <h3 className="text-xl font-semibold text-brand-green-800 mb-2">
          Well Done!
        </h3>
        <p className="text-brand-green-700/80 text-sm leading-relaxed">
          You've completed your assessment. These insights will help guide your
          wellness journey and personal growth.
        </p>
      </motion.div>
    </div>
  </div>
))

ResultsLeftPanel.displayName = 'ResultsLeftPanel'

// Score Card Component with severity color + circular meter
const ScoreCard = memo(({ assessment, result }: { assessment: any, result: any }) => {
  const max = assessment.scoring.ranges[assessment.scoring.ranges.length - 1].max
  const score = result.score
  const pct = Math.max(0, Math.min(100, Math.round((score / max) * 100)))
  const r = 56
  const c = 2 * Math.PI * r

  const severityColors: Record<string, string> = {
    normal: '#16a34a', // green-600
    mild: '#059669',   // emerald-600
    moderate: '#d97706', // amber-600
    severe: '#ea580c', // orange-600
    critical: '#dc2626' // red-600
  }
  const stroke = severityColors[result?.severity || 'normal']

  return (
    <div className="bg-white/80 rounded-2xl shadow-sm border border-white/50 p-8 mb-8">
      <div className="flex items-center gap-6">
        {/* Circular progress meter */}
        <div className="relative w-32 h-32">
          <svg width="128" height="128" viewBox="0 0 128 128" className="rotate-[-90deg]">
            <circle cx="64" cy="64" r={r} stroke="#e5e7eb" strokeWidth="10" fill="none" />
            <circle
              cx="64" cy="64" r={r}
              stroke={stroke}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${c} ${c}`}
              strokeDashoffset={`${c - (pct / 100) * c}`}
              fill="none"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-[90deg]">
            <div className="text-3xl font-bold" style={{ color: '#1f3d42' }}>{score}</div>
            <div className="text-xs text-zinc-500">/ {max}</div>
          </div>
        </div>

        {/* Score details */}
        <div className="flex-1">
          <div className="text-sm text-zinc-600 mb-1">Overall Score</div>
          <div className="text-2xl font-semibold mb-2" style={{ color: '#1f3d42' }}>{pct}%</div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-green-100/80 text-brand-green-800 rounded-full text-xs font-semibold border border-brand-green-200/50">
            <span className="material-symbols-outlined text-sm">verified</span>
            {result.level}
          </div>
        </div>
      </div>
    </div>
  )
})

ScoreCard.displayName = 'ScoreCard'

// Compact Summary Card Component for overview displays
const CompactSummaryCard = memo(({ assessment, result }: { assessment: any, result: any }) => (
  <div className="bg-white/70 rounded-xl p-4 border border-white/50 hover:bg-white/80 transition-all duration-300">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 rounded-full bg-brand-green-100 flex items-center justify-center">
        <span className="text-sm font-semibold text-brand-green-700">
          {assessment?.shortTitle?.charAt(0) || '?'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-zinc-900 truncate">{assessment?.shortTitle || 'Unknown'}</h3>
        <p className="text-sm text-zinc-600 font-medium">{result.level}</p>
      </div>
    </div>
    <div className="text-2xl font-bold text-brand-green-700" style={{ color: '#1f3d42' }}>
      {result.score}
      <span className="text-sm font-normal text-zinc-500 ml-1">
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
      <div className="bg-white/70 rounded-xl p-6 border border-white/50 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-brand-green-100/80 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-green-600"></div>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">Preparing your personalized guidance...</h3>
        </div>
        <p className="text-zinc-600 text-sm">Please wait while we generate tailored recommendations.</p>
      </div>
    )
  }

  const e = aiExplanation?.explanation ?? aiExplanation
  if (!e) return null

  return (
    <div className="space-y-6 mb-8">
      {/* Recommendations */}
      {Array.isArray(e.recommendations) && e.recommendations.length > 0 && (
        <div className="bg-white/70 rounded-xl p-6 border border-white/50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-green-100/80 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-lg" style={{ color: '#1f3d42' }}>recommend</span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">Recommendations</h3>
          </div>
          <div className="space-y-3">
            {e.recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-brand-green-50/50 rounded-lg">
                <div className="w-6 h-6 bg-brand-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-zinc-700 text-sm leading-relaxed">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {e.nextSteps && (
        <div className="bg-white/70 rounded-xl p-6 border border-white/50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-green-100/80 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-lg" style={{ color: '#1f3d42' }}>flag</span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">Next Steps</h3>
          </div>
          <p className="text-zinc-700 text-sm leading-relaxed">{e.nextSteps}</p>
        </div>
      )}

      {/* Supportive Message */}
      {e.supportiveMessage && (
        <div className="bg-brand-green-50/70 rounded-xl p-6 border border-brand-green-200/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-brand-green-100/80 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-lg" style={{ color: '#1f3d42' }}>favorite</span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">A Caring Note</h3>
          </div>
          <p className="text-zinc-700 italic leading-relaxed">“{e.supportiveMessage}”</p>
        </div>
      )}
    </div>
  )
})

AIInsights.displayName = 'AIInsights'

// Action Buttons Component
const ActionButtons = memo(({ onRetake, onContinue }: { onRetake: () => void, onContinue: () => void }) => (
  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
    <motion.button
      onClick={onRetake}
      className="px-6 py-3 bg-white/80 text-zinc-700 border border-zinc-300 rounded-xl hover:bg-zinc-50 transition-all duration-300 font-semibold"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Retake Assessment
    </motion.button>
    <motion.button
      onClick={onContinue}
      className="px-6 py-3 bg-brand-green-700 text-white rounded-xl hover:bg-brand-green-800 transition-all duration-300 font-semibold shadow-md"
      style={{
        backgroundColor: '#1f3d42',
        color: '#ffffff'
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Continue to Dashboard
    </motion.button>
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
  className = ''
}: AssessmentResultsProps) {
  const { user } = useAuth()
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateAIExplanation = async () => {
      if (!user || !assessment || !result) return

      try {
        setIsLoading(true)
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
          console.groupEnd()
        }

        setAiExplanation(explanation)
      } catch (err) {
        console.error('Error generating AI explanation:', err)
        setError('Failed to generate explanation')
      } finally {
        setIsLoading(false)
      }
    }

    generateAIExplanation()
  }, [user, assessment, result])

  // Memoized header content with category and severity chips
  const headerContent = useMemo(() => {
    const severityMap: Record<string, string> = {
      normal: 'bg-green-100/80 text-green-800 border-green-200/60',
      mild: 'bg-emerald-100/80 text-emerald-800 border-emerald-200/60',
      moderate: 'bg-amber-100/80 text-amber-800 border-amber-200/60',
      severe: 'bg-orange-100/80 text-orange-800 border-orange-200/60',
      critical: 'bg-red-100/80 text-red-800 border-red-200/60'
    }
    const severityClass = severityMap[result?.severity || 'normal']
    const categoryLabel = assessment.category.charAt(0).toUpperCase() + assessment.category.slice(1)

    return (
      <div className="mb-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-brand-green-100 to-brand-green-200 rounded-2xl mb-3">
          <span
            className="material-symbols-outlined text-xl"
            style={{ color: '#1f3d42' }}
          >
            analytics
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2 text-center md:text-left">{assessment.title}</h1>
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand-green-100/60 text-brand-green-800 rounded-full text-xs font-medium border border-brand-green-200/60 capitalize">
            <span className="material-symbols-outlined text-sm" style={{ color: '#1f3d42' }}>category</span>
            {categoryLabel}
          </span>
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${severityClass}`}>
            <span className="material-symbols-outlined text-sm">monitoring</span>
            {result?.severity || 'normal'}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 text-zinc-700 rounded-full text-xs font-medium border border-white/50">
            Level: {result?.level}
          </span>
        </div>
      </div>
    )
  }, [assessment.title, assessment.category, result?.severity, result?.level])

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
      <div className={`bg-white/80 rounded-2xl shadow-sm border border-white/50 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-green-100 to-brand-green-200 rounded-xl flex items-center justify-center">
              <span
                className="material-symbols-outlined text-lg"
                style={{ color: '#1f3d42' }}
              >
                analytics
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">{assessment.shortTitle}</h3>
              <p className="text-sm text-zinc-600 font-medium">{result.level}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-light text-brand-green-700" style={{ color: '#1f3d42' }}>
              {result.score}
            </div>
            <div className="text-sm text-zinc-600">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Analyzing your results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Section 1: Card on the left, content on the right */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Score Card as a featured card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-green-200 to-brand-green-400 rounded-3xl transform rotate-3 shadow-2xl"></div>
            <div className="relative glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20">
              <ScoreCard assessment={assessment} result={result} />
            </div>
          </motion.div>

          {/* Right: Header + brief summary */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            {headerContent}
            <div className="bg-white/70 rounded-xl p-6 border border-white/50 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined" style={{ color: '#1f3d42' }}>verified</span>
                <span className="text-sm font-semibold text-brand-green-700 uppercase tracking-wide">{result.level}</span>
              </div>
              <p className="text-zinc-700 leading-relaxed">
                {(aiExplanation && aiExplanation.summary) || result.description}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Section 2: Content on the left, Card on the right */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Deeper explanation */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Original Assessment Data */}
            <div className="bg-white/80 rounded-2xl p-6 border border-white/50 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Assessment Description</h3>
              <p className="text-zinc-700 leading-relaxed">{result.description}</p>
            </div>

            {result.recommendations && result.recommendations.length > 0 && (
              <div className="bg-white/80 rounded-2xl p-6 border border-white/50 shadow-sm">
                <h3 className="text-lg font-semibold text-zinc-900 mb-3">Clinical Recommendations</h3>
                <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                  {result.recommendations.map((recommendation: string, idx: number) => (
                    <li key={idx}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.insights && result.insights.length > 0 && (
              <div className="bg-white/80 rounded-2xl p-6 border border-white/50 shadow-sm">
                <h3 className="text-lg font-semibold text-zinc-900 mb-3">Key Insights</h3>
                <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                  {result.insights.map((insight: string, idx: number) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.nextSteps && result.nextSteps.length > 0 && (
              <div className="bg-white/80 rounded-2xl p-6 border border-white/50 shadow-sm">
                <h3 className="text-lg font-semibold text-zinc-900 mb-3">Next Steps</h3>
                <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                  {result.nextSteps.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* User Responses (Collapsible) */}
            {result.responses && Object.keys(result.responses).length > 0 && (
              <div className="bg-white/80 rounded-2xl p-6 border border-white/50 shadow-sm">
                <details className="group">
                  <summary className="text-lg font-semibold text-zinc-900 mb-3 cursor-pointer list-none flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl group-open:rotate-90 transition-transform duration-200">chevron_right</span>
                    Your Responses
                  </summary>
                  <div className="mt-4 space-y-3">
                    {Object.entries(result.responses).map(([questionId, response]) => {
                      const question = assessment.questions.find((q: any) => q.id === questionId)
                      return (
                        <div key={questionId} className="p-3 bg-zinc-50 rounded-lg">
                          <p className="text-sm font-medium text-zinc-700 mb-1">
                            {question?.text || `Question ${questionId}`}
                          </p>
                          <p className="text-zinc-600">
                            {typeof response === 'number' ? `Score: ${response}` : String(response)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </details>
              </div>
            )}

            {/* AI-Generated Explanation */}
            {aiExplanation && (
              <>
                <div className="bg-white/80 rounded-2xl p-6 border border-white/50 shadow-sm">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">AI-Generated Explanation</h3>
                  <p className="text-zinc-700 leading-relaxed">{aiExplanation.whatItMeans}</p>
                </div>

                {aiExplanation.manifestations?.length > 0 && (
                  <div className="bg-white/80 rounded-2xl p-6 border border-white/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-3">How these symptoms might show up in your daily life</h3>
                    <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                      {aiExplanation.manifestations.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiExplanation.unconsciousManifestations?.length > 0 && (
                  <div className="bg-white/80 rounded-2xl p-6 border border-white/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-3">Unconscious patterns that may show up</h3>
                    <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                      {aiExplanation.unconsciousManifestations.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Right: AI Insights card + actions */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="relative glassmorphic rounded-3xl p-6 shadow-2xl border border-white/20">
              <AIInsights aiExplanation={aiExplanation} isLoading={isLoading} />
              {aiExplanation && aiExplanation.recommendations?.length > 0 && (
                <div className="bg-white/70 rounded-xl p-4 border border-white/50 shadow-sm">
                  <h4 className="text-base font-semibold text-zinc-900 mb-2">Recommended next steps</h4>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-700">
                    {aiExplanation.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              {showActions && (
                <div className="pt-4">
                  <ActionButtons onRetake={onRetake} onContinue={onContinue} />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
