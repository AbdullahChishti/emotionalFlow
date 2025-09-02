'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface NavigationParams {
  mode?: 'listen' | 'support'
}

interface WelcomeScreenProps {
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const handleListenPress = () => {
    onNavigate('MoodSelection', { mode: 'listen' })
  }

  const handleSupportPress = () => {
    onNavigate('MoodSelection', { mode: 'support' })
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-100 via-white to-primary-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 250,
            height: 250,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
            top: '15%',
            left: '10%'
          }}
          animate={{
            y: [0, -25, 0],
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
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
            bottom: '20%',
            right: '15%'
          }}
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 7
          }}
        />
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <motion.div
          className="container mx-auto px-6 py-12 flex flex-col items-center justify-center flex-grow text-center"
        >
          <motion.div className="mb-10">
            <motion.div
              className="relative w-24 h-24 mx-auto flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
            >
              <div className="absolute inset-0 bg-primary-300 rounded-full blur-xl opacity-30"></div>
              <span className="relative text-6xl text-primary-600">🧠</span>
            </motion.div>
          </motion.div>

          <motion.h1 className="text-4xl md:text-5xl font-bold text-secondary-800 leading-tight mb-4">
            You&apos;re not alone here.
          </motion.h1>

          <motion.p
            className="text-lg text-secondary-600 max-w-md mb-12 leading-relaxed"
          >
            This is a safe space where support flows both ways. You can speak, you can listen. Either way, you&apos;re part of something healing.
          </motion.p>

          <motion.div className="w-full max-w-sm space-y-6">
            <div>
              <motion.button
                onClick={handleSupportPress}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group text-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">❤️</span>
                I need support
              </motion.button>
              <p className="text-sm text-secondary-500 mt-2 px-4">Spend your empathy credits and share freely.</p>
            </div>

            <div>
              <motion.button
                onClick={handleListenPress}
                className="w-full py-4 glassmorphic text-secondary-800 rounded-xl hover:bg-white/50 transition-all duration-300 shadow-md flex items-center justify-center gap-3 group font-medium text-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">🎧</span>
                I want to listen
              </motion.button>
              <p className="text-sm text-secondary-500 mt-2 px-4">Be there for someone and earn empathy credits.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
