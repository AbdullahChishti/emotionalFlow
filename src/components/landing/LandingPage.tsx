'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// Minimal purple floating elements
const PurpleOrb = ({
  delay = 0,
  size = 100,
  position
}: {
  delay?: number
  size?: number
  position: { top?: string, left?: string, right?: string, bottom?: string }
}) => {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none opacity-20"
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        ...position
      }}
      animate={{
        y: [0, -15, 0],
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: 12 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay
      }}
    />
  )
}

// Enhanced storytelling text with refined typography
const StoryText = ({
  text,
  size = 'lg',
  delay = 0,
  className = '',
  italic = false,
  highlight = false
}: {
  text: string
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  delay?: number
  className?: string
  italic?: boolean
  highlight?: boolean
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  }
  
  return (
    <motion.p
      className={`${sizeClasses[size]} font-light text-slate-600 leading-relaxed ${italic ? 'italic' : ''} ${highlight ? 'text-purple-700 font-normal' : ''} ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {text}
    </motion.p>
  )
}

// Enhanced chapter title component
const ChapterTitle = ({
  number,
  title,
  subtitle,
  delay = 0
}: {
  number: string
  title: string
  subtitle?: string
  delay?: number
}) => {
  return (
    <motion.div
      className="text-center mb-20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        className="inline-block mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.2, duration: 0.6 }}
      >
        <div className="flex items-center space-x-4">
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
          <span className="text-xs font-medium text-purple-500 tracking-[0.3em] uppercase">
            Chapter {number}
          </span>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
        </div>
      </motion.div>

      <motion.h2
        className="text-4xl md:text-5xl lg:text-6xl font-extralight text-slate-800 mb-6 leading-tight tracking-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.3, duration: 0.8 }}
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          className="text-xl text-slate-600 font-light max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.5, duration: 0.8 }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}

export function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50/90 via-indigo-50/95 to-purple-100/80 relative">
      {/* Enhanced purple floating elements with more sophistication */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <PurpleOrb delay={0} size={160} position={{ top: '8%', left: '6%' }} />
        <PurpleOrb delay={4} size={120} position={{ bottom: '15%', right: '8%' }} />
        <PurpleOrb delay={8} size={90} position={{ top: '55%', left: '12%' }} />
        <PurpleOrb delay={12} size={140} position={{ bottom: '25%', left: '75%' }} />
        <PurpleOrb delay={16} size={70} position={{ top: '75%', right: '20%' }} />
      </div>

      {/* Subtle pattern overlay for texture */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.4) 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }} />
      </div>

      <div className="relative max-w-screen-lg mx-auto px-8 py-24">
        {/* Chapter 1: The Beginning */}
        <section className="min-h-screen flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="space-y-16"
          >
            <ChapterTitle
              number="01"
              title="A Moment of Stillness"
              subtitle="In the quiet spaces between thoughts"
            />

            <div className="max-w-3xl mx-auto space-y-10">
              <motion.div
                className="text-center space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 1 }}
              >
                <StoryText
                  text="In the quiet spaces between thoughts, where the weight of unspoken words grows heavy, there exists a gentle truth:"
                  size="xl"
                  delay={0.4}
                  className="text-center"
                />

                <StoryText
                  text="Healing begins not with force, but with the courage to be seen. To be heard. To be understood."
                  size="xl"
                  delay={0.7}
                  italic={true}
                  className="text-center text-purple-700"
                />
              </motion.div>

              <motion.div
                className="text-center pt-12"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 1 }}
              >
                <h1 className="text-5xl md:text-7xl font-extralight text-slate-800 leading-tight tracking-tight">
                  Welcome to Your
                  <br />
                  <span className="text-purple-600 font-normal">Healing Journey</span>
                </h1>

                <motion.div
                  className="w-24 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent mx-auto mt-8"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.3, duration: 0.8 }}
                />
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Chapter 2: The Discovery */}
        <section className="py-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="space-y-16"
          >
            <ChapterTitle
              number="02"
              title="The Gentle Path"
              subtitle="Where healing meets understanding"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <StoryText
                  text="They discovered that healing wasn't about fixing what was broken. It was about creating space for what wanted to emerge."
                  size="xl"
                  delay={0.4}
                />

                <StoryText
                  text="In the safety of compassionate presence, old wounds could finally breathe. Here, every emotion has permission to exist."
                  size="lg"
                  delay={0.6}
                  italic={true}
                  highlight={true}
                />

                <StoryText
                  text="Every story deserves to be heard. Every heart deserves to be held."
                  size="lg"
                  delay={0.8}
                  highlight={true}
                />
              </motion.div>

              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <StoryText
                  text="Professional guidance becomes a gentle companion rather than a clinical directive."
                  size="lg"
                  delay={0.7}
                />

                <StoryText
                  text="Understanding becomes the foundation, not judgment. Growth happens naturally, like a flower opening to the sun."
                  size="lg"
                  delay={0.9}
                  italic={true}
                />

                <motion.div
                  className="pt-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                >
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-50 rounded-full">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-purple-700 font-medium">Safe • Compassionate • Understanding</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

                        {/* Enhanced Services preview */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-20"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.3, duration: 1 }}
            >
              <motion.div
                className="text-center space-y-6 group"
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="relative w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <svg className="w-9 h-9 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-slate-800">Individual Therapy</h3>
                  <p className="text-slate-600 leading-relaxed">Personalized sessions tailored to your unique journey</p>
                </div>
              </motion.div>

              <motion.div
                className="text-center space-y-6 group"
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <svg className="w-9 h-9 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-slate-800">Support Groups</h3>
                  <p className="text-slate-600 leading-relaxed">Connect with others who truly understand</p>
                </div>
              </motion.div>

              <motion.div
                className="text-center space-y-6 group"
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="relative w-20 h-20 bg-gradient-to-br from-violet-100 to-violet-200 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <svg className="w-9 h-9 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-slate-800">Mindfulness</h3>
                  <p className="text-slate-600 leading-relaxed">Peaceful practices for inner calm</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

                {/* Chapter 3: The Transformation */}
        <section className="py-40 bg-white/70 backdrop-blur-sm rounded-3xl px-16 mx-4 shadow-lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-20"
          >
            <ChapterTitle
              number="03"
              title="Emerging Light"
              subtitle="The quiet strength of healing"
            />

            <div className="max-w-4xl mx-auto space-y-12">
              <motion.div
                className="text-center space-y-8"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <StoryText
                  text="Transformation doesn't announce itself with fanfare. It arrives quietly, in the gentle moments when you realize you can breathe a little easier, sleep a little deeper, and face tomorrow with a touch more courage."
                  size="xl"
                  delay={0.6}
                  className="text-center leading-relaxed"
                />

                <motion.div
                  className="w-32 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent mx-auto my-8"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                />

                <StoryText
                  text="This is not about becoming someone new. It's about remembering who you've always been, beneath the weight of accumulated pain and forgotten dreams."
                  size="xl"
                  delay={0.9}
                  italic={true}
                  highlight={true}
                  className="text-center"
                />
              </motion.div>

              <motion.div
                className="text-center pt-12 space-y-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-light text-slate-800 mb-10">
                  Your Story Continues Here
                </h2>

                <motion.button
                  className="px-16 py-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-light rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-700 relative overflow-hidden group"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 30px 60px -12px rgba(139, 92, 246, 0.6)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1.1 }}
                  />
                  <span className="relative z-10">Begin Your Chapter</span>
                </motion.button>

                <motion.div
                  className="flex items-center justify-center space-x-6 pt-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.6, duration: 0.8 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-600 font-light">Free consultation</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <span className="text-slate-600 font-light">Safe space</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                    <span className="text-slate-600 font-light">Your pace</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </section>

                {/* Chapter 4: The Invitation */}
        <section className="py-40">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center space-y-16"
          >
            <ChapterTitle
              number="04"
              title="A Hand Extended"
              subtitle="The courage to begin"
            />

            <div className="max-w-3xl mx-auto space-y-12">
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <StoryText
                  text="Every healing journey begins with a single step. Not because the path is easy, but because you don't have to walk it alone. Here, understanding meets compassion, and hope finds its voice."
                  size="xl"
                  delay={0.6}
                  className="leading-relaxed"
                />

                <motion.div
                  className="w-40 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent mx-auto my-10"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                />

                <StoryText
                  text="Your story matters. Your pain deserves witness. Your healing deserves celebration."
                  size="xl"
                  delay={0.9}
                  italic={true}
                  highlight={true}
                />
              </motion.div>

              <motion.div
                className="pt-12 space-y-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <motion.button
                  className="px-20 py-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-light rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-700 relative overflow-hidden group"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 35px 70px -12px rgba(139, 92, 246, 0.7)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1.2 }}
                  />
                  <span className="relative z-10 tracking-wide">Start Your Journey Today</span>
                </motion.button>

                <motion.div
                  className="flex flex-wrap items-center justify-center gap-8 pt-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.6, duration: 0.8 }}
                >
                  <div className="flex items-center space-x-2 px-4 py-2 bg-purple-50/80 rounded-full">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-700 font-medium">Compassionate care</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-50/80 rounded-full">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <span className="text-slate-700 font-medium">Professional guidance</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-violet-50/80 rounded-full">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                    <span className="text-slate-700 font-medium">Safe environment</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Enhanced footer */}
        <footer className="py-20 border-t border-purple-200/60 bg-white/40 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
            <motion.div
              className="text-center md:text-left space-y-3"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-3xl font-light text-slate-800 mb-2">Emotion Economy</div>
              <StoryText
                text="Where healing begins with understanding."
                size="base"
                className="text-slate-600"
              />
              <div className="flex items-center space-x-4 pt-4">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-500 font-light">Always here for you</span>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-12"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center space-x-8">
                <a href="#" className="text-slate-600 hover:text-purple-600 transition-colors duration-300 text-sm font-medium hover:scale-105 transform">
                  Privacy
                </a>
                <div className="w-px h-4 bg-purple-300/60"></div>
                <a href="#" className="text-slate-600 hover:text-purple-600 transition-colors duration-300 text-sm font-medium hover:scale-105 transform">
                  Terms
                </a>
                <div className="w-px h-4 bg-purple-300/60"></div>
                <a href="#" className="text-slate-600 hover:text-purple-600 transition-colors duration-300 text-sm font-medium hover:scale-105 transform">
                  Support
                </a>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="text-center mt-12 pt-8 border-t border-purple-200/40"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="text-sm text-slate-500 font-light">
              © {new Date().getFullYear()} Emotion Economy. Crafted with care for your healing journey.
            </div>
            <motion.div
              className="flex items-center justify-center space-x-2 mt-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400 font-light tracking-widest">WITH COMPASSION</span>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </motion.div>
          </motion.div>
        </footer>
      </div>
    </main>
  )
}

