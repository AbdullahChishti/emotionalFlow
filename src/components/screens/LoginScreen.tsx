'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function LoginScreen() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(110, 182, 113, 0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
            top: '10%',
            left: '10%'
          }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 150,
            height: 150,
            background: 'radial-gradient(circle, rgba(110, 182, 113, 0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
            bottom: '20%',
            right: '15%'
          }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 5
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
              <span className="material-symbols-outlined text-4xl text-brand-green-600">psychology</span>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green-600 to-brand-green-700 bg-clip-text text-transparent">
                MindWell
              </h1>
            </motion.div>
            <h2 className="text-2xl font-semibold text-secondary-800 mb-2">Welcome Back</h2>
            <p className="text-secondary-600">Continue your healing journey</p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-center text-secondary-800">Sign in to your account</h3>

            <div className="space-y-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 text-xl">mail</span>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl py-4 pl-12 pr-4 text-secondary-800 placeholder:text-secondary-400 focus:ring-2 focus:ring-brand-green-300 focus:border-brand-green-300 transition-all outline-none"
                />
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 text-xl">lock</span>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl py-4 pl-12 pr-4 text-secondary-800 placeholder:text-secondary-400 focus:ring-2 focus:ring-brand-green-300 focus:border-brand-green-300 transition-all outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <motion.button
                className="w-full bg-gradient-to-r from-brand-green-500 to-brand-green-600 hover:from-brand-green-600 hover:to-brand-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-green-500/30 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In
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
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold text-brand-green-600 hover:text-brand-green-700 transition-colors hover:underline">
                Sign Up
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
