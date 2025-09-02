'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function SignupScreen() {
  const [intent, setIntent] = useState<'listen' | 'support' | null>(null)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-100 via-white to-primary-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 220,
            height: 220,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
            top: '8%',
            left: '8%'
          }}
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 180,
            height: 180,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
            bottom: '15%',
            right: '12%'
          }}
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 6
          }}
        />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <span className="material-symbols-outlined text-4xl text-primary-600">psychology</span>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                MindWell
              </h1>
            </motion.div>
            <h2 className="text-2xl font-semibold text-secondary-800 mb-2">Join Your Healing Community</h2>
            <p className="text-secondary-600">Start your journey toward better mental wellness</p>
          </motion.div>

          {/* Signup Form */}
          <motion.div
            className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-center text-secondary-800">Create your account</h3>

            <div className="space-y-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 text-xl">person</span>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl py-4 pl-12 pr-4 text-secondary-800 placeholder:text-secondary-400 focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all outline-none"
                />
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 text-xl">mail</span>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl py-4 pl-12 pr-4 text-secondary-800 placeholder:text-secondary-400 focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all outline-none"
                />
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 text-xl">lock</span>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl py-4 pl-12 pr-4 text-secondary-800 placeholder:text-secondary-400 focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all outline-none"
                />
              </div>
            </div>

            {/* Intent Selection */}
            <div className="pt-4 space-y-4">
              <p className="text-center text-sm text-secondary-600 font-medium">I'm here to...</p>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  className={`w-full text-center p-4 rounded-xl border-2 font-semibold transition-all duration-300 ${
                    intent === 'listen'
                      ? 'bg-primary-500 border-primary-500 text-white shadow-lg'
                      : 'bg-white/70 backdrop-blur-sm border-white/40 hover:border-primary-300 text-secondary-700'
                  }`}
                  onClick={() => setIntent('listen')}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: intent === 'listen' ? 1 : 1.02 }}
                >
                  <span className="material-symbols-outlined text-xl mb-1 block">headphones</span>
                  Listen
                </motion.button>
                <motion.button
                  className={`w-full text-center p-4 rounded-xl border-2 font-semibold transition-all duration-300 ${
                    intent === 'support'
                      ? 'bg-primary-500 border-primary-500 text-white shadow-lg'
                      : 'bg-white/70 backdrop-blur-sm border-white/40 hover:border-primary-300 text-secondary-700'
                  }`}
                  onClick={() => setIntent('support')}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: intent === 'support' ? 1 : 1.02 }}
                >
                  <span className="material-symbols-outlined text-xl mb-1 block">favorite</span>
                  Get Support
                </motion.button>
              </div>
            </div>

            <div className="pt-2">
              <motion.button
                className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all duration-300 transform ${
                  intent
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white hover:shadow-xl hover:scale-105 shadow-primary-500/30'
                    : 'bg-secondary-300 text-secondary-500 cursor-not-allowed'
                }`}
                disabled={!intent}
                whileHover={intent ? { scale: 1.02 } : {}}
                whileTap={intent ? { scale: 0.98 } : {}}
              >
                Join MindWell
              </motion.button>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-secondary-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors hover:underline">
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
