/**
 * Assessment Question Component
 * Handles different question types with glassmorphic styling
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AssessmentQuestion } from '@/data/assessments'
import { glassStyles, glassVariants } from '@/styles/glassmorphic-design-system'

interface AssessmentQuestionProps {
  question: AssessmentQuestion
  value: number | string | null
  onChange: (value: number | string) => void
  questionNumber: number
  totalQuestions: number
}

export function AssessmentQuestionComponent({
  question,
  value,
  onChange,
  questionNumber,
  totalQuestions
}: AssessmentQuestionProps) {
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'likert-5':
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map((optionValue) => (
                <motion.button
                  key={optionValue}
                  onClick={() => onChange(optionValue)}
                  className={`h-12 rounded-xl backdrop-blur-xl border transition-all duration-300 ${
                    value === optionValue
                      ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-700'
                      : 'bg-white/10 border-white/20 text-gray-600 hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {optionValue + 1}
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'likert-7':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-7 gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((optionValue) => (
                <motion.button
                  key={optionValue}
                  onClick={() => onChange(optionValue)}
                  className={`h-12 rounded-lg backdrop-blur-xl border transition-all duration-300 ${
                    value === optionValue
                      ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-700'
                      : 'bg-white/10 border-white/20 text-gray-600 hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {optionValue + 1}
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'yes-no':
        return (
          <div className="flex gap-4 mt-6">
            <motion.button
              onClick={() => onChange('yes')}
              className={`flex-1 py-4 px-6 rounded-xl backdrop-blur-xl border transition-all duration-300 ${
                value === 'yes'
                  ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-700'
                  : 'bg-white/10 border-white/20 text-gray-600 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Yes
            </motion.button>
            <motion.button
              onClick={() => onChange('no')}
              className={`flex-1 py-4 px-6 rounded-xl backdrop-blur-xl border transition-all duration-300 ${
                value === 'no'
                  ? 'bg-red-500/30 border-red-400/50 text-red-700'
                  : 'bg-white/10 border-white/20 text-gray-600 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              No
            </motion.button>
          </div>
        )

      case 'frequency':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => onChange(index)}
                className={`w-full p-4 rounded-xl backdrop-blur-xl border transition-all duration-300 text-left ${
                  value === index
                    ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-700'
                    : 'bg-white/10 border-white/20 text-gray-600 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        )

      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => onChange(option)}
                className={`w-full p-4 rounded-xl backdrop-blur-xl border transition-all duration-300 text-left ${
                  value === option
                    ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-700'
                    : 'bg-white/10 border-white/20 text-gray-600 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        )

      default:
        return (
          <div className="text-center text-gray-500 mt-6">
            Question type not supported yet
          </div>
        )
    }
  }

  return (
    <motion.div
      className={`${glassVariants.panelSizes.medium} ${glassVariants.panelSizes.medium}`}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          Question {questionNumber} of {totalQuestions}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < questionNumber - 1 ? 'bg-emerald-500' :
                i === questionNumber - 1 ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question text */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 leading-relaxed">
          {question.text}
        </h3>
        {question.category && (
          <div className="mt-2">
            <span className="inline-block px-2 py-1 bg-gray-100/50 text-gray-600 text-xs rounded-full capitalize">
              {question.category.replace('-', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Question input */}
      {renderQuestionInput()}

      {/* Helper text */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        Take your time. There's no rush to answer.
      </div>
    </motion.div>
  )
}

export default AssessmentQuestionComponent
