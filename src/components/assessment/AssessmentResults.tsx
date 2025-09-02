'use client'

import { motion } from 'framer-motion'
import { useAuth } from '../providers/TestAuthProvider'
import { getAIAssessmentExplanation, AssessmentData, AIExplanation } from '../../lib/assessment-ai'
import { useEffect, useState } from 'react'

interface AssessmentResultsProps {
  assessment: any
  result: any
  onRetake: () => void
  onContinue: () => void
}

export default function AssessmentResults({ assessment, result, onRetake, onContinue }: AssessmentResultsProps) {
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
          assessmentType: assessment.id,
          assessmentName: assessment.title,
          score: result.score,
          maxScore: assessment.scoring.ranges[assessment.scoring.ranges.length - 1].max,
          severity: result.severity,
          level: result.level,
          responses: result.responses || {}
        }

        const response = await getAIAssessmentExplanation(assessmentData, user)
        if (response.success) {
          setAiExplanation(response.explanation)
        } else {
          setError('Unable to generate AI explanation')
        }
      } catch (err) {
        console.error('Error generating AI explanation:', err)
        setError('Failed to generate explanation')
      } finally {
        setIsLoading(false)
      }
    }

    generateAIExplanation()
  }, [user, assessment, result])

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green-100 rounded-2xl mb-4">
            <span className="text-brand-green-600 text-2xl">📊</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{assessment.title}</h1>
          <p className="text-gray-600">Your assessment results</p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 text-center">
          <div className="text-6xl font-light text-brand-green-600 mb-2">{result.score}</div>
          <div className="text-gray-500 mb-4">out of {assessment.scoring.ranges[assessment.scoring.ranges.length - 1].max}</div>
          <div className="inline-flex items-center px-4 py-2 bg-brand-green-50 text-brand-green-700 rounded-full text-sm font-medium">
            {result.level}
          </div>
        </div>

        {/* AI Content Grid */}
        {aiExplanation && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600">💡</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {aiExplanation.summary || 'Understanding your assessment results...'}
                </p>
              </div>

              {/* What It Means */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600">📋</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">What This Means</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {aiExplanation.whatItMeans || 'Processing your assessment data...'}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Manifestations */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                    <span className="text-amber-600">🔍</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">How It Shows Up</h3>
                </div>
                <div className="space-y-3">
                  {aiExplanation.unconsciousManifestations && Array.isArray(aiExplanation.unconsciousManifestations) ? (
                    aiExplanation.unconsciousManifestations.map((manifestation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                        <div className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 text-sm">{manifestation}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No patterns identified</p>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <span className="text-green-600">🎯</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {aiExplanation.recommendations && Array.isArray(aiExplanation.recommendations) ? (
                    aiExplanation.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 text-sm">{recommendation}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No recommendations available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {aiExplanation && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Next Steps</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {aiExplanation.nextSteps || 'Consider your next steps based on these results...'}
            </p>
          </div>
        )}

        {/* Supportive Message */}
        {aiExplanation && (
          <div className="bg-gradient-to-r from-brand-green-50 to-emerald-50 rounded-xl p-6 border border-brand-green-200 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-green-600">💙</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">A Message for You</h3>
              <p className="text-gray-700 text-sm italic max-w-2xl mx-auto">
                "{aiExplanation.supportiveMessage || 'You\'re taking an important step toward understanding yourself better.'}"
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRetake}
            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Retake Assessment
          </button>
          <button
            onClick={onContinue}
            className="px-6 py-3 bg-brand-green-500 text-white rounded-lg hover:bg-brand-green-600 transition-colors font-medium"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
