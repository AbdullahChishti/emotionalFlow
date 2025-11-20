'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#FAFAFA] overflow-hidden">
      {/* Refined breathing circle - softer, more elegant */}
      <motion.div
        className="absolute w-[420px] h-[420px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #E8F5F3, var(--color-primary-light) 50%, var(--color-primary) 100%)',
          filter: 'blur(40px)',
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: 0.3,
        }}
        transition={{
          scale: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          },
          opacity: {
            duration: 2,
            ease: "easeOut"
          }
        }}
      />

      {/* Content - positioned outside circle for clarity */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          {/* Main headline - refined typography */}
          <h1 className="text-7xl md:text-9xl font-extralight text-[#1D1D1F] mb-6 tracking-[-0.02em] leading-[0.95]">
            Clarity
          </h1>

          {/* Minimal subtext - better contrast */}
          <p className="text-lg md:text-xl text-[#6E6E73] font-normal max-w-xl mx-auto mb-12 leading-relaxed tracking-wide">
            Understand your mind.
            <br />
            Transform your life.
          </p>

          {/* Single, focused CTA - more refined */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="px-12 py-3.5 text-sm font-medium rounded-full tracking-wide transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: '#1D1D1F',
                  color: 'white',
                  boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.12)'
                }}
              >
                Begin
              </Button>
            </Link>
          </motion.div>

          {/* Minimal tagline - refined */}
          <motion.p
            className="text-xs text-[#86868B] font-light mt-16 tracking-wider uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Evidence-Based · Private · Free
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
