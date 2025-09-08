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
import { useApp } from '@/hooks/useApp'
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
  const { auth, assessment } = useApp()
  const { user } = auth
  const { saveAssessment, assessmentsLoading: loading } = assessment

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
  const [errors, setErrors] = useState<Record<string, string>>({})

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
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-700 transition-all duration-300 shadow-3xl hover:shadow-3xl hover:shadow-emerald-900/50 border border-emerald-500/20"
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
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-700 transition-all duration-300 shadow-3xl hover:shadow-3xl hover:shadow-emerald-900/50 border border-emerald-500/20"
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
          console.log('💾 SAVE TRACE: AssessmentFlowMigrated starting save process')
          console.log('💾 SAVE TRACE: User details:', {
            userId: user.id,
            email: user.email,
            isAuthenticated: !!user
          })
          console.log('💾 SAVE TRACE: Results to process:', {
            count: Object.keys(resultsToProcess).length,
            assessmentIds: Object.keys(resultsToProcess),
            sampleResult: resultsToProcess[Object.keys(resultsToProcess)[0]]
          })
          
          // Save each assessment result using the centralized store
          const savePromises = Object.entries(resultsToProcess).map(([assessmentId, result], index) => {
            console.log(`💾 SAVE TRACE: Preparing assessment ${index + 1}/${Object.keys(resultsToProcess).length}:`, {
              assessmentId,
              originalResult: result,
              hasResponses: !!result.responses,
              responseCount: Object.keys(result.responses || {}).length
            })

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

            console.log(`💾 SAVE TRACE: Transformed assessment ${assessmentId}:`, assessmentResult)
            
            console.log(`💾 SAVE TRACE: Calling saveAssessment(${user.id}, assessmentResult)`)
            return saveAssessment(user.id, assessmentResult).then(result => {
              console.log(`💾 SAVE TRACE: saveAssessment result for ${assessmentId}:`, result)
              // Check if result is false (failed save)
              if (result === false) {
                console.error(`💾 SAVE TRACE: saveAssessment returned false for ${assessmentId} - treating as error`)
                throw new Error(`Assessment ${assessmentId} save failed - service returned false`)
              }
              return result
            }).catch(error => {
              console.error(`💾 SAVE TRACE: saveAssessment error for ${assessmentId}:`, error)
              throw error
            })
          })

          console.log(`💾 SAVE TRACE: Created ${savePromises.length} save promises, waiting for completion...`)

          // Wait for all saves to complete
          const saveResults = await Promise.allSettled(savePromises)
          
          console.log('💾 SAVE TRACE: All save promises settled:', saveResults.map((result, index) => ({
            index,
            status: result.status,
            value: result.status === 'fulfilled' ? result.value : undefined,
            reason: result.status === 'rejected' ? result.reason : undefined
          })))
          
          // Log results
          const successful = saveResults.filter(result => result.status === 'fulfilled').length
          const failed = saveResults.filter(result => result.status === 'rejected').length
          
          console.log(`💾 SAVE TRACE: Final results - Saved ${successful} assessments, ${failed} failed`)
          
          if (failed > 0) {
            console.error('💾 SAVE TRACE: Failed assessments details:', saveResults
              .filter(r => r.status === 'rejected')
              .map((result, index) => ({
                index,
                error: result.reason,
                message: result.reason?.message,
                stack: result.reason?.stack?.split('\n').slice(0, 3)
              }))
            )
          }
        } catch (error) {
          console.error('💾 SAVE TRACE: Exception in save process:', {
            error,
            message: error?.message,
            stack: error?.stack?.split('\n').slice(0, 5)
          })
          setErrors(prev => ({
            ...prev,
            assessments: 'Failed to save assessment results. Please try again.'
          }))
        } finally {
          console.log('💾 SAVE TRACE: Background processing finished')
        }
      } else {
        console.warn('💾 SAVE TRACE: Save skipped - missing user or results:', {
          hasUser: !!user,
          hasResults: !!resultsToProcess,
          resultsCount: resultsToProcess ? Object.keys(resultsToProcess).length : 0
        })
      }

      console.log('🎯 Calling onComplete callback immediately (non-blocking) with:', {
        resultsCount: Object.keys(resultsToProcess).length,
        userProfile: userProfile ? 'provided' : 'default'
      })
      onComplete(resultsToProcess, userProfile || defaultProfile)

      // Clear any previous errors on successful completion
      setErrors({})
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
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Minimal header */}
      <div className="px-2 mb-4 flex items-center justify-between">
        <h1 className="text-base font-medium text-slate-800">Choose assessment</h1>
        <span className="text-xs text-slate-500">{assessmentIds.length} available</span>
      </div>

      {/* Minimal list with dividers */}
      <div className="rounded-lg border border-slate-200/60 bg-white/50 divide-y divide-slate-100 overflow-hidden">
        {assessmentIds.map((assessmentId, index) => {
          const assessment = ASSESSMENTS[assessmentId]
          const category = ASSESSMENT_CATEGORIES[assessment.category]
          const iconName = getAssessmentIconName(assessmentId)

          return (
            <motion.button
              key={assessmentId}
              type="button"
              className="w-full text-left px-3 py-3 flex items-center gap-3 hover:bg-slate-50/60 transition-colors"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.03 }}
              onClick={() => {
                setCurrentAssessmentIndex(index)
                setCurrentState('taking')
              }}
            >
              <span className="material-symbols-outlined text-slate-600 text-base">{iconName}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[13px] text-slate-800 truncate">{assessment.shortTitle || assessment.title}</span>
                  <span className="text-[10px] text-slate-400">{category.name}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {assessment.questions.length} questions • {assessment.estimatedTime}m
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
            </motion.button>
          )
        })}
      </div>
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
      <div className="max-w-3xl mx-auto">
        {/* Minimal sticky header with single progress */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur mb-4 border-b border-slate-100">
          <div className="px-2 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-slate-600 text-base">assignment</span>
              <h1 className="text-sm font-medium text-slate-800 truncate">
                {currentAssessment.title}
              </h1>
            </div>
            <div className="text-xs text-slate-500 tabular-nums">
              {currentQuestionIndex + 1}<span className="text-slate-400">/{currentAssessment.questions.length}</span>
            </div>
          </div>
          <div className="px-2 pb-2">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-emerald-500 h-1.5"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>

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
            showInlineProgress={false}
          />
        </motion.div>

        {/* Minimal footer */}
        <div className="flex justify-between items-center mt-4 px-1">
          <button
            onClick={onExit}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            Exit
          </button>
          <div className="text-[11px] text-slate-500 tabular-nums">
            {completedQuestions}<span className="text-slate-400">/{totalQuestions}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4">
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
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
