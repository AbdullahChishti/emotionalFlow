'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Material Symbols icons import
import 'material-symbols/outlined.css'

// --- Helper Components ---
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-primary-400/20 rounded-full"
        initial={{ y: '100%', x: `${Math.random() * 100}%`, opacity: 0 }}
        animate={{ y: '-10%', opacity: [0, 0.6, 0] }}
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
      className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: delay + 0.3, type: 'spring', stiffness: 300, damping: 20 }}
    >
      <span className="material-symbols-outlined text-primary-600 text-lg">check_circle</span>
    </motion.div>
    <span className="text-secondary-600">{text}</span>
  </motion.div>
)

// --- Main Component ---
interface NavigationParams {
  mood?: number
  mode?: 'listen' | 'support'
  matchedUser?: any
}

interface MatchingScreenProps {
  onNavigate: (screen: string, params?: NavigationParams) => void
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
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-100 via-white to-primary-50 text-secondary-800 font-sans relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            top: '10%',
            right: '10%'
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 250,
            height: 250,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            bottom: '20%',
            left: '15%'
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 8
          }}
        />
      </div>

      <FloatingParticles />

      {/* Header */}
      <header className="relative flex items-center justify-between p-6 glassmorphic z-10">
        <motion.button
          onClick={handleBack}
          className="p-3 text-secondary-500 hover:bg-secondary-100/70 hover:text-secondary-700 rounded-full transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </motion.button>
        <div className="flex-1 text-center">
          <motion.div
            className="flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <span className="material-symbols-outlined text-3xl text-primary-600">psychology</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              MindWell
            </h1>
          </motion.div>
        </div>
        <div className="w-14" />
      </header>

      <main className="relative flex-1 flex flex-col items-center justify-center p-6 text-center">
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
                className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.div
                  className="w-16 h-16 bg-primary-500 rounded-full shadow-2xl shadow-primary-500/30"
                  animate={{ scale: [1, 0.95, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                />
              </motion.div>

              <div className="max-w-lg">
                <h1 className="text-4xl md:text-5xl font-bold text-secondary-800 mb-4 leading-tight">
                  Someone&apos;s here — just for you.
                </h1>
                <p className="text-secondary-600 text-lg max-w-2xl mx-auto leading-relaxed">
                  We&apos;re connecting you with a compassionate listener who truly understands what you&apos;re feeling. Your heart deserves this moment of being truly heard.
                </p>
              </div>

              <div className="space-y-6 self-start">
                <AnimatedChecklistItem text="Finding someone who&apos;s… ready to hold space for your heart" delay={1} />
                <AnimatedChecklistItem text="Finding someone who&apos;s… walked this emotional path before" delay={2} />
                <AnimatedChecklistItem text="Finding someone who&apos;s… here, present, and truly listening" delay={3} />
              </div>

              <motion.div
                className="mt-12 p-6 glassmorphic rounded-2xl max-w-sm shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 4, duration: 0.8 }}
              >
                <p className="text-secondary-600 italic font-medium text-base">
                  "In the tender space of being heard, we discover our deepest healing begins."
                </p>
              </motion.div>

              <p className="text-sm text-secondary-500 mt-8 font-medium">
                While you wait, take a gentle breath. Your courage in reaching out has already begun your healing journey. You&apos;re not alone—you&apos;re exactly where you need to be.
              </p>
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
                  className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                    <span className="material-symbols-outlined text-5xl text-primary-600">check_circle</span>
                </motion.div>

                <div className="max-w-lg">
                    <h1 className="text-4xl md:text-5xl font-bold text-secondary-800 mb-4 leading-tight">
                      We&apos;ve found your perfect match.
                    </h1>
                    <p className="text-secondary-600 text-lg">
                      You&apos;re being connected with {matchedUser.name}, who&apos;s ready to listen with an open heart and walk alongside you in this moment.
                    </p>
                </div>

                <motion.button
                    onClick={handleConnect}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full max-w-xs mt-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    Connect
                    <span className="material-symbols-outlined text-xl">favorite</span>
                </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
