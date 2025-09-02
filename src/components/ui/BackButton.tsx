'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import 'material-symbols/outlined.css'

interface BackButtonProps {
  fallbackPath?: string
  className?: string
}

export function BackButton({ fallbackPath = '/', className = '' }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackPath)
    }
  }

  return (
    <motion.button
      onClick={handleBack}
      className={`group flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/50 rounded-full text-secondary-700 hover:bg-white/80 hover:text-secondary-800 transition-all duration-300 shadow-sm hover:shadow-md ${className}`}
      whileHover={{ scale: 1.02, x: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        className="material-symbols-outlined text-lg"
        whileHover={{ x: -2 }}
        transition={{ duration: 0.2 }}
      >
        arrow_back
      </motion.span>
      <span className="text-sm font-medium">Back</span>
    </motion.button>
  )
}
