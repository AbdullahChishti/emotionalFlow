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
import { useAuth } from '@/stores/authStore'
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

type AssessmentState = 'selection' | 'taking'

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
  const [completionTriggered, setCompletionTriggered] = useState(false) // Prevent multiple completions
  const [allResponses, setAllResponses] = useState<Record<string, Record<string, number | string>>>({})
  const [results, setResults] = useState<Record<string, AssessmentResult>>({})

  const [savingResults, setSavingResults] = useState(false)
  const [saveStartAt, setSaveStartAt] = useState<number | null>(null)

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
      
      // Add responses to the result object for database storage
      const resultWithResponses = {
        ...result,
        responses: newResponses
      }

      const newResults = {
        ...results,
        [currentAssessment.id]: resultWithResponses
      }

      // Store responses for this assessment
      setAllResponses(prev => ({
        ...prev,
        [currentAssessment.id]: newResponses
      }))

      // Skip individual results - go to next assessment or completion
      if (currentAssessmentIndex < assessmentIds.length - 1) {
        // Move to next assessment
        setResults(newResults) // Update results state for intermediate assessments
        setCurrentAssessmentIndex(currentAssessmentIndex + 1)
        setCurrentQuestionIndex(0)
        setResponses({})
        setCurrentState('taking')
      } else {
        // All assessments complete - process and navigate to results
        console.log('🎯 ASSESSMENT COMPLETE - Final assessment finished')
        console.log('📊 Final results:', newResults)

        // Prevent multiple completions
        if (completionTriggered) {
          console.log('⚠️ Completion already triggered, ignoring duplicate')
          return
        }

        setCompletionTriggered(true)
        console.log('✅ Completion triggered flag set')

        // Update results state
        setResults(newResults)

        // Call handleContinue immediately - React state updates are synchronous within the same render cycle
        console.log('🚀 Calling handleContinue with final results')
        handleContinue(newResults)
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

  const handleContinue = async (assessmentResults?: Record<string, any>) => {
    console.log('🎯 handleContinue called with:', assessmentResults)

    // Prevent multiple submissions
    if (savingResults) {
      console.log('Already processing results, ignoring duplicate call')
      console.log('💡 If this is unexpected, savingResults state might be stuck')
      return
    }

    // Guard against undefined currentAssessment
    if (!currentAssessment) {
      console.error('Current assessment is undefined in handleContinue')
      return
    }

    console.log('🔍 Navigation check:', {
      currentAssessmentIndex,
      totalAssessments: assessmentIds.length,
      isLastAssessment: currentAssessmentIndex >= assessmentIds.length - 1,
      savingResults
    })

    if (currentAssessmentIndex < assessmentIds.length - 1) {
      console.log('➡️ Moving to next assessment')
      setCurrentAssessmentIndex(currentAssessmentIndex + 1)
      setCurrentQuestionIndex(0)
      setResponses({})
      setCurrentState('taking')
    } else {
      console.log('🎯 Final assessment - processing completion')
      // Final step: immediately navigate to results and process in background
      setSavingResults(true)
      setSaveStartAt(Date.now())

      const defaultProfile: UserProfile = {
        id: user?.id || 'anonymous',
        email: user?.email || undefined,
        lastAssessmentDate: new Date()
      }
      const resultsToProcess = assessmentResults || results

      // Fire-and-forget processing to avoid blocking UI navigation
      if (user) {
        Promise.resolve(
          FlowManager.completeAssessmentFlow(resultsToProcess, user.id)
        ).catch(err => {
          console.error('💥 Background assessment processing failed:', err)
        }).finally(() => {
          console.log('🔄 Background processing finished (success or failure)')
        })
      }

      console.log('🎯 Calling onComplete callback immediately (non-blocking) with:', {
        resultsCount: Object.keys(resultsToProcess).length,
        userProfile: userProfile ? 'provided' : 'default'
      })
      onComplete(resultsToProcess, userProfile || defaultProfile)
      // Do not reset savingResults here; component will unmount after navigation
    }
  }

  // Safety: if saving overlay persists too long (navigation issue), auto-hide and enable manual continue
  useEffect(() => {
    if (!savingResults) return
    const timeout = setTimeout(() => {
      console.warn('AssessmentFlow: saving overlay active >6s, enabling manual continue')
      setSavingResults(false)
    }, 6000)
    return () => clearTimeout(timeout)
  }, [savingResults])

  const renderSelection = () => (
    <motion.div
      className="max-w-6xl mx-auto space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-4xl font-semibold text-slate-900 mb-2">Assessments</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Evidence-based measures to understand your current state.
        </p>
      </motion.div>

      {/* Assessment List */}
      <div className="grid md:grid-cols-2 gap-6">
        {assessmentIds.map((assessmentId, index) => {
          const assessment = ASSESSMENTS[assessmentId]
          const category = ASSESSMENT_CATEGORIES[assessment.category]
          const AssessmentIcon = getAssessmentIcon(assessmentId)
          const isSelected = currentAssessmentIndex === index && currentState === 'taking'

          return (
            <motion.div
              key={assessmentId}
              className={`bg-white rounded-xl border border-slate-200 p-6 cursor-pointer group hover:bg-slate-50 transition-colors ${
                isSelected ? 'outline outline-2 outline-slate-900' : ''
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                setCurrentAssessmentIndex(index)
                setCurrentQuestionIndex(0)
                setResponses({})
                setCurrentState('taking')
              }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                    <span className="material-symbols-outlined text-base text-slate-600">
                      {getAssessmentIconName(assessmentId)}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">
                        {assessment.shortTitle}
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-sm">
                        {assessment.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      <span>{assessment.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">quiz</span>
                      <span>{assessment.questions.length} questions</span>
                    </div>
                  </div>
                </div>
                
                {/* Arrow indicator */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Start Button */}
      <motion.div
        className="text-center pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={() => setCurrentState('taking')}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center gap-2 mx-auto"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
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
        className="absolute top-6 left-6 z-50"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          onClick={() => {
            setCurrentState('selection')
            setCurrentAssessmentIndex(0)
            setCurrentQuestionIndex(0)
            setResponses({})
          }}
          className="group flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          <span className="text-sm font-medium">Back</span>
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

  // renderResults and renderCompleted functions removed - results now shown on dedicated /results page

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      {/* Exit Button */}
      <motion.button
        onClick={onExit}
        className="fixed top-6 right-6 z-50 p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="material-symbols-outlined text-base">close</span>
      </motion.button>

      {/* Saving overlay when finalizing */}
      {savingResults && (
        <div className="fixed inset-0 z-40 bg-white/90 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800 mx-auto mb-4"></div>
            <p className="text-slate-800 font-medium">Finalizing your results…</p>
            <p className="text-slate-500 text-sm mt-2">This should only take a moment.</p>
            <button
              onClick={() => {
                const defaultProfile: UserProfile = {
                  id: user?.id || 'anonymous',
                  email: user?.email || undefined,
                  lastAssessmentDate: new Date()
                }
                onComplete(results, defaultProfile)
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-base">arrow_forward</span>
              Continue to results
            </button>
          </div>
        </div>
      )}

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

      </AnimatePresence>
    </div>
  )
}

export default AssessmentFlow
