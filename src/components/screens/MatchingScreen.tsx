'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Users, Heart, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface MatchingScreenProps {
  onNavigate: (screen: string, params?: any) => void
  mood: number
  mode: 'listen' | 'support'
}

export function MatchingScreen({ onNavigate, mood, mode }: MatchingScreenProps) {
  const [matchingStage, setMatchingStage] = useState<'searching' | 'found' | 'connected'>('searching')
  const [matchedUser, setMatchedUser] = useState<any>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)

  // Mock matching process
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    // Simulate finding a match after 3-8 seconds
    const matchTimeout = setTimeout(() => {
      setMatchedUser({
        name: mode === 'listen' ? 'Alex' : 'Jordan',
        avatar: mode === 'listen' ? '😔' : '😊',
        mood: mode === 'listen' ? 3 : 7,
        credits: mode === 'listen' ? 45 : 120,
        experience: mode === 'listen' ? 'First time seeking support' : 'Experienced listener'
      })
      setMatchingStage('found')
    }, Math.random() * 5000 + 3000)

    return () => {
      clearInterval(timer)
      clearTimeout(matchTimeout)
    }
  }, [mode])

  const handleConnect = () => {
    setMatchingStage('connected')
    setTimeout(() => {
      onNavigate('Session', { mood, mode, matchedUser })
    }, 2000)
  }

  const handleBack = () => {
    onNavigate('MoodSelection', { mode })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradients matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex items-center justify-between p-6 relative">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-medium text-foreground">
          Finding Your Match
        </h1>
        <div className="flex items-center gap-2 text-sm text-text-tertiary">
          <Clock className="w-4 h-4" />
          {formatTime(timeElapsed)}
        </div>
      </div>

      <div className="container mx-auto px-8 py-8 flex flex-col items-center justify-center min-h-[80vh] relative">
        {/* Floating Connection Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-primary/20 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0.8, 1],
                opacity: [0, 0.7, 0.4, 0.7],
                x: [0, Math.sin(i) * 50, Math.cos(i) * 30],
                y: [0, Math.cos(i) * 40, Math.sin(i) * 20]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + (i % 3) * 20}%`
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {matchingStage === 'searching' && (
            <motion.div
              key="searching"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center relative"
            >
              {/* Beautiful Connection Visualization */}
              <div className="relative mb-12">
                {/* Central Hub */}
                <motion.div
                  className="w-32 h-32 bg-gradient-to-br from-primary/30 to-blue-500/30 rounded-full flex items-center justify-center mx-auto relative backdrop-blur-sm border border-white/20"
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 20px rgba(139, 92, 246, 0.3)",
                      "0 0 40px rgba(139, 92, 246, 0.5)",
                      "0 0 20px rgba(139, 92, 246, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Users className="w-16 h-16 text-primary" />

                  {/* Orbiting Connection Points */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-4 h-4 bg-gradient-to-br from-primary to-blue-500 rounded-full"
                      animate={{
                        rotate: 360,
                        scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{
                        rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1.5, repeat: Infinity, delay: i * 0.2 }
                      }}
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-60px)`,
                      }}
                    />
                  ))}
                </motion.div>

                {/* Connection Lines */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-24 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                      animate={{
                        rotate: [0, 120, 240, 360],
                        opacity: [0.3, 0.8, 0.3]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 1,
                        ease: "easeInOut"
                      }}
                      style={{
                        transform: `rotate(${i * 120}deg)`
                      }}
                    />
                  ))}
                </div>
              </div>

              <motion.h2
                className="text-4xl md:text-5xl font-light text-foreground mb-6"
                initial={{ letterSpacing: "0.1em" }}
                animate={{ letterSpacing: "0.05em" }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                Finding your perfect match
              </motion.h2>
              <motion.p
                className="text-xl text-muted-foreground mb-12 max-w-2xl font-light leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {mode === 'listen'
                  ? 'Searching for someone who needs your unique perspective and emotional support'
                  : 'Connecting you with a compassionate listener who understands your journey'
                }
              </motion.p>

              {/* Matching Criteria */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 max-w-md mx-auto border border-white/30 shadow-lg"
              >
                <h3 className="font-medium text-foreground mb-6 text-lg">Matching based on:</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/40 rounded-2xl">
                    <span className="text-muted-foreground font-light">Your emotional state:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-primary to-blue-500 rounded-full animate-pulse" />
                      <span className="font-medium text-foreground">{mood}/10</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/40 rounded-2xl">
                    <span className="text-muted-foreground font-light">Connection type:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse" />
                      <span className="font-medium text-foreground capitalize">{mode}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/40 rounded-2xl">
                    <span className="text-muted-foreground font-light">Availability:</span>
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="font-medium text-green-600">Online</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {matchingStage === 'found' && matchedUser && (
            <motion.div
              key="found"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center relative"
            >
              {/* Success Celebration Animation */}
              <div className="relative mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
                  className="w-32 h-32 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full flex items-center justify-center mx-auto relative backdrop-blur-sm border border-white/20"
                >
                  <CheckCircle className="w-16 h-16 text-green-500" />

                  {/* Celebration Particles */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        x: Math.cos(i * 30 * Math.PI / 180) * 80,
                        y: Math.sin(i * 30 * Math.PI / 180) * 80
                      }}
                      transition={{
                        duration: 1.5,
                        delay: 0.3 + i * 0.05,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </motion.div>
              </div>

              <motion.h2
                className="text-4xl md:text-5xl font-light text-foreground mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Perfect Match Found!
              </motion.h2>

              {/* Matched User Card */}
              <motion.div
                initial={{ y: 30, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: "spring", bounce: 0.3 }}
                className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 max-w-md mx-auto mb-8 border border-white/30 shadow-xl relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-primary to-blue-500 rounded-full blur-xl" />
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-xl" />
                </div>

                <div className="relative">
                  {/* Avatar with Mood Visualization */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <motion.div
                        className="w-20 h-20 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center text-4xl backdrop-blur-sm border border-white/30"
                        animate={{
                          boxShadow: [
                            "0 0 20px rgba(139, 92, 246, 0.3)",
                            "0 0 30px rgba(139, 92, 246, 0.5)",
                            "0 0 20px rgba(139, 92, 246, 0.3)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {matchedUser.avatar}
                      </motion.div>
                      <motion.div
                        className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                  </div>

                  <h3 className="text-2xl font-light text-foreground mb-3 text-center">
                    {matchedUser.name}
                  </h3>
                  <p className="text-muted-foreground mb-6 text-center font-light leading-relaxed">
                    {matchedUser.experience}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl">
                      <span className="text-muted-foreground font-light">Emotional state:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-primary to-blue-500 rounded-full animate-pulse" />
                        <span className="font-medium text-foreground">{matchedUser.mood}/10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl">
                      <span className="text-muted-foreground font-light">Support credits:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse" />
                        <span className="font-medium text-primary">{matchedUser.credits}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <motion.button
                  onClick={handleConnect}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-full hover:from-violet-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl shadow-violet-300/50 flex items-center gap-3 mx-auto font-medium text-lg transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Heart className="w-5 h-5" />
                  </motion.div>
                  Connect & Start Session
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {matchingStage === 'connected' && (
            <motion.div
              key="connected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-pink-400 via-fuchsia-400 to-indigo-400 rounded-full flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-fuchsia-300/30 animate-pulse"
              >
                {/* Modern filled heart SVG */}
                <svg className="w-14 h-14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </motion.div>

              <h2 className="text-3xl font-bold text-foreground mb-4">
                Connected!
              </h2>
              <p className="text-lg text-muted-foreground">
                Starting your session...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
