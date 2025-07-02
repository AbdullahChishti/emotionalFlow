'use client'

import { useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { ChevronLeft, ArrowRight } from 'lucide-react'
import SketchbookBackground from '@/components/ui/SketchbookBackground'

interface MoodSelectionScreenProps {
  onNavigate: (screen: string, params?: any) => void
  mode: 'listen' | 'support'
}

const moods = [
  { emoji: '😔', label: 'Very Low', value: 1 },
  { emoji: '😟', label: 'Low', value: 2 },
  { emoji: '😕', label: 'Down', value: 3 },
  { emoji: '😐', label: 'Neutral', value: 4 },
  { emoji: '🙂', label: 'Okay', value: 5 },
  { emoji: '😊', label: 'Good', value: 6 },
  { emoji: '😄', label: 'Happy', value: 7 },
  { emoji: '😁', label: 'Great', value: 8 },
  { emoji: '🤩', label: 'Excited', value: 9 },
  { emoji: '💖', label: 'Euphoric', value: 10 },
]

export function MoodSelectionScreen({ onNavigate, mode }: MoodSelectionScreenProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)

  const handleContinue = () => {
    if (selectedMood !== null) {
      onNavigate('Matching', { mood: selectedMood, mode })
    }
  }

  const handleBack = () => {
    onNavigate('Welcome')
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 relative overflow-hidden">
      <SketchbookBackground />

      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6 relative z-10">
        <button
          onClick={handleBack}
          className="p-2 text-zinc-600 hover:bg-zinc-200/60 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-medium text-zinc-700">
          {mode === 'listen' ? 'Ready to Listen' : 'Seeking Support'}
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-light text-zinc-800 mb-3">
            How are you feeling now?
          </h2>
          <p className="text-base md:text-lg text-zinc-500 max-w-md mx-auto">
            {mode === 'listen'
              ? 'Select your current mood to find someone who needs you.'
              : 'Choose your emotion to connect with the right listener.'}
          </p>
        </motion.div>

        {/* Mood Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5 max-w-4xl mx-auto mb-8"
        >
          {moods.map((mood) => (
            <motion.button
              key={mood.value}
              variants={itemVariants}
              onClick={() => setSelectedMood(mood.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative p-4 text-center rounded-2xl border-2 transition-all duration-300 ${
                selectedMood === mood.value
                  ? 'bg-white/90 border-indigo-400 shadow-lg shadow-indigo-500/10'
                  : 'bg-white/70 border-zinc-200/80 hover:border-zinc-300'
              }`}
            >
              <div className="text-4xl md:text-5xl mb-3 transition-transform duration-300 group-hover:scale-110">
                {mood.emoji}
              </div>
              <div
                className={`text-sm font-medium transition-colors ${
                  selectedMood === mood.value ? 'text-indigo-600' : 'text-zinc-700'
                }`}>
                {mood.label}
              </div>
            </motion.button>
          ))}
        </motion.div>
      </main>

      {/* Footer with Continue Button */}
      <footer className="p-4 md:p-6 relative z-10">
        <AnimatePresence>
          {selectedMood !== null && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="max-w-md mx-auto"
            >
              <button
                onClick={handleContinue}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:scale-100"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  )
}
