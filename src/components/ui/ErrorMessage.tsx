'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ErrorMessageProps {
  message: string
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ErrorMessage({
  message,
  className = '',
  showIcon = true,
  size = 'md'
}: ErrorMessageProps) {
  const sizeClasses = {
    sm: 'text-xs gap-1.5',
    md: 'text-sm gap-2',
    lg: 'text-base gap-3'
  }

  const iconSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`
        flex items-center ${sizeClasses[size]}
        text-red-600 bg-red-50
        border border-red-200 rounded-lg
        px-3 py-2 ${className}
      `.trim()}
      role="alert"
      aria-live="polite"
    >
      {showIcon && (
        <span className={`material-symbols-outlined ${iconSizeClasses[size]} flex-shrink-0`}>
          error
        </span>
      )}
      <span>{message}</span>
    </motion.div>
  )
}
