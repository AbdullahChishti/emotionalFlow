'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Check, Heart } from 'lucide-react'

// --- Helper Components ---
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-white/10 rounded-full"
        initial={{ y: '100%', x: `${Math.random() * 100}%`, opacity: 0 }}
        animate={{ y: '-10%', opacity: [0, 1, 0] }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          delay: Math.random() * 10,
          ease: 'linear',
        }}
        style={{ width: `${Math.random() * 3 + 1}px`, height: `${Math.random() * 3 + 1}px` }}
      />
    ))}
  </div>
)

const AnimatedChecklistItem = ({ text, delay }: { text: string; delay: number }) => (
  <motion.div
    className="flex items-center gap-3"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <motion.div
      className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: delay + 0.3, type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Check className="w-4 h-4 text-green-300" />
    </motion.div>
    <span className="text-gray-300">{text}</span>
  </motion.div>
)

// --- Main Component ---
interface MatchingScreenProps {
  onNavigate: (screen: string, params?: any) => void
  mood: number
  mode: 'listen' | 'support'
}

export function MatchingScreen({ onNavigate, mood, mode }: MatchingScreenProps) {
  const [matchingStage, setMatchingStage] = useState<'searching' | 'found'>('searching')
  const [matchedUser, setMatchedUser] = useState<any>(null)

  useEffect(() => {
    const matchTimeout = setTimeout(() => {
      setMatchedUser({ name: mode === 'listen' ? 'Alex' : 'Jordan' })
      setMatchingStage('found')
    }, 5500) // Total time for animations + a little extra

    return () => clearTimeout(matchTimeout)
  }, [mode])

  const handleConnect = () => {
    onNavigate('Session', { mood, mode, matchedUser })
  }

  const handleBack = () => {
    onNavigate('MoodSelection', { mode })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white font-sans relative overflow-hidden">
      <FloatingParticles />
      
      <header className="flex items-center justify-between p-4 md:p-6 relative z-10">
        <button onClick={handleBack} className="p-2 text-gray-300 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <AnimatePresence mode="wait">
          {matchingStage === 'searching' && (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-8"
            >
              <motion.div
                className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.div 
                  className="w-16 h-16 bg-purple-500 rounded-full shadow-2xl shadow-purple-500/50"
                  animate={{ scale: [1, 0.95, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                />
              </motion.div>

              <div className="max-w-lg">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Someone’s here — just for you.</h1>
                <p className="text-gray-400">We’re connecting you with a listener who understands what you’re feeling.</p>
              </div>

              <div className="space-y-4 self-start">
                <AnimatedChecklistItem text="Finding someone who’s… emotionally present" delay={1} />
                <AnimatedChecklistItem text="Finding someone who’s… experienced with this mood" delay={2} />
                <AnimatedChecklistItem text="Finding someone who’s… online now" delay={3} />
              </div>

              <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg max-w-sm text-sm">
                <p className="text-gray-400 italic">“We don’t heal alone. We heal when we’re heard.”</p>
              </div>

              <p className="text-xs text-gray-500 mt-4">While you wait, take a breath. You're not alone anymore.</p>
            </motion.div>
          )}

          {matchingStage === 'found' && matchedUser && (
            <motion.div
              key="found"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-8"
            >
                <motion.div
                  className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                    <Check className="w-12 h-12 text-green-300" />
                </motion.div>

                <div className="max-w-lg">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">We’ve found a match.</h1>
                    <p className="text-gray-400">You're being connected with {matchedUser.name}.</p>
                </div>

                <motion.button
                    onClick={handleConnect}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full max-w-xs mt-4 py-4 bg-white text-gray-800 rounded-full font-bold shadow-lg shadow-white/20 transition-all duration-300 flex items-center justify-center gap-2 text-lg relative overflow-hidden group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <span className="absolute w-full h-full bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow" />
                    <span className="relative z-10 flex items-center justify-center gap-2">Connect <Heart className="w-5 h-5" /></span>
                </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
