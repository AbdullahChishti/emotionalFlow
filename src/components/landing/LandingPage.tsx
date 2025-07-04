'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { valueProps } from './journey-data'
import { Verse } from './Verse'
import { FinalVerse } from './FinalVerse'

export function LandingPage() {
  const [scene, setScene] = useState(0)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const handleNext = () => {
    // Allow transitioning to the final scene
    if (scene < valueProps.length + 1) {
      setScene(scene + 1)
    }
  }

  const handleBack = () => {
    if (scene > 0) {
      setScene(scene - 1)
    }
  }

  const handleRestart = () => {
    setScene(0)
  }

  return (
    <main
      onMouseMove={handleMouseMove}
      className="group relative flex h-screen w-full flex-col items-center justify-center bg-[#0A0A0A] text-zinc-50 overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([newX, newY]) =>
              `radial-gradient(600px at ${newX}px ${newY}px, rgba(167, 139, 250, 0.1), transparent 80%)`
          ),
        }}
      />
      
      <AnimatePresence mode="wait">
        {scene === 0 && (
          <motion.div
            key="scene0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.6 } }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="z-10 text-center text-4xl md:text-6xl font-serif tracking-tighter leading-tight flex items-center">
              A quiet space to be heard
              <motion.button
                onClick={handleNext}
                className="text-purple-400 ml-2 bg-transparent border-none p-0 cursor-pointer text-4xl md:text-6xl font-serif tracking-tighter leading-tight"
                animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                .
              </motion.button>
            </h1>
          </motion.div>
        )}

        {scene > 0 && scene <= valueProps.length && (
          <Verse
            key={`scene${scene}`}
            {...valueProps[scene - 1]}
            onNext={handleNext}
            onBack={handleBack}
            isFirst={scene === 1}
            isLast={scene === valueProps.length}
          />
        )}

        {scene === valueProps.length + 1 && (
          <FinalVerse key="finalScene" onRestart={handleRestart} />
        )}
      </AnimatePresence>
    </main>
  )
}

