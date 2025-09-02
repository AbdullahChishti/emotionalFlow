/**
 * Assessment Results Component
 * Displays interpretation, recommendations, and insights
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Assessment, AssessmentResult } from '@/data/assessments'
import { UserProfile } from '@/data/assessment-integration'
import { glassStyles, glassVariants } from '@/styles/glassmorphic-design-system'

interface AssessmentResultsProps {
  assessment: Assessment
  result: AssessmentResult
  userProfile?: UserProfile
  onRetake: () => void
  onContinue: () => void
}

export function AssessmentResults({
  assessment,
  result,
  userProfile,
  onRetake,
  onContinue
}: AssessmentResultsProps) {
  const [showClinicalView, setShowClinicalView] = useState(false)

  // Get the friendly explanation from user profile
  const getFriendlyExplanation = () => {
    const assessmentId = assessment.id
    if (assessmentId === 'phq9' && userProfile?.currentSymptoms?.depression?.friendlyExplanation) {
      return userProfile.currentSymptoms.depression.friendlyExplanation
    }
    if (assessmentId === 'gad7' && userProfile?.currentSymptoms?.anxiety?.friendlyExplanation) {
      return userProfile.currentSymptoms.anxiety.friendlyExplanation
    }
    if (assessmentId === 'cd-risc' && userProfile?.resilience?.friendlyExplanation) {
      return userProfile.resilience.friendlyExplanation
    }
    if (assessmentId === 'ace' && userProfile?.trauma?.friendlyExplanation) {
      return userProfile.trauma.friendlyExplanation
    }
    return null
  }

  const friendlyExplanation = getFriendlyExplanation()
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'normal':
        return 'from-emerald-500/20 to-green-500/20'
      case 'mild':
        return 'from-yellow-500/20 to-amber-500/20'
      case 'moderate':
        return 'from-orange-500/20 to-red-500/20'
      case 'severe':
        return 'from-red-500/20 to-pink-500/20'
      case 'critical':
        return 'from-red-600/20 to-red-800/20'
      default:
        return 'from-gray-500/20 to-gray-600/20'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'normal':
        return '✅'
      case 'mild':
        return '⚠️'
      case 'moderate':
        return '🟡'
      case 'severe':
        return '🔴'
      case 'critical':
        return '🚨'
      default:
        return 'ℹ️'
    }
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        className={`${glassVariants.panelSizes.large} text-center`}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))`,
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-4">
          <span className="text-4xl">{getSeverityIcon(result.severity)}</span>
        </div>
        <h1 className="text-2xl font-light text-gray-800 mb-2">
          {assessment.title} Results
        </h1>
        <div className="text-6xl font-light text-gray-800 mb-4">
          {result.score}
        </div>
        <div className="text-lg text-gray-700 mb-2">
          {result.level}
        </div>
        <div className="text-sm text-gray-600">
          {result.description}
        </div>
      </motion.div>

      {/* Score Visualization */}
      <motion.div
        className={`${glassVariants.panelSizes.medium}`}
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: `linear-gradient(135deg, ${getSeverityColor(result.severity)}, rgba(255, 255, 255, 0.1))`,
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-medium text-gray-800 mb-4">Score Range</h3>
        <div className="space-y-2">
          {assessment.scoring.ranges.map((range, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg transition-colors ${
                result.score >= range.min && result.score <= range.max
                  ? 'bg-white/30 border border-white/40'
                  : 'bg-white/10'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">{range.label}</span>
                <span className="text-sm text-gray-600">
                  {range.min}-{range.max} points
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {range.description}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        className={`${glassVariants.panelSizes.medium}`}
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
          💡 Recommendations
        </h3>
        <div className="space-y-3">
          {result.recommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3 p-3 bg-white/10 rounded-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <span className="text-emerald-600 mt-1">•</span>
              <span className="text-gray-700">{recommendation}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

        {/* AI-Generated Friendly Explanation */}
  {friendlyExplanation && (
    <motion.div
      className={`${glassVariants.panelSizes.medium}`}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
          🤖 Understanding Your Results
        </h3>
        <motion.button
          onClick={() => setShowClinicalView(!showClinicalView)}
          className="text-sm px-3 py-1 rounded-full bg-gray-100/50 hover:bg-gray-200/50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showClinicalView ? 'Show Friendly' : 'Show Clinical'}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {!showClinicalView ? (
          <motion.div
            key="friendly"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-gradient-to-r from-emerald-50/30 to-blue-50/30 rounded-lg border border-emerald-200/30"
          >
            <div className="flex items-start gap-3">
              <span className="text-emerald-600 mt-1">💚</span>
              <div>
                <p className="text-gray-700 leading-relaxed">{friendlyExplanation}</p>
                <div className="mt-3 text-xs text-gray-500 italic">
                  This explanation was generated with AI to make your results more approachable and supportive.
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="clinical"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 rounded-lg border border-blue-200/30"
          >
            <div className="flex items-start gap-3">
              <span className="text-blue-600 mt-1">📊</span>
              <div>
                <p className="text-gray-700 leading-relaxed">{result.description}</p>
                <div className="mt-3 text-xs text-gray-500 italic">
                  This is the clinical interpretation based on established medical guidelines.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )}

  {/* Key Insights */}
  <motion.div
    className={`${glassVariants.panelSizes.medium}`}
    style={{
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: friendlyExplanation ? 1.0 : 0.8 }}
  >
    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
      🔍 Key Insights
    </h3>
    <div className="space-y-3">
      {result.insights.map((insight, index) => (
        <motion.div
          key={index}
          className="flex items-start gap-3 p-3 bg-blue-50/20 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (friendlyExplanation ? 1.2 : 1.0) + index * 0.1 }}
        >
          <span className="text-blue-600 mt-1">💭</span>
          <span className="text-gray-700">{insight}</span>
        </motion.div>
      ))}
    </div>
  </motion.div>

      {/* Next Steps */}
      <motion.div
        className={`${glassVariants.panelSizes.medium}`}
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
          🚀 Next Steps
        </h3>
        <div className="space-y-3">
          {result.nextSteps.map((step, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3 p-3 bg-emerald-50/20 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + index * 0.1 }}
            >
              <span className="text-emerald-600 mt-1">{index + 1}.</span>
              <span className="text-gray-700">{step}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex gap-4 justify-center pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <motion.button
          onClick={onRetake}
          className="px-6 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-gray-700 hover:bg-white/20 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Retake Assessment
        </motion.button>
        <motion.button
          onClick={onContinue}
          className="px-8 py-3 rounded-xl backdrop-blur-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-700 hover:bg-emerald-500/30 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue to Next Assessment
        </motion.button>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        className="text-center text-sm text-gray-500 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <p>
          This assessment is for informational purposes only and is not a substitute for professional medical advice,
          diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.
        </p>
        <p className="mt-2">
          Source: {assessment.source} • {assessment.citations.join(', ')}
        </p>
      </motion.div>
    </motion.div>
  )
}

export default AssessmentResults
