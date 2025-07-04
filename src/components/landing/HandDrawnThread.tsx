'use client'

import { motion, Variants } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const threadVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: 1.5, type: 'spring', duration: 2, bounce: 0 },
      opacity: { delay: 1.5, duration: 0.1 },
    },
  },
}

export function HandDrawnThread() {
  const prefersReducedMotion = usePrefersReducedMotion()
  return (
    <motion.svg
      className="absolute top-0 left-0 w-full h-full -z-10"
      viewBox="0 0 600 200"
      preserveAspectRatio="none"
      initial={prefersReducedMotion ? 'visible' : 'hidden'}
      animate="visible"
    >
      <motion.path
        d="M 20 110 C 150 140, 300 60, 450 90 S 580 130, 580 130"
        fill="transparent"
        stroke="rgba(236, 72, 153, 0.7)"
        strokeWidth="4"
        strokeLinecap="round"
        variants={threadVariants}
      />
    </motion.svg>
  )
}
