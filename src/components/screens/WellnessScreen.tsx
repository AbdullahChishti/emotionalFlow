'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import 'material-symbols/outlined.css'

const wellnessOptions = [
  {
    title: 'Daily Check-in',
    description: 'Track your mood and get personalized recommendations',
    icon: 'sentiment_satisfied',
    href: '/dashboard',
    color: 'from-brand-green-400 to-brand-green-600',
    bgColor: 'bg-brand-green-50'
  },
  {
    title: 'Guided Meditation',
    description: 'Find peace and clarity with guided meditation sessions',
    icon: 'self_improvement',
    href: '/meditation',
    color: 'from-brand-green-500 to-brand-green-700',
    bgColor: 'bg-brand-green-50'
  },
  {
    title: 'Therapy Sessions',
    description: 'Connect with listeners and share your journey',
    icon: 'chat',
    href: '/session',
    color: 'from-brand-green-600 to-brand-green-800',
    bgColor: 'bg-brand-green-50'
  }
]

export function WellnessScreen() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(51, 95, 100, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            top: '10%',
            left: '10%'
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      <div className="min-h-screen p-4 relative">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl text-white">spa</span>
            </div>
            <h1 className="text-4xl font-bold text-secondary-800 mb-4">Your Wellness Journey</h1>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto leading-relaxed">
              Take care of your mental health with daily check-ins, guided meditation, and supportive conversations.
            </p>
          </motion.div>

          {/* Wellness Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {wellnessOptions.map((option, index) => (
              <motion.div
                key={option.title}
                className={`bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${option.bgColor}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(option.href)}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="material-symbols-outlined text-2xl text-white">
                    {option.icon}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-secondary-800 mb-3 group-hover:text-primary-700 transition-colors">
                  {option.title}
                </h3>

                <p className="text-secondary-600 leading-relaxed mb-6">
                  {option.description}
                </p>

                <div className="flex items-center text-primary-600 font-semibold group-hover:text-primary-700 transition-colors">
                  <span>Get Started</span>
                  <motion.span
                    className="material-symbols-outlined text-lg ml-2"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    arrow_forward
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <motion.div
            className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-secondary-800 mb-6 text-center">Your Wellness Progress</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">7</div>
                <p className="text-secondary-600">Days checked in</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">12</div>
                <p className="text-secondary-600">Meditation sessions</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
                <p className="text-secondary-600">Support conversations</p>
              </div>
            </div>
          </motion.div>

          {/* Inspirational Quote */}
          <motion.div
            className="text-center mt-12 bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <blockquote className="text-xl text-secondary-700 font-light leading-relaxed italic">
              "Self-care is not a luxury. It is a necessity for those who want to give their best to others."
            </blockquote>
            <div className="mt-4 text-sm text-secondary-500">
              — Take time for yourself today
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
