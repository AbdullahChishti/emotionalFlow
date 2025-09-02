'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Shield, Users, Sparkles, ArrowRight, ArrowLeft, CheckCircle, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import { EnhancedWelcomeTutorial } from '@/components/ui/EnhancedWelcomeTutorial'

interface EnhancedOnboardingFlowProps {
  onComplete: () => void
}

export function EnhancedOnboardingFlow({ onComplete }: EnhancedOnboardingFlowProps) {
  const { user, refreshProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  
  // Enhanced onboarding data
  const [userName, setUserName] = useState('')
  const [currentMood, setCurrentMood] = useState<number | null>(null)
  const [supportPreference, setSupportPreference] = useState<'receive' | 'give' | 'both'>('both')
  const [emotionalCapacity, setEmotionalCapacity] = useState<'low' | 'medium' | 'high'>('medium')
  const [privacyLevel, setPrivacyLevel] = useState<'anonymous' | 'semi-private' | 'open'>('semi-private')

  const moods = [
    { emoji: '😢', label: 'Overwhelmed', value: 1, color: 'from-red-400 to-red-600' },
    { emoji: '😔', label: 'Sad', value: 2, color: 'from-orange-400 to-orange-600' },
    { emoji: '😕', label: 'Down', value: 3, color: 'from-yellow-400 to-yellow-600' },
    { emoji: '😐', label: 'Neutral', value: 4, color: 'from-gray-400 to-gray-600' },
    { emoji: '🙂', label: 'Okay', value: 5, color: 'from-blue-400 to-blue-600' },
    { emoji: '😊', label: 'Good', value: 6, color: 'from-green-400 to-green-600' },
    { emoji: '😄', label: 'Happy', value: 7, color: 'from-emerald-400 to-emerald-600' },
    { emoji: '😁', label: 'Great', value: 8, color: 'from-teal-400 to-teal-600' },
    { emoji: '🥳', label: 'Amazing', value: 9, color: 'from-purple-400 to-purple-600' },
  ]

  const handleComplete = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Update user profile with enhanced onboarding data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: userName.trim() || user.user_metadata?.full_name || 'Anonymous',
          preferred_mode: supportPreference,
          emotional_capacity: emotionalCapacity,
          privacy_level: privacyLevel,
          last_active: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Create initial mood entry
      if (currentMood) {
        const { error: moodError } = await supabase
          .from('mood_entries')
          .insert({
            user_id: user.id,
            mood_score: currentMood,
            emotional_capacity: emotionalCapacity,
            seeking_support: supportPreference === 'receive' || supportPreference === 'both',
            willing_to_listen: supportPreference === 'give' || supportPreference === 'both',
          })

        if (moodError) throw moodError
      }

      await refreshProfile()
      setShowTutorial(true) // Show enhanced tutorial before completing
    } catch (error) {
      console.error('Enhanced onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTutorialComplete = () => {
    setShowTutorial(false)
    onComplete()
  }

  const nextStep = () => {
    if (currentStep < 6) {
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
      case 1: return userName.trim().length >= 2
      case 2: return currentMood !== null
      case 3: return supportPreference !== null
      case 4: return emotionalCapacity !== null
      case 5: return privacyLevel !== null
      case 6: return true // Final step
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100 relative overflow-hidden flex items-center justify-center p-4">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-green-50/30 via-transparent to-brand-green-100/30" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-brand-green-200/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-brand-green-200/20 to-transparent rounded-full blur-3xl" />

      <div className="w-full max-w-2xl relative">
        {/* Enhanced Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-secondary-700">
              Step {currentStep} of 6
            </span>
            <span className="text-sm text-secondary-500">
              {Math.round((currentStep / 6) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-white/60 backdrop-blur-sm rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-brand-green-500 to-brand-green-600 h-3 rounded-full shadow-sm"
              initial={{ width: '16.67%' }}
              animate={{ width: `${(currentStep / 6) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Welcome & Name */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-brand-green-200 to-brand-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Heart className="w-12 h-12 text-brand-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-secondary-900 mb-4">
                Welcome to Your
                <br />
                <span className="bg-gradient-to-r from-brand-green-600 to-brand-green-700 bg-clip-text text-transparent">
                  Safe Space
                </span>
              </h1>
              <p className="text-lg text-secondary-600 mb-8 max-w-lg mx-auto leading-relaxed">
                We're so glad you're here. Let's create a gentle, personalized experience just for you.
              </p>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 max-w-md mx-auto shadow-lg">
                <label className="block text-left text-sm font-medium text-secondary-700 mb-2">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name or preferred nickname"
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-brand-green-300 focus:border-brand-green-400 transition-all outline-none text-secondary-900 placeholder-secondary-400"
                />
                <p className="text-xs text-secondary-500 mt-2 text-left">
                  This helps us create a more personal experience. You can always change it later.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Current Mood */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">💙</span>
              </div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                How is your heart feeling today?
              </h2>
              <p className="text-lg text-secondary-600 mb-8 leading-relaxed">
                There's no right or wrong answer. Your feelings are valid and important.
              </p>
              
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
                {moods.map((mood) => (
                  <motion.button
                    key={mood.value}
                    onClick={() => setCurrentMood(mood.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      currentMood === mood.value
                        ? 'border-brand-green-500 bg-brand-green-50 shadow-lg'
                        : 'border-secondary-200 bg-white hover:border-brand-green-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-3xl mb-2">{mood.emoji}</div>
                    <div className="text-sm font-medium text-secondary-700">
                      {mood.label}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Support Preference */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                How would you like to connect?
              </h2>
              <p className="text-lg text-secondary-600 mb-8 leading-relaxed">
                Choose what feels right for you right now. You can always change this later.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <motion.button
                  onClick={() => setSupportPreference('receive')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    supportPreference === 'receive'
                      ? 'border-brand-green-500 bg-brand-green-50 shadow-lg'
                      : 'border-secondary-200 bg-white hover:border-brand-green-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-2">I Need Support</h3>
                  <p className="text-sm text-secondary-600 leading-relaxed">
                    I'm looking for someone to listen and offer gentle guidance
                  </p>
                </motion.button>

                <motion.button
                  onClick={() => setSupportPreference('give')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    supportPreference === 'give'
                      ? 'border-brand-green-500 bg-brand-green-50 shadow-lg'
                      : 'border-secondary-200 bg-white hover:border-brand-green-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-2">I Want to Help</h3>
                  <p className="text-sm text-secondary-600 leading-relaxed">
                    I have energy to listen and support others in their journey
                  </p>
                </motion.button>

                <motion.button
                  onClick={() => setSupportPreference('both')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    supportPreference === 'both'
                      ? 'border-brand-green-500 bg-brand-green-50 shadow-lg'
                      : 'border-secondary-200 bg-white hover:border-brand-green-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-2">Both Ways</h3>
                  <p className="text-sm text-secondary-600 leading-relaxed">
                    I'm open to both giving and receiving support as needed
                  </p>
                </motion.button>
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
              <div className="w-20 h-20 bg-gradient-to-br from-orange-200 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">⚖️</span>
              </div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                What's your emotional capacity right now?
              </h2>
              <p className="text-lg text-secondary-600 mb-8 leading-relaxed">
                This helps us protect you from burnout and match you appropriately.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {[
                  { 
                    value: 'low', 
                    label: 'Low Capacity', 
                    description: 'I need support more than I can give right now',
                    emoji: '🛡️',
                    color: 'from-red-400 to-red-600'
                  },
                  { 
                    value: 'medium', 
                    label: 'Balanced', 
                    description: 'I can give and receive support in balance',
                    emoji: '⚖️',
                    color: 'from-yellow-400 to-yellow-600'
                  },
                  { 
                    value: 'high', 
                    label: 'High Capacity', 
                    description: 'I have lots of energy to help others',
                    emoji: '🌟',
                    color: 'from-green-400 to-green-600'
                  },
                ].map((capacity) => (
                  <motion.button
                    key={capacity.value}
                    onClick={() => setEmotionalCapacity(capacity.value as any)}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      emotionalCapacity === capacity.value
                        ? 'border-brand-green-500 bg-brand-green-50 shadow-lg'
                        : 'border-secondary-200 bg-white hover:border-brand-green-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${capacity.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <span className="text-2xl">{capacity.emoji}</span>
                    </div>
                    <h3 className="font-semibold text-secondary-900 mb-2">
                      {capacity.label}
                    </h3>
                    <p className="text-sm text-secondary-600 leading-relaxed">
                      {capacity.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 5: Privacy Level */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-200 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                How private would you like to be?
              </h2>
              <p className="text-lg text-secondary-600 mb-8 leading-relaxed">
                Your privacy and comfort are our top priorities. Choose what feels safe for you.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {[
                  { 
                    value: 'anonymous', 
                    label: 'Completely Anonymous', 
                    description: 'No personal info shared, maximum privacy',
                    icon: '🕶️',
                    color: 'from-gray-400 to-gray-600'
                  },
                  { 
                    value: 'semi-private', 
                    label: 'Semi-Private', 
                    description: 'Share first name only, moderate privacy',
                    icon: '👤',
                    color: 'from-blue-400 to-blue-600'
                  },
                  { 
                    value: 'open', 
                    label: 'Open', 
                    description: 'Comfortable sharing more about yourself',
                    icon: '🌱',
                    color: 'from-green-400 to-green-600'
                  },
                ].map((privacy) => (
                  <motion.button
                    key={privacy.value}
                    onClick={() => setPrivacyLevel(privacy.value as any)}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      privacyLevel === privacy.value
                        ? 'border-brand-green-500 bg-brand-green-50 shadow-lg'
                        : 'border-secondary-200 bg-white hover:border-brand-green-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${privacy.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <span className="text-2xl">{privacy.icon}</span>
                    </div>
                    <h3 className="font-semibold text-secondary-900 mb-2">
                      {privacy.label}
                    </h3>
                    <p className="text-sm text-secondary-600 leading-relaxed">
                      {privacy.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 6: Welcome & Setup Complete */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-brand-green-200 to-brand-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Star className="w-12 h-12 text-brand-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-secondary-900 mb-4">
                You're All Set! 🌟
              </h1>
              <p className="text-lg text-secondary-600 mb-8 max-w-lg mx-auto leading-relaxed">
                Your safe space is ready. Remember, healing is a journey, and you're taking beautiful steps forward.
              </p>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 max-w-md mx-auto shadow-lg">
                <h3 className="font-semibold text-secondary-800 mb-4">What's Next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-green-600" />
                    <span className="text-secondary-700">Start with a gentle check-in</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-green-600" />
                    <span className="text-secondary-700">Explore your personalized dashboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-green-600" />
                    <span className="text-secondary-700">Connect with compassionate listeners</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Navigation */}
        <div className="flex justify-between items-center mt-12">
          <motion.button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 text-secondary-600 hover:text-secondary-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: currentStep > 1 ? 1.05 : 1 }}
            whileTap={{ scale: currentStep > 1 ? 0.95 : 1 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <motion.button
            onClick={nextStep}
            disabled={!canProceed() || loading}
            className="flex items-center gap-2 px-8 py-3 text-white rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: canProceed() && !loading ? '#335f64' : '#9ca3af',
              boxShadow: canProceed() && !loading ? '0 10px 15px -3px rgba(51, 95, 100, 0.3)' : 'none'
            }}
            whileHover={{ scale: canProceed() && !loading ? 1.05 : 1 }}
            whileTap={{ scale: canProceed() && !loading ? 0.95 : 1 }}
          >
            {loading ? (
              'Creating your space...'
            ) : currentStep === 6 ? (
              'Enter Your Safe Space'
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Enhanced Welcome Tutorial */}
      <EnhancedWelcomeTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />
    </div>
  )
}
