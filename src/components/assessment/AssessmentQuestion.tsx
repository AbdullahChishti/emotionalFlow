/**
 * Assessment Question Component - Optimized for Zero Flickering
 * Handles different question types with completely isolated static and dynamic components
 */

'use client'

import React, { memo, useCallback, useMemo } from 'react'
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
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((optionValue) => (
                <motion.button
                  key={optionValue}
                  onClick={() => handleOptionChange(optionValue)}
                  className={`h-14 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    value === optionValue
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
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
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>At no time</span>
              <span>All of the time</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {[0, 1, 2, 3, 4, 5].map((optionValue) => (
                <motion.button
                  key={optionValue}
                  onClick={() => handleOptionChange(optionValue)}
                  className={`h-12 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    value === optionValue
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
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
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((optionValue) => (
                <motion.button
                  key={optionValue}
                  onClick={() => handleOptionChange(optionValue)}
                  className={`h-12 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    value === optionValue
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
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
                className={`w-full p-4 rounded-lg border transition-all duration-200 text-left text-sm font-medium ${
                  value === index
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  <span className={`inline-block w-2 h-2 rounded-full ${value === index ? 'bg-white' : 'bg-slate-300'}`} />
                </div>
              </motion.button>
            ))}
          </div>
        )

      case 'yes-no':
        return (
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => handleOptionChange('yes')}
              className={`p-4 rounded-lg border transition-all duration-200 font-medium ${
                value === 'yes'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Yes
            </motion.button>
            <motion.button
              onClick={() => handleOptionChange('no')}
              className={`p-4 rounded-lg border transition-all duration-200 font-medium ${
                value === 'no'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
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
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Not at all</span>
              <span>Extremely</span>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: 10 }, (_, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleOptionChange(i + 1)}
                  className={`h-10 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    value === i + 1
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
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
    <div className="w-full flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-slate-200 rounded-2xl p-6"
        >
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600">Question {questionNumber} of {totalQuestions}</div>
              <div className="text-sm font-medium text-slate-900">{Math.round(progress)}%</div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-slate-900 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 text-center">
              {question.text}
            </h3>
            {question.category && (
              <div className="mt-3 text-center">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-slate-200 bg-white text-slate-700 capitalize">
                  {question.category.replace('-', ' ')}
                </span>
              </div>
            )}
          </div>

          {/* Inputs */}
          <div className="mb-2">
            {renderQuestionInput()}
          </div>

          {/* Helper */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Answer honestly. There are no right or wrong answers.
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
    <div className="min-h-screen bg-white flex items-center justify-center">
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
