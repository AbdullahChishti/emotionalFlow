'use client'

import { motion } from 'framer-motion'

export function ReachingHandsIllustration() {
  return (
    <motion.div
      className="relative w-80 h-80 flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left Hand */}
        <motion.path
          d="M40 150 C 60 130, 80 120, 110 120"
          stroke="#a78bfa"
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0, x: -20, opacity: 0 }}
          whileInView={{ pathLength: 1, x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        />
        {/* Right Hand */}
        <motion.path
          d="M200 150 C 180 130, 160 120, 130 120"
          stroke="#7dd3fc"
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0, x: 20, opacity: 0 }}
          whileInView={{ pathLength: 1, x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        />
        {/* Interaction Glow */}
        <motion.circle
          cx="120"
          cy="120"
          r="20"
          fill="white"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.7 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 1.7, duration: 0.5 }}
          style={{ filter: 'blur(15px)' }}
        />
      </svg>
    </motion.div>
  )
}
