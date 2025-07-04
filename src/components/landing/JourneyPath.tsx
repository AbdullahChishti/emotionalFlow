'use client'

import { forwardRef } from 'react'
import { motion, useTransform, MotionValue } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  GiveSupportIcon,
  EarnCreditsIcon,
  GetMatchedIcon,
  ReceiveSupportIcon,
  AICompanionIcon,
} from './JourneyAnimations'

// Fix for React bug with lowercase SVG component tags
const MotionCircle = motion.circle;

// Define types for clarity and safety
interface JourneyStep {
  title: string
  description: string
  Animation: React.FC<{ color: string; size: number; [key: string]: any }>
  color: string
  position: { top: string; left: string }
}

export const journeySteps: JourneyStep[] = [
  {
    title: 'Give Support',
    description: 'Offer your presence and be a pillar for someone in need.',
    Animation: GiveSupportIcon,
    color: '#f472b6', // Warm Pink
    position: { top: '10%', left: '65%' },
  },
  {
    title: 'Earn Empathy Credits',
    description: 'Your time and empathy are valued. Earn credits for every connection.',
    Animation: EarnCreditsIcon,
    color: '#fb923c', // Warm Orange
    position: { top: '30%', left: '35%' },
  },
  {
    title: 'Get Matched',
    description: 'Our AI finds the right person for you to talk to, right when you need it.',
    Animation: GetMatchedIcon,
    color: '#60a5fa', // Soft Blue
    position: { top: '50%', left: '70%' },
  },
  {
    title: 'Receive Support',
    description: 'Use your credits to connect with someone who will listen, without judgment.',
    Animation: ReceiveSupportIcon,
    color: '#a78bfa', // Warm Purple
    position: { top: '70%', left: '30%' },
  },
  {
    title: 'AI Never Leaves You Alone',
    description: 'Our companion AI is always here to offer support if a peer is unavailable.',
    Animation: AICompanionIcon,
    color: '#4ade80', // Gentle Green
    position: { top: '90%', left: '50%' },
  },
]

const StepNode = ({
  step,
  scrollYProgress,
  isLast,
  prefersReducedMotion,
}: {
  step: JourneyStep
  scrollYProgress: MotionValue<number>
  isLast?: boolean
  prefersReducedMotion: boolean
}) => {
  const opacityRange = isLast
    ? [0.95, 1] // Fade in at the very, very end
    : [
        parseFloat(step.position.top) / 100 - 0.1,
        parseFloat(step.position.top) / 100,
        parseFloat(step.position.top) / 100 + 0.1,
      ]
  const opacityValues = isLast ? [0, 1] : [0, 1, 0] // Other nodes fade in and out
  const opacity = useTransform(scrollYProgress, opacityRange, opacityValues)

    const scale = useTransform(opacity, [0, 1], isLast ? [0.6, 1] : [0.9, 1])

  return (
    <motion.div
      className={`absolute ${isLast ? 'w-2/3 md:w-1/2' : 'w-1/3 md:w-1/4'}`}
      style={{
        top: step.position.top,
        left: step.position.left,
        opacity: prefersReducedMotion ? 1 : opacity,
        scale: prefersReducedMotion ? 1 : scale,
        transform: isLast ? 'translate(-50%, -40%)' : 'translateX(-50%)',
      }}
    >
      <motion.div
        className={`relative ${isLast ? 'h-40 w-40' : 'h-24 w-24'} mx-auto mb-4`}
        animate={isLast ? { scale: [1, 1.03, 1], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } } : {}}
      >
        <step.Animation color={step.color} size={isLast ? 160 : 80} />
      </motion.div>
      <h3 className={`font-semibold text-zinc-800 mb-2 text-center ${isLast ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'}`}>{step.title}</h3>
      <p className={`text-zinc-600 leading-relaxed text-center ${isLast ? 'text-lg md:text-xl' : 'text-md md:text-lg'}`}>{step.description}</p>
    </motion.div>
  )
}

interface JourneyPathProps {
  scrollYProgress: MotionValue<number>
}

export const JourneyPath = forwardRef<HTMLElement, JourneyPathProps>(
  ({ scrollYProgress }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion()

    const pathLength = prefersReducedMotion
      ? 1
      : useTransform(scrollYProgress, [0, 1], [0, 1])

    const threadOpacity = useTransform(scrollYProgress, [0.85, 0.95], [1, 0])
    const sanctuaryOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1])
    const sanctuaryScale = useTransform(scrollYProgress, [0.9, 1], [0.5, 1])

    return (
      <section ref={ref} className="relative h-[250vh] w-full pt-24 pb-12">
        <div className="container mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-zinc-900">How Heard Works: A New Economy of Care</h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg md:text-xl text-zinc-700">Follow the thread of connection. See how giving and receiving support creates a balanced, empathetic community.</p>
        </div>
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          <motion.svg viewBox="0 0 500 1200" className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="xMidYMin meet">
            {/* Empathy Thread */}
            <motion.path
              d="M 250 60 C 450 120, 50 240, 250 360 S 450 480, 250 600 C 50 720, 450 840, 250 960 S 50 1080, 250 1140"
              fill="none"
              stroke="rgba(251, 146, 60, 0.4)"
              strokeWidth="2"
              style={{ pathLength, opacity: threadOpacity }}
            />
            <motion.path
              d="M 250 60 C 450 120, 50 240, 250 360 S 450 480, 250 600 C 50 720, 450 840, 250 960 S 50 1080, 250 1140"
              fill="none"
              stroke="rgba(251, 146, 60, 0.15)"
              strokeWidth="10"
              strokeLinecap="round"
              style={{ pathLength, opacity: threadOpacity }}
            />

            {/* Sanctuary Circle */}
            <MotionCircle
              cx="250"
              cy="1080"
              r="150"
              fill="rgba(74, 222, 128, 0.1)"
              style={{
                opacity: sanctuaryOpacity,
                scale: sanctuaryScale,
                transformOrigin: 'center 1080px',
              }}
            />
            <MotionCircle
              cx="250"
              cy="1080"
              r="150"
              stroke="rgba(74, 222, 128, 0.2)"
              strokeWidth="2"
              fill="transparent"
              style={{
                opacity: sanctuaryOpacity,
                scale: sanctuaryScale,
                transformOrigin: 'center 1080px',
              }}
            />
          </motion.svg>
          <div className="relative w-full h-full max-w-4xl mx-auto">
            {journeySteps.map((step, index) => (
              <StepNode
                key={index}
                step={step}
                scrollYProgress={scrollYProgress}
                isLast={index === journeySteps.length - 1}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }
)

JourneyPath.displayName = 'JourneyPath'