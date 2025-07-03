'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ArcProps {
  percentage: number;
  color: string;
  radius: number;
  strokeWidth: number;
}

const Arc = ({ percentage, color, radius, strokeWidth }: ArcProps) => {
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - percentage)

  return (
    <motion.circle
      cx="50"
      cy="50"
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={circumference}
      initial={{ strokeDashoffset: circumference }}
      whileInView={{ strokeDashoffset }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 2, ease: 'easeOut' }}
    />
  )
}

export function EmpathyWalletGraph() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative w-80 h-80 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {/* Background Circle */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(120, 82, 255, 0.1)" strokeWidth="8" />

        {/* Given Arc */}
        <Arc percentage={0.75} color="#a78bfa" radius={42} strokeWidth={8} />
        {/* Received Arc */}
        <Arc percentage={0.4} color="#7dd3fc" radius={32} strokeWidth={8} />

        {/* Glowing Pulses */}
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#a78bfa"
          strokeWidth="8"
          style={{ filter: 'blur(4px)' }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={isHovered ? 'hover' : 'default'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {isHovered ? (
              <>
                <p className="text-sm text-purple-500 font-semibold">You've helped</p>
                <p className="text-4xl font-bold text-zinc-800">3 people</p>
                <p className="text-sm text-zinc-500">this week</p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-zinc-700">Your Balance</p>
                <div className="mt-2 flex items-center justify-center gap-4">
                    <div className="text-center">
                        <p className="text-xs text-purple-500 uppercase tracking-wider">Given</p>
                        <p className="text-3xl font-bold text-purple-400">75</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-sky-400 uppercase tracking-wider">Received</p>
                        <p className="text-3xl font-bold text-sky-400">40</p>
                    </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
