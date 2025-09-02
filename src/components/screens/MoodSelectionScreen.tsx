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
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-100 via-white to-primary-50 relative overflow-hidden text-secondary-800 font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            top: '10%',
            right: '10%'
          }}
          animate={{
            y: [0, -30, 0],
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
            width: 250,
            height: 250,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            bottom: '20%',
            left: '15%'
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 8
          }}
        />
      </div>

      {/* Header */}
      <header className="relative flex items-center justify-between p-6 glassmorphic z-10">
        <motion.button
          onClick={handleBack}
          className="p-3 text-secondary-500 hover:bg-secondary-100/70 hover:text-secondary-700 rounded-full transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </motion.button>
        <div className="flex-1 text-center">
          <motion.div
            className="flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <span className="material-symbols-outlined text-3xl text-primary-600">psychology</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              MindWell
            </h1>
          </motion.div>
        </div>
        <div className="w-14" />
      </header>

      <main className="relative flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-800 mb-4 leading-tight">
            Which moment feels most like you right now?
          </h1>
          <p className="text-secondary-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Your feelings are valid, and there&apos;s no judgment here. Choose what feels true to your heart in this moment—we&apos;re here to meet you exactly where you are.
          </p>
        </motion.div>

        <div className="w-full max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {scenes.map((scene) => (
                    <motion.div
                        key={scene.value}
                        onClick={() => setSelectedScene(scene.value)}
                        onHoverStart={() => setHoveredScene(scene.value)}
                        onHoverEnd={() => setHoveredScene(null)}
                        className="relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer shadow-lg"
                        animate={{ scale: selectedScene === scene.value ? 1.05 : 1, zIndex: selectedScene === scene.value ? 10 : 1 }}
                        whileHover={{ scale: selectedScene === scene.value ? 1.05 : 1.03 }}
                        transition={{ duration: 0.2 }}
                    >
                        <scene.component />
                        <AnimatePresence>
                            {(hoveredScene === scene.value || selectedScene === scene.value) && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 p-6 glassmorphic"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                >
                                    <p className="text-center font-bold text-secondary-800">{scene.label}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <AnimatePresence>
                          {selectedScene === scene.value && (
                            <motion.div
                              className="absolute inset-0 border-4 border-primary-400 rounded-3xl pointer-events-none shadow-lg shadow-primary-400/20"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>

        <div className="text-center mt-12 space-y-4">
             <motion.button
               onClick={handleNotSure}
               className="text-secondary-500 hover:text-primary-600 transition-colors font-medium text-lg"
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
             >
               Feeling uncertain?
             </motion.button>
            <p className="text-base text-secondary-600 max-w-md mx-auto leading-relaxed">
              That&apos;s completely okay—emotions can feel complex. We&apos;ll gently guide you to find the perfect listener who can meet you in this tender space.
            </p>
        </div>
      </main>

      <footer className="p-6 relative z-10">
        <AnimatePresence>
          {selectedScene !== null && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="max-w-md mx-auto"
            >
              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
              >
                Continue
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  )
}
