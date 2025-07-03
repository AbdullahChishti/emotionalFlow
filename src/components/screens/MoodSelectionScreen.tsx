'use client'

import { useState, FC } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { ChevronLeft, ArrowRight, Leaf } from 'lucide-react'

// --- Animated Scene Components ---
const OverwhelmedScene = () => (
  <div className="absolute inset-0 overflow-hidden bg-gray-800">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-white/30 rounded-full"
        initial={{ x: Math.random() * 300 - 50, y: Math.random() * 500 - 100, scale: Math.random() * 0.5 + 0.2, opacity: 0 }}
        animate={{ 
          x: Math.random() * 300 - 50,
          y: Math.random() * 500 - 100,
          opacity: [0, 0.5, 0]
        }}
        transition={{
          duration: Math.random() * 2 + 1,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: 'linear'
        }}
        style={{ width: `${Math.random() * 8 + 4}px`, height: `${Math.random() * 8 + 4}px` }}
      />
    ))}
  </div>
)

const NumbScene = () => (
  <div className="absolute inset-0 bg-gray-400 overflow-hidden">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/noise.svg)', backgroundSize: '100px' }}></div>
  </div>
)

const CalmScene = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-blue-900">
    <motion.div
      className="w-24 h-24 bg-blue-400 rounded-full"
      animate={{ scale: [1, 1.05, 1], opacity: [0.7, 0.9, 0.7] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ boxShadow: '0 0 40px 20px rgba(100, 180, 255, 0.5)' }}
    />
  </div>
)

const LostScene = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-700 overflow-hidden">
    <motion.div
      initial={{ y: -100, rotate: -45, opacity: 0 }}
      animate={{ y: 100, rotate: 45, opacity: 1 }}
      transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    >
      <Leaf className="w-16 h-16 text-gray-400/80" />
    </motion.div>
  </div>
)

const HopefulScene = () => (
  <div className="absolute inset-0 bg-black overflow-hidden">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute h-full w-1/3 bg-gradient-to-t from-transparent via-yellow-200/50 to-transparent"
        initial={{ y: '100%', rotate: 45 }}
        animate={{ y: '-100%' }}
        transition={{ 
          duration: 6 + i * 2, 
          repeat: Infinity, 
          ease: 'linear', 
          delay: i * 2
        }}
        style={{ left: `${i * 33.33}%` }}
      />
    ))}
  </div>
)

// --- Main Component ---
interface MoodSelectionScreenProps {
  onNavigate: (screen: string, params?: any) => void
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white font-sans">
      <header className="flex items-center justify-between p-4 md:p-6 relative z-10">
        <button onClick={handleBack} className="p-2 text-gray-300 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Which moment feels most like you right now?</h1>
          <p className="text-gray-400">There’s no right answer — just what resonates.</p>
        </motion.div>

        <div className="w-full max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {scenes.map((scene) => (
                    <motion.div
                        key={scene.value}
                        onClick={() => setSelectedScene(scene.value)}
                        onHoverStart={() => setHoveredScene(scene.value)}
                        onHoverEnd={() => setHoveredScene(null)}
                        className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105"
                        animate={{ scale: selectedScene === scene.value ? 1.05 : 1, zIndex: selectedScene === scene.value ? 10 : 1 }}
                    >
                        <scene.component />
                        <AnimatePresence>
                            {(hoveredScene === scene.value || selectedScene === scene.value) && (
                                <motion.div 
                                    className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                >
                                    <p className="text-center font-semibold text-white">{scene.label}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <AnimatePresence>
                          {selectedScene === scene.value && (
                            <motion.div 
                              className="absolute inset-0 border-4 border-white/80 rounded-2xl pointer-events-none"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            />
                          )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>

        <div className="text-center mt-10 space-y-4">
             <button onClick={handleNotSure} className="text-gray-400 hover:text-white transition-colors">Not sure?</button>
            <p className="text-sm text-gray-500">Don’t worry about explaining. We’ll use this to find the right listener.</p>
        </div>
      </main>

      <footer className="p-4 md:p-6 relative z-10">
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
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-white text-black rounded-xl font-bold shadow-lg shadow-white/10 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  )
}
