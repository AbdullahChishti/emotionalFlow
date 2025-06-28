'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface MoodSelectionScreenProps {
  onNavigate: (screen: string, params?: any) => void
  mode: 'listen' | 'support'
}

export function MoodSelectionScreen({ onNavigate, mode }: MoodSelectionScreenProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)

  const moods = [
    {
      label: 'Very Low',
      value: 1,
      gradient: 'from-slate-400 to-slate-600',
      shadowColor: 'shadow-slate-300/30',
      description: 'Feeling very down',
      pattern: 'heavy-rain'
    },
    {
      label: 'Low',
      value: 2,
      gradient: 'from-blue-400 to-slate-500',
      shadowColor: 'shadow-blue-300/30',
      description: 'Feeling sad',
      pattern: 'light-rain'
    },
    {
      label: 'Down',
      value: 3,
      gradient: 'from-indigo-400 to-blue-500',
      shadowColor: 'shadow-indigo-300/30',
      description: 'A bit down',
      pattern: 'cloudy'
    },
    {
      label: 'Neutral',
      value: 4,
      gradient: 'from-gray-300 to-gray-400',
      shadowColor: 'shadow-gray-300/30',
      description: 'Feeling neutral',
      pattern: 'calm'
    },
    {
      label: 'Okay',
      value: 5,
      gradient: 'from-emerald-300 to-teal-400',
      shadowColor: 'shadow-emerald-300/30',
      description: 'Feeling okay',
      pattern: 'gentle-breeze'
    },
    {
      label: 'Good',
      value: 6,
      gradient: 'from-green-400 to-emerald-500',
      shadowColor: 'shadow-green-300/30',
      description: 'Feeling good',
      pattern: 'sunny-clouds'
    },
    {
      label: 'Happy',
      value: 7,
      gradient: 'from-yellow-400 to-orange-400',
      shadowColor: 'shadow-yellow-300/30',
      description: 'Feeling happy',
      pattern: 'sunny'
    },
    {
      label: 'Very Happy',
      value: 8,
      gradient: 'from-orange-400 to-pink-400',
      shadowColor: 'shadow-orange-300/30',
      description: 'Feeling very happy',
      pattern: 'bright-sun'
    },
    {
      label: 'Excited',
      value: 9,
      gradient: 'from-pink-400 to-rose-500',
      shadowColor: 'shadow-pink-300/30',
      description: 'Feeling excited',
      pattern: 'sparkles'
    },
    {
      label: 'Euphoric',
      value: 10,
      gradient: 'from-violet-400 to-purple-500',
      shadowColor: 'shadow-violet-300/30',
      description: 'Feeling euphoric',
      pattern: 'fireworks'
    },
  ]

  const handleContinue = () => {
    if (selectedMood !== null) {
      onNavigate('Matching', { mood: selectedMood, mode })
    }
  }

  const handleBack = () => {
    onNavigate('Welcome')
  }

  // Mood visualization component
  const MoodVisualization = ({ pattern, gradient, isSelected }: { pattern: string, gradient: string, isSelected: boolean }) => {
    const getPatternElements = () => {
      switch (pattern) {
        case 'heavy-rain':
          return (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-4 bg-white/40 rounded-full animate-pulse"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${10 + (i % 3) * 15}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          )
        case 'light-rain':
          return (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-3 bg-white/30 rounded-full animate-pulse"
                  style={{
                    left: `${25 + i * 15}%`,
                    top: `${15 + (i % 2) * 20}%`,
                    animationDelay: `${i * 0.3}s`
                  }}
                />
              ))}
            </div>
          )
        case 'cloudy':
          return (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-5 bg-white/30 rounded-full animate-pulse" />
              <div className="w-6 h-4 bg-white/20 rounded-full -ml-2 mt-1 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          )
        case 'calm':
          return (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-1 bg-white/40 rounded-full animate-pulse" />
            </div>
          )
        case 'gentle-breeze':
          return (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-8 h-0.5 bg-white/30 rounded-full animate-pulse"
                  style={{
                    left: `${20 + i * 20}%`,
                    top: `${30 + i * 15}%`,
                    animationDelay: `${i * 0.4}s`
                  }}
                />
              ))}
            </div>
          )
        case 'sunny-clouds':
          return (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-white/40 rounded-full animate-pulse" />
              <div className="w-4 h-3 bg-white/20 rounded-full -ml-1 mt-2 animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
          )
        case 'sunny':
          return (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white/50 rounded-full animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-2 bg-white/40 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-12px)`,
                    }}
                  />
                ))}
              </div>
            </div>
          )
        case 'bright-sun':
          return (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-white/60 rounded-full animate-pulse">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-3 bg-white/50 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-16px)`,
                    }}
                  />
                ))}
              </div>
            </div>
          )
        case 'sparkles':
          return (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/60 rounded-full animate-ping"
                  style={{
                    left: `${20 + i * 12}%`,
                    top: `${20 + (i % 3) * 20}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          )
        case 'fireworks':
          return (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/70 rounded-full animate-ping"
                  style={{
                    left: `${15 + i * 10}%`,
                    top: `${15 + (i % 4) * 15}%`,
                    animationDelay: `${i * 0.15}s`
                  }}
                />
              ))}
            </div>
          )
        default:
          return null
      }
    }

    return (
      <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${gradient} ${isSelected ? 'scale-110' : ''} transition-all duration-300`}>
        {getPatternElements()}
        <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background gradients matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-green-50/30" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-200/40 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-200/40 to-transparent rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 relative z-10">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-medium text-foreground">
          {mode === 'listen' ? 'Ready to Listen' : 'Seeking Support'}
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative px-2 md:px-8 z-10">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{ scale: 0 }}
              animate={{
                y: [0, -20, 20, -10],
                scale: [0, 1, 0.8, 1],
                opacity: [0, 0.6, 0.3, 0.6]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`
              }}
            />
          ))}
        </div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 md:mb-8 relative"
        >
          <motion.h2
            className="text-2xl md:text-4xl font-light text-foreground mb-2 md:mb-4"
            initial={{ letterSpacing: "0.1em" }}
            animate={{ letterSpacing: "0.05em" }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            How are you feeling?
          </motion.h2>
          <motion.p
            className="text-base md:text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {mode === 'listen'
              ? 'Share your emotional state so we can match you with someone who needs your unique perspective and support'
              : 'Help us understand your current emotional landscape so we can connect you with the perfect listener'
            }
          </motion.p>
        </motion.div>

        {/* Mood Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-6 max-w-5xl mx-auto mb-4 md:mb-8"
          style={{ width: '100%' }}
        >
          {moods.map((mood, index) => (
            <motion.button
              key={mood.value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              onClick={() => setSelectedMood(mood.value)}
              className={`
                group relative p-4 md:p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-105 backdrop-blur-sm mood-card-breathe
                ${selectedMood === mood.value
                  ? `border-transparent bg-white/70 shadow-xl ${mood.shadowColor} transform scale-105`
                  : 'border-white/20 bg-white/30 hover:border-white/40 hover:bg-white/50 hover:shadow-lg'
                }
              `}
              style={{
                boxShadow: selectedMood === mood.value
                  ? `0 10px 24px -8px rgba(0, 0, 0, 0.10), 0 0 16px ${mood.shadowColor.replace('shadow-', '').replace('/30', '')}`
                  : undefined
              }}
            >
              {/* Mood Visualization */}
              <div className="flex justify-center mb-2 md:mb-4">
                <MoodVisualization
                  pattern={mood.pattern}
                  gradient={mood.gradient}
                  isSelected={selectedMood === mood.value}
                />
              </div>

              {/* Mood Label */}
              <div className={`text-base md:text-lg font-medium mb-0.5 md:mb-1 transition-colors ${
                selectedMood === mood.value
                  ? 'text-foreground'
                  : 'text-foreground/80 group-hover:text-foreground'
              }`}>
                {mood.label}
              </div>

              {/* Mood Description */}
              <div className={`text-xs md:text-sm mb-1 md:mb-2 transition-colors ${
                selectedMood === mood.value
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/70 group-hover:text-muted-foreground'
              }`}>
                {mood.description}
              </div>

              {/* Mood Value */}
              <div className={`text-xs md:text-sm font-medium transition-colors ${
                selectedMood === mood.value
                  ? 'text-primary'
                  : 'text-muted-foreground group-hover:text-primary'
              }`}>
                {mood.value}/10
              </div>

              {/* Selection Ring */}
              {selectedMood === mood.value && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 rounded-2xl border-4 border-primary/30 pointer-events-none"
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Selected Mood Display */}
        {selectedMood !== null && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
            className="text-center mb-4 md:mb-8"
          >
            <div className="inline-flex items-center gap-2 md:gap-4 px-4 md:px-8 py-2 md:py-4 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
              <div className="flex-shrink-0">
                <MoodVisualization
                  pattern={moods.find(m => m.value === selectedMood)?.pattern || 'calm'}
                  gradient={moods.find(m => m.value === selectedMood)?.gradient || 'from-gray-300 to-gray-400'}
                  isSelected={true}
                />
              </div>
              <div className="text-left">
                <div className="font-medium text-foreground text-base md:text-lg">
                  You're feeling {moods.find(m => m.value === selectedMood)?.label.toLowerCase()}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  {moods.find(m => m.value === selectedMood)?.description}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Continue Button at the bottom with space above */}
      <div className="flex justify-center py-6 md:py-8 z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button
            onClick={handleContinue}
            disabled={selectedMood === null}
            className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-full hover:from-violet-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl shadow-violet-300/50 flex items-center gap-2 md:gap-3 font-medium text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
