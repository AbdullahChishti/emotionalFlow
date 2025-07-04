'use client'

import { motion, Variants } from 'framer-motion'
import { valueProps } from './journey-data'
import {
  FloatingOrbitOrb,
  RisingLightBeam,
  RhythmicPulse,
  HandDrawnSpiral,
  BreathingOrb,
} from './ValueAnimations'

const animations = [
  FloatingOrbitOrb,
  RisingLightBeam,
  RhythmicPulse,
  HandDrawnSpiral,
  BreathingOrb,
]

export function CoreValues() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 80 },
    },
  }

  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-800">Our Principles</h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-zinc-600">
            We are building a new kind of space, grounded in these core values.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {valueProps.map((value, index) => {
            const AnimationComponent = animations[index % animations.length]
            return (
              <motion.div
                key={value.title}
                className="bg-white/40 backdrop-blur-sm p-8 rounded-2xl text-center flex flex-col items-center shadow-lg border border-white/60 hover:shadow-xl transition-shadow duration-300"
                variants={itemVariants}
              >
                <div className="w-24 h-24 mb-6 flex items-center justify-center">
                  <AnimationComponent color={value.color} size={80} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3" style={{ color: value.color }}>
                  {value.title}
                </h3>
                <p className="text-zinc-700 flex-grow">{value.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
