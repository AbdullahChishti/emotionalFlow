'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TutorialStep {
  id: string
  title: string
  description: string
  icon: string
  content: React.ReactNode
  position?: 'center' | 'top' | 'bottom'
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to MindWell',
    description: 'Your journey to emotional wellness starts here',
    icon: 'waving_hand',
    position: 'center',
    content: (
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl text-white">psychology</span>
        </div>
        <h2 className="text-2xl font-bold text-secondary-800">Welcome to MindWell! 🌱</h2>
        <p className="text-secondary-600 leading-relaxed max-w-md mx-auto">
          MindWell is a safe space where emotional support flows both ways. You can share your feelings,
          listen to others, and grow together in a compassionate community.
        </p>
      </div>
    )
  },
  {
    id: 'empathy-system',
    title: 'The Empathy Credit System',
    description: 'How giving and receiving support works',
    icon: 'volunteer_activism',
    position: 'center',
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-white">account_balance_wallet</span>
          </div>
          <h3 className="text-xl font-bold text-secondary-800 mb-2">Empathy Credits</h3>
          <p className="text-secondary-600">Our unique system encourages reciprocal emotional support</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-2xl text-green-600 mb-2 block">arrow_upward</span>
            <h4 className="font-semibold text-green-800 mb-1">Earn Credits</h4>
            <p className="text-sm text-green-700">By listening and supporting others</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-2xl text-blue-600 mb-2 block">arrow_downward</span>
            <h4 className="font-semibold text-blue-800 mb-1">Spend Credits</h4>
            <p className="text-sm text-blue-700">To receive support from the community</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-4">
          <p className="text-sm text-secondary-700 leading-relaxed">
            <strong>How it works:</strong> Start with 10 free credits. Listen to others to earn more credits,
            then use them to have someone listen to you. It's a beautiful cycle of giving and receiving support! 🤝
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'daily-checkins',
    title: 'Daily Emotional Check-ins',
    description: 'Track your mood and get personalized insights',
    icon: 'sentiment_satisfied',
    position: 'center',
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-white">calendar_today</span>
          </div>
          <h3 className="text-xl font-bold text-secondary-800 mb-2">Daily Check-ins</h3>
          <p className="text-secondary-600">Build emotional awareness through consistent self-reflection</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
            <span className="material-symbols-outlined text-primary-600">mood</span>
            <div>
              <div className="font-semibold text-secondary-800">Rate Your Mood</div>
              <div className="text-sm text-secondary-600">Use our intuitive slider to express how you're feeling</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
            <span className="material-symbols-outlined text-primary-600">edit_note</span>
            <div>
              <div className="font-semibold text-secondary-800">Journal Your Thoughts</div>
              <div className="text-sm text-secondary-600">Write about what's on your mind - completely private</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
            <span className="material-symbols-outlined text-primary-600">lightbulb</span>
            <div>
              <div className="font-semibold text-secondary-800">Get Recommendations</div>
              <div className="text-sm text-secondary-600">Receive personalized suggestions based on your mood</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-sm text-blue-700 leading-relaxed">
            <strong>Pro tip:</strong> Consistent daily check-ins help you recognize patterns in your emotional health
            and make positive changes over time. 🌟
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'sessions',
    title: 'Support Sessions',
    description: 'Connect with empathetic listeners',
    icon: 'chat',
    position: 'center',
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-white">chat</span>
          </div>
          <h3 className="text-xl font-bold text-secondary-800 mb-2">Support Sessions</h3>
          <p className="text-secondary-600">Real conversations with real people who care</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-purple-50 rounded-2xl p-4">
            <h4 className="font-semibold text-purple-800 mb-2">How Sessions Work</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Choose to listen or receive support</li>
              <li>• Get matched with someone compatible</li>
              <li>• Have a private, confidential conversation</li>
              <li>• Earn credits by listening, spend credits to talk</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-2xl p-4">
            <h4 className="font-semibold text-green-800 mb-2">Session Benefits</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Feel heard and validated</li>
              <li>• Gain new perspectives</li>
              <li>• Build meaningful connections</li>
              <li>• Learn coping strategies</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-amber-600">info</span>
            <span className="font-semibold text-amber-800">Important</span>
          </div>
          <p className="text-sm text-amber-700">
            All conversations are confidential. You can choose to remain anonymous,
            and professional support is always available through our crisis resources.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'safety-privacy',
    title: 'Safety & Privacy',
    description: 'Your well-being and privacy are our top priorities',
    icon: 'verified_user',
    position: 'center',
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-white">verified_user</span>
          </div>
          <h3 className="text-xl font-bold text-secondary-800 mb-2">Your Safety First</h3>
          <p className="text-secondary-600">Built with compassion, privacy, and care</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
            <span className="material-symbols-outlined text-emerald-600 mt-1">lock</span>
            <div>
              <div className="font-semibold text-secondary-800">Complete Privacy</div>
              <div className="text-sm text-secondary-600">Your conversations and personal information are always protected</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
            <span className="material-symbols-outlined text-emerald-600 mt-1">report</span>
            <div>
              <div className="font-semibold text-secondary-800">Report & Support</div>
              <div className="text-sm text-secondary-600">Easily report inappropriate behavior or get immediate help</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
            <span className="material-symbols-outlined text-emerald-600 mt-1">emergency</span>
            <div>
              <div className="font-semibold text-secondary-800">Crisis Resources</div>
              <div className="text-sm text-secondary-600">24/7 access to professional crisis support and hotlines</div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-red-600">warning</span>
            <span className="font-semibold text-red-800">Emergency Situations</span>
          </div>
          <p className="text-sm text-red-700 mb-3">
            If you're experiencing a mental health crisis or having thoughts of self-harm,
            please contact emergency services immediately.
          </p>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
            View Crisis Resources
          </button>
        </div>
      </div>
    )
  },
  {
    id: 'getting-started',
    title: 'Ready to Begin',
    description: 'Your wellness journey starts now',
    icon: 'rocket_launch',
    position: 'center',
    content: (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl text-white">rocket_launch</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-secondary-800 mb-2">You're All Set! 🚀</h2>
          <p className="text-secondary-600 max-w-md mx-auto">
            Remember, healing is a journey, not a destination. Be patient with yourself,
            and know that every small step counts.
          </p>
        </div>

        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6">
          <h3 className="font-semibold text-secondary-800 mb-3">Quick Start Guide</h3>
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Complete your daily check-in</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Explore the Wellness page</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Start your first session</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-sm text-green-700 leading-relaxed">
            <strong>Remember:</strong> You're not alone in this. Every member of our community
            started exactly where you are now. Take it one day at a time. 🌱
          </p>
        </div>
      </div>
    )
  }
]

