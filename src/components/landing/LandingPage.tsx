'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthModal } from '@/components/auth/AuthModal'

// Simplified Modern Header
const ModernHeader = ({ showAuthModal }: { showAuthModal: () => void }) => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/90 border-b border-white/30"
    >
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              MindWell
            </span>
          </motion.div>

          {/* Get Started Button */}
          <motion.button
            onClick={showAuthModal}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}

// Navigation Dots Component
const NavigationDots = ({
  activeSection,
  onNavigate
}: {
  activeSection: string
  onNavigate: (section: string) => void
}) => {
  const sections = [
    { id: 'chapter1', label: 'Beginning', icon: '🌟' },
    { id: 'chapter2', label: 'Discovery', icon: '🔍' },
    { id: 'chapter3', label: 'Transformation', icon: '✨' },
    { id: 'chapter4', label: 'Invitation', icon: '🤝' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col space-y-4"
    >
      {sections.map((section, index) => (
        <motion.button
          key={section.id}
          onClick={() => onNavigate(section.id)}
          className={`group relative flex items-center justify-end`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.8 }}
            whileHover={{ opacity: 1, x: 0, scale: 1 }}
            className="absolute right-full mr-4 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
          >
            {section.label}
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900"></div>
          </motion.div>

          {/* Dot */}
          <motion.div
            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
              activeSection === section.id
                ? 'bg-purple-500 border-purple-500 shadow-lg shadow-purple-500/50'
                : 'bg-white/80 border-slate-300 hover:border-purple-300'
            }`}
            animate={{
              scale: activeSection === section.id ? 1.2 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="w-full h-full flex items-center justify-center text-xs">
              {section.icon}
            </div>
          </motion.div>
        </motion.button>
      ))}
    </motion.div>
  )
}

// Scroll progress indicator
const ScrollProgress = ({ progress }: { progress: number }) => {
    return (
            <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-purple-500 to-blue-500 origin-left"
      style={{ scaleX: progress }}
      transition={{ duration: 0.1 }}
    />
  )
}

// Chapter Title Component
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

// Story Text Component
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

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [activeSection, setActiveSection] = useState('chapter1')
  const [scrollProgress, setScrollProgress] = useState(0)

  // Handle navigation
  const handleNavigate = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offsetTop = element.offsetTop - 80 // Account for fixed header
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  const handleShowAuthModal = () => {
    setAuthMode('signup')
    setShowAuthModal(true)
  }

  // Track scroll progress and active section
  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = window.scrollY / totalHeight
      setScrollProgress(progress)

      // Determine active section
      const sections = ['chapter1', 'chapter2', 'chapter3', 'chapter4']
      let currentSection = 'chapter1'

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            currentSection = section
            break
          }
        }
      }

      setActiveSection(currentSection)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50/90 via-indigo-50/95 to-purple-100/80 relative">
      {/* Enable smooth scrolling */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Navigation Components */}
      <ScrollProgress progress={scrollProgress} />
      <ModernHeader showAuthModal={handleShowAuthModal} />
      <NavigationDots activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <motion.div
          className="absolute rounded-full pointer-events-none opacity-20"
          style={{
            width: 160,
            height: 160,
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
            top: '8%',
            left: '6%'
          }}
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
            <motion.div
          className="absolute rounded-full pointer-events-none opacity-20"
          style={{
            width: 120,
            height: 120,
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
            bottom: '15%',
            right: '8%'
          }}
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4
          }}
        />
      </div>

      <div className="relative max-w-screen-lg mx-auto px-8 py-24">
        {/* Chapter 1: The Beginning */}
        <section id="chapter1" className="min-h-screen flex flex-col justify-center">
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
        <section id="chapter2" className="py-32">
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
                <motion.button
                  onClick={handleShowAuthModal}
                  className="px-16 py-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-light rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-700 relative overflow-hidden group cursor-pointer"
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
            </motion.div>
                </div>
          </motion.div>
        </section>

                {/* Chapter 3: The Transformation */}
        <section id="chapter3" className="py-40 bg-white/70 backdrop-blur-sm rounded-3xl px-16 mx-4 shadow-lg">
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
                  text="What if healing wasn't about fixing what was broken, but about creating space for what wanted to emerge?"
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
                  text="Every story deserves to be heard. Every heart deserves to be held."
                  size="xl"
                  delay={0.9}
                  italic={true}
                  highlight={true}
                  className="text-center"
                />
              </motion.div>
          </div>
        </motion.div>
        </section>

                {/* Chapter 4: The Invitation */}
        <section id="chapter4" className="py-40">
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
                  text="Every healing journey begins with a single step. Not because the path is easy, but because you don't have to walk it alone."
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
                  onClick={handleShowAuthModal}
                  className="px-20 py-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-light rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-700 relative overflow-hidden group cursor-pointer"
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
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </main>
  )
}