'use client'

import { motion, Variants } from 'framer-motion'

export function SplitPortraitIllustration() {
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: 0.5, type: 'spring', duration: 1.5, bounce: 0 },
        opacity: { delay: 0.5, duration: 0.01 },
      },
    },
  }

  return (
    <motion.div
      className="relative w-80 h-80 flex items-center justify-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left Face Outline */}
        <motion.path
          d="M120 210C86.8629 210 60 183.137 60 150C60 116.863 86.8629 90 120 90V30"
          stroke="#a78bfa"
          strokeWidth="8"
          strokeLinecap="round"
          variants={draw}
        />
        {/* Right Face Outline */}
        <motion.path
          d="M120 210C153.137 210 180 183.137 180 150C180 116.863 153.137 90 120 90V30"
          stroke="#7dd3fc"
          strokeWidth="8"
          strokeLinecap="round"
          variants={draw}
        />
        {/* Shared Connection Point */}
        <motion.circle 
            cx="120" 
            cy="90" 
            r="10" 
            fill="#c4b5fd"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
        />
      </svg>
    </motion.div>
  )
}
