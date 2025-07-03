'use client'

import { motion } from 'framer-motion'

interface ScrollProgressIndicatorProps {
  progress: number
  sections: number
}

export const ScrollProgressIndicator = ({ progress, sections }: ScrollProgressIndicatorProps) => {
  const dots = Array.from({ length: sections })

  return (
    <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 h-64 hidden lg:flex flex-col items-center justify-between z-30">
      <motion.div 
        className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-0.5 bg-purple-200/50 rounded-full"
      />
      <motion.div 
        className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-0.5 bg-purple-500 rounded-full"
        style={{ scaleY: progress, transformOrigin: 'top' }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />
      <div className="relative h-full w-full flex flex-col items-center justify-between">
        {dots.map((_, i) => {
          const stepProgress = (i + 1) / sections
          const isActive = progress >= stepProgress || (i === 0 && progress > 0)
          
          return (
            <motion.div 
              key={i}
              className="w-3 h-3 rounded-full bg-purple-200/50 relative"
              animate={{ 
                backgroundColor: isActive ? 'rgb(168 85 247)' : 'rgba(233, 213, 255, 0.5)',
                scale: isActive ? 1.2 : 1
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          )
        })}
      </div>
    </div>
  )
}
