'use client'

import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { ArrowRight } from 'lucide-react'

interface GlowingOrbCTAProps {
  onClick: () => void
}

export function GlowingOrbCTA({ onClick }: GlowingOrbCTAProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <motion.button
      onClick={onClick}
      className="relative w-40 h-40 md:w-48 md:h-48 rounded-full focus:outline-none"
      whileHover={prefersReducedMotion ? undefined : 'hover'}
      whileTap={{ scale: 0.95 }}
      initial="initial"
      animate="initial"
    >
      {/* Pulsing background glow */}
      <motion.div
        className="absolute inset-0 bg-purple-500 rounded-full blur-2xl"
        animate={prefersReducedMotion ? { scale: 1, opacity: 0.5 } : {
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={prefersReducedMotion ? { duration: 0 } : {
          duration: 4,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />

      {/* Main orb body */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full shadow-lg"
        variants={prefersReducedMotion ? undefined : {
          initial: { scale: 1 },
          hover: { scale: 1.1 },
        }}
        transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
      />

      {/* Inner light spot */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-1/4 h-1/4 bg-purple-300 rounded-full blur-xl opacity-70"
        variants={prefersReducedMotion ? undefined : {
          initial: { scale: 1, x: '-50%', y: '-50%' },
          hover: { scale: 1.2, x: '-40%', y: '-60%' },
        }}
        transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
      />

      {/* Text and Icon Content */}
      <motion.div className="relative z-10 flex items-center justify-center h-full text-white overflow-hidden">
        <motion.span
          className="text-xl md:text-2xl font-bold tracking-wider"
          variants={prefersReducedMotion ? undefined : {
            initial: { opacity: 1, y: 0 },
            hover: { opacity: 0, y: -20 },
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          Begin
        </motion.span>
        <motion.div
          className="absolute"
          variants={prefersReducedMotion ? undefined : {
            initial: { opacity: 0, y: 20 },
            hover: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <ArrowRight className="w-8 h-8 md:w-10 md:h-10" />
        </motion.div>
      </motion.div>
    </motion.button>
  )
}
