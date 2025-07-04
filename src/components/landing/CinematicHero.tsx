'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GenerativeBackground } from './GenerativeBackground'
import { EmpathyOrb } from './EmpathyOrb'
import { RedThread } from './RedThread'

const empathyWhispers = [
  'You are not alone.',
  'Someone is here to listen.',
  'It’s okay to not be okay.',
  'Your feelings are valid.',
]

export function CinematicHero() {
  const [threadPositions, setThreadPositions] = useState<{ x: number; y: number }[]>([]);
  const [whisperPositions, setWhisperPositions] = useState<{ top: string; left: string; yStart: number; yEnd: number }[]>([]);
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const pRef = useRef<HTMLParagraphElement>(null)

  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.9])

  useEffect(() => {
    const calculatePositions = () => {
      if (h1Ref.current && pRef.current) {
        const h1Rect = h1Ref.current.getBoundingClientRect()
        const pRect = pRef.current.getBoundingClientRect()
        setThreadPositions([
          { x: h1Rect.left + h1Rect.width / 2, y: h1Rect.top + h1Rect.height / 2 },
          { x: pRect.left + pRect.width / 2, y: pRect.top + pRect.height / 2 },
        ])
      }
    }

    calculatePositions()
    window.addEventListener('resize', calculatePositions)

    // Set whisper positions once on mount
    setWhisperPositions(
      empathyWhispers.map(() => {
        const yStart = Math.random() * 10
        return {
          top: `${20 + Math.random() * 60}%`,
          left: `${10 + Math.random() * 80}%`,
          yStart: yStart,
          yEnd: yStart - (10 + Math.random() * 10), // Drift upwards
        }
      })
    )

    return () => window.removeEventListener('resize', calculatePositions)
  }, [])

  const handleBegin = () => {
    const nextSection = document.getElementById('next-section')
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.section
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      style={{ opacity, scale }}
    >
      <GenerativeBackground />
      <RedThread positions={threadPositions} />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white p-4">
        {/* Main Text with Parallax */}
        <div className="relative w-full max-w-4xl mx-auto">
          <motion.h1
            ref={h1Ref}
            className="text-4xl md:text-6xl font-semibold tracking-tighter text-zinc-100 text-left absolute top-[20vh] left-8 md:left-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
            style={{ y: useTransform(scrollY, [0, 500], [0, -100]) }}
          >
            Feeling off?
          </motion.h1>

          <motion.p
            ref={pRef}
            className="text-2xl md:text-4xl font-light text-zinc-200 leading-relaxed absolute top-[35vh] right-8 md:right-16 text-right max-w-md"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 1.5 }}
            style={{ y: useTransform(scrollY, [0, 500], [0, -150]) }}
          >
            You don’t have to carry it alone.
          </motion.p>
        </div>

        {/* Empathy Whispers */}
        {whisperPositions.length > 0 &&
          empathyWhispers.map((text, i) => (
            <motion.p
              key={i}
              className="absolute text-lg text-zinc-400 font-light"
              initial={{ opacity: 0, y: whisperPositions[i].yStart }}
              animate={{
                opacity: [0, 0.6, 0.6, 0],
                y: [whisperPositions[i].yStart, whisperPositions[i].yEnd],
              }}
              transition={{
                duration: 12,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'mirror',
                delay: 2 + i * 4,
              }}
              style={{
                top: whisperPositions[i].top,
                left: whisperPositions[i].left,
              }}
            >
              {text}
            </motion.p>
          ))}

        {/* Experiential CTA */}
        <div className="absolute bottom-[15vh]">
          <EmpathyOrb onBegin={handleBegin} />
        </div>
      </div>
    </motion.section>
  )
}
