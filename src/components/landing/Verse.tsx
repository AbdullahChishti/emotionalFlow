'use client'

import { motion, Transition } from 'framer-motion'

interface VerseProps {
  title: string
  description: string
  icon: React.ComponentType<{ color: string; size?: number }>
  color: string
  onNext: () => void
  onBack: () => void
  isFirst: boolean
  isLast: boolean
}

export function Verse({ title, description, icon: Icon, color, onNext, onBack, isFirst, isLast }: VerseProps) {
  const verseVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const verseTransition: Transition = {
    duration: 0.8,
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
      <div className="mb-8">
        <Icon color={color} size={120} />
      </div>
      <h2 className="text-4xl md:text-5xl font-serif tracking-tighter leading-tight mb-4" style={{ color }}>
        {title}
      </h2>
      <p className="text-lg md:text-xl text-zinc-400 mb-12">
        {description}
      </p>
      <div className="flex gap-6 items-center">
        {!isFirst && (
          <button onClick={onBack} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            Back
          </button>
        )}
        <button 
          onClick={onNext} 
          className="px-6 py-3 font-medium text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl"
          style={{ 
            backgroundColor: color,
            boxShadow: `0 10px 20px -10px ${color}`
          }}
        >
          {isLast ? 'Continue' : 'Next'}
        </button>
      </div>
    </motion.div>
  )
}
