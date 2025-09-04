'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface TrustIndicator {
  icon: string
  text: string
  delay?: number
}

interface TrustIndicatorsProps {
  indicators?: TrustIndicator[]
  className?: string
}

export function TrustIndicators({
  indicators = [
    {
      icon: 'shield_lock',
      text: 'Your privacy is protected with bank-level security',
      delay: 0.1
    },
    {
      icon: 'health_and_safety',
      text: 'Evidence-based tools created with mental health professionals',
      delay: 0.2
    },
    {
      icon: 'spa',
      text: 'Gentle, compassionate approach to your well-being',
      delay: 0.3
    }
  ],
  className = ''
}: TrustIndicatorsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className={`space-y-3 ${className}`}
    >
      <ul className="space-y-3">
        {indicators.map((indicator, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: indicator.delay }}
            className="flex items-start gap-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-base text-blue-600">
                {indicator.icon}
              </span>
            </div>
            <span className="text-sm text-slate-600 leading-relaxed">
              {indicator.text}
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}
