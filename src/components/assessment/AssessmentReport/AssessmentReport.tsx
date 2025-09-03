'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import { getAIAssessmentExplanation } from '../../../lib/assessment-ai'
import { AssessmentData, AIExplanation } from '../../../lib/assessment-ai'
import { ReportHeader } from './ReportHeader'
import { ScoreMeter } from './ScoreMeter'
import { ReportInsights } from './ReportInsights'
import { ReportActions } from './ReportActions'
import { ReportSummary } from './ReportSummary'
import { ReportLoading } from './ReportLoading'
import 'material-symbols/outlined.css'

interface AssessmentReportProps {
  assessment: any
  result: any
  onRetake: () => void
  onContinue: () => void
  variant?: 'full' | 'summary' | 'compact'
  showActions?: boolean
  className?: string
}

export function AssessmentReport({
  assessment,
  result,
  onRetake,
  onContinue,
  variant = 'full',
  showActions = true,
  className = ''
}: AssessmentReportProps) {
  const { user } = useAuth()
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateAIExplanation = async () => {
      if (!assessment || !result) {
        setIsLoading(false)
        return
      }

      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const assessmentData: AssessmentData = {
          assessmentName: assessment.title,
          score: result.score,
          maxScore: assessment.scoring.ranges[assessment.scoring.ranges.length - 1].max,
          responses: result.responses || {},
          category: assessment.category
        }

        const explanation = await getAIAssessmentExplanation(assessmentData, user)
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

  // Handle compact variant for summary displays
  if (variant === 'compact') {
    return <ReportSummary assessment={assessment} result={result} className={className} />
  }

  // Handle loading state
  if (isLoading) {
    return <ReportLoading className={className} />
  }

  // Handle error state
  if (error) {
    return (
      <div className={`bg-white/90 rounded-2xl p-8 shadow-sm ${className}`}>
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-red-500 text-4xl mb-3">error</span>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-6">We couldn't load your assessment results. Please try again later.</p>
          <button
            onClick={onContinue}
            className="px-6 py-2 bg-brand-green-700 text-white rounded-lg hover:bg-brand-green-800 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Main report view
  return (
    <div className={`bg-white/90 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {/* Header Section */}
      <ReportHeader 
        title={assessment.title}
        category={assessment.category}
        severity={result?.severity}
        level={result?.level}
      />

      <div className="p-8">
        {/* Score Meter */}
        <ScoreMeter 
          score={result.score}
          maxScore={assessment.scoring.ranges[assessment.scoring.ranges.length - 1].max}
          severity={result.severity}
          level={result.level}
          className="mb-8"
        />

        {/* Insights Section */}
        <ReportInsights 
          explanation={aiExplanation}
          className="mb-8"
        />

        {/* Actions */}
        {showActions && (
          <ReportActions 
            onRetake={onRetake}
            onContinue={onContinue}
          />
        )}
      </div>
    </div>
  )
}

export default AssessmentReport
