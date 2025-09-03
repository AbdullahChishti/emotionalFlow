'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Soothing, lighter color palettes
const moodColors: { [key: string]: string[] } = {
  calm: ['#a7c5eb', '#b3e0dc', '#e0f2f1'],
  happy: ['#ffd6a5', '#ffb347', '#fff4e0'],
  sad: ['#c9d6df', '#e0e0e0', '#f0f2f5'],
  anxious: ['#dcd0ff', '#c8b6ff', '#e6e0ff'],
  neutral: ['#e0e0e0', '#eeeeee', '#f5f5f5'],
  grateful: ['#c8e6c9', '#a5d6a7', '#e8f5e9'],
}

interface MoodBackgroundProps {
  mood: string
}

export const MoodBackground: React.FC<MoodBackgroundProps> = ({ mood }) => {
  const colors = moodColors[mood] || moodColors.neutral

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-stone-50">
      <AnimatePresence>
        <motion.div
          key={mood}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 3, ease: 'easeInOut' } }}
          exit={{ opacity: 0, transition: { duration: 3, ease: 'easeInOut' } }}
          className="absolute inset-0"
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              transform: [
                'scale(1) rotate(0deg)',
                'scale(1.1) rotate(15deg)',
                'scale(1) rotate(0deg)',
              ],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              background: `radial-gradient(circle at 15% 25%, ${colors[0]}55, transparent 40%),
                         radial-gradient(circle at 85% 40%, ${colors[1]}44, transparent 55%),
                         radial-gradient(circle at 40% 90%, ${colors[2]}33, transparent 65%)`,
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
