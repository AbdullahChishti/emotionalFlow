'use client'

import React from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

interface InteractiveGlowContainerProps {
  children: React.ReactNode
  className?: string
  onMouseMove?: (event: React.MouseEvent<HTMLDivElement>) => void
  onTouchStart?: (event: React.TouchEvent<HTMLDivElement>) => void
}

export function InteractiveGlowContainer({
  children,
  className,
  onMouseMove,
  onTouchStart,
}: InteractiveGlowContainerProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = event
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
    onMouseMove?.(event)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onTouchStart={onTouchStart}
      className={`group relative ${className || ''}`}>
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([newX, newY]) =>
              // Using a subtle violet glow, similar to landing page
              `radial-gradient(600px at ${newX}px ${newY}px, rgba(167, 139, 250, 0.1), transparent 80%)`
          ),
        }}
      />
      {children}
    </div>
  )
}
