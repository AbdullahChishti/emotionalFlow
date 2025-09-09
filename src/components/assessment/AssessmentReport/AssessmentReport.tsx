'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import { useApp } from '@/hooks/useApp'
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
  const { auth } = useApp()
  const { user } = auth
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
      <div 
        className={`rounded-2xl p-6 shadow-sm ${className}`}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 via-teal-50/5 to-emerald-50/10 rounded-2xl"></div>
        <div className="relative z-10">
          <h3 
            className="text-lg font-semibold text-gray-900 mb-2"
            style={{
              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '-0.01em',
              fontWeight: '600'
            }}
          >
            {assessment.title}
          </h3>
          <p 
            className="text-gray-600"
            style={{
              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '-0.01em',
              fontWeight: '300'
            }}
          >
            Score: {result.score}
          </p>
        </div>
      </div>
    )
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div 
        className={`rounded-2xl p-8 shadow-sm ${className}`}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 via-teal-50/5 to-emerald-50/10 rounded-2xl"></div>
        <div className="relative z-10 text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p 
            className="text-gray-600"
            style={{
              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '-0.01em',
              fontWeight: '300'
            }}
          >
            Loading assessment results...
          </p>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div 
        className={`rounded-2xl p-8 shadow-sm ${className}`}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 via-teal-50/5 to-emerald-50/10 rounded-2xl"></div>
        <div className="relative z-10 text-center py-12">
          <span className="material-symbols-outlined text-red-500 text-4xl mb-3">error</span>
          <h3 
            className="text-lg font-semibold text-gray-900 mb-2"
            style={{
              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '-0.01em',
              fontWeight: '600'
            }}
          >
            Something went wrong
          </h3>
          <p 
            className="text-gray-600 mb-6"
            style={{
              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '-0.01em',
              fontWeight: '300'
            }}
          >
            We couldn't load your assessment results. Please try again later.
          </p>
          <motion.button
            onClick={onContinue}
            className="px-6 py-2 text-white rounded-lg transition-all duration-500"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
              boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '-0.005em',
              fontWeight: '500'
            }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            Return to Dashboard
          </motion.button>
        </div>
      </div>
    )
  }

  // Main report view
  return (
    <div 
      className={`rounded-2xl shadow-sm overflow-hidden ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(16, 185, 129, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 via-teal-50/5 to-emerald-50/10"></div>
      <div className="relative z-10">
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
              <div 
                className="text-4xl font-bold text-emerald-600 mb-2"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.02em',
                  fontWeight: '700'
                }}
              >
                {result.score}
              </div>
              <div 
                className="text-lg text-gray-600 mb-1"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.01em',
                  fontWeight: '500'
                }}
              >
                {result.level}
              </div>
              <div 
                className="text-sm text-gray-500"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.005em',
                  fontWeight: '400'
                }}
              >
                {result.severity}
              </div>
            </div>
          </div>

          {/* Insights Section */}
          {aiExplanation && (
            <div className="mb-8">
              <h3 
                className="text-lg font-semibold text-gray-900 mb-4"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.01em',
                  fontWeight: '600'
                }}
              >
                Assessment Insights
              </h3>
              <div className="prose prose-sm max-w-none">
                <p 
                  className="text-gray-700"
                  style={{
                    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.01em',
                    fontWeight: '300'
                  }}
                >
                  {aiExplanation.summary}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-4">
              <motion.button
                onClick={onRetake}
                className="flex-1 px-6 py-3 text-gray-700 rounded-lg transition-all duration-500"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.005em',
                  fontWeight: '500'
                }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Retake Assessment
              </motion.button>
              <motion.button
                onClick={onContinue}
                className="flex-1 px-6 py-3 text-white rounded-lg transition-all duration-500"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.005em',
                  fontWeight: '500'
                }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AssessmentReport
