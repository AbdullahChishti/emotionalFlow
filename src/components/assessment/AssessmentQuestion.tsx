/**
 * Assessment Question Component
 * Handles different question types with modern, professional styling
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AssessmentQuestion } from '@/data/assessments'

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
  const progress = (questionNumber / totalQuestions) * 100

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'likert-5':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600 mb-6">
              <span className="font-medium">Strongly Disagree</span>
              <span className="font-medium">Strongly Agree</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map((optionValue) => (
                <motion.button
                  key={optionValue}
                  onClick={() => onChange(optionValue)}
                  className={`h-16 rounded-xl border-2 transition-all duration-300 font-semibold text-lg ${
                    value === optionValue
                      ? 'bg-gradient-to-br from-brand-green-500 to-emerald-600 border-brand-green-400 text-white shadow-lg shadow-brand-green-500/25'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-brand-green-300 hover:bg-brand-green-50 hover:text-brand-green-700'
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
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
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600 mb-6">
              <span className="font-medium">Strongly Disagree</span>
              <span className="font-medium">Strongly Agree</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((optionValue) => (
                <motion.button
                  key={optionValue}
                  onClick={() => onChange(optionValue)}
                  className={`h-14 rounded-lg border-2 transition-all duration-300 font-semibold ${
                    value === optionValue
                      ? 'bg-gradient-to-br from-brand-green-500 to-emerald-600 border-brand-green-400 text-white shadow-lg shadow-brand-green-500/25'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-brand-green-300 hover:bg-brand-green-50 hover:text-brand-green-700'
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
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
          <div className="flex gap-6 mt-8">
            <motion.button
              onClick={() => onChange('yes')}
              className={`flex-1 py-6 px-8 rounded-xl border-2 transition-all duration-300 font-semibold text-lg ${
                value === 'yes'
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              ✅ Yes
            </motion.button>
            <motion.button
              onClick={() => onChange('no')}
              className={`flex-1 py-6 px-8 rounded-xl border-2 transition-all duration-300 font-semibold text-lg ${
                value === 'no'
                  ? 'bg-gradient-to-br from-red-500 to-pink-600 border-red-400 text-white shadow-lg shadow-red-500/25'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700'
              }`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              ❌ No
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
                className={`w-full p-5 rounded-xl border-2 transition-all duration-300 text-left font-medium ${
                  value === index
                    ? 'bg-gradient-to-r from-brand-green-100 to-emerald-100 border-brand-green-300 text-brand-green-800 shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-brand-green-300 hover:bg-brand-green-50 hover:text-brand-green-800'
                }`}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {value === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-brand-green-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-sm">✓</span>
                    </motion.div>
                  )}
                </div>
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
                className={`w-full p-5 rounded-xl border-2 transition-all duration-300 text-left font-medium ${
                  value === option
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300 text-blue-800 shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800'
                }`}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {value === option && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-sm">✓</span>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )

      default:
        return (
          <div className="text-center text-gray-500 mt-6 p-8 bg-gray-50 rounded-xl">
            <span className="text-2xl mb-2 block">⚠️</span>
            Question type not supported yet
          </div>
        )
    }
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Progress Section */}
      <div className="mb-8">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className="text-sm font-medium text-brand-green-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-green-500 to-emerald-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < questionNumber - 1 
                  ? 'bg-brand-green-500 scale-110' 
                  : i === questionNumber - 1 
                    ? 'bg-brand-green-600 scale-125 shadow-lg shadow-brand-green-500/50' 
                    : 'bg-gray-300'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: i < questionNumber ? 1 : 0.8 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Question Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-brand-green-600 text-xl">❓</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 leading-relaxed">
              {question.text}
            </h3>
          </div>
          
          {question.category && (
            <div className="inline-block">
              <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm font-medium rounded-full capitalize border border-gray-300">
                {question.category.replace('-', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Question Input */}
        <div className="mb-8">
          {renderQuestionInput()}
        </div>

        {/* Helper Text */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            <span className="text-blue-500">💡</span>
            <span className="text-sm font-medium">Take your time. There's no rush to answer.</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AssessmentQuestionComponent
