/**
 * Assessment Flow Component
 * Orchestrates the complete assessment experience
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ASSESSMENTS,
  ASSESSMENT_CATEGORIES,
  Assessment,
  AssessmentResult
} from '@/data/assessments'
import { AssessmentIntegrator, UserProfile } from '@/data/assessment-integration'
import { AssessmentQuestionComponent } from './AssessmentQuestion'
import { AssessmentResults } from './AssessmentResults'
import { glassVariants, glassAnimations } from '@/styles/glassmorphic-design-system'

interface AssessmentFlowProps {
  assessmentIds: string[]
  onComplete: (results: Record<string, AssessmentResult>, userProfile: UserProfile) => void
  onExit: () => void
  userProfile?: UserProfile
}

type AssessmentState = 'selection' | 'taking' | 'results' | 'completed'

export function AssessmentFlow({
  assessmentIds,
  onComplete,
  onExit,
  userProfile
}: AssessmentFlowProps) {
  const [currentState, setCurrentState] = useState<AssessmentState>('selection')
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, number | string>>({})
  const [results, setResults] = useState<Record<string, AssessmentResult>>({})

  const currentAssessment = ASSESSMENTS[assessmentIds[currentAssessmentIndex]]
  const currentQuestion = currentAssessment?.questions[currentQuestionIndex]

  // Calculate progress
  const totalQuestions = assessmentIds.reduce((total, id) => {
    return total + (ASSESSMENTS[id]?.questions.length || 0)
  }, 0)

  const completedQuestions = assessmentIds.slice(0, currentAssessmentIndex).reduce((total, id) => {
    return total + (ASSESSMENTS[id]?.questions.length || 0)
  }, 0) + currentQuestionIndex

  const progress = (completedQuestions / totalQuestions) * 100

  const handleAnswer = async (answer: number | string) => {
    const newResponses = {
      ...responses,
      [currentQuestion.id]: answer
    }
    setResponses(newResponses)

    // Move to next question or finish assessment
    if (currentQuestionIndex < currentAssessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Calculate results for current assessment
      const score = calculateScore(currentAssessment, newResponses)
      // Convert string responses to numbers for scoring
      const numericResponses: Record<string, number> = {}
      Object.entries(newResponses).forEach(([key, value]) => {
        if (typeof value === 'number') {
          numericResponses[key] = value
        } else if (typeof value === 'string') {
          // For yes/no questions, convert to 1/0
          numericResponses[key] = value === 'yes' ? 1 : 0
        }
      })

      const result = currentAssessment.scoring.interpretation(score, numericResponses)

      const newResults = {
        ...results,
        [currentAssessment.id]: result
      }
      setResults(newResults)

      // Move to next assessment or show results
      if (currentAssessmentIndex < assessmentIds.length - 1) {
        setCurrentAssessmentIndex(currentAssessmentIndex + 1)
        setCurrentQuestionIndex(0)
        setResponses({}) // Reset for next assessment
      } else {
        setCurrentState('completed')
        // Process results into user profile (now async with AI explanations)
        try {
          const userProfile = await AssessmentIntegrator.processResults(newResults)
          onComplete(newResults, userProfile)
        } catch (error) {
          console.error('Error processing assessment results:', error)
          // Fallback to basic processing without AI explanations
          const symptomData = AssessmentIntegrator.extractSymptomData(newResults)
          const resilienceData = AssessmentIntegrator.extractResilienceData(newResults)

          const basicProfile = {
            id: 'user_' + Date.now(),
            traumaHistory: AssessmentIntegrator.extractTraumaData(newResults),
            currentSymptoms: {
              depression: symptomData.depression,
              anxiety: symptomData.anxiety,
              stress: symptomData.stress
            },
            resilience: resilienceData,
            riskFactors: AssessmentIntegrator.assessRiskFactors(newResults),
            preferences: AssessmentIntegrator.generatePreferences(newResults),
            lastAssessed: new Date()
          }
          onComplete(newResults, basicProfile)
        }
      }
    }
  }

  const calculateScore = (assessment: Assessment, responses: Record<string, number | string>): number => {
    let score = 0

    assessment.questions.forEach(question => {
      const response = responses[question.id]

      if (response !== undefined && response !== null) {
        if (question.type === 'yes-no') {
          score += response === 'yes' ? 1 : 0
        } else if (typeof response === 'number') {
          score += response
        } else if (typeof response === 'string' && question.options) {
          // For frequency/multiple choice, map to numeric value
          const optionIndex = question.options.indexOf(response)
          if (optionIndex !== -1) {
            score += optionIndex
          }
        } else if (typeof response === 'string') {
          // Handle other string responses (like multiple choice without predefined options)
          score += 0 // Default to 0 for now
        }
      }
    })

    return score
  }

  const handleRetake = () => {
    setCurrentQuestionIndex(0)
    setResponses({})
    setCurrentState('taking')
  }

  const handleContinue = async () => {
    if (currentAssessmentIndex < assessmentIds.length - 1) {
      setCurrentAssessmentIndex(currentAssessmentIndex + 1)
      setCurrentQuestionIndex(0)
      setResponses({})
      setCurrentState('taking')
    } else {
      setCurrentState('completed')
    }
  }

  const renderSelection = () => (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        className={`${glassVariants.panelSizes.large} text-center`}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-3xl font-light text-gray-800 mb-4">
          Psychological Assessments
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          These scientifically validated assessments can help you understand your mental health
          and identify areas for growth. Take your time and answer honestly.
        </p>
      </motion.div>

      {/* Assessment List */}
      <div className="grid md:grid-cols-2 gap-6">
        {assessmentIds.map((assessmentId, index) => {
          const assessment = ASSESSMENTS[assessmentId]
          const category = ASSESSMENT_CATEGORIES[assessment.category]

          return (
            <motion.div
              key={assessmentId}
              className={`${glassVariants.panelSizes.medium} cursor-pointer`}
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                background: `linear-gradient(135deg, ${category.color}, rgba(255, 255, 255, 0.1))`,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setCurrentState('taking')
              }}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{category.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {assessment.shortTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {assessment.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{assessment.estimatedTime} min</span>
                    <span>{assessment.questions.length} questions</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Start Button */}
      <motion.div
        className="text-center pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.button
          onClick={() => setCurrentState('taking')}
          className="px-8 py-4 rounded-2xl backdrop-blur-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-700 hover:bg-emerald-500/30 transition-all duration-300 text-lg font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Begin Assessments
        </motion.button>
      </motion.div>
    </motion.div>
  )

  const renderTaking = () => (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <motion.div
        className={`${glassVariants.panelSizes.small} mb-6`}
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-800">
            {currentAssessment.shortTitle}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-emerald-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Current Question */}
      <AnimatePresence mode="wait">
        <AssessmentQuestionComponent
          key={`${currentAssessment.id}-${currentQuestionIndex}`}
          question={currentQuestion}
          value={responses[currentQuestion.id] || null}
          onChange={handleAnswer}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={currentAssessment.questions.length}
        />
      </AnimatePresence>
    </div>
  )

  const renderResults = () => {
    const currentResult = results[currentAssessment.id]

    if (!currentResult) return null

    return (
      <AssessmentResults
        assessment={currentAssessment}
        result={currentResult}
        userProfile={userProfile}
        onRetake={handleRetake}
        onContinue={handleContinue}
      />
    )
  }

  const renderCompleted = () => (
    <motion.div
      className="max-w-4xl mx-auto text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className={`${glassVariants.panelSizes.large}`}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="mb-6">
          <span className="text-6xl">🎉</span>
        </div>
        <h1 className="text-3xl font-light text-gray-800 mb-4">
          Assessment Complete!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Thank you for completing these assessments. Your results provide valuable insights
          into your mental health and well-being.
        </p>

        <div className="flex gap-4 justify-center">
          <motion.button
            onClick={() => setCurrentState('selection')}
            className="px-6 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-gray-700 hover:bg-white/20 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Take Another Assessment
          </motion.button>
          <motion.button
            onClick={onExit}
            className="px-8 py-3 rounded-xl backdrop-blur-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-700 hover:bg-emerald-500/30 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Return to Dashboard
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/60 to-emerald-50/40 p-6">
      {/* Exit Button */}
      <motion.button
        onClick={onExit}
        className="fixed top-6 right-6 z-50 p-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-gray-600 hover:bg-white/20 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        ✕
      </motion.button>

      {/* Content */}
      <AnimatePresence mode="wait">
        {currentState === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderSelection()}
          </motion.div>
        )}

        {currentState === 'taking' && (
          <motion.div
            key="taking"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderTaking()}
          </motion.div>
        )}

        {currentState === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {renderResults()}
          </motion.div>
        )}

        {currentState === 'completed' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderCompleted()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AssessmentFlow
