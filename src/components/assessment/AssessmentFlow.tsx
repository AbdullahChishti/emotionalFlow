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
import { AssessmentManager } from '@/lib/services/AssessmentManager'
import { FlowManager } from '@/lib/services/FlowManager'
import { AssessmentQuestionComponent } from './AssessmentQuestion'
// AssessmentResults import removed - now handled by /results page
import { glassVariants, glassAnimations } from '@/styles/glassmorphic-design-system'
import { ASSESSMENT_ICONS } from '@/data/assessment-icons'
// Assessment operations handled by AssessmentManager
import { useAuth } from '@/components/providers/AuthProvider'
import { UserProfile } from '@/types'

// Material Symbols icons import
import 'material-symbols/outlined.css'

interface AssessmentFlowProps {
  assessmentIds: string[]
  onComplete: (results: Record<string, AssessmentResult>, userProfile: UserProfile) => void
  onExit: () => void
  userProfile?: UserProfile
  onProfileEnhancement?: (enhancedProfile: UserProfile) => void
}

type AssessmentState = 'selection' | 'taking' | 'results' | 'completed'

export function AssessmentFlow({
  assessmentIds,
  onComplete,
  onExit,
  userProfile,
  onProfileEnhancement
}: AssessmentFlowProps) {
  const { user } = useAuth()
  const [currentState, setCurrentState] = useState<AssessmentState>('selection')
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, number | string>>({})
  const [allResponses, setAllResponses] = useState<Record<string, Record<string, number | string>>>({})
  const [results, setResults] = useState<Record<string, AssessmentResult>>({})

  const [savingResults, setSavingResults] = useState(false)

  // Validate assessmentIds and currentAssessmentIndex
  if (!assessmentIds || assessmentIds.length === 0) {
    console.error('AssessmentFlow: No assessment IDs provided')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50/80 via-blue-50/60 to-emerald-50/40">
        <div className="glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-2xl text-red-600">error</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            No Assessments Found
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto mb-6">
            No assessments were provided to display. Please go back and select an assessment.
          </p>
          <button
            onClick={onExit}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (currentAssessmentIndex < 0 || currentAssessmentIndex >= assessmentIds.length) {
    console.error('AssessmentFlow: Invalid currentAssessmentIndex', {
      currentAssessmentIndex,
      assessmentIdsLength: assessmentIds.length,
      assessmentIds
    })
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50/80 via-blue-50/60 to-emerald-50/40">
        <div className="glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-2xl text-red-600">error</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Invalid Assessment Index
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto mb-6">
            There was an issue with the assessment flow. Please try again.
          </p>
          <button
            onClick={onExit}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentAssessmentId = assessmentIds[currentAssessmentIndex]
  if (!currentAssessmentId) {
    console.error('AssessmentFlow: Current assessment ID is undefined', {
      currentAssessmentIndex,
      currentAssessmentId,
      assessmentIds
    })
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50/80 via-blue-50/60 to-emerald-50/40">
        <div className="glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-2xl text-red-600">error</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Assessment ID Not Found
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto mb-6">
            The assessment ID could not be found. Please try selecting a different assessment.
          </p>
          <button
            onClick={onExit}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentAssessment = ASSESSMENTS[currentAssessmentId]
  if (!currentAssessment) {
    console.error('AssessmentFlow: Current assessment not found in ASSESSMENTS', {
      currentAssessmentId,
      availableAssessments: Object.keys(ASSESSMENTS),
      assessmentIds
    })
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50/80 via-blue-50/60 to-emerald-50/40">
        <div className="glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-2xl text-red-600">error</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Assessment Not Available
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto mb-6">
            The requested assessment is not available. Please try selecting a different assessment.
          </p>
          <button
            onClick={onExit}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = currentAssessment?.questions[currentQuestionIndex]

  // Legacy function - now handled by FlowManager
  const saveAssessmentDataToDatabase = async (userProfile: any, results: Record<string, AssessmentResult>) => {
    console.log('⚠️ Legacy saveAssessmentDataToDatabase called - this should now be handled by FlowManager')
    // This function is kept for backward compatibility but should not be used
    // Assessment saving is now handled by FlowManager.completeAssessmentFlow()
    return Promise.resolve()
  }

  // Debug logging
  console.log('AssessmentFlow Debug:', {
    currentAssessmentIndex,
    currentAssessmentId,
    assessmentIds,
    currentAssessmentTitle: currentAssessment?.title,
    currentQuestionIndex,
    currentQuestionText: currentQuestion?.text,
    totalQuestions: currentAssessment?.questions?.length
  })

  // Calculate progress
  const totalQuestions = assessmentIds.reduce((total, id) => {
    return total + (ASSESSMENTS[id]?.questions.length || 0)
  }, 0)

  const completedQuestions = assessmentIds.slice(0, currentAssessmentIndex).reduce((total, id) => {
    return total + (ASSESSMENTS[id]?.questions.length || 0)
  }, 0) + currentQuestionIndex

  const progress = (completedQuestions / totalQuestions) * 100

  const getAssessmentIcon = (assessmentId: string) => {
    // Map assessment IDs to appropriate SVG icons
    if (assessmentId.includes('depression') || assessmentId.includes('phq')) {
      return ASSESSMENT_ICONS.depression
    } else if (assessmentId.includes('anxiety') || assessmentId.includes('gad')) {
      return ASSESSMENT_ICONS.anxiety
    } else if (assessmentId.includes('stress') || assessmentId.includes('pss')) {
      return ASSESSMENT_ICONS.stress
    } else if (assessmentId.includes('resilience') || assessmentId.includes('cd-risc')) {
      return ASSESSMENT_ICONS.resilience
    } else if (assessmentId.includes('wellness') || assessmentId.includes('mental')) {
      return ASSESSMENT_ICONS.wellness
    } else if (assessmentId.includes('cognitive') || assessmentId.includes('thinking')) {
      return ASSESSMENT_ICONS.cognitive
    } else if (assessmentId.includes('emotional') || assessmentId.includes('mood')) {
      return ASSESSMENT_ICONS.emotional
    }
    return ASSESSMENT_ICONS.general
  }

  const getAssessmentIconName = (assessmentId: string) => {
    // Map assessment IDs to Material Symbols icon names
    if (assessmentId.includes('depression') || assessmentId.includes('phq')) {
      return 'mood'
    } else if (assessmentId.includes('anxiety') || assessmentId.includes('gad')) {
      return 'psychology'
    } else if (assessmentId.includes('stress') || assessmentId.includes('pss')) {
      return 'stress_management'
    } else if (assessmentId.includes('resilience') || assessmentId.includes('cd-risc')) {
      return 'fitness_center'
    } else if (assessmentId.includes('wellness') || assessmentId.includes('mental')) {
      return 'self_improvement'
    } else if (assessmentId.includes('cognitive') || assessmentId.includes('thinking')) {
      return 'psychology'
    } else if (assessmentId.includes('emotional') || assessmentId.includes('mood')) {
      return 'sentiment_satisfied'
    }
    return 'assessment'
  }

  const handleAnswer = async (answer: number | string) => {
    // Guard against undefined currentAssessment or currentQuestion
    if (!currentAssessment || !currentQuestion) {
      console.error('Current assessment or question is undefined')
      return
    }

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

      // Store responses for this assessment
      setAllResponses(prev => ({
        ...prev,
        [currentAssessment.id]: newResponses
      }))

      // Skip individual results - go to next assessment or completion
      if (currentAssessmentIndex < assessmentIds.length - 1) {
        // Move to next assessment
        setCurrentAssessmentIndex(currentAssessmentIndex + 1)
        setCurrentQuestionIndex(0)
        setResponses({})
        setCurrentState('taking')
      } else {
        // All assessments complete - go to completion
        setCurrentState('completed')
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

  const handleContinue = async () => {
    // Prevent multiple submissions
    if (savingResults) {
      console.log('⏳ Already processing results, ignoring duplicate call')
      return
    }

    // Guard against undefined currentAssessment
    if (!currentAssessment) {
      console.error('Current assessment is undefined in handleContinue')
      return
    }

    if (currentAssessmentIndex < assessmentIds.length - 1) {
      setCurrentAssessmentIndex(currentAssessmentIndex + 1)
      setCurrentQuestionIndex(0)
      setResponses({})
      setCurrentState('taking')
    } else {
      // Final assessment: skip redundant completion screen and go straight to dashboard
      setSavingResults(true)
      try {
        // Use FlowManager for complete assessment flow
        if (user) {
          console.log('🎯 Starting complete assessment flow with FlowManager')
          await FlowManager.completeAssessmentFlow(results, user.id)
          console.log('✅ Assessment flow completed successfully')
        }

        // Trigger completion callback with user profile
        const defaultProfile: UserProfile = {
          id: user?.id || 'anonymous',
          email: user?.email || undefined,
          lastAssessmentDate: new Date()
        }
        onComplete(results, userProfile || defaultProfile)
      } catch (error) {
        console.error('💥 Critical error in assessment processing:', error)
        // Fallback to basic processing
        console.log('⚠️ Using fallback processing due to error')
        const defaultProfile: UserProfile = {
          id: user?.id || 'anonymous',
          email: user?.email || undefined,
          lastAssessmentDate: new Date()
        }
        onComplete(results, userProfile || defaultProfile)
      } finally {
        setSavingResults(false)
      }
    }
  }

  const renderSelection = () => (
    <motion.div
      className="max-w-6xl mx-auto space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        className="bg-white rounded-xl border border-gray-200 p-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl text-gray-600">psychology</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Clinical Assessment
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
          Complete this scientifically validated psychological assessment to gain evidence-based insights into your mental health and well-being.
        </p>
        
        {/* Professional validation badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-800"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <span className="material-symbols-outlined text-base">verified</span>
          <span>Clinically Validated • Evidence-Based • Professional Grade</span>
        </motion.div>
      </motion.div>

      {/* Assessment List */}
      <div className="grid md:grid-cols-2 gap-8">
        {assessmentIds.map((assessmentId, index) => {
          const assessment = ASSESSMENTS[assessmentId]
          const category = ASSESSMENT_CATEGORIES[assessment.category]
          const AssessmentIcon = getAssessmentIcon(assessmentId)
          const isSelected = currentAssessmentIndex === index && currentState === 'taking'

          return (
            <motion.div
              key={assessmentId}
              className={`bg-white rounded-lg border border-gray-200 p-6 cursor-pointer group hover:border-gray-300 hover:shadow-sm transition-all duration-200 ${
                isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                setCurrentAssessmentIndex(index)
                setCurrentQuestionIndex(0)
                setResponses({})
                setCurrentState('taking')
              }}
            >
              <div className="flex items-start gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-all duration-200">
                    <span className="material-symbols-outlined text-xl text-gray-600">
                      {getAssessmentIconName(assessmentId)}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                        {assessment.shortTitle}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {assessment.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>{assessment.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">quiz</span>
                      <span>{assessment.questions.length} questions</span>
                    </div>
                  </div>
                </div>
                
                {/* Arrow indicator */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Start Button */}
      <motion.div
        className="text-center pt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.button
          onClick={() => setCurrentState('taking')}
          className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium flex items-center gap-2 mx-auto"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="material-symbols-outlined text-lg">play_arrow</span>
          Begin Assessment
        </motion.button>
      </motion.div>
    </motion.div>
  )

  const renderTaking = () => (
    <div className="relative">
      {/* Exit Button - Positioned absolutely */}
      <motion.div
        className="absolute top-4 left-4 z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={() => {
            setCurrentState('selection')
            setCurrentAssessmentIndex(0)
            setCurrentQuestionIndex(0)
            setResponses({})
          }}
          className="group flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform duration-200">
            arrow_back
          </span>
          <span className="font-medium">Back</span>
        </motion.button>
      </motion.div>

      {/* Current Question - Full Screen */}
      {currentAssessment && currentQuestion ? (
        <AssessmentQuestionComponent
          question={currentQuestion}
          value={responses[currentQuestion.id] || null}
          onChange={handleAnswer}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={currentAssessment.questions.length}
        />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading assessment...</p>
          </div>
        </div>
      )}
    </div>
  )

  // renderResults function removed - results now shown on dedicated /results page

  const renderCompleted = () => (
    <motion.div
      className="max-w-4xl mx-auto text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-12 border border-gray-200 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="mb-8">
          <motion.div
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
          >
            <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
          </motion.div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Assessment Complete
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          {savingResults 
            ? 'Saving your results and generating your personalized analysis...'
            : 'Thank you for completing these assessments. Your results provide valuable insights into your mental health and well-being.'
          }
        </p>
        
        {savingResults && (
          <div className="flex justify-center mb-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green-500"></div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={() => setCurrentState('selection')}
            className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium hover:shadow-sm border border-gray-200"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Take Another Assessment
          </motion.button>
                      <motion.button
              onClick={onExit}
              className="px-8 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300 font-medium"
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Exit Button */}
      <motion.button
        onClick={onExit}
        className="fixed top-6 right-6 z-50 p-3 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-300 shadow-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="material-symbols-outlined text-lg">close</span>
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
