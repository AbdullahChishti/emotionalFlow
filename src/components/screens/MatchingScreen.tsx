'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import 'material-symbols/outlined.css'

// --- Magical Connection Components ---

// Animated constellation pattern
const ConstellationPattern = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={`star-${i}`}
        className="absolute w-1 h-1 bg-primary-400/60 rounded-full"
        initial={{
          x: `${Math.random() * 100}%`,
          y: `${Math.random() * 100}%`,
          opacity: 0
        }}
        animate={{
          opacity: [0, 0.8, 0.4, 0.8, 0],
          scale: [1, 1.5, 1]
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: 'easeInOut'
        }}
      />
    ))}
    {/* Connection lines */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={`line-${i}`}
        className="absolute h-px bg-gradient-to-r from-transparent via-primary-300/30 to-transparent"
        initial={{
          width: 0,
          x: `${Math.random() * 100}%`,
          y: `${Math.random() * 100}%`,
          opacity: 0
        }}
        animate={{
          width: [0, 60 + Math.random() * 40, 0],
          opacity: [0, 0.6, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: 'easeInOut'
        }}
        style={{
          transformOrigin: 'left center',
          rotate: `${Math.random() * 360}deg`
        }}
      />
    ))}
  </div>
)

// Sacred geometry pattern
const SacredGeometry = ({ isActive }: { isActive: boolean }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <motion.div
      className="relative"
      animate={isActive ? { rotate: 360 } : {}}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    >
      {/* Outer circle */}
      <motion.div
        className="w-64 h-64 border border-primary-300/20 rounded-full"
        animate={isActive ? { scale: [1, 1.1, 1], borderWidth: [1, 2, 1] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Middle circle */}
      <motion.div
        className="absolute top-8 left-8 w-48 h-48 border border-primary-400/20 rounded-full"
        animate={isActive ? { scale: [1, 1.05, 1], borderWidth: [1, 1.5, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      {/* Inner circle */}
      <motion.div
        className="absolute top-16 left-16 w-32 h-32 border border-primary-500/30 rounded-full"
        animate={isActive ? { scale: [1, 1.1, 1], borderWidth: [1, 2, 1] } : {}}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      {/* Center glow */}
      <motion.div
        className="absolute top-28 left-28 w-8 h-8 bg-primary-400/40 rounded-full blur-sm"
        animate={isActive ? { scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  </div>
)

// Heartbeat pulse effect
const HeartbeatPulse = ({ isActive }: { isActive: boolean }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <motion.div
      className="w-32 h-32 border-2 border-primary-400/30 rounded-full"
      animate={isActive ? {
        scale: [1, 1.3, 1],
        opacity: [0.3, 0.6, 0.3],
        borderWidth: [2, 4, 2]
      } : {}}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  </div>
)

// Magical connection bridge
const ConnectionBridge = ({ progress }: { progress: number }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <motion.div
      className="relative w-80 h-1 bg-gradient-to-r from-primary-300/20 via-primary-400/60 to-primary-300/20 rounded-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary-500/40 via-primary-600/80 to-primary-500/40 rounded-full"
        initial={{ x: '-100%' }}
        animate={{ x: `${(progress / 100) * 100 - 100}%` }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary-600 rounded-full shadow-lg"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  </div>
)

// Wisdom words that appear during matching
const WisdomWords = ({ stage }: { stage: number }) => {
  const wisdom = [
    { text: "In the space between thoughts, healing begins", delay: 1 },
    { text: "Every emotion is a messenger with wisdom to share", delay: 2.5 },
    { text: "Your vulnerability is the bridge to connection", delay: 4 },
    { text: "In being seen, we find our deepest belonging", delay: 5.5 }
  ]

  return (
    <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center">
      <AnimatePresence>
        {wisdom.slice(0, stage).map((item, index) => (
          <motion.div
            key={index}
            className="mb-4"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.8, delay: item.delay }}
          >
            <p className="text-primary-700/80 italic font-medium text-sm max-w-xs mx-auto leading-relaxed">
              {item.text}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

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
  const [connectionProgress, setConnectionProgress] = useState(0)
  const [wisdomStage, setWisdomStage] = useState(0)

  useEffect(() => {
    // Simulate the magical connection process
    const progressInterval = setInterval(() => {
      setConnectionProgress(prev => {
        if (prev < 100) {
          return prev + 2
        } else {
          clearInterval(progressInterval)
          return 100
        }
      })
    }, 100)

    // Wisdom words progression
    const wisdomTimeouts = [
      setTimeout(() => setWisdomStage(1), 1000),
      setTimeout(() => setWisdomStage(2), 2500),
      setTimeout(() => setWisdomStage(3), 4000),
      setTimeout(() => setWisdomStage(4), 5500),
    ]

    // Final match reveal
    const matchTimeout = setTimeout(() => {
      setMatchedUser({
        name: mode === 'listen' ? 'Alex' : 'Jordan',
        specialty: mode === 'listen' ? 'deep listening' : 'empathetic support'
      })
      setMatchingStage('found')
    }, 6500)

    return () => {
      clearInterval(progressInterval)
      wisdomTimeouts.forEach(clearTimeout)
      clearTimeout(matchTimeout)
    }
  }, [mode])

  const handleConnect = () => {
    onNavigate('Session', { mood, mode, matchedUser })
  }

  const handleBack = () => {
    onNavigate('MoodSelection', { mode })
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-primary-50 text-secondary-800 font-sans relative overflow-hidden">
      {/* Magical Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-80 h-80 bg-secondary-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-primary-100/25 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary-50/20 rounded-full blur-3xl"></div>
      </div>

      {/* Constellation Pattern */}
      <ConstellationPattern />

      {/* Sacred Geometry */}
      <SacredGeometry isActive={matchingStage === 'searching'} />

      {/* Heartbeat Pulse */}
      <HeartbeatPulse isActive={connectionProgress > 20} />

      {/* Connection Bridge */}
      <ConnectionBridge progress={connectionProgress} />

      {/* Wisdom Words */}
      <WisdomWords stage={wisdomStage} />

      {/* Minimal Header */}
      <header className="relative p-6 z-20">
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

      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-8 text-center z-10">
        <AnimatePresence mode="wait">
          {matchingStage === 'searching' && (
            <motion.div
              key="searching"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto"
            >
              {/* Sacred Connection Visualization */}
              <motion.div
                className="relative mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-primary-400/30 to-primary-600/30 rounded-full flex items-center justify-center border border-primary-300/50"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-primary-500/50 to-primary-700/50 rounded-full flex items-center justify-center"
                    animate={{
                      scale: [1, 0.9, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <span className="text-2xl">✨</span>
                  </motion.div>
                </motion.div>

                {/* Floating connection particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-primary-500/40 rounded-full"
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 0
                    }}
                    animate={{
                      x: Math.cos(i * 60 * Math.PI / 180) * 60,
                      y: Math.sin(i * 60 * Math.PI / 180) * 60,
                      opacity: [0, 0.8, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: 'easeInOut'
                    }}
                  />
                ))}
              </motion.div>

              {/* Sacred Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mb-6"
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-primary-700 font-medium text-sm mb-6 border border-white/50"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                  Weaving Connections
                </motion.div>

                <h1 className="text-3xl md:text-4xl font-bold text-secondary-800 mb-4 leading-tight">
                  Your souls are
                  <br />
                  <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                    finding each other
                  </span>
                </h1>
                <p className="text-secondary-600 text-base max-w-lg mx-auto leading-relaxed">
                  In this sacred moment, we&apos;re connecting you with someone whose heart resonates with yours.
                  This isn&apos;t just matching—it&apos;s destiny unfolding.
                </p>
              </motion.div>

              {/* Connection Progress */}
              <motion.div
                className="w-full max-w-xs mx-auto mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                <div className="flex justify-between text-xs text-secondary-500 mb-2">
                  <span>Searching the cosmos...</span>
                  <span>{connectionProgress}%</span>
                </div>
                <div className="w-full h-2 bg-primary-100/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${connectionProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>

              {/* Magical Elements */}
              <motion.div
                className="space-y-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.8 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="text-lg">🌟</span>
                  <span className="text-sm text-secondary-700 font-medium">Aligning energies</span>
                </motion.div>

                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                >
                  <span className="text-lg">💫</span>
                  <span className="text-sm text-secondary-700 font-medium">Finding resonance</span>
                </motion.div>

                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                >
                  <span className="text-lg">✨</span>
                  <span className="text-sm text-secondary-700 font-medium">Creating magic</span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {matchingStage === 'found' && matchedUser && (
            <motion.div
              key="found"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center gap-8 max-w-2xl mx-auto"
            >
              {/* Magical Reveal */}
              <motion.div
                className="relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
              >
                <motion.div
                  className="w-32 h-32 bg-gradient-to-br from-primary-400/40 to-primary-600/40 rounded-full flex items-center justify-center border-2 border-primary-300/50"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-primary-500/60 to-primary-700/60 rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <span className="text-3xl">👋</span>
                  </motion.div>
                </motion.div>

                {/* Celebration particles */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary-500 rounded-full"
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 0
                    }}
                    animate={{
                      x: Math.cos(i * 30 * Math.PI / 180) * 80,
                      y: Math.sin(i * 30 * Math.PI / 180) * 80,
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      delay: 0.8 + i * 0.1,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </motion.div>

              {/* Sacred Introduction */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="text-center"
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-primary-700 font-medium text-sm mb-6 border border-white/50"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Connection Complete
                </motion.div>

                <h1 className="text-3xl md:text-4xl font-bold text-secondary-800 mb-4 leading-tight">
                  The stars have aligned
                  <br />
                  <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                    for this moment
                  </span>
                </h1>
                <p className="text-secondary-600 text-base max-w-lg mx-auto leading-relaxed mb-6">
                  Meet <span className="font-semibold text-primary-700">{matchedUser.name}</span> — a kindred spirit
                  who specializes in <span className="font-medium text-primary-600">{matchedUser.specialty}</span>.
                  Your hearts found each other across the digital cosmos.
                </p>
              </motion.div>

              {/* Sacred Connection Button */}
              <motion.button
                onClick={handleConnect}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full max-w-sm py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-base border border-primary-400/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <span>Begin Sacred Conversation</span>
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
              </motion.button>

              {/* Gentle Reminder */}
              <motion.p
                className="text-sm text-secondary-500 max-w-sm mx-auto leading-relaxed italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.6 }}
              >
                This connection is a gift. Take your time, be gentle with yourself, and allow the magic to unfold.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
