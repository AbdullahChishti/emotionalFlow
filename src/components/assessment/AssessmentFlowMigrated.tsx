/**
 * Migrated Assessment Flow Component
 * Uses centralized API system with AppDataStore
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
import { AssessmentQuestionComponent } from './AssessmentQuestion'
import { glassVariants, glassAnimations } from '@/styles/glassmorphic-design-system'
import { useAuth } from '@/stores/authStore'
import { useAppDataStore } from '@/stores/appDataStore'
import { UserProfile } from '@/types'

// Material Symbols icons import
import 'material-symbols/outlined.css'

interface AssessmentFlowMigratedProps {
  assessmentIds: string[]
  onComplete: (results: Record<string, AssessmentResult>, userProfile: UserProfile) => void
  onExit: () => void
  userProfile?: UserProfile
  onProfileEnhancement?: (enhancedProfile: UserProfile) => void
}

type AssessmentState = 'selection' | 'taking'

export function AssessmentFlowMigrated({
  assessmentIds,
  onComplete,
  onExit,
  userProfile,
  onProfileEnhancement
}: AssessmentFlowMigratedProps) {
  const { user } = useAuth()
  
  // Use centralized data store
  const {
    saveAssessment,
    loading,
    errors
  } = useAppDataStore()

  // Local state for UI flow
  const [currentState, setCurrentState] = useState<AssessmentState>('selection')
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, number | string>>({})
  const [completionTriggered, setCompletionTriggered] = useState(false)
  const [allResponses, setAllResponses] = useState<Record<string, Record<string, number | string>>>({})
  const [results, setResults] = useState<Record<string, AssessmentResult>>({})
  const [savingResults, setSavingResults] = useState(false)
  const [saveStartAt, setSaveStartAt] = useState<number | null>(null)

  // Validate assessmentIds and currentAssessmentIndex
  if (!assessmentIds || assessmentIds.length === 0) {
    console.error('AssessmentFlowMigrated: No assessment IDs provided')
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
    console.error('AssessmentFlowMigrated: Invalid currentAssessmentIndex', {
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
  const currentAssessment = ASSESSMENTS[currentAssessmentId]
  const currentQuestion = currentAssessment?.questions[currentQuestionIndex]

  // Calculate progress with error handling
  const completedQuestions = assessmentIds.slice(0, currentAssessmentIndex).reduce((total, assessmentId) => {
    const assessment = ASSESSMENTS[assessmentId]
    return total + (assessment?.questions?.length || 0)
  }, 0) + currentQuestionIndex

  const totalQuestions = assessmentIds.reduce((total, assessmentId) => {
    const assessment = ASSESSMENTS[assessmentId]
    return total + (assessment?.questions?.length || 0)
  }, 0)

  const progress = (completedQuestions / totalQuestions) * 100


  const getAssessmentIconName = (assessmentId: string) => {
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
    if (!currentAssessment || !currentQuestion) {
      console.error('Current assessment or question is undefined')
      return
    }

    const newResponses = {
      ...responses,
      [currentQuestion.id]: answer
    }
    setResponses(newResponses)

    if (currentQuestionIndex < currentAssessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Calculate results for current assessment
      const score = calculateScore(currentAssessment, newResponses)
      const numericResponses: Record<string, number> = {}
      Object.entries(newResponses).forEach(([key, value]) => {
        if (typeof value === 'number') {
          numericResponses[key] = value
        } else if (typeof value === 'string') {
          numericResponses[key] = value === 'yes' ? 1 : 0
        }
      })

      const result = currentAssessment.scoring.interpretation(score, numericResponses)
      const resultWithResponses = {
        ...result,
        responses: newResponses
      }

      const newResults = {
        ...results,
        [currentAssessment.id]: resultWithResponses
      }

      setAllResponses(prev => ({
        ...prev,
        [currentAssessment.id]: newResponses
      }))

      if (currentAssessmentIndex < assessmentIds.length - 1) {
        setResults(newResults)
        setCurrentAssessmentIndex(currentAssessmentIndex + 1)
        setCurrentQuestionIndex(0)
        setResponses({})
        setCurrentState('taking')
      } else {
        console.log('🎯 ASSESSMENT COMPLETE - Final assessment finished')
        console.log('📊 Final results:', newResults)

        if (completionTriggered) {
          console.log('⚠️ Completion already triggered, ignoring duplicate')
          return
        }

        setCompletionTriggered(true)
        setResults(newResults)
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
          const optionIndex = question.options.indexOf(response)
          if (optionIndex !== -1) {
            score += optionIndex
          }
        } else if (typeof response === 'string') {
          score += 0
        }
      }
    })

    return score
  }

  const handleContinue = async (assessmentResults?: Record<string, any>) => {
    console.log('🎯 handleContinue called with:', assessmentResults)

    if (savingResults) {
      console.log('Already processing results, ignoring duplicate call')
      return
    }

    if (!currentAssessment) {
      console.error('Current assessment is undefined in handleContinue')
      return
    }

    if (currentAssessmentIndex < assessmentIds.length - 1) {
      console.log('➡️ Moving to next assessment')
      setCurrentAssessmentIndex(currentAssessmentIndex + 1)
      setCurrentQuestionIndex(0)
      setResponses({})
      setCurrentState('taking')
    } else {
      console.log('🎯 Final assessment - processing completion')
      setSavingResults(true)
      setSaveStartAt(Date.now())

      const defaultProfile: UserProfile = {
        id: user?.id || 'anonymous',
        email: user?.email || undefined,
        lastAssessmentDate: new Date()
      }
      const resultsToProcess = assessmentResults || results

      // Use centralized API to save assessments
      if (user && resultsToProcess) {
        try {
          console.log('💾 AssessmentFlowMigrated: Saving assessments using centralized API...')
          
          // Save each assessment result using the centralized store
          const savePromises = Object.entries(resultsToProcess).map(([assessmentId, result]) => {
            const assessmentResult: AssessmentResult = {
              id: `${user.id}-${assessmentId}-${Date.now()}`,
              assessmentId,
              title: result.title || ASSESSMENTS[assessmentId]?.title || 'Assessment',
              score: result.score || 0,
              maxScore: result.maxScore || ASSESSMENTS[assessmentId]?.maxScore || 0,
              responses: result.responses || {},
              completedAt: new Date().toISOString(),
              interpretation: result.interpretation || 'No interpretation available'
            }
            
            return saveAssessment(user.id, assessmentResult)
          })

          // Wait for all saves to complete
          const saveResults = await Promise.allSettled(savePromises)
          
          // Log results
          const successful = saveResults.filter(result => result.status === 'fulfilled').length
          const failed = saveResults.filter(result => result.status === 'rejected').length
          
          console.log(`✅ AssessmentFlowMigrated: Saved ${successful} assessments, ${failed} failed`)
          
          if (failed > 0) {
            console.warn('⚠️ Some assessments failed to save:', saveResults.filter(r => r.status === 'rejected'))
          }
        } catch (error) {
          console.error('❌ AssessmentFlowMigrated: Failed to save assessments:', error)
        } finally {
          console.log('🔄 AssessmentFlowMigrated: Background processing finished')
        }
      }

      console.log('🎯 Calling onComplete callback immediately (non-blocking) with:', {
        resultsCount: Object.keys(resultsToProcess).length,
        userProfile: userProfile ? 'provided' : 'default'
      })
      onComplete(resultsToProcess, userProfile || defaultProfile)
    }
  }

  // Safety: if saving overlay persists too long, auto-hide
  useEffect(() => {
    if (!savingResults) return
    const timeout = setTimeout(() => {
      console.warn('AssessmentFlowMigrated: saving overlay active >6s, enabling manual continue')
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
          const iconName = getAssessmentIconName(assessmentId)

          return (
            <motion.div
              key={assessmentId}
              className="glassmorphic rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => {
                setCurrentAssessmentIndex(index)
                setCurrentState('taking')
              }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-2xl">
                    {iconName}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {assessment.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    {category.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {assessment.questions.length} questions • {assessment.estimatedTime} min
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 transition-colors duration-300">
                  arrow_forward
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Start Button */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => setCurrentState('taking')}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Start Assessments
        </button>
      </motion.div>
    </motion.div>
  )

  const renderTaking = () => {
    if (!currentAssessment || !currentQuestion) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl text-red-600">error</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Assessment Error</h2>
            <p className="text-slate-600 mb-4">Unable to load assessment data.</p>
            <button
              onClick={onExit}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors duration-300"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Assessment {currentAssessmentIndex + 1} of {assessmentIds.length}
            </span>
            <span className="text-sm font-medium text-slate-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Assessment Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-white">
              {getAssessmentIconName(currentAssessmentId)}
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">
            {currentAssessment.title}
          </h1>
          <p className="text-slate-600">
            Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
          </p>
        </motion.div>

        {/* Question Component */}
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <AssessmentQuestionComponent
            question={currentQuestion}
            value={responses[currentQuestion.id]}
            onChange={handleAnswer}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={currentAssessment.questions.length}
          />
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={onExit}
            className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors duration-300"
          >
            Exit Assessment
          </button>
          <div className="text-sm text-slate-500">
            {completedQuestions} of {totalQuestions} questions completed
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/60 to-emerald-50/40 p-6">
      <AnimatePresence mode="wait">
        {currentState === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSelection()}
          </motion.div>
        )}

        {currentState === 'taking' && (
          <motion.div
            key="taking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTaking()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saving Overlay */}
      {savingResults && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="glassmorphic rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Saving Your Results
            </h2>
            <p className="text-slate-600 mb-4">
              Please wait while we process your assessment data...
            </p>
            <div className="text-sm text-slate-500">
              This may take a few moments
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {errors.assessments && (
        <motion.div
          className="fixed bottom-6 right-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center">
            <span className="material-symbols-outlined text-red-500 mr-2">error</span>
            <div>
              <h3 className="font-medium text-red-800">Save Error</h3>
              <p className="text-sm text-red-600">{errors.assessments}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
