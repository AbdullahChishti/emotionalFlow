'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Material Symbols icons import
import 'material-symbols/outlined.css'

// --- Animated Scene Components ---
const OverwhelmedScene = () => (
  <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-red-100 to-red-200">
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="w-20 h-20 bg-red-300 rounded-full flex items-center justify-center"
        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-4xl">🌪️</span>
      </motion.div>
    </div>
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-red-400/40 rounded-full"
        initial={{ x: Math.random() * 200 - 50, y: Math.random() * 300 - 100, scale: Math.random() * 0.3 + 0.1, opacity: 0 }}
        animate={{
          x: Math.random() * 200 - 50,
          y: Math.random() * 300 - 100,
          opacity: [0, 0.6, 0]
        }}
        transition={{
          duration: Math.random() * 2 + 1,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: 'linear'
        }}
        style={{ width: `${Math.random() * 6 + 3}px`, height: `${Math.random() * 6 + 3}px` }}
      />
    ))}
  </div>
)

const NumbScene = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="text-6xl opacity-60"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        💭
      </motion.div>
    </div>
  </div>
)

const CalmScene = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
    <motion.div
      className="w-24 h-24 bg-primary-300 rounded-full flex items-center justify-center"
      animate={{ scale: [1, 1.05, 1], opacity: [0.7, 0.9, 0.7] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="text-3xl">🌸</span>
    </motion.div>
  </div>
)

const LostScene = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
    <motion.div
      initial={{ y: -50, rotate: -15, opacity: 0 }}
      animate={{ y: 50, rotate: 15, opacity: 1 }}
      transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    >
      <span className="text-5xl">🍂</span>
    </motion.div>
  </div>
)

const HopefulScene = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-amber-100 overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="text-6xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        🌅
      </motion.div>
    </div>
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 bg-gradient-to-t from-yellow-300/60 via-yellow-200/40 to-transparent"
        initial={{ height: 0, y: '100%' }}
        animate={{ height: Math.random() * 100 + 50, y: '0%' }}
        transition={{
          duration: 4 + i * 1,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: i * 0.5
        }}
        style={{ left: `${i * 25}%` }}
      />
    ))}
  </div>
)

// --- Main Component ---
interface NavigationParams {
  mood?: number
  mode?: 'listen' | 'support'
}

interface MoodSelectionScreenProps {
  onNavigate: (screen: string, params?: NavigationParams) => void
  mode: 'listen' | 'support'
}

const scenes = [
  { component: OverwhelmedScene, label: 'Overwhelmed', value: 1 },
  { component: NumbScene, label: 'Numb', value: 2 },
  { component: CalmScene, label: 'Calm', value: 4 },
  { component: LostScene, label: 'Lost', value: 3 },
  { component: HopefulScene, label: 'Hopeful', value: 7 },
]

export function MoodSelectionScreen({ onNavigate, mode }: MoodSelectionScreenProps) {
  const [selectedScene, setSelectedScene] = useState<number | null>(null)
  const [hoveredScene, setHoveredScene] = useState<number | null>(null)

  const handleContinue = () => {
    if (selectedScene !== null) {
      onNavigate('EmotionRefinement', { mood: selectedScene, mode })
    }
  }

  const handleBack = () => onNavigate('Welcome')
  const handleNotSure = () => setSelectedScene(4) // Selects 'Calm'

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-primary-50 text-secondary-800 font-sans relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-80 h-80 bg-primary-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-secondary-100/25 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-50/20 rounded-full blur-3xl"></div>
      </div>

      {/* Minimal Header */}
      <header className="relative p-6 z-10">
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

      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-12"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-primary-700 font-medium text-sm mb-6 border border-white/50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
              Take Your Time
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold text-secondary-800 mb-4 leading-tight">
              How are you feeling
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                right now?
              </span>
            </h1>
            <p className="text-secondary-600 text-base max-w-lg mx-auto leading-relaxed">
              Every emotion you feel is valid and important. Take a gentle breath and choose what resonates with your heart today.
            </p>
          </motion.div>
        </div>

        <div className="w-full max-w-4xl mx-auto">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
                {scenes.map((scene, index) => (
                    <motion.div
                        key={scene.value}
                        onClick={() => setSelectedScene(scene.value)}
                        onHoverStart={() => setHoveredScene(scene.value)}
                        onHoverEnd={() => setHoveredScene(null)}
                        className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                          opacity: 1,
                          scale: selectedScene === scene.value ? 1.05 : 1,
                          zIndex: selectedScene === scene.value ? 10 : 1
                        }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: selectedScene === scene.value ? 1.05 : 1.02 }}
                    >
                        <scene.component />

                        {/* Minimal overlay */}
                        <motion.div
                          className="absolute inset-0 bg-white/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: (hoveredScene === scene.value || selectedScene === scene.value) ? 1 : 0 }}
                        />

                        {/* Label */}
                        <motion.div
                          className="absolute bottom-3 left-3 right-3"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{
                            y: (hoveredScene === scene.value || selectedScene === scene.value) ? 0 : 10,
                            opacity: (hoveredScene === scene.value || selectedScene === scene.value) ? 1 : 0
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                            <p className="text-center text-sm font-medium text-secondary-800">{scene.label}</p>
                          </div>
                        </motion.div>

                        {/* Selection indicator */}
                        <AnimatePresence>
                          {selectedScene === scene.value && (
                            <motion.div
                              className="absolute inset-0 border-2 border-primary-400 rounded-2xl pointer-events-none"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-xs text-white">check</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </motion.div>
        </div>

        <motion.div
          className="text-center mt-8 space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.button
            onClick={handleNotSure}
            className="inline-flex items-center gap-2 text-secondary-500 hover:text-primary-600 transition-colors font-medium text-sm px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/70"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>💭</span>
            <span>Not sure?</span>
          </motion.button>
          <p className="text-sm text-secondary-600 max-w-sm mx-auto leading-relaxed">
            That&apos;s perfectly fine. Sometimes emotions need time to settle. We can start with something gentle.
          </p>
        </motion.div>
      </main>

      <motion.footer
        className="p-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <AnimatePresence>
          {selectedScene !== null && (
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="max-w-sm mx-auto"
            >
              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-base"
              >
                <span>Continue with this feeling</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.footer>
    </div>
  )
}
