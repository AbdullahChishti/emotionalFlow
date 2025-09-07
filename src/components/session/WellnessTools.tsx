'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { track } from '@/lib/analytics'

// Breathing Exercise Component
export function BreathingExercise() {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [count, setCount] = useState(4)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setCount(prev => {
        if (prev === 1) {
          setPhase(current => {
            if (current === 'inhale') return 'hold'
            if (current === 'hold') return 'exhale'
            return 'inhale'
          })
          return 4
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive])

  const phaseConfig = {
    inhale: { instruction: 'Breathe in slowly', scale: 1.3 },
    hold: { instruction: 'Hold gently', scale: 1.3 },
    exhale: { instruction: 'Release slowly', scale: 0.7 }
  }

  const currentPhase = phaseConfig[phase]

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/60 shadow-xl">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800 mb-3">Mindful Breathing</h3>
        <p className="text-sm text-slate-600 mb-8 leading-relaxed font-light">
          Follow the rhythm to find your center
        </p>

        <div className="relative w-32 h-32 mx-auto mb-8">
          <motion.div
            className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-xl border border-white/60"
            animate={{ scale: currentPhase.scale }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <span className="text-3xl font-bold text-emerald-600">{count}</span>
          </motion.div>
          <div className="absolute inset-0 rounded-full border-2 border-[#335f64]/20 animate-pulse" />
        </div>

        <div className="mb-6">
          <p className="text-lg font-semibold text-slate-800 mb-2">{currentPhase.instruction}</p>
          <p className="text-xs text-slate-500 capitalize font-medium">{phase} phase</p>
        </div>

        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 shadow-sm ${
            isActive
              ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:from-red-200 hover:to-red-300 border border-red-200/50'
              : 'bg-gradient-to-r from-slate-100 to-slate-200 text-emerald-600 hover:from-slate-200 hover:to-slate-300 border border-slate-200/50'
          }`}
        >
          {isActive ? 'Pause' : 'Resume'}
        </button>
      </div>
    </div>
  )
}

// Grounding Exercise Component
export function GroundingExercise() {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 max-w-md w-full text-center border border-slate-200/60 shadow-xl">
      <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center border border-white/60">
        <span className="material-symbols-outlined text-emerald-600 text-2xl">spa</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">5-4-3-2-1 Grounding</h3>
      <p className="text-slate-600 text-sm mb-5">
        Notice 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell, and 1 you can taste.
      </p>
    </div>
  )
}

// Journal Component
export function JournalExercise() {
  const [journalText, setJournalText] = useState('')

  const handleSave = () => {
    // Save journal entry logic
    track('journal_save', { length: journalText.length })
    console.log('Journal saved:', journalText)
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 max-w-lg w-full border border-slate-200/60 shadow-xl">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Gentle Journal</h3>
      <p className="text-slate-600 text-sm mb-3">Write anything that comes up for you right now.</p>
      
      <textarea 
        value={journalText}
        onChange={(e) => setJournalText(e.target.value)}
        className="w-full rounded-2xl border border-slate-300/60 p-3 bg-white/90 outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600/50 text-slate-800 text-sm" 
        rows={5} 
        placeholder="Let your thoughts flow..." 
      />
      
      <div className="mt-4 flex justify-end gap-3">
        <button 
          className="px-4 py-2 rounded-2xl border border-slate-300 bg-white/70 text-slate-700 text-sm"
        >
          Clear
        </button>
        <button 
          onClick={handleSave}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm"
        >
          Save
        </button>
      </div>
    </div>
  )
}

// Main Wellness Tools Component
interface WellnessToolsProps {
  onClose: () => void
}

export function WellnessTools({ onClose }: WellnessToolsProps) {
  const [activeTab, setActiveTab] = useState<'breathing' | 'grounding' | 'journal'>('breathing')

  const tools = [
    { id: 'breathing', label: 'Breathing', icon: 'self_improvement' },
    { id: 'grounding', label: 'Grounding', icon: 'spa' },
    { id: 'journal', label: 'Journal', icon: 'edit_note' }
  ] as const

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'breathing':
        return <BreathingExercise />
      case 'grounding':
        return <GroundingExercise />
      case 'journal':
        return <JournalExercise />
      default:
        return <BreathingExercise />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ duration: 0.25 }}
        className="max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tool Selector */}
        <div className="mb-4 flex justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 border border-slate-200/60 shadow-sm">
            <div className="flex gap-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setActiveTab(tool.id)
                    track('wellness_tool_switch', { tool: tool.id })
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
                    activeTab === tool.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tool.icon}</span>
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Tool Component */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderActiveComponent()}
          </motion.div>
        </AnimatePresence>

        {/* Close Button */}
        <div className="text-center mt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-2xl text-slate-700 text-sm font-medium hover:bg-white transition-all duration-200 shadow-sm"
          >
            Close Tools
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
