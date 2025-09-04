'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface TherapeuticWelcomeProps {
  greeting?: string
  message?: string
  className?: string
}

export function TherapeuticWelcome({
  greeting = "Welcome back, dear friend",
  message = "We're honored to continue supporting you on your journey of self-discovery and emotional wellness. Take your time and proceed at your own pace.",
  className = ''
}: TherapeuticWelcomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`text-center space-y-3 ${className}`}
    >
      <h2 className="text-therapeutic-reassuring text-slate-700 leading-relaxed tracking-tight">
        {greeting}
      </h2>
      <p className="text-therapeutic-welcoming text-slate-600 leading-relaxed max-w-md mx-auto">
        {message}
      </p>
    </motion.div>
  )
}
