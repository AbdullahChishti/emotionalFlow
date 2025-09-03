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
import AssessmentResults from './AssessmentResults'
import { glassVariants, glassAnimations } from '@/styles/glassmorphic-design-system'
import { ASSESSMENT_ICONS } from '@/data/assessment-icons'
import AssessmentService from '@/lib/assessment-service'
import { useAuth } from '@/components/providers/AuthProvider'

// Material Symbols icons import
import 'material-symbols/outlined.css'

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
  const { user } = useAuth()
  const [currentState, setCurrentState] = useState<AssessmentState>('selection')
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, number | string>>({})
  const [allResponses, setAllResponses] = useState<Record<string, Record<string, number | string>>>({})
  const [results, setResults] = useState<Record<string, AssessmentResult>>({})

  const [savingResults, setSavingResults] = useState(false)

  const currentAssessment = ASSESSMENTS[assessmentIds[currentAssessmentIndex]]
  const currentQuestion = currentAssessment?.questions[currentQuestionIndex]

  // Function to save assessment data to database
  const saveAssessmentDataToDatabase = async (userProfile: UserProfile, results: Record<string, AssessmentResult>) => {
    if (!user) return

    try {


      // Save individual assessment results
      for (const [assessmentId, result] of Object.entries(results)) {
        const assessment = ASSESSMENTS[assessmentId]
        if (assessment) {
          await AssessmentService.saveAssessmentResult(
            user.id,
            assessmentId,
            assessment.title,
            result,
            allResponses[assessmentId] || {}, // Use stored responses
            result.insights?.[0] // Use first insight as friendly explanation
          )
        }
      }

      // Save user profile
      await AssessmentService.saveUserProfile(
        user.id,
        userProfile,
        {
          therapy: userProfile.preferences?.therapyApproach || [],
          content: userProfile.preferences?.contentTypes || [],
          community: userProfile.preferences?.copingStrategies || [],
          wellness: userProfile.preferences?.copingStrategies || [],
          crisis: userProfile.riskFactors
        }
      )

      console.log('Assessment data saved to database successfully')
    } catch (error) {
      console.error('Error saving assessment data to database:', error)
    }
  }

  // Debug logging
  console.log('Current Assessment Index:', currentAssessmentIndex)
  console.log('Current Assessment ID:', assessmentIds[currentAssessmentIndex])
  console.log('Current Assessment:', currentAssessment?.title)
  console.log('Current Question:', currentQuestion?.text)

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

      // Show results for this assessment first
      setCurrentState('results')
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
      setSavingResults(true)
      
      // Process all results when all assessments are completed
      try {
        const userProfile = await AssessmentIntegrator.processResults(results)
        
        // Save to database if user is authenticated
        if (user) {
          await saveAssessmentDataToDatabase(userProfile, results)
        }
        
        onComplete(results, userProfile)
      } catch (error) {
        console.error('Error processing assessment results:', error)
        // Fallback to basic processing without AI explanations
        const symptomData = AssessmentIntegrator.extractSymptomData(results)
        const resilienceData = AssessmentIntegrator.extractResilienceData(results)

        const basicProfile = {
          id: 'user_' + Date.now(),
          traumaHistory: AssessmentIntegrator.extractTraumaData(results),
          currentSymptoms: {
            depression: symptomData.depression,
            anxiety: symptomData.anxiety,
            stress: symptomData.stress
          },
          resilience: resilienceData,
          riskFactors: AssessmentIntegrator.assessRiskFactors(results),
          preferences: AssessmentIntegrator.generatePreferences(results),
          lastAssessed: new Date()
        }
        
        // Save to database if user is authenticated
        if (user) {
          await saveAssessmentDataToDatabase(basicProfile, results)
        }
        
        onComplete(results, basicProfile)
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
        className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-6">
          <div className="w-16 h-16 bg-brand-green-100 rounded-2xl flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl text-brand-green-700">psychology</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Mental Health Assessments
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-6">
          These scientifically validated assessments can help you understand your mental health
          and identify areas for growth. Take your time and answer honestly.
        </p>
        
        {/* Professional Grade Info Pill */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-full text-sm font-medium text-blue-800 shadow-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <span className="material-symbols-outlined text-base">verified</span>
          <span>Professional-grade assessments used by world's top psychologists</span>
          <span className="material-symbols-outlined text-base">psychology</span>
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
              className={`bg-white rounded-2xl p-6 shadow-lg border border-slate-200 cursor-pointer group hover:shadow-xl transition-all duration-300 ${
                isSelected ? 'ring-2 ring-brand-green-500 ring-offset-2' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
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
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-green-100 to-brand-green-200 rounded-2xl flex items-center justify-center group-hover:from-brand-green-200 group-hover:to-brand-green-300 transition-all duration-300">
                    <span className="material-symbols-outlined text-2xl text-brand-green-700">
                      {getAssessmentIconName(assessmentId)}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-green-700 transition-colors">
                        {assessment.shortTitle}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {assessment.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-brand-green-500 rounded-full"></div>
                      <span className="font-medium">{assessment.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-brand-green-400 rounded-full"></div>
                      <span className="font-medium">{assessment.questions.length} questions</span>
                    </div>
                  </div>
                </div>
                
                {/* Arrow indicator */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-brand-green-100 rounded-full flex items-center justify-center group-hover:bg-brand-green-200 transition-colors duration-300">
                    <svg className="w-5 h-5 text-brand-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
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
          className="px-10 py-4 bg-white border-2 border-brand-green-600 text-brand-green-600 rounded-xl hover:bg-brand-green-50 hover:border-brand-green-700 hover:text-brand-green-700 transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="material-symbols-outlined">play_arrow</span>
          Begin Assessments
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
          className="group flex items-center gap-2 glassmorphic px-4 py-2 rounded-xl text-zinc-700 hover:text-zinc-900 transition-colors duration-200 shadow-lg border border-white/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform duration-200">
            arrow_back
          </span>
          <span className="font-semibold">Exit</span>
        </motion.button>
      </motion.div>

      {/* Current Question - Full Screen */}
      <AssessmentQuestionComponent
        question={currentQuestion}
        value={responses[currentQuestion.id] || null}
        onChange={handleAnswer}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={currentAssessment.questions.length}
      />
    </div>
  )

  const renderResults = () => {
    const currentResult = results[currentAssessment.id]

    if (!currentResult) return null

    return (
      <AssessmentResults
        assessment={currentAssessment}
        result={currentResult}
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
        className="bg-white rounded-2xl p-12 border border-gray-200 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="mb-8">
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-brand-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
          >
            <span className="text-4xl">🎉</span>
          </motion.div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Assessment Complete!
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
            className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 font-medium hover:shadow-md"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            🔄 Take Another Assessment
          </motion.button>
                      <motion.button
              onClick={onExit}
              className="px-8 py-3 rounded-xl backdrop-blur-xl bg-brand-green-500/20 border border-brand-green-400/30 text-brand-green-700 hover:bg-brand-green-500/30 transition-all duration-300"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-brand-green-50/60 to-brand-green-50/40 p-6">
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
