'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { track } from '@/lib/analytics'
import { AssessmentSidebar } from './AssessmentSidebar'
import { ChatInterface } from './ChatInterface'
import { WellnessTools } from './WellnessTools'
import 'material-symbols/outlined.css'

interface ModernSessionScreenProps {
  onNavigate: (screen: string, params?: any) => void
  matchedUser?: { name: string }
}

export function ModernSessionScreen({ onNavigate, matchedUser }: ModernSessionScreenProps) {
  const therapistName = matchedUser?.name || 'MindWell'
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showEndModal, setShowEndModal] = useState(false)
  const [showWellnessTools, setShowWellnessTools] = useState(false)

  // Session Timer
  React.useEffect(() => {
    const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  const handleEndSession = () => {
    setShowEndModal(false)
    onNavigate('dashboard')
  }

  return (
    <div 
      className="relative overflow-hidden h-[calc(100dvh-6rem-1.5rem)] lg:h-[calc(100dvh-7rem-1.5rem)]"
      style={{
        fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%, #f8fafc 100%)'
      }}
    >
      {/* Ultra-sophisticated Background Layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating animated elements */}
        <motion.div
          className="absolute top-16 left-8 w-36 h-36 rounded-3xl opacity-20"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
            filter: 'blur(40px)'
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-32 right-16 w-28 h-28 rounded-2xl opacity-15"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #134e4a 100%)',
            filter: 'blur(30px)'
          }}
          animate={{
            y: [0, 15, 0],
            x: [0, -8, 0],
            scale: [1, 0.9, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-24 left-1/4 w-20 h-20 rounded-xl opacity-10"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            filter: 'blur(25px)'
          }}
          animate={{
            y: [0, -10, 0],
            x: [0, 5, 0],
            scale: [1, 1.05, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-16 h-16 rounded-lg opacity-12"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            filter: 'blur(20px)'
          }}
          animate={{
            y: [0, 12, 0],
            x: [0, -6, 0],
            scale: [1, 0.95, 1],
            opacity: [0.12, 0.22, 0.12]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />

        {/* Decorative geometric patterns */}
        <div className="absolute top-16 left-8 w-36 h-36 border-l-2 border-t-2 border-emerald-300/20 rounded-tl-2xl opacity-60" />
        <div className="absolute top-32 right-16 w-28 h-28 border-r-2 border-b-2 border-teal-400/15 rounded-br-2xl opacity-40" />
        <div className="absolute bottom-24 left-1/4 w-20 h-20 border-l border-t border-emerald-200/30 rounded-tl-xl opacity-30" />
        <div className="absolute top-1/3 right-1/3 w-16 h-16 border-r border-b border-teal-300/20 rounded-br-lg opacity-25" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/5 via-transparent to-teal-100/10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-50/5 to-teal-100/8" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 h-full flex flex-col"
      >
        {/* Ultra-refined Header with Sophisticated Design */}
        <motion.div
          className="flex-shrink-0 p-6 relative"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Subtle header background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-2 right-8 w-24 h-24 border-r border-b border-emerald-300 rounded-br-lg"></div>
            <div className="absolute bottom-1 left-12 w-16 h-16 border-l border-t border-teal-200 rounded-tl-md"></div>
          </div>

          <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm relative"
                  style={{
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
                    boxShadow: '0 4px 12px -4px rgba(16, 185, 129, 0.2)'
                  }}
                  whileHover={{
                    scale: 1.05,
                    rotate: 2,
                    boxShadow: "0 20px 40px -12px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.1)"
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.25, 0.1, 0.25, 1],
                    boxShadow: { duration: 0.25 }
                  }}
                >
                  <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-teal-500/5 rounded-xl"></div>
                </motion.div>
                <div>
                  <h1 
                    className="text-2xl font-light text-slate-800 tracking-tight"
                    style={{
                      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      letterSpacing: '-0.02em',
                      fontWeight: '200'
                    }}
                  >
                    Therapy Session
                  </h1>
                  <p 
                    className="text-sm text-slate-500 font-medium"
                    style={{
                      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      letterSpacing: '-0.005em',
                      fontWeight: '400'
                    }}
                  >
                    with {therapistName}
                  </p>
                </div>
              </div>

              <motion.div
                className="flex items-center gap-2 px-4 py-2 rounded-full shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: '#047857',
                  boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.15)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.25)'
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span 
                  className="text-sm font-medium"
                  style={{
                    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.005em',
                    fontWeight: '500'
                  }}
                >
                  Active Session
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.button
                onClick={() => {
                  setShowWellnessTools(true)
                  track('tools_toggle', { action: 'open' })
                }}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-500 shadow-sm hover:shadow-md"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: '#374151',
                  boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.1)'
                }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -1,
                  boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.15)',
                  background: 'rgba(255, 255, 255, 1)'
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                  <motion.div
                    className="w-5 h-5 flex items-center justify-center"
                    whileHover={{ rotate: 8, scale: 1.1 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <motion.svg
                      className="w-4 h-4 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      whileHover={{ fill: "rgba(16, 185, 129, 0.1)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </motion.svg>
                  </motion.div>
                <span 
                  style={{
                    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.005em',
                    fontWeight: '500'
                  }}
                >
                  Wellness Tools
                </span>
              </motion.button>

              <motion.div
                className="px-4 py-2.5 rounded-xl shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: '#374151',
                  boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.1)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.15)'
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                  <span 
                    className="font-mono tracking-wide"
                    style={{
                      fontFamily: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                      fontWeight: '500'
                    }}
                  >
                    {formatTime(timeElapsed)}
                  </span>
                </div>
              </motion.div>

              <motion.button
                onClick={() => setShowEndModal(true)}
                className="px-5 py-2.5 text-white text-sm font-medium rounded-xl transition-all duration-500 shadow-lg hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -1,
                  boxShadow: '0 12px 40px -8px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)'
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <span 
                  style={{
                    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.005em',
                    fontWeight: '500'
                  }}
                >
                  End Session
                </span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Ultra-refined Main Content Area */}
        <motion.div
          className="flex-1 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="max-w-7xl mx-auto h-full grid grid-cols-[280px_1fr] gap-8 p-8">
            {/* Enhanced Left Column - Assessment Sidebar */}
            <motion.div
              className="relative h-full overflow-y-auto rounded-2xl shadow-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/20 to-teal-50/10 rounded-2xl"></div>
              <div className="relative z-10 p-6">
                <AssessmentSidebar variant="compact" />
              </div>
              <div className="absolute right-[-16px] top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-emerald-300/40 to-transparent shadow-sm" />
            </motion.div>

            {/* Enhanced Right Column - Chat Interface */}
            <motion.div
              className="min-w-0 h-full rounded-2xl shadow-sm overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="h-full relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 via-teal-50/5 to-emerald-50/10 rounded-2xl"></div>
                <div className="relative z-10 h-full">
                  <ChatInterface therapistName={therapistName} />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Ultra-refined End Session Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="rounded-3xl p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
            >
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-8 right-8 w-16 h-16 border-r border-b border-emerald-300 rounded-br-lg"></div>
                <div className="absolute bottom-6 left-6 w-12 h-12 border-l border-t border-teal-200 rounded-tl-md"></div>
              </div>

              <div className="relative z-10">
                {/* Enhanced Icon */}
                <motion.div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl relative"
                  style={{
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 20px 40px -12px rgba(16, 185, 129, 0.25)'
                  }}
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg relative"
                    style={{
                      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                      boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.2)'
                    }}
                    whileHover={{ rotate: 3, scale: 1.05 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-teal-500/5 rounded-xl"></div>
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </motion.div>
                </motion.div>

                {/* Enhanced Typography */}
                <motion.h2
                  className="text-2xl font-light text-slate-800 mb-4 tracking-tight"
                  style={{
                    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.02em',
                    fontWeight: '200'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Complete Your Session?
                </motion.h2>

                <motion.div
                  className="flex items-center justify-center gap-2 text-slate-600 mb-8 text-base leading-relaxed"
                  style={{
                    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.01em',
                    fontWeight: '300'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <span>You've shared</span>
                  <span 
                    className="font-semibold text-slate-800 px-3 py-1 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      letterSpacing: '-0.005em',
                      fontWeight: '500'
                    }}
                  >
                    {formatTime(timeElapsed)}
                  </span>
                  <span>of meaningful conversation.</span>
                </motion.div>

                {/* Enhanced Action Buttons */}
                <motion.div
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <motion.button
                    onClick={() => setShowEndModal(false)}
                    className="flex-1 py-4 text-sm font-semibold rounded-2xl transition-all duration-500 shadow-lg hover:shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      color: '#374151',
                      boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.15)'
                    }}
                    whileHover={{
                      scale: 1.015,
                      y: -2,
                      boxShadow: "0 20px 40px -12px rgba(16, 185, 129, 0.25), 0 8px 16px -4px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.1)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      duration: 0.32,
                      ease: [0.25, 0.1, 0.25, 1],
                      boxShadow: { duration: 0.28 }
                    }}
                  >
                    <span 
                      style={{
                        fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        letterSpacing: '-0.005em',
                        fontWeight: '500'
                      }}
                    >
                      Continue Session
                    </span>
                  </motion.button>
                  <motion.button
                    onClick={handleEndSession}
                    className="flex-1 py-4 text-white text-sm font-semibold rounded-2xl transition-all duration-500 shadow-lg hover:shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                      boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    }}
                    whileHover={{
                      scale: 1.015,
                      y: -2,
                      boxShadow: "0 20px 40px -12px rgba(16, 185, 129, 0.4), 0 8px 16px -4px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.2)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      duration: 0.32,
                      ease: [0.25, 0.1, 0.25, 1],
                      boxShadow: { duration: 0.28 }
                    }}
                  >
                    <span 
                      style={{
                        fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        letterSpacing: '-0.005em',
                        fontWeight: '500'
                      }}
                    >
                      End Session
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wellness Tools Modal */}
      <AnimatePresence>
        {showWellnessTools && (
          <WellnessTools onClose={() => setShowWellnessTools(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