interface WelcomeTutorialProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
}

export function WelcomeTutorial({ isOpen, onClose, onComplete }: WelcomeTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)

  const currentTutorialStep = tutorialSteps[currentStep]

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setCompleted(true)
      onComplete?.()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    setCompleted(true)
    onComplete?.()
  }

  useEffect(() => {
    if (completed) {
      // Auto-close after completion
      const timer = setTimeout(() => {
        onClose()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [completed, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-600">
                    {currentTutorialStep.icon}
                  </span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-secondary-800">
                    {currentTutorialStep.title}
                  </h1>
                  <p className="text-sm text-secondary-600">
                    {currentTutorialStep.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSkip}
                  className="text-secondary-500 hover:text-secondary-700 text-sm font-medium"
                >
                  Skip Tutorial
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/60 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-secondary-500 mb-2">
                <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
                <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {completed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-white">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-secondary-800 mb-2">Tutorial Complete! 🎉</h2>
                <p className="text-secondary-600">You're ready to start your wellness journey</p>
              </motion.div>
            ) : (
              currentTutorialStep.content
            )}
          </div>

          {/* Footer */}
          {!completed && (
            <div className="p-6 border-t border-white/50">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                    currentStep === 0
                      ? 'text-secondary-400 cursor-not-allowed'
                      : 'text-secondary-700 hover:bg-white/60'
                  }`}
                >
                  Back
                </button>

                <div className="flex gap-2">
                  {tutorialSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? 'bg-primary-500 w-6'
                          : index < currentStep
                          ? 'bg-primary-300'
                          : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
