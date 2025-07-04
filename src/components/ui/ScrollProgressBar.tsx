'use client'

import { motion, MotionValue, useSpring, useTransform } from 'framer-motion'
import { journeySteps } from '@/components/landing/JourneyPath'

// 1. Define props for the new JourneyNode component
interface JourneyNodeProps {
  scrollYProgress: MotionValue<number>
  stepProgress: number
}

// 2. Create the JourneyNode component
function JourneyNode({ scrollYProgress, stepProgress }: JourneyNodeProps) {
  // 3. Use useTransform to create a MotionValue for the background color
  const backgroundColor = useTransform(
    scrollYProgress,
    // Input range: when scrollYProgress is just before or at the step's progress point
    [stepProgress - 0.01, stepProgress],
    // Output range: the color transitions from zinc to purple
    ['rgb(244 244 245)', 'rgb(168 85 247)'],
    // Clamp ensures the output value doesn't go beyond the specified range
    { clamp: true }
  )

  return (
    <motion.div
      className="absolute w-3 h-3 -translate-x-1/2 rounded-full border-2 border-purple-500"
      style={{
        top: `${stepProgress * 100}%`,
        backgroundColor, // Use the transformed MotionValue here
      }}
    />
  )
}

interface NarrativeScrollbarProps {
  scrollYProgress: MotionValue<number>
}

export function ScrollProgressBar({ scrollYProgress }: NarrativeScrollbarProps) {
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const height = useTransform(springProgress, [0, 1], ['0%', '100%'])

  return (
    <div className="fixed top-0 left-4 md:left-8 h-full z-50 flex items-center">
      <div className="relative h-2/3 w-1 bg-zinc-200/50 rounded-full">
        {/* Progress Fill */}
        <motion.div
          className="absolute top-0 left-0 w-full bg-purple-500 rounded-full"
          style={{
            height,
            boxShadow: '0 0 8px rgba(168, 85, 247, 0.8)',
          }}
        />

        {/* Journey Nodes */}
        <div className="absolute top-0 left-0 w-full">
          {journeySteps.map((step, index) => {
            const stepProgress = index / (journeySteps.length - 1)
            // 4. Render the JourneyNode component for each step
            return (
              <JourneyNode
                key={index}
                scrollYProgress={scrollYProgress}
                stepProgress={stepProgress}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
