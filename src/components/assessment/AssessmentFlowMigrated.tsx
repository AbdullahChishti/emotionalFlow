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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40">
        <motion.div
          className="relative max-w-md mx-4"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Multi-layered background with depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/90 to-white/95 rounded-3xl"></div>
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-3xl"></div>
          
          {/* Subtle animated gradient orb */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-100/20 via-rose-50/10 to-red-100/20 rounded-full blur-2xl animate-pulse"></div>

          <div className="relative p-8 text-center">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <span className="material-symbols-outlined text-2xl text-white">error</span>
            </motion.div>
            <h1 className="text-2xl font-light text-slate-900 mb-4 tracking-tight">
              No Assessments{' '}
              <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent font-normal">
                Found
              </span>
          </h1>
            <p className="text-slate-600 font-light mb-6 leading-relaxed">
            No assessments were provided to display. Please go back and select an assessment.
          </p>
            <motion.button
            onClick={onExit}
              className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 text-white rounded-2xl font-medium hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-400/20 focus:ring-offset-2"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                <span>Return to Dashboard</span>
              </div>
            </motion.button>
        </div>
        </motion.div>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40">
        <motion.div
          className="relative max-w-md mx-4"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Multi-layered background with depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/90 to-white/95 rounded-3xl"></div>
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-3xl"></div>
          
          {/* Subtle animated gradient orb */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-100/20 via-rose-50/10 to-red-100/20 rounded-full blur-2xl animate-pulse"></div>

          <div className="relative p-8 text-center">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <span className="material-symbols-outlined text-2xl text-white">error</span>
            </motion.div>
            <h1 className="text-2xl font-light text-slate-900 mb-4 tracking-tight">
              Invalid Assessment{' '}
              <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent font-normal">
                Index
              </span>
          </h1>
            <p className="text-slate-600 font-light mb-6 leading-relaxed">
            There was an issue with the assessment flow. Please try again.
          </p>
            <motion.button
            onClick={onExit}
              className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 text-white rounded-2xl font-medium hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-400/20 focus:ring-offset-2"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                <span>Return to Dashboard</span>
              </div>
            </motion.button>
        </div>
        </motion.div>
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
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Ultra-refined header with sophisticated background */}
      <motion.div
        className="relative mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Layered background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-slate-50/20 to-teal-50/30 rounded-2xl blur-xl -z-10"></div>
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/40 shadow-lg -z-10"></div>
        
        <div className="relative px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-light text-slate-900 tracking-tight">
                Choose Your{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent font-normal">
                  Assessment
                </span>
              </h1>
              <p className="text-sm text-slate-600 font-light mt-2">
                Select an assessment to begin your mental wellness journey
              </p>
            </div>
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-50/80 to-slate-100/80 border border-slate-200/60 rounded-full shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <span className="material-symbols-outlined text-emerald-600 text-sm">psychology</span>
              <span className="text-xs text-slate-700 font-medium">{assessmentIds.length} Available</span>
            </motion.div>
          </div>
      </div>
      </motion.div>

      {/* Ultra-sophisticated assessment cards */}
      <div className="grid gap-4">
        {assessmentIds.map((assessmentId, index) => {
          const assessment = ASSESSMENTS[assessmentId]
          const category = ASSESSMENT_CATEGORIES[assessment.category]
          const iconName = getAssessmentIconName(assessmentId)

          return (
            <motion.button
              key={assessmentId}
              type="button"
              className="group relative w-full text-left overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setCurrentAssessmentIndex(index)
                setCurrentState('taking')
              }}
            >
              {/* Multi-layered background with depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/30 to-white/95 rounded-2xl"></div>
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg group-hover:shadow-xl transition-all duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              
              {/* Subtle animated gradient orb */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-100/20 via-green-50/10 to-teal-100/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative p-6 flex items-center gap-6">
                {/* Enhanced icon container */}
                <motion.div
                  className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="material-symbols-outlined text-emerald-600 text-xl">{iconName}</span>
                </motion.div>

                {/* Enhanced content */}
              <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-medium text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors duration-300 truncate">
                        {assessment.shortTitle || assessment.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                          {category.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {assessment.questions.length} questions • {assessment.estimatedTime}m
                        </span>
                      </div>
                    </div>
                    
                    {/* Enhanced chevron with animation */}
                    <motion.div
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100/50 group-hover:bg-emerald-50 transition-colors duration-300"
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-600 text-lg transition-colors duration-300">chevron_right</span>
                    </motion.div>
                </div>
                  
                  {/* Assessment description */}
                  <p className="text-sm text-slate-600 font-light leading-relaxed line-clamp-2">
                    {assessment.description || "Professional assessment to evaluate your mental wellness and provide personalized insights."}
                  </p>
                </div>
              </div>

              {/* Subtle bottom accent line */}
              <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )

  const renderTaking = () => {
    if (!currentAssessment || !currentQuestion) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40">
          <motion.div
            className="relative max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Multi-layered background with depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/90 to-white/95 rounded-3xl"></div>
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-3xl"></div>
            
            {/* Subtle animated gradient orb */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-100/20 via-rose-50/10 to-red-100/20 rounded-full blur-2xl animate-pulse"></div>

            <div className="relative p-8 text-center">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <span className="material-symbols-outlined text-2xl text-white">error</span>
              </motion.div>
              <h2 className="text-2xl font-light text-slate-900 mb-4 tracking-tight">
                Assessment{' '}
                <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent font-normal">
                  Error
                </span>
              </h2>
              <p className="text-slate-600 font-light mb-6 leading-relaxed">
                Unable to load assessment data. Please try again.
              </p>
              <motion.button
                onClick={onExit}
                className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 text-white rounded-2xl font-medium hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-400/20 focus:ring-offset-2"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  <span>Return to Dashboard</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )
    }

    return (
      <div className="max-w-4xl mx-auto">
        {/* Ultra-sophisticated sticky header */}
        <motion.div 
          className="sticky top-0 z-10 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Multi-layered background with depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/40 to-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-lg"></div>
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
          
          <div className="relative px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              {/* Enhanced assessment title */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <motion.div
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="material-symbols-outlined text-emerald-600 text-lg">assignment</span>
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-light text-slate-900 tracking-tight truncate">
                {currentAssessment.title}
              </h1>
                  <p className="text-sm text-slate-600 font-light">
                    Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
                  </p>
            </div>
          </div>

              {/* Progress indicator with enhanced styling */}
              <motion.div
                className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-slate-50/80 to-slate-100/80 border border-slate-200/60 rounded-full shadow-sm"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-700 font-medium tabular-nums">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Ultra-refined progress bar */}
            <div className="relative">
              <div className="w-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                <motion.div
                  className="h-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-500 rounded-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </motion.div>
              </div>
              
              {/* Progress milestones */}
              <div className="absolute top-0 left-0 w-full h-2 flex items-center">
                {Array.from({ length: currentAssessment.questions.length }, (_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 rounded-full ${
                      i <= currentQuestionIndex ? 'bg-white shadow-sm' : 'bg-slate-300/50'
                    } transition-colors duration-300`}
                    style={{
                      marginLeft: i === 0 ? '0' : `${100 / (currentAssessment.questions.length - 1)}%`,
                      transform: 'translateX(-50%)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Question Component with sophisticated container */}
        <motion.div
          key={currentQuestion.id}
          className="relative"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Subtle background accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 via-slate-50/10 to-teal-50/20 rounded-3xl blur-xl -z-10"></div>
          <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/40 shadow-lg p-8">
          <AssessmentQuestionComponent
            question={currentQuestion}
            value={responses[currentQuestion.id]}
            onChange={handleAnswer}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={currentAssessment.questions.length}
            showInlineProgress={false}
          />
          </div>
        </motion.div>

        {/* Ultra-refined footer */}
        <motion.div 
          className="flex justify-between items-center mt-8 px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.button
            onClick={onExit}
            className="group flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50/50 rounded-full transition-all duration-300"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Exit Assessment</span>
          </motion.button>
          
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-600 font-light">
              Progress: <span className="font-medium tabular-nums">{completedQuestions}/{totalQuestions}</span>
            </div>
            <div className="w-px h-4 bg-slate-200"></div>
            <div className="text-xs text-slate-600 font-light">
              ~{Math.max(1, Math.ceil((currentAssessment.questions.length - currentQuestionIndex) * 0.5))}m remaining
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40 p-4">
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

      {/* Ultra-sophisticated Saving Overlay */}
      {savingResults && (
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-md flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.div
            className="relative max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Multi-layered background with depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/90 to-white/95 rounded-3xl"></div>
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-3xl"></div>
            
            {/* Subtle animated gradient orbs */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-emerald-100/30 via-green-50/20 to-teal-100/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-20 -right-20 w-32 h-32 bg-gradient-to-br from-teal-100/30 via-emerald-50/20 to-green-100/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative p-8 text-center">
              {/* Ultra-refined loading icon */}
              <motion.div
                className="w-20 h-20 mx-auto mb-6 relative"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 rounded-3xl shadow-lg"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent rounded-3xl"></div>
                <div className="relative w-full h-full flex items-center justify-center">
                  <motion.div
                    className="w-10 h-10 border-3 border-white/80 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
            </div>
                
                {/* Pulsing ring effect */}
                <motion.div
                  className="absolute inset-0 border-2 border-emerald-400/30 rounded-3xl"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              {/* Enhanced typography */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h2 className="text-2xl font-light text-slate-900 mb-3 tracking-tight">
                  Saving Your{' '}
                  <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent font-normal">
                    Results
                  </span>
            </h2>
                <p className="text-slate-600 font-light mb-6 leading-relaxed">
                  Please wait while we securely process and save your assessment data...
                </p>
                
                {/* Animated progress dots */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-emerald-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        delay: i * 0.2,
                        ease: [0.25, 0.1, 0.25, 1]
                      }}
                    />
                  ))}
                </div>
                
                <div className="text-sm text-slate-500 font-light">
                  This process is encrypted and secure
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Ultra-sophisticated Error Display */}
      {errors.assessments && (
        <motion.div
          className="fixed bottom-6 right-6 max-w-sm z-50"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="relative">
            {/* Multi-layered background with depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50/90 to-red-50/95 rounded-2xl"></div>
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl border border-red-200/60 shadow-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-50/20 to-transparent rounded-2xl"></div>
            
            {/* Subtle animated gradient orb */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-red-100/30 via-rose-50/20 to-red-100/30 rounded-full blur-xl animate-pulse"></div>

            <div className="relative p-5">
              <div className="flex items-start gap-4">
                {/* Enhanced error icon */}
                <motion.div
                  className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="material-symbols-outlined text-white text-lg">error</span>
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-red-900 mb-1 tracking-tight">
                    Save Error
                  </h3>
                  <p className="text-sm text-red-700 font-light leading-relaxed mb-3">
                    {errors.assessments}
                  </p>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-full transition-colors duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setErrors(prev => ({ ...prev, assessments: '' }))}
                    >
                      Dismiss
                    </motion.button>
                    <motion.button
                      className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-full transition-colors duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Try Again
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
