'use client'

import React, { useState, FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import 'material-symbols/outlined.css'

// --- Modern Slider Component ---
interface ModernSliderProps {
  label: string
  description: string
  value: number
  onChange: (value: number) => void
  minLabel: string
  maxLabel: string
  emoji: string
}

const ModernSlider: FC<ModernSliderProps> = ({ label, description, value, onChange, minLabel, maxLabel, emoji }) => {
  const getValueLabel = (val: number) => {
    const labels = ['Very Little', 'Little', 'Some', 'Quite a Bit', 'A Lot', 'Very Much']
    return labels[val] || labels[2]
  }

  return (
    <motion.div
      className="w-full max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border border-white/50">
          <span className="text-2xl">{emoji}</span>
        </div>
        <h3 className="text-lg font-medium text-secondary-800 mb-2">{label}</h3>
        <p className="text-sm text-secondary-600 leading-relaxed">{description}</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="flex justify-between text-xs text-secondary-500 mb-2">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>

          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-primary-200 to-primary-300 rounded-lg appearance-none cursor-pointer slider-thumb:bg-white slider-thumb:w-6 slider-thumb:h-6 slider-thumb:rounded-full slider-thumb:shadow-lg slider-thumb:border-2 slider-thumb:border-primary-300 hover:slider-thumb:scale-110 transition-transform"
          />

          <div className="flex justify-center mt-3">
            <motion.div
              key={value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-3 py-1 bg-primary-500 text-white text-xs rounded-full font-medium"
            >
              {getValueLabel(value)}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// --- Main Component ---
interface EmotionRefinementScreenProps {
  onNavigate: (screen: string, params?: any) => void
  mode: 'listen' | 'support'
  mood: number
}

export function EmotionRefinementScreen({ onNavigate, mode, mood }: EmotionRefinementScreenProps) {
  const [sadness, setSadness] = useState(2)
  const [anxiety, setAnxiety] = useState(2)
  const [impact, setImpact] = useState(2)

  const handleContinue = () => {
    onNavigate('Matching', { mood, mode, refinement: { sadness, anxiety, impact } })
  }

  const handleSkip = () => {
    onNavigate('Matching', { mood, mode })
  }

  const handleBack = () => onNavigate('MoodSelection')

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-primary-50 text-secondary-800 font-sans relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 right-20 w-80 h-80 bg-secondary-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary-100/25 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary-50/20 rounded-full blur-3xl"></div>
      </div>

      {/* Minimal Header */}
      <header className="relative p-6 z-10">
        <motion.button
          onClick={handleBack}
          className="absolute left-6 top-6 w-10 h-10 bg-white/60 backdrop-blur-sm border border-white/40 rounded-full flex items-center justify-center text-secondary-500 hover:bg-white/80 hover:text-secondary-700 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </motion.button>

        <div className="text-center pt-4">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="w-8 h-8 bg-primary-100/50 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-lg text-primary-600">psychology</span>
            </div>
            <span className="text-lg font-medium text-secondary-800">MindWell</span>
          </motion.div>
        </div>
      </header>

      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-12"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-primary-700 font-medium text-sm mb-6 border border-white/50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
              Optional Refinement
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold text-secondary-800 mb-4 leading-tight">
              Thank you for sharing
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                how you feel
              </span>
            </h1>
            <p className="text-secondary-600 text-base max-w-lg mx-auto leading-relaxed mb-8">
              If you'd like to help us understand your experience a bit more, we can refine this together.
              Take your time—no pressure, just presence.
            </p>
          </motion.div>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <ModernSlider
              label="Sadness"
              description="How much sadness have you been feeling lately?"
              value={sadness}
              onChange={setSadness}
              minLabel="Very Little"
              maxLabel="A Lot"
              emoji="💙"
            />
            <ModernSlider
              label="Anxiety"
              description="How often do anxious thoughts visit you?"
              value={anxiety}
              onChange={setAnxiety}
              minLabel="Rarely"
              maxLabel="Often"
              emoji="🧘"
            />
            <ModernSlider
              label="Daily Impact"
              description="How much does this affect your everyday life?"
              value={impact}
              onChange={setImpact}
              minLabel="Minimal"
              maxLabel="Significant"
              emoji="🌱"
            />
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-8 space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.button
            onClick={handleSkip}
            className="inline-flex items-center gap-2 text-secondary-500 hover:text-primary-600 transition-colors font-medium text-sm px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/70"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>🤍</span>
            <span>Skip for now</span>
          </motion.button>
          <p className="text-sm text-secondary-600 max-w-sm mx-auto leading-relaxed">
            That's completely fine. We can always explore this more later when you're ready.
          </p>
        </motion.div>
      </main>

      <motion.footer
        className="p-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <AnimatePresence>
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-sm mx-auto"
          >
            <motion.button
              onClick={handleContinue}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-base"
            >
              <span>Continue with these insights</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </motion.footer>
    </div>
  )
}
