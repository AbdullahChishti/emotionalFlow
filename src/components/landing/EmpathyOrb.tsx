'use client'

import { useState, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'

interface EmpathyOrbProps {
  onBegin: () => void
}

export function EmpathyOrb({ onBegin }: EmpathyOrbProps) {
  const [isHeld, setIsHeld] = useState(false)
  const holdTimeout = useRef<NodeJS.Timeout | null>(null)
  const rippleControls = useAnimation()
  const orbControls = useAnimation()

  const handlePressStart = () => {
    // Start the ripple effect immediately
    rippleControls.start({
      scale: [0, 4],
      opacity: [0.5, 0],
      transition: { duration: 0.7, ease: 'easeOut' },
    })

    // Start the hold-to-activate timer
    holdTimeout.current = setTimeout(() => {
      setIsHeld(true)
      onBegin()
      if (typeof window.navigator.vibrate === 'function') {
        window.navigator.vibrate(100)
      }
      orbControls.start({ scale: 0.95, transition: { duration: 0.2 } })
    }, 1500)
  }

  const handlePressEnd = () => {
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current)
    }
    if (!isHeld) {
      // If not held long enough, just reset
      orbControls.start({
        scale: 1,
        transition: { type: 'spring', stiffness: 500, damping: 30 },
      })
    }
  }

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center select-none"
      whileHover="hover"
      initial="rest"
    >
      {/* Soft Shadow */}
      <motion.div
        className="absolute w-32 h-32 bg-purple-900 rounded-full blur-2xl -bottom-4 opacity-30"
        variants={{
          rest: { y: 0, opacity: 0.3 },
          hover: { y: 10, opacity: 0.5, scale: 1.1 },
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />

      {/* Main Orb Container */}
      <motion.div
        className="relative w-32 h-32 md:w-40 md:h-40 cursor-pointer z-10 flex items-center justify-center"
        animate={orbControls}
        variants={{
          rest: { y: 0 },
          hover: { y: -10 },
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      >
        {/* Breathing Glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-500"
          variants={{
            rest: { scale: 1, opacity: 0.4, filter: 'blur(24px)' },
            hover: { scale: 1.1, opacity: 0.6, filter: 'blur(32px)' },
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />

        {/* Core Orb Gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-400 via-purple-500 to-indigo-600" />

        {/* Ripple Effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white"
          animate={rippleControls}
          initial={{ scale: 0, opacity: 0 }}
        />

        {/* Text inside the orb */}
        <span className="relative text-white font-medium text-lg tracking-wide">
          Hold to Begin
        </span>
      </motion.div>
    </motion.div>
  )
}
