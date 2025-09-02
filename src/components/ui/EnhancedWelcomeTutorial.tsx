'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Shield, Users, Sparkles, ArrowRight, ArrowLeft, CheckCircle, Star, Home, MessageCircle, Brain, Wallet } from 'lucide-react'

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
    title: 'Welcome to Your Safe Space',
    description: 'Where healing begins with compassion',
    icon: 'waving_hand',
    position: 'center',
    content: (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-green-400 to-brand-green-600 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-800">Welcome to Your Safe Space! 🌱</h2>
        <p className="text-secondary-600 leading-relaxed max-w-md mx-auto">
          This is a place where your heart can rest, your feelings are honored, and healing happens at your own pace. 
          You're not alone here—every step you take matters.
        </p>
        <div className="bg-gradient-to-r from-brand-green-50 to-blue-50 rounded-2xl p-4">
          <p className="text-sm text-secondary-700 leading-relaxed">
            <strong>Remember:</strong> There's no pressure here. Take your time, be gentle with yourself, 
            and know that every emotion you feel is valid. 💙
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'empathy-system',
    title: 'The Heart of Our Community',
    description: 'How giving and receiving support works',
    icon: 'volunteer_activism',
    position: 'center',
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-green-400 to-brand-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-secondary-800 mb-2">Empathy Credits</h3>
          <p className="text-secondary-600">A gentle system that honors both giving and receiving</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-2xl p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-green-800 mb-1">Earn Credits</h4>
            <p className="text-sm text-green-700">By listening with compassion and offering gentle support</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-blue-800 mb-1">Spend Credits</h4>
            <p className="text-sm text-blue-700">To receive compassionate support when you need it</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-brand-green-50 to-blue-50 rounded-2xl p-4">
          <p className="text-sm text-secondary-700 leading-relaxed">
            <strong>How it works:</strong> Start with 10 free credits. When you listen to others with an open heart, 
            you earn more credits. When you need support, you can use credits to connect with someone who cares. 
            It's a beautiful cycle of mutual care and understanding. 🤝
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'daily-checkins',
    title: 'Gentle Daily Check-ins',
    description: 'Honor your feelings with compassion',
    icon: 'sentiment_satisfied',
    position: 'center',
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-secondary-800 mb-2">Daily Check-ins</h3>
          <p className="text-secondary-600">A gentle way to honor your emotional journey</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white">💙</span>
            </div>
            <div>
              <div className="font-semibold text-secondary-800">Honor Your Feelings</div>
              <div className="text-sm text-secondary-600">Use our gentle slider to express how your heart feels today</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white">✍️</span>
            </div>
            <div>
              <div className="font-semibold text-secondary-800">Share Your Thoughts</div>
              <div className="text-sm text-secondary-600">Write about what's on your heart - completely private and safe</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-secondary-800">Gentle Insights</div>
              <div className="text-sm text-secondary-600">Receive compassionate suggestions based on your current needs</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-sm text-blue-700 leading-relaxed">
            <strong>Gentle reminder:</strong> Daily check-ins help you stay connected to your emotional well-being. 
            There's no pressure to be "perfect" - just honest and kind to yourself. 🌟
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'sessions',
    title: 'Compassionate Support Sessions',
    description: 'Connect with hearts that understand',
    icon: 'chat',
    position: 'center',
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-secondary-800 mb-2">Support Sessions</h3>
          <p className="text-secondary-600">Real conversations with real hearts that care</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-purple-50 rounded-2xl p-4">
            <h4 className="font-semibold text-purple-800 mb-2">How Sessions Work</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Choose to listen with compassion or receive gentle support</li>
              <li>• Get matched with someone who understands your heart</li>
              <li>• Have a private, confidential conversation</li>
              <li>• Earn credits by listening, spend credits to be heard</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-2xl p-4">
            <h4 className="font-semibold text-green-800 mb-2">What You'll Experience</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Feel truly heard and validated</li>
              <li>• Gain gentle perspectives and insights</li>
              <li>• Build meaningful, compassionate connections</li>
              <li>• Learn gentle coping strategies</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-amber-800">Your Safety Matters</span>
          </div>
          <p className="text-sm text-amber-700">
            All conversations are completely confidential. You can choose to remain anonymous,
            and professional support is always available through our crisis resources.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'safety-privacy',
    title: 'Your Safety & Privacy',
    description: 'Protected with love and care',
    icon: 'verified_user',
    position: 'center',
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-secondary-800 mb-2">Your Safety First</h3>
          <p className="text-secondary-600">Built with love, privacy, and deep care for your well-being</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mt-1">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-secondary-800">Complete Privacy</div>
              <div className="text-sm text-secondary-600">Your conversations and personal information are always protected with care</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mt-1">
              <span className="text-white">📢</span>
            </div>
            <div>
              <div className="font-semibold text-secondary-800">Gentle Reporting</div>
              <div className="text-sm text-secondary-600">Easily report any concerns or get immediate compassionate help</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mt-1">
              <span className="text-white">🆘</span>
            </div>
            <div>
              <div className="font-semibold text-secondary-800">Crisis Support</div>
              <div className="text-sm text-secondary-600">24/7 access to professional crisis support and emergency resources</div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-red-600">⚠️</span>
            <span className="font-semibold text-red-800">Emergency Situations</span>
          </div>
          <p className="text-sm text-red-700 mb-3">
            If you're experiencing a mental health crisis or having thoughts of self-harm,
            please contact emergency services immediately. You matter, and help is available.
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
    title: 'Ready to Begin Your Journey',
    description: 'Your healing path starts with love',
    icon: 'rocket_launch',
    position: 'center',
    content: (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-green-400 to-brand-green-600 rounded-full flex items-center justify-center mx-auto">
          <Star className="w-10 h-10 text-white" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-secondary-800 mb-2">You're Ready to Begin! 🌟</h2>
          <p className="text-secondary-600 max-w-md mx-auto">
            Remember, healing is a gentle journey, not a race. Be patient and kind with yourself,
            and know that every small step you take is a beautiful act of self-love.
          </p>
        </div>

        <div className="bg-gradient-to-r from-brand-green-50 to-blue-50 rounded-2xl p-6">
          <h3 className="font-semibold text-secondary-800 mb-3">Your Gentle Start</h3>
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 bg-brand-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Take a gentle check-in with your heart</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 bg-brand-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Explore your personalized wellness space</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 bg-brand-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Connect with a compassionate listener</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-sm text-green-700 leading-relaxed">
            <strong>Remember:</strong> You're not alone in this journey. Every member of our community
            started exactly where you are now. Take it one gentle step at a time, and know that your heart is safe here. 🌱
          </p>
        </div>
      </div>
    )
  }
]

interface EnhancedWelcomeTutorialProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
}

export function EnhancedWelcomeTutorial({ isOpen, onClose, onComplete }: EnhancedWelcomeTutorialProps) {
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
                <div className="w-10 h-10 bg-brand-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">
                    {currentTutorialStep.icon === 'waving_hand' ? '👋' :
                     currentTutorialStep.icon === 'volunteer_activism' ? '🤝' :
                     currentTutorialStep.icon === 'sentiment_satisfied' ? '💙' :
                     currentTutorialStep.icon === 'chat' ? '💬' :
                     currentTutorialStep.icon === 'verified_user' ? '🛡️' :
                     currentTutorialStep.icon === 'rocket_launch' ? '🚀' : '💙'}
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
                  <span className="text-xl">✕</span>
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
                  className="bg-gradient-to-r from-brand-green-400 to-brand-green-600 h-2 rounded-full"
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
                <div className="w-16 h-16 bg-gradient-to-br from-brand-green-400 to-brand-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-800 mb-2">Welcome to Your Journey! 🌟</h2>
                <p className="text-secondary-600">Your safe space is ready, and your heart is welcome here</p>
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
                          ? 'bg-brand-green-500 w-6'
                          : index < currentStep
                          ? 'bg-brand-green-300'
                          : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  onClick={handleNext}
                  className="px-6 py-2 text-white font-medium rounded-xl shadow-lg transition-all duration-300"
                  style={{ 
                    background: 'linear-gradient(to right, #335f64, #2a4f54)',
                    boxShadow: '0 10px 15px -3px rgba(51, 95, 100, 0.3)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {currentStep === tutorialSteps.length - 1 ? 'Begin Your Journey' : 'Next'}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
