'use client'

import { motion, Transition } from 'framer-motion'
import { GlowingOrbCTA } from './GlowingOrbCTA'

interface FinalVerseProps {
  onRestart: () => void
}

export function FinalVerse({ onRestart }: FinalVerseProps) {
  const verseVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const verseTransition: Transition = {
    duration: 1.2,
    ease: [0.43, 0.13, 0.23, 0.96],
  }

  return (
    <motion.div
      variants={verseVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={verseTransition}
      className="z-10 text-center flex flex-col items-center justify-center w-full max-w-2xl px-4"
    >
      <h2 className="text-4xl md:text-5xl font-serif tracking-tighter leading-tight mb-6 text-zinc-100">
        Your space is ready.
      </h2>
      <p className="text-lg md:text-xl text-zinc-400 mb-12">
        Begin your journey with us. Find your center, share your strength.
      </p>
      <div className="mb-12">
        <GlowingOrbCTA onClick={() => {}} />
      </div>
      <button onClick={onRestart} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        Restart the journey
      </button>
    </motion.div>
  )
}
