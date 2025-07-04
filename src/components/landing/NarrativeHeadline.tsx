'use client'

import { motion, Variants } from 'framer-motion'
import React, { Fragment } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface NarrativeHeadlineProps {
  text: string
  className?: string
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: 'blur(3px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    },
  },
}

export function NarrativeHeadline({ text, className }: NarrativeHeadlineProps) {
  const lines = text.split('<br />')
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <motion.h1
      className={`font-serif text-4xl font-medium tracking-tight text-zinc-800 md:text-6xl ${className}`}
      variants={prefersReducedMotion ? undefined : containerVariants}
      initial="hidden"
      animate="visible"
    >
      {lines.map((line, lineIndex) => {
        const words = line.trim().split(' ')
        return (
          <Fragment key={lineIndex}>
            {words.map((word, wordIndex) => (
              <motion.span
                key={wordIndex}
                className="inline-block"
                variants={prefersReducedMotion ? undefined : wordVariants}
                style={{ marginRight: '0.25em' }}
              >
                {word}{wordIndex < words.length - 1 ? '\u00A0' : ''}
              </motion.span>
            ))}
            {lineIndex < lines.length - 1 && <br />}
          </Fragment>
        )
      })}
    </motion.h1>
  )
}
