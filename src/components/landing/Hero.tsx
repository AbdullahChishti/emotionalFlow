'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { track, getOrAssignABBuck } from '@/lib/analytics'

type Props = {
  variant?: 'A' | 'B'
}

export function Hero({ variant = 'B' }: Props) {
  const router = useRouter()

  useEffect(() => {
    const abBucket = getOrAssignABBuck()
    track('hero_view', { variant, abBucket })
  }, [variant])

  const onChat = () => {
    track('cta_click', { id: 'chat' })
    // Gate via login, pass intent
    router.push('/login?intent=chat')
  }

  return (
    <motion.section
      aria-label="MindWell hero"
      className="relative isolate overflow-hidden py-20 md:py-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Multi-layered sophisticated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-50/10 to-transparent"></div>

      {/* Enhanced floating decorative elements */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-4 -left-4 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-100/20 to-teal-50/10 blur-3xl"
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-20 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-teal-100/15 to-green-50/8 blur-2xl"
          animate={{
            y: [0, 12, 0],
            x: [0, -8, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute bottom-40 right-1/4 w-20 h-20 rounded-full bg-gradient-to-br from-green-100/10 to-emerald-50/5 blur-lg"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="mx-auto max-w-[1200px] px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Enhanced Copy Section */}
          <motion.div
            className="order-2 md:order-1 space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="space-y-6">
              <motion.h1
                className="text-4xl md:text-5xl font-light leading-tight tracking-tight text-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Find{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent font-normal">
                  calm
                </span>{' '}
                in the chaos.
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-slate-500 max-w-[36rem] mx-auto md:mx-0 leading-loose font-light tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                When life feels heavy, you deserve a gentle space to breathe. We listen with care and offer tools that help—always here, always free.
              </motion.p>
            </div>

            {/* Enhanced CTA Group */}
            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.button
                id="cta-chat"
                aria-label="Chat with MindWell"
                onClick={onChat}
                className="group relative overflow-hidden px-10 py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 text-white rounded-2xl font-medium text-lg shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-400/20 focus:ring-offset-2 transition-all duration-300"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">psychology</span>
                  Start Chatting with MindWell
                </span>
              </motion.button>
            </motion.div>

            {/* Enhanced Trust Cluster */}
            <motion.div
              className="mt-12 space-y-6"
              aria-label="Trust and privacy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <div className="space-y-4">
                {/* Enhanced trust items */}
                <div className="flex items-start gap-3">
                  <motion.div
                    className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="material-symbols-outlined text-white text-lg">shield</span>
                  </motion.div>
                  <div>
                    <h4 className="text-slate-900 font-medium mb-1">Private & Secure</h4>
                    <p className="text-slate-600 font-light">Your data stays with you</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <motion.div
                    className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="material-symbols-outlined text-white text-lg">analytics</span>
                  </motion.div>
                  <div>
                    <h4 className="text-slate-900 font-medium mb-1">Evidence-Based Tools</h4>
                    <p className="text-slate-600 font-light">Created with clinicians</p>
                  </div>
                </div>
              </div>

              {/* Enhanced testimonial */}
              <motion.figure
                className="mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 to-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200/50"></div>
                  <blockquote className="relative italic text-slate-700 p-6 text-center">
                    <span className="text-2xl text-slate-400 mb-2 block">"</span>
                    I felt heard and calmer in minutes.
                    <span className="text-2xl text-slate-400 mt-2 block">"</span>
                    <cite className="text-sm text-slate-600 font-medium mt-4 block">— Amina, 27</cite>
                  </blockquote>
                </div>
              </motion.figure>

              <motion.p
                className="text-sm leading-6 text-slate-500 text-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                MindWell is for support and self-help. It's not a substitute for emergency care.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Enhanced Illustration */}
          <motion.div
            className="order-1 md:order-2 relative w-full"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative mx-auto max-w-[560px] aspect-[4/3] w-full">
              {/* Multi-layered background effects */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/80 to-slate-400/60 rounded-3xl transform rotate-3 shadow-2xl"></div>
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/40 shadow-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-3xl"></div>

              {/* Subtle gradient orb */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-emerald-100/20 to-teal-50/10 rounded-full blur-xl"></div>

              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/assets/Psychologist-rafiki_1.svg"
                  alt="Warm, inclusive therapy illustration"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 560px"
                  className="relative rounded-3xl object-cover shadow-lg"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default Hero
