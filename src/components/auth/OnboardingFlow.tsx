'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Ear, Users, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user, refreshProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Onboarding data
  const [initialMood, setInitialMood] = useState<number | null>(null)
  const [preferredMode, setPreferredMode] = useState<'therapist' | 'friend' | 'both'>('both')
  const [emotionalCapacity, setEmotionalCapacity] = useState<'low' | 'medium' | 'high'>('medium')

  const moods = [
    { emoji: '😢', label: 'Very Sad', value: 1 },
    { emoji: '😔', label: 'Sad', value: 2 },
    { emoji: '😕', label: 'Down', value: 3 },
    { emoji: '😐', label: 'Neutral', value: 4 },
    { emoji: '🙂', label: 'Okay', value: 5 },
    { emoji: '😊', label: 'Good', value: 6 },
    { emoji: '😄', label: 'Happy', value: 7 },
    { emoji: '😁', label: 'Very Happy', value: 8 },
    { emoji: '🤩', label: 'Excited', value: 9 },
    { emoji: '🥳', label: 'Euphoric', value: 10 },
  ]

  const handleComplete = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Update user profile with onboarding data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          preferred_mode: preferredMode,
          emotional_capacity: emotionalCapacity,
          last_active: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Create initial mood entry
      if (initialMood) {
        const { error: moodError } = await supabase
          .from('mood_entries')
          .insert({
            user_id: user.id,
            mood_score: initialMood,
            emotional_capacity: emotionalCapacity,
            seeking_support: false,
            willing_to_listen: true,
          })

        if (moodError) throw moodError
      }

      await refreshProfile()
      onComplete()
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true // Welcome step
      case 2: return initialMood !== null
      case 3: return preferredMode !== null
      case 4: return emotionalCapacity !== null
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Background gradients matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl" />

      <div className="w-full max-w-2xl relative">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">
              Step {currentStep} of 4
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / 4) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-white/30 backdrop-blur-sm rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-primary to-accent h-3 rounded-full shadow-sm"
              initial={{ width: '25%' }}
              animate={{ width: `${(currentStep / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Heart className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-4xl font-light text-foreground mb-4">
                Welcome to EmotionEconomy!
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto font-light">
                Let's set up your profile so we can provide you with the best emotional support experience.
              </p>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 max-w-md mx-auto shadow-lg">
                <h3 className="font-medium text-foreground mb-4">What you'll get:</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">10 starting empathy credits</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Personalized matching</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Burnout protection</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Initial Mood */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                How are you feeling today?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                This helps us understand your current emotional state
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setInitialMood(mood.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      initialMood === mood.value
                        ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{mood.emoji}</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {mood.label}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Preferred Mode */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                How do you prefer to help others?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Choose your preferred listening style
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <button
                  onClick={() => setPreferredMode('therapist')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    preferredMode === 'therapist'
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <Ear className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Therapist Mode</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Structured, professional listening with guidance
                  </p>
                </button>

                <button
                  onClick={() => setPreferredMode('friend')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    preferredMode === 'friend'
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Friend Mode</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Casual, peer-to-peer emotional support
                  </p>
                </button>

                <button
                  onClick={() => setPreferredMode('both')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    preferredMode === 'both'
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Both</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Flexible approach based on the situation
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Emotional Capacity */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                What's your emotional capacity right now?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                This helps us protect you from burnout
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {[
                  { value: 'low', label: 'Low', description: 'I need support more than I can give', color: 'red' },
                  { value: 'medium', label: 'Medium', description: 'I can give and receive in balance', color: 'yellow' },
                  { value: 'high', label: 'High', description: 'I have lots of energy to help others', color: 'green' },
                ].map((capacity) => (
                  <button
                    key={capacity.value}
                    onClick={() => setEmotionalCapacity(capacity.value as any)}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      emotionalCapacity === capacity.value
                        ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      capacity.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                      capacity.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      <div className={`w-6 h-6 rounded-full ${
                        capacity.color === 'red' ? 'bg-red-500' :
                        capacity.color === 'yellow' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {capacity.label} Capacity
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {capacity.description}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={nextStep}
            disabled={!canProceed() || loading}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {loading ? (
              'Setting up...'
            ) : currentStep === 4 ? (
              'Complete Setup'
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
