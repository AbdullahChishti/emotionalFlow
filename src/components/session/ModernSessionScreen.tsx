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
    <div className="bg-white relative overflow-hidden h-[calc(100dvh-6rem-1.5rem)] lg:h-[calc(100dvh-7rem-1.5rem)]">
      {/* Subtle background decorations */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-20 left-10 w-32 h-32 border-l-2 border-t-2 border-slate-400/15 rounded-tl-full" />
        <div className="absolute top-40 right-20 w-24 h-24 border-r-2 border-b-2 border-slate-500/20 rounded-br-full" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 h-full flex flex-col"
      >
        {/* Header with session controls */}
        <div className="flex-shrink-0 p-4 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-slate-800">Therapy Session</h1>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Active</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                  setShowWellnessTools(true)
                  track('tools_toggle', { action: 'open' })
                      }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white border border-slate-200/60 rounded-lg text-slate-700 text-sm font-medium transition-all duration-200 shadow-sm"
                    >
                <span className="material-symbols-outlined text-base">spa</span>
                      <span>Wellness Tools</span>
                    </button>
              
              <div className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200/70">
                        {formatTime(timeElapsed)}
                      </div>
              
                      <button
                        onClick={() => setShowEndModal(true)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                      >
                        End Session
                      </button>
                    </div>
                  </div>
                    </div>

        {/* Main content - Two columns */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full grid grid-cols-[260px_1fr] gap-6 p-6">
            {/* Left Column - Subtle assessment access indicator */}
            <div className="relative h-full overflow-y-auto">
              <AssessmentSidebar variant="compact" />
              <div className="absolute right-[-12px] top-0 bottom-0 w-px bg-slate-200/80" />
            </div>

            {/* Right Column - Chat Interface */}
            <div className="min-w-0 h-full overflow-hidden">
              <ChatInterface therapistName={therapistName} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* End Session Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border border-slate-200/60"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/60">
                <span className="material-symbols-outlined text-[#335f64] text-3xl">psychology</span>
              </div>

              <h2 className="text-2xl font-semibold text-slate-800 mb-3">Complete Your Session?</h2>
              <p className="text-slate-600 mb-8 text-base leading-relaxed">
                You've shared <span className="font-semibold text-slate-800">{formatTime(timeElapsed)}</span> of meaningful conversation.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 py-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 text-sm font-semibold rounded-2xl transition-all duration-300 hover:from-slate-200 hover:to-slate-300 shadow-sm"
                >
                  Continue
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex-1 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm font-semibold rounded-2xl transition-all duration-300 hover:from-slate-800 hover:to-slate-900 shadow-lg"
                >
                  End Session
                </button>
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
