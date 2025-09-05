'use client'

import { useState } from 'react'
import { AssessmentFlow } from '@/components/assessment/AssessmentFlow'
import AssessmentResults from '@/components/assessment/AssessmentResults'
import { AssessmentHistory } from '@/components/assessment/AssessmentHistory'
import { ASSESSMENTS } from '@/data/assessments'
import { AssessmentResult } from '@/data/assessments'

export default function AssessmentsPage() {
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null)
  const [assessmentResults, setAssessmentResults] = useState<Record<string, AssessmentResult>>({})
  const [showResults, setShowResults] = useState(false)
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string>('')

  const handleFlowSelect = (flowId: string) => {
    setSelectedFlow(flowId)
    setShowResults(false)
  }

  const handleAssessmentComplete = (results: Record<string, AssessmentResult>) => {
    setAssessmentResults(results)
    setShowResults(true)
    setSelectedFlow(null)
  }

  const handleRetakeAssessment = (assessmentId: string) => {
    setCurrentAssessmentId(assessmentId)
    setSelectedFlow('single')
    setShowResults(false)
  }

  // Show assessment history by default
  if (!selectedFlow && !showResults) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Mental Health Assessments</h1>
          <p className="text-zinc-600 max-w-2xl mx-auto">
            Take scientifically validated assessments to better understand your mental health and get personalized insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(ASSESSMENTS).map((assessment) => (
            <div
              key={assessment.id}
              className="glassmorphic p-6 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => handleFlowSelect('single')}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{assessment.category === 'trauma' ? '🩹' : assessment.category === 'depression' ? '😢' : assessment.category === 'anxiety' ? '😰' : assessment.category === 'resilience' ? '💪' : '✨'}</div>
                <h3 className="font-semibold text-lg text-zinc-900 mb-2">{assessment.shortTitle}</h3>
                <p className="text-sm text-zinc-600 mb-4">{assessment.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentAssessmentId(assessment.id)
                    handleFlowSelect('single')
                  }}
                  className="bg-brand-green-500 hover:bg-brand-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Take Assessment
                </button>
              </div>
            </div>
          ))}
        </div>

        <AssessmentHistory onRetakeAssessment={handleRetakeAssessment} />
      </div>
    )
  }

  // Show assessment flow
  if (selectedFlow && !showResults) {
    const assessmentIds = selectedFlow === 'single' && currentAssessmentId
      ? [currentAssessmentId]
      : ['phq9', 'gad7', 'pss10', 'who5']

    return (
      <AssessmentFlow
        assessmentIds={assessmentIds}
        onComplete={handleAssessmentComplete}
        onExit={() => {
          setSelectedFlow(null)
          setShowResults(false)
        }}
      />
    )
  }

  // Show results
  if (showResults && Object.keys(assessmentResults).length > 0) {
    return (
      <AssessmentResults
        results={assessmentResults}
        onRetake={() => {
          setShowResults(false)
          setSelectedFlow('single')
        }}
        onNewAssessment={() => {
          setShowResults(false)
          setSelectedFlow(null)
        }}
      />
    )
  }

  return null
}
