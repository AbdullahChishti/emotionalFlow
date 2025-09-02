'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SessionCompletionScreenProps {
  sessionData: {
    duration: number
    messageCount: number
    initialMood: string
    finalMood: string
    creditsEarned: number
    matchedUser: { name: string }
  }
  onComplete: (feedback: SessionFeedback) => void
  onClose: () => void
}

interface SessionFeedback {
  rating: number
  helpfulness: number
  wouldRecommend: boolean
  insights: string
  nextSteps: string[]
}

const SessionCompletionScreen = ({ sessionData, onComplete, onClose }: SessionCompletionScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [feedback, setFeedback] = useState<SessionFeedback>({
    rating: 0,
    helpfulness: 0,
    wouldRecommend: false,
    insights: '',
    nextSteps: []
  })

  const steps = [
    { id: 'summary', title: 'Session Summary', icon: 'analytics' },
    { id: 'feedback', title: 'Your Feedback', icon: 'star' },
    { id: 'insights', title: 'Key Insights', icon: 'lightbulb' },
    { id: 'next-steps', title: 'Next Steps', icon: 'arrow_forward' }
  ]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleRating = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }))
  }

  const handleHelpfulness = (helpfulness: number) => {
    setFeedback(prev => ({ ...prev, helpfulness }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(feedback)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      onClose()
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Summary
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-white">check_circle</span>
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 mb-2">Session Complete!</h2>
              <p className="text-secondary-600">Here's how your session went</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">{formatTime(sessionData.duration)}</div>
                <div className="text-sm text-secondary-600">Duration</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{sessionData.messageCount}</div>
                <div className="text-sm text-secondary-600">Messages</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{sessionData.creditsEarned}</div>
                <div className="text-sm text-secondary-600">Credits Earned</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{sessionData.matchedUser.name}</div>
                <div className="text-sm text-secondary-600">Your Listener</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-4">
              <h3 className="font-semibold text-secondary-800 mb-2">Mood Journey</h3>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-lg mb-1">Started</div>
                  <div className="text-2xl">{sessionData.initialMood}</div>
                </div>
                <div className="flex-1 px-4">
                  <div className="h-1 bg-primary-200 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg mb-1">Ended</div>
                  <div className="text-2xl">{sessionData.finalMood}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 1: // Feedback
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-secondary-800 mb-2">How was your experience?</h2>
              <p className="text-secondary-600">Your feedback helps us improve</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Overall Rating
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      onClick={() => handleRating(star)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        feedback.rating >= star
                          ? 'bg-yellow-400 text-white shadow-lg'
                          : 'bg-white/60 text-secondary-400 hover:bg-yellow-100'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span className="material-symbols-outlined">star</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  How helpful was this session?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 1, label: 'Not helpful', color: 'bg-red-100 text-red-700' },
                    { value: 2, label: 'Somewhat helpful', color: 'bg-orange-100 text-orange-700' },
                    { value: 3, label: 'Helpful', color: 'bg-yellow-100 text-yellow-700' },
                    { value: 4, label: 'Very helpful', color: 'bg-green-100 text-green-700' },
                    { value: 5, label: 'Extremely helpful', color: 'bg-emerald-100 text-emerald-700' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleHelpfulness(option.value)}
                      className={`w-full p-3 rounded-xl text-left transition-all duration-300 ${
                        feedback.helpfulness === option.value
                          ? `${option.color} border-2 border-current shadow-md`
                          : 'bg-white/60 hover:bg-white/80'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={feedback.wouldRecommend}
                    onChange={(e) => setFeedback(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                    className="rounded border-secondary-300"
                  />
                  <span className="text-sm font-medium text-secondary-700">
                    I would recommend this service to others
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        )

      case 2: // Insights
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-secondary-800 mb-2">Key Insights</h2>
              <p className="text-secondary-600">What did you learn or discover?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Share your key takeaways (optional)
              </label>
              <textarea
                value={feedback.insights}
                onChange={(e) => setFeedback(prev => ({ ...prev, insights: e.target.value }))}
                placeholder="What insights did you gain? How did this session help you?"
                className="w-full h-32 p-4 bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all duration-300 resize-none text-secondary-800 placeholder:text-secondary-400"
                rows={4}
              />
            </div>

            <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-blue-600">info</span>
                <span className="font-semibold text-blue-800">Pro Tip</span>
              </div>
              <p className="text-blue-700 text-sm">
                Reflecting on your sessions helps track your emotional growth over time.
                Your insights are private and only used to improve your experience.
              </p>
            </div>
          </motion.div>
        )

      case 3: // Next Steps
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-secondary-800 mb-2">What's Next?</h2>
              <p className="text-secondary-600">Choose your next steps for continued growth</p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'check-in', label: 'Daily Check-in', icon: 'sentiment_satisfied', desc: 'Track your mood and get recommendations' },
                { id: 'meditation', label: 'Guided Meditation', icon: 'self_improvement', desc: 'Find peace and clarity' },
                { id: 'journal', label: 'Journal Entry', icon: 'edit_note', desc: 'Process your thoughts and feelings' },
                { id: 'dashboard', label: 'View Progress', icon: 'analytics', desc: 'See your emotional journey' }
              ].map((step) => (
                <motion.button
                  key={step.id}
                  onClick={() => setFeedback(prev => ({
                    ...prev,
                    nextSteps: feedback.nextSteps.includes(step.id)
                      ? feedback.nextSteps.filter(s => s !== step.id)
                      : [...feedback.nextSteps, step.id]
                  }))}
                  className={`w-full p-4 rounded-2xl text-left transition-all duration-300 ${
                    feedback.nextSteps.includes(step.id)
                      ? 'bg-primary-100 border-2 border-primary-300 shadow-md'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl">
                      {step.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-secondary-800">{step.label}</div>
                      <div className="text-sm text-secondary-600">{step.desc}</div>
                    </div>
                    {feedback.nextSteps.includes(step.id) && (
                      <span className="material-symbols-outlined text-primary-600">check_circle</span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="bg-green-50/80 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-green-600">celebration</span>
                <span className="font-semibold text-green-800">Great job!</span>
              </div>
              <p className="text-green-700 text-sm">
                Taking these next steps will help maintain and build upon the progress you made in this session.
              </p>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-xl flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 max-w-lg w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header with Steps */}
        <div className="p-6 border-b border-white/50">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white/60 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-primary-500 text-white'
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-white/60 text-secondary-400'
                  }`}
                >
                  {index < currentStep ? (
                    <span className="material-symbols-outlined text-xs">check</span>
                  ) : (
                    index + 1
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/60 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-lg font-bold text-secondary-800">
              {steps[currentStep].title}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/50">
          <motion.button
            onClick={handleNext}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {currentStep === steps.length - 1 ? 'Complete & Continue' : 'Next'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export { SessionCompletionScreen }
export type { SessionFeedback }
