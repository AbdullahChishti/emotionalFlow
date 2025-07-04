'use client'

import { motion } from 'framer-motion'
import { useId } from 'react'

interface RedThreadProps {
  positions: { x: number; y: number }[]
}

export function RedThread({ positions }: RedThreadProps) {
  const gradientId = useId()

  if (positions.length < 2) {
    return null
  }

  // Create a more organic, wavy path using cubic bezier curves
  const pathD = positions.reduce((acc, pos, i) => {
    if (i === 0) {
      return `M ${pos.x} ${pos.y}`
    }
    const p1 = positions[i - 1]
    const p2 = pos
    const waveHeight = 25

    // Control points for a gentle S-curve
    const cp1x = p1.x + (p2.x - p1.x) * 0.25
    const cp1y = p1.y + (p2.y - p1.y) * 0.25 + (i % 2 === 0 ? -waveHeight : waveHeight)
    const cp2x = p1.x + (p2.x - p1.x) * 0.75
    const cp2y = p1.y + (p2.y - p1.y) * 0.75 + (i % 2 === 0 ? waveHeight : -waveHeight)

    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }, '')

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 15 }}
      overflow="visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
          <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Softer Glow effect */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={10}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, ease: 'easeInOut', delay: 1 }}
        style={{ filter: 'blur(10px)', opacity: 0.4 }}
      />

      {/* Main thread */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, ease: 'easeInOut', delay: 1 }}
      />

      {/* Traveling Particles using SMIL animation for performance */}
      {[...Array(5)].map((_, i) => (
        <circle key={i} r={3} fill="#ef4444">
          <animateMotion
            dur={`${4 + i * 0.5}s`}
            repeatCount="indefinite"
            path={pathD}
            begin={`${i * 0.8}s`}
          />
          <animate
            attributeName="r"
            values="2;4;2"
            dur="4s"
            repeatCount="indefinite"
            begin={`${i * 0.8}s`}
          />
        </circle>
      ))}
    </svg>
  )
}
