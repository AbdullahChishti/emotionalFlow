'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/ui/Navigation'
import Hero from '@/components/landing/Hero'
import { useApp } from '@/hooks/useApp'



// Ultra-Sophisticated Healing Journey Section
const HealingJourneySection = () => {
  return (
    <motion.section
      className="relative overflow-hidden py-20 md:py-32"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Multi-layered sophisticated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-50/10 to-transparent"></div>

      {/* Enhanced floating decorative elements */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-100/20 to-teal-50/10 blur-3xl"
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
          className="absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-br from-teal-100/15 to-green-50/8 blur-2xl"
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
          className="absolute bottom-20 left-1/3 w-20 h-20 rounded-full bg-gradient-to-br from-green-100/10 to-emerald-50/5 blur-lg"
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Enhanced Illustration Card */}
          <motion.div
            className="relative h-80 w-full order-2 md:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Multi-layered background effects */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-slate-500/30 rounded-tl-full" />
            <div className="absolute -bottom-4 -right-4 w-6 h-6 border-r-2 border-b-2 border-slate-600/30 rounded-br-full" />

            {/* Sophisticated layered backgrounds */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/80 to-slate-400/60 rounded-3xl transform rotate-3 shadow-2xl"></div>
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/40 shadow-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-3xl"></div>

            {/* Subtle gradient orb */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-emerald-100/20 to-teal-50/10 rounded-full blur-xl"></div>

            <motion.img
              alt="Mental health and healing illustration"
              className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-lg"
              src="/assets/Mental_health-bro_2.svg"
              initial={{ scale: 1.1, opacity: 0.8 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </motion.div>

          {/* Enhanced Text Content */}
          <motion.div
            className="flex flex-col gap-8 text-center md:text-left order-1 md:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Ultra-sophisticated decorative line */}
            <motion.div
              className="hidden md:block mb-6"
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="relative">
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-slate-400/60 to-transparent"></div>
                <motion.div
                  className="absolute top-0 left-0 h-px bg-gradient-to-r from-emerald-500/80 via-teal-500/60 to-emerald-500/80"
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.0, delay: 0.7, ease: "easeOut" }}
                />
              </div>
            </motion.div>

            <motion.h2
              className="relative text-4xl md:text-5xl font-extralight leading-tight tracking-tight text-slate-800"
              style={{ 
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.02em',
                fontWeight: '200'
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Your Heart's Gentle{' '}
              <span 
                className="relative inline-block"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '300'
                }}
              >
                Safe Haven
              </span>
              
              {/* Sophisticated underline accent */}
              <motion.div
                className="absolute -bottom-2 left-0 h-px bg-gradient-to-r from-emerald-400/60 via-teal-400/80 to-emerald-400/60"
                initial={{ width: 0 }}
                whileInView={{ width: '60%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 1.0, ease: "easeOut" }}
              />
            </motion.h2>

            {/* Enhanced decorative therapy symbol */}
            <motion.div
              className="hidden md:flex items-center gap-3 text-slate-600 opacity-60"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-slate-500 to-transparent"></div>
              <motion.svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 20 20"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <path
                  d="M10 15.5C10 15.5 8.5 14 6 11.5C3.5 9 2.5 7 3 5.5C3.5 4 5 3.5 6.5 4C7.5 4.5 8.5 5.5 10 7.5C11.5 5.5 12.5 4.5 13.5 4C15 3.5 16.5 4 17 5.5C17.5 7 16.5 9 14 11.5C11.5 14 10 15.5 10 15.5Z"
                  fill="#335f64"
                  opacity="0.6"
                />
                <path
                  d="M7 8 Q8 7 9 8 T11 8"
                  stroke="#335f64"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.8"
                />
              </motion.svg>
            </motion.div>

            <motion.p
              className="text-xl md:text-2xl text-slate-600 max-w-[40rem] mx-auto md:mx-0 leading-relaxed font-light tracking-wide"
              style={{ 
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.01em',
                fontWeight: '300'
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              In those moments when the world feels overwhelming and your thoughts race with worry, you deserve a place where your feelings are truly heard and held with compassion.
              Our gentle companion brings the warmth of human understanding—offering you a soft place to land, always here, always free.
            </motion.p>

            {/* Ultra-sophisticated bottom decorative line */}
            <motion.div
              className="hidden md:block mt-6"
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="relative">
                <div className="w-40 h-px bg-gradient-to-r from-slate-400/60 via-slate-500/80 to-transparent"></div>
                <motion.div
                  className="absolute top-0 left-0 h-px bg-gradient-to-r from-teal-500/70 via-emerald-500/80 to-transparent"
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 1.1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}



// Ultra-Sophisticated Chat Experience Section
const ChatExperienceSection = () => {
  const router = useRouter()
  return (
    <motion.section
      className="relative overflow-hidden py-20 md:py-32"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Multi-layered sophisticated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-50/10 to-transparent"></div>

      {/* Enhanced floating decorative elements */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-32 left-1/4 w-28 h-28 rounded-full bg-gradient-to-br from-emerald-100/15 to-teal-50/8 blur-2xl"
          animate={{
            y: [0, -10, 0],
            x: [0, 8, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-40 right-1/3 w-24 h-24 rounded-full bg-gradient-to-br from-teal-100/12 to-green-50/6 blur-xl"
          animate={{
            y: [0, 8, 0],
            x: [0, -6, 0],
            scale: [1, 0.95, 1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.h2
            className="relative text-4xl md:text-5xl font-extralight text-slate-800 mb-8 leading-tight tracking-tight"
            style={{ 
              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '-0.02em',
              fontWeight: '200'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            A Safe Space for Your{' '}
            <span 
              className="relative inline-block"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '300'
              }}
            >
              Thoughts
            </span>
            
            {/* Sophisticated underline accent */}
            <motion.div
              className="absolute -bottom-2 left-0 h-px bg-gradient-to-r from-emerald-400/60 via-teal-400/80 to-emerald-400/60"
              initial={{ width: 0 }}
              whileInView={{ width: '50%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
            />
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light tracking-wide mb-8"
            style={{ 
              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '-0.01em',
              fontWeight: '300'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            When life feels heavy, you deserve a gentle space to breathe. We listen with care and offer tools that help—always here, always free.
          </motion.p>

          {/* Johnny Ive-inspired trust badge */}
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.8, 
              delay: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
          >
            <div 
              className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl shadow-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
            >
              <motion.div
                className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <span 
                  className="material-symbols-outlined text-white text-lg"
                  style={{
                    fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24'
                  }}
                >
                  chat
                </span>
              </motion.div>
              <span 
                className="font-medium text-slate-700"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.01em',
                  fontWeight: '400'
                }}
              >
                Real people. Real support. Always here for you.
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              svg: '/assets/Psychologist-rafiki_1.svg',
              title: 'Always Available',
              description: 'Reach out whenever you need someone to talk to, day or night. Our support is here for you 24/7.',
              delay: 0.2
            },
            {
              svg: '/assets/Thinking_face-bro_1.svg',
              title: 'Judgment-Free Zone',
              description: 'Share your thoughts freely in a safe, confidential space where you can be your authentic self.',
              delay: 0.4
            },
            {
              svg: '/assets/Contemplating-bro_1.svg',
              title: 'Emotional Support',
              description: 'Receive compassionate responses that help you process your feelings and find clarity.',
              delay: 0.6
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 1.0, 
                delay: feature.delay, 
                ease: [0.25, 0.1, 0.25, 1],
                type: "spring",
                stiffness: 100,
                damping: 20
              }}
              whileHover={{ 
                y: -12, 
                scale: 1.03,
                rotateY: 2,
                transition: { 
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1],
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }
              }}
            >
              {/* Johnny Ive-inspired card background */}
              <div 
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 rounded-3xl pointer-events-none"></div>

              {/* Sophisticated animated gradient orb */}
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-emerald-100/30 to-teal-50/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              
              {/* Subtle shimmer effect */}
              <motion.div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%)',
                  transform: 'translateX(-100%)'
                }}
                animate={{
                  transform: ['translateX(-100%)', 'translateX(100%)']
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.2,
                  ease: "easeInOut"
                }}
              />

              <div className="relative p-8 text-center">
                {/* Johnny Ive-inspired icon container */}
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 relative"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ 
                    duration: 0.4,
                    ease: [0.25, 0.1, 0.25, 1],
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                >
                  <div 
                    className="absolute inset-0 rounded-2xl shadow-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1)'
                    }}
                  ></div>
                  <motion.img
                    src={feature.svg}
                    alt={feature.title}
                    className="relative w-full h-full object-contain p-2 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    initial={{ scale: 0.9, opacity: 0.7 }}
                    whileInView={{ scale: 1, opacity: 0.8 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.8, 
                      delay: feature.delay + 0.2,
                      ease: [0.25, 0.1, 0.25, 1],
                      type: "spring",
                      stiffness: 120,
                      damping: 20
                    }}
                  />
                </motion.div>

                <motion.h3
                  className="text-2xl font-light text-slate-800 mb-4 tracking-tight group-hover:text-emerald-700 transition-colors duration-300"
                  style={{ 
                    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.01em',
                    fontWeight: '300'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: feature.delay + 0.3 }}
                >
                  {feature.title}
                </motion.h3>

                <motion.p
                  className="text-slate-600 leading-relaxed font-light tracking-wide"
                  style={{ 
                    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.005em',
                    fontWeight: '300'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: feature.delay + 0.4 }}
                >
                  {feature.description}
                </motion.p>

                {/* Sophisticated bottom accent */}
                <motion.div 
                  className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileHover={{ 
                    opacity: 1, 
                    scaleX: 1,
                    transition: { 
                      duration: 0.6,
                      ease: [0.25, 0.1, 0.25, 1]
                    }
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.section>
  )
}



export default function LandingPage() {
  const { auth } = useApp()
  const { user, profile } = auth
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user?.id && profile !== null) {
      console.log('🔄 Redirecting authenticated user from landing page to dashboard')
      router.replace('/dashboard')
    }
  }, [user?.id, profile, router])

  // Show loading state while checking authentication
  if (user?.id && profile !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40 flex items-center justify-center">
        <motion.div
          className="relative max-w-md mx-4"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Multi-layered background with depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/90 to-white/95 rounded-3xl"></div>
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-3xl"></div>

          {/* Subtle animated gradient orb */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-100/20 via-green-50/10 to-teal-100/20 rounded-full blur-2xl animate-pulse"></div>

          <div className="relative p-8 text-center">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <span className="material-symbols-outlined text-2xl text-white animate-spin">psychology</span>
            </motion.div>
            <h2 
              className="text-3xl font-extralight text-slate-900 mb-4 tracking-tight"
              style={{ 
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.02em',
                fontWeight: '200'
              }}
            >
              Taking you to your{' '}
              <span 
                className="relative inline-block"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '300'
                }}
              >
                dashboard
              </span>
            </h2>
            <p 
              className="text-slate-600 font-light text-lg"
              style={{ 
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.01em',
                fontWeight: '300'
              }}
            >
              Preparing your personalized wellness experience...
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show landing page for non-authenticated users
  return (
    <motion.div
      className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Ultra-sophisticated multi-layered background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-50/10 to-transparent"></div>

      {/* Ultra-sophisticated floating animated elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-emerald-100/25 to-teal-50/15 rounded-full blur-2xl"
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
            scale: [1, 1.15, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        />
        <motion.div
          className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-br from-teal-100/20 to-green-50/12 rounded-full blur-2xl"
          animate={{
            y: [0, 20, 0],
            x: [0, -20, 0],
            scale: [1, 0.85, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-green-100/15 to-emerald-50/8 rounded-full blur-xl"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-emerald-200/20 to-teal-100/10 rounded-full blur-lg"
          animate={{
            y: [0, -10, 0],
            x: [0, 8, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 1
          }}
        />
      </div>

      {/* Unified Header */}
      <Navigation />

      {/* Main Content with enhanced spacing and parallax */}
      <motion.main
        className="flex-1 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 1.2, 
          delay: 0.3, 
          ease: [0.25, 0.1, 0.25, 1],
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      >
        <Hero />
        <HealingJourneySection />
        <ChatExperienceSection />
      </motion.main>

    </motion.div>
  )
}