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

// Storytelling text with gentle reveal
const StoryText = ({
  text,
  size = 'lg',
  delay = 0,
  className = '',
  italic = false
}: {
  text: string
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  delay?: number
  className?: string
  italic?: boolean
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  }

  return (
    <motion.p
      className={`${sizeClasses[size]} font-light text-slate-600 leading-relaxed ${italic ? 'italic' : ''} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 1,
        ease: 'easeOut'
      }}
    >
      {text}
    </motion.p>
  )
}

// Chapter title component
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
      className="text-center mb-16"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: 'easeOut' }}
    >
      <div className="text-sm font-light text-purple-400 mb-4 tracking-widest uppercase">
        Chapter {number}
      </div>
      <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-4 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-slate-600 font-light max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}

export function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100">
      {/* Minimal purple floating elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <PurpleOrb delay={0} size={140} position={{ top: '10%', left: '8%' }} />
        <PurpleOrb delay={3} size={100} position={{ bottom: '20%', right: '12%' }} />
        <PurpleOrb delay={6} size={80} position={{ top: '60%', left: '15%' }} />
        <PurpleOrb delay={9} size={120} position={{ bottom: '30%', left: '70%' }} />
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

            <div className="max-w-2xl mx-auto space-y-8">
              <StoryText
                text="There was once a person who carried the weight of countless unspoken words. Days blurred into nights, and the simple act of breathing felt like an effort. They walked through life like a shadow, present but unseen, heard but unheard."
                size="lg"
                delay={0.3}
              />

              <StoryText
                text="In the depths of their solitude, a small voice whispered that change was possible. Not through force or will, but through gentle understanding and the courage to begin."
                size="lg"
                delay={0.6}
                italic={true}
              />

              <motion.div
                className="pt-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-6xl font-light text-slate-800 leading-tight">
                  Welcome to Your
                  <br />
                  <span className="text-purple-600 font-medium">Healing Journey</span>
                </h1>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-6">
                <StoryText
                  text="They discovered that healing wasn't about fixing what was broken. It was about creating space for what wanted to emerge. In the safety of compassionate presence, old wounds could finally breathe."
                  size="lg"
                  delay={0.2}
                />

                <StoryText
                  text="Here, in this sacred space, every emotion has permission to exist. Every story deserves to be heard. Every heart deserves to be held."
                  size="lg"
                  delay={0.5}
                  italic={true}
                />
              </div>

              <div className="space-y-6">
                <StoryText
                  text="Professional guidance becomes a gentle companion rather than a clinical directive. Understanding becomes the foundation, not judgment. Growth happens naturally, like a flower opening to the sun."
                  size="lg"
                  delay={0.8}
                />
              </div>
            </div>

            {/* Services preview */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <h3 className="font-medium text-slate-800">Individual Therapy</h3>
                <p className="text-sm text-slate-600">Personalized sessions</p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <h3 className="font-medium text-slate-800">Support Groups</h3>
                <p className="text-sm text-slate-600">Shared understanding</p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                </div>
                <h3 className="font-medium text-slate-800">Mindfulness</h3>
                <p className="text-sm text-slate-600">Peaceful practices</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Chapter 3: The Transformation */}
        <section className="py-32 bg-white/60 rounded-3xl px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="space-y-16"
          >
            <ChapterTitle
              number="03"
              title="Emerging Light"
              subtitle="The quiet strength of healing"
            />

            <div className="max-w-3xl mx-auto space-y-8">
              <StoryText
                text="Transformation doesn't announce itself with fanfare. It arrives quietly, in the gentle moments when you realize you can breathe a little easier, sleep a little deeper, and face tomorrow with a touch more courage."
                size="lg"
                delay={0.3}
                className="text-center"
              />

              <StoryText
                text="This is not about becoming someone new. It's about remembering who you've always been, beneath the weight of accumulated pain and forgotten dreams."
                size="lg"
                delay={0.6}
                italic={true}
                className="text-center"
              />

              <motion.div
                className="text-center pt-8"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-8">
                  Your Story Continues Here
                </h2>

                <motion.button
                  className="px-12 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-light rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.5)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Begin Your Chapter
                </motion.button>

                <StoryText
                  text="Free initial consultation • Safe space • Your pace"
                  size="base"
                  delay={1.2}
                  className="mt-6 text-slate-600"
                />
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Chapter 4: The Invitation */}
        <section className="py-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="text-center space-y-12"
          >
            <ChapterTitle
              number="04"
              title="A Hand Extended"
              subtitle="The courage to begin"
            />

            <div className="max-w-2xl mx-auto space-y-8">
              <StoryText
                text="Every healing journey begins with a single step. Not because the path is easy, but because you don't have to walk it alone. Here, understanding meets compassion, and hope finds its voice."
                size="lg"
                delay={0.3}
              />

              <StoryText
                text="Your story matters. Your pain deserves witness. Your healing deserves celebration."
                size="lg"
                delay={0.6}
                italic={true}
              />

              <motion.div
                className="pt-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <motion.button
                  className="px-16 py-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-light rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-500"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 30px 60px -12px rgba(139, 92, 246, 0.6)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Your Journey Today
                </motion.button>

                <StoryText
                  text="Compassionate care • Professional guidance • Safe environment"
                  size="base"
                  delay={1.2}
                  className="mt-6 text-slate-600"
                />
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Minimal footer */}
        <footer className="py-16 border-t border-purple-200/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-center md:text-left">
              <div className="text-2xl font-light text-slate-800 mb-2">Emotion Economy</div>
              <StoryText
                text="Where healing begins with understanding."
                size="sm"
                className="text-slate-600"
              />
            </div>
            <div className="flex items-center space-x-8">
              <a href="#" className="text-slate-600 hover:text-purple-600 transition-colors duration-300 text-sm font-light">
                Privacy
              </a>
              <div className="w-px h-4 bg-purple-300/50"></div>
              <a href="#" className="text-slate-600 hover:text-purple-600 transition-colors duration-300 text-sm font-light">
                Terms
              </a>
              <div className="w-px h-4 bg-purple-300/50"></div>
              <a href="#" className="text-slate-600 hover:text-purple-600 transition-colors duration-300 text-sm font-light">
                Support
              </a>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-slate-500">
            © {new Date().getFullYear()} Emotion Economy. Crafted with care for your healing journey.
          </div>
        </footer>
      </div>
    </main>
  )
}

