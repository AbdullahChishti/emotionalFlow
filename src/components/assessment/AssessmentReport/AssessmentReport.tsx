'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/stores/authStore'
import { getAIAssessmentExplanation } from '@/lib/assessment-ai'
import { AssessmentData, AIExplanation } from '@/lib/assessment-ai'
import { ReportHeader } from './ReportHeader'
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
    return (
      <div className={`bg-white/90 rounded-2xl p-6 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{assessment.title}</h3>
        <p className="text-gray-600">Score: {result.score}</p>
      </div>
    )
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className={`bg-white/90 rounded-2xl p-8 shadow-sm ${className}`}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment results...</p>
        </div>
      </div>
    )
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
        {/* Score Display */}
        <div className="mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2">{result.score}</div>
            <div className="text-lg text-gray-600 mb-1">{result.level}</div>
            <div className="text-sm text-gray-500">{result.severity}</div>
          </div>
        </div>

        {/* Insights Section */}
        {aiExplanation && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Insights</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700">{aiExplanation.summary}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-4">
            <button
              onClick={onRetake}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Retake Assessment
            </button>
            <button
              onClick={onContinue}
              className="flex-1 px-6 py-3 text-white rounded-lg transition-colors"
              style={{
                backgroundColor: '#335f64'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4f52'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#335f64'}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssessmentReport
