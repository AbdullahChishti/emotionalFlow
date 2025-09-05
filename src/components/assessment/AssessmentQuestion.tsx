/**
 * Assessment Question Component - Optimized for Zero Flickering
 * Handles different question types with completely isolated static and dynamic components
 */

'use client'

import React, { memo, useCallback, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { AssessmentQuestion } from '@/data/assessments'

// Material Symbols icons import
import 'material-symbols/outlined.css'

interface AssessmentQuestionProps {
  question: AssessmentQuestion
  value: number | string | null
  onChange: (value: number | string) => void
  questionNumber: number
  totalQuestions: number
}

// Completely isolated static illustration panel with zero dependencies
const StaticIllustrationPanel = memo(() => {
  // Use useRef to ensure this component never re-renders after mount
  const hasAnimated = useRef(false)
  
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      {/* Glassmorphic Background Elements - Static */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-green-100/50 to-brand-green-200/30"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-green-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-green-300/15 rounded-full blur-3xl"></div>
      
      {/* SVG Illustration - Static */}
      <div className="relative z-10 flex items-center justify-center w-full p-12">
        <motion.div
          initial={!hasAnimated.current ? { opacity: 0, scale: 0.8 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          onAnimationComplete={() => { hasAnimated.current = true }}
          className="w-full max-w-lg"
        >
          <img
            src="/assets/Psychologist-rafiki_1.svg"
            alt="Assessment in progress illustration"
            className="w-full h-auto drop-shadow-2xl"
            loading="eager"
            draggable={false}
          />
        </motion.div>
      </div>

      {/* Inspirational Text Overlay - Static */}
      <div className="absolute bottom-12 left-12 right-12 z-20">
        <motion.div
          initial={!hasAnimated.current ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glassmorphic rounded-2xl p-6 text-center"
        >
          <h3 className="text-xl font-semibold text-brand-green-800 mb-2">
            Take Your Time
          </h3>
          <p className="text-brand-green-700/80 text-sm leading-relaxed">
            Answer honestly and thoughtfully. There are no right or wrong answers - 
            this is about understanding yourself better.
          </p>
        </motion.div>
      </div>
    </div>
  )
})

StaticIllustrationPanel.displayName = 'StaticIllustrationPanel'

// Dynamic question form component - isolated from static content
interface DynamicQuestionFormProps {
  question: AssessmentQuestion
  value: number | string | null
  onChange: (value: number | string) => void
  questionNumber: number
  totalQuestions: number
}

const DynamicQuestionForm = memo(({
  question,
  value,
  onChange,
  questionNumber,
  totalQuestions
}: DynamicQuestionFormProps) => {
  // Memoized progress calculation
  const progress = useMemo(() => (questionNumber / totalQuestions) * 100, [questionNumber, totalQuestions])
  
  // Memoized option change handler
  const handleOptionChange = useCallback((optionValue: number | string) => {
    onChange(optionValue)
  }, [onChange])

  // Memoized question input renderer
  const renderQuestionInput = useCallback(() => {
    switch (question.type) {
      case 'likert-5':
        return (
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-zinc-700 mb-6">
              <span className="font-semibold">Strongly Disagree</span>
              <span className="font-semibold">Strongly Agree</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map((optionValue) => (
                <motion.button
                  key={optionValue}
                  onClick={() => handleOptionChange(optionValue)}
                  className={`h-16 rounded-xl border-2 transition-all duration-300 font-semibold text-lg ${
                    value === optionValue
                      ? 'bg-gradient-to-br from-brand-green-600 to-brand-green-700 border-brand-green-500 text-white shadow-lg'
                      : 'bg-white/80 border-zinc-300 text-zinc-700 hover:border-brand-green-400 hover:bg-brand-green-50 hover:text-brand-green-800'
                  }`}
                  style={value === optionValue ? {
                    backgroundColor: '#1f3d42',
                    borderColor: '#1f3d42',
                    color: '#ffffff',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  } : {}}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {optionValue + 1}
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'likert-6':
        return (
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-zinc-700 mb-6">
              <span className="font-semibold">At no time</span>
              <span className="font-semibold">All of the time</span>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {[0, 1, 2, 3, 4, 5].map((optionValue) => (
                <motion.button
                  key={optionValue}
                  onClick={() => handleOptionChange(optionValue)}
                  className={`h-16 rounded-xl border-2 transition-all duration-300 font-semibold text-lg ${
                    value === optionValue
                      ? 'bg-gradient-to-br from-brand-green-600 to-brand-green-700 border-brand-green-500 text-white shadow-lg'
                      : 'bg-white/80 border-zinc-300 text-zinc-700 hover:border-brand-green-400 hover:bg-brand-green-50 hover:text-brand-green-800'
                  }`}
                  style={value === optionValue ? {
                    backgroundColor: '#1f3d42',
                    borderColor: '#1f3d42',
                    color: '#ffffff',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  } : {}}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {optionValue + 1}
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'likert-7':
        return (
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-zinc-700 mb-6">
              <span className="font-semibold">Strongly Disagree</span>
              <span className="font-semibold">Strongly Agree</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((optionValue) => (
                <motion.button
                  key={optionValue}
                  onClick={() => handleOptionChange(optionValue)}
                  className={`h-14 rounded-lg border-2 transition-all duration-300 font-semibold ${
                    value === optionValue
                      ? 'bg-gradient-to-br from-brand-green-600 to-brand-green-700 border-brand-green-500 text-white shadow-lg'
                      : 'bg-white/80 border-zinc-300 text-zinc-700 hover:border-brand-green-400 hover:bg-brand-green-50 hover:text-brand-green-800'
                  }`}
                  style={value === optionValue ? {
                    backgroundColor: '#1f3d42',
                    borderColor: '#1f3d42',
                    color: '#ffffff',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  } : {}}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {optionValue + 1}
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'frequency':
        const frequencyOptions = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        return (
          <div className="space-y-3">
            {frequencyOptions.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleOptionChange(index)}
                className={`w-full p-5 rounded-xl border-2 transition-all duration-300 text-left font-medium ${
                  value === index
                    ? 'bg-gradient-to-r from-brand-green-100 to-brand-green-200 border-brand-green-400 text-brand-green-800 shadow-md'
                    : 'bg-white/80 border-zinc-300 text-zinc-700 hover:border-brand-green-400 hover:bg-brand-green-50 hover:text-brand-green-800'
                }`}
                style={value === index ? {
                  backgroundColor: 'rgba(31, 61, 66, 0.1)',
                  borderColor: '#1f3d42',
                  color: '#1f3d42'
                } : {}}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                    value === index ? 'bg-brand-green-600 border-brand-green-600' : 'border-zinc-400'
                  }`}>
                    {value === index && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )

      case 'yes-no':
        return (
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => handleOptionChange('yes')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 font-semibold text-lg ${
                value === 'yes'
                  ? 'bg-brand-green-600 border-brand-green-500 text-white shadow-lg'
                  : 'bg-white/80 border-zinc-300 text-zinc-700 hover:border-brand-green-400 hover:bg-brand-green-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Yes
            </motion.button>
            <motion.button
              onClick={() => handleOptionChange('no')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 font-semibold text-lg ${
                value === 'no'
                  ? 'bg-brand-green-600 border-brand-green-500 text-white shadow-lg'
                  : 'bg-white/80 border-zinc-300 text-zinc-700 hover:border-brand-green-400 hover:bg-brand-green-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              No
            </motion.button>
          </div>
        )

      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleOptionChange(index)}
                className={`w-full p-5 rounded-xl border-2 transition-all duration-300 text-left font-medium ${
                  value === index
                    ? 'bg-brand-green-100 border-brand-green-400 text-brand-green-800 shadow-md'
                    : 'bg-white/80 border-zinc-300 text-zinc-700 hover:border-brand-green-400 hover:bg-brand-green-50'
                }`}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        )

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-zinc-600 mb-4">
              <span>Not at all</span>
              <span>Extremely</span>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: 10 }, (_, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleOptionChange(i + 1)}
                  className={`h-12 rounded-lg border-2 transition-all duration-300 font-semibold ${
                    value === i + 1
                      ? 'bg-brand-green-600 border-brand-green-500 text-white shadow-lg'
                      : 'bg-white/80 border-zinc-300 text-zinc-700 hover:border-brand-green-400 hover:bg-brand-green-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {i + 1}
                </motion.button>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <p className="text-zinc-500">Question type not supported</p>
          </div>
        )
    }
  }, [question.type, question.options, value, handleOptionChange])

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 lg:px-12">
      {/* Mobile Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-green-300/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          {/* Progress Section */}
          <div className="mb-8">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span 
                  className="material-symbols-outlined text-2xl"
                  style={{ color: '#1f3d42' }}
                >
                  quiz
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">Assessment Progress</h2>
                  <p className="text-sm text-zinc-600">Question {questionNumber} of {totalQuestions}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-brand-green-700">{Math.round(progress)}%</div>
                <div className="text-xs text-zinc-600">Complete</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-zinc-200/50 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-green-600 to-brand-green-700 rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Question Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-green-100 to-brand-green-200 rounded-xl flex items-center justify-center">
                <span 
                  className="material-symbols-outlined text-xl"
                  style={{ color: '#1f3d42' }}
                >
                  psychology
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-zinc-900 leading-relaxed mb-1">
                  {question.text}
                </h3>
                {question.category && (
                  <span className="inline-block px-3 py-1 bg-brand-green-100/50 text-brand-green-700 text-xs font-medium rounded-full capitalize">
                    {question.category.replace('-', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Question Input */}
          <div className="mb-8">
            {renderQuestionInput()}
          </div>

          {/* Helper Text */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-3 bg-brand-green-50/50 text-brand-green-700 rounded-xl border border-brand-green-200/50">
              <span 
                className="material-symbols-outlined text-lg"
                style={{ color: '#1f3d42' }}
              >
                lightbulb
              </span>
              <span className="text-sm font-medium">Take your time. There's no rush to answer.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function to optimize re-renders
  return (
    prevProps.question.id === nextProps.question.id &&
    prevProps.value === nextProps.value &&
    prevProps.questionNumber === nextProps.questionNumber &&
    prevProps.totalQuestions === nextProps.totalQuestions
  )
})

DynamicQuestionForm.displayName = 'DynamicQuestionForm'

export const AssessmentQuestionComponent = memo(({
  question,
  value,
  onChange,
  questionNumber,
  totalQuestions
}: AssessmentQuestionProps) => {
  // Memoized onChange handler to prevent unnecessary re-renders
  const memoizedOnChange = useCallback((newValue: number | string) => {
    onChange(newValue)
  }, [onChange])

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100 flex">
      {/* Left Side - Completely Static Illustration Panel */}
      <StaticIllustrationPanel />

      {/* Right Side - Dynamic Question Form */}
      <DynamicQuestionForm
        question={question}
        value={value}
        onChange={memoizedOnChange}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
      />
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for optimal performance
  return (
    prevProps.question.id === nextProps.question.id &&
    prevProps.value === nextProps.value &&
    prevProps.questionNumber === nextProps.questionNumber &&
    prevProps.totalQuestions === nextProps.totalQuestions &&
    prevProps.onChange === nextProps.onChange
  )
})

AssessmentQuestionComponent.displayName = 'AssessmentQuestionComponent'

export default AssessmentQuestionComponent
