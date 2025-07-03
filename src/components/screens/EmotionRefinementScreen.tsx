'use client'

import { useState, FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ArrowRight } from 'lucide-react'

// --- Custom Slider Component ---
interface CustomSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  minLabel: string
  maxLabel: string
}

const CustomSlider: FC<CustomSliderProps> = ({ label, value, onChange, minLabel, maxLabel }) => {
  return (
    <div className="w-full">
      <label className="block text-gray-300 mb-2 text-center">{label}</label>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer thumb:bg-white thumb:w-6 thumb:h-6 thumb:rounded-full"
          style={{
            // Custom styling for the track and thumb
            '--thumb-color': 'white',
            '--track-color': '#374151',
          } as React.CSSProperties}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white font-sans">
      <header className="flex items-center justify-between p-4 md:p-6 relative z-10">
        <button onClick={handleBack} className="p-2 text-gray-300 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-10 max-w-xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Thanks for checking in.</h1>
          <p className="text-gray-400">Want to help us understand a bit more? (This is optional)</p>
        </motion.div>

        <motion.div 
          className="w-full max-w-md mx-auto space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <CustomSlider 
            label="How often do you feel sad/down?"
            value={sadness}
            onChange={setSadness}
            minLabel="Rarely"
            maxLabel="Often"
          />
          <CustomSlider 
            label="How often do you feel anxious or worried?"
            value={anxiety}
            onChange={setAnxiety}
            minLabel="Rarely"
            maxLabel="Often"
          />
          <CustomSlider 
            label="How much does this affect your day-to-day?"
            value={impact}
            onChange={setImpact}
            minLabel="Not much"
            maxLabel="A lot"
          />
        </motion.div>

        <div className="text-center mt-10">
            <button onClick={handleSkip} className="text-gray-400 hover:text-white transition-colors text-sm">
                Skip for now
            </button>
        </div>
      </main>

      <footer className="p-4 md:p-6 relative z-10">
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="max-w-md mx-auto"
        >
            <motion.button
            onClick={handleContinue}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-white text-black rounded-xl font-bold shadow-lg shadow-white/10 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
            >
            Continue <ArrowRight className="w-5 h-5" />
            </motion.button>
        </motion.div>
      </footer>
    </div>
  )
}
