'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Heart } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { EmpathyWalletGraph } from './EmpathyWalletGraph'
import {
  FloatingOrbitOrb,
  RisingLightBeam,
  RhythmicPulse,
  HandDrawnSpiral,
  BreathingOrb,
  GentleSparkle,
  HandwrittenLine,
  LoopedHeartGlow,
} from './ValueAnimations'
import { ScrollProgressIndicator } from './ScrollProgressIndicator'



export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [scrollBg, setScrollBg] = useState('from-blue-50 via-purple-50 to-green-50')
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollFraction = scrollY / pageHeight

      if (scrollFraction < 0.33) {
        setScrollBg('from-blue-50 via-purple-50 to-green-50')
      } else if (scrollFraction < 0.66) {
        setScrollBg('from-purple-50 via-rose-50 to-amber-50')
      } else {
        setScrollBg('from-amber-50 via-teal-50 to-cyan-50')
      }

      const valueSection = document.getElementById('value-section')
      if (valueSection) {
        const sectionTop = valueSection.offsetTop
        const sectionHeight = valueSection.scrollHeight - window.innerHeight
        const progress = (scrollY - sectionTop) / sectionHeight
        setScrollProgress(Math.max(0, Math.min(1, progress)))
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br ${scrollBg} font-sans text-zinc-800 overflow-x-hidden transition-all duration-1000 ease-in-out`}>
      <ScrollProgressIndicator progress={scrollProgress} sections={5} />
      <div className="relative z-10">
        {/* Header */}
        <header className="py-6 px-4 md:px-8">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-purple-500" />
              <span className="text-2xl font-bold tracking-tight text-zinc-700">heard</span>
            </div>
            <motion.button
              onClick={() => setShowAuthModal(true)}
              className="px-5 py-2 text-sm font-medium text-zinc-600 hover:bg-purple-100/70 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="pt-16 md:pt-24 pb-24">
          <section className="container mx-auto text-center px-4">
            <motion.div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[600px] bg-gradient-to-tr from-purple-200 via-blue-200 to-green-200 blur-3xl opacity-40 rounded-full -z-10"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, 0],
              }}
              transition={{ duration: 20, ease: 'easeInOut', repeat: Infinity }}
            />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-zinc-900 leading-tight md:leading-snug">
                Feeling off? <br /> You don’t have to carry it alone.
              </h1>
              <p className="max-w-2xl mx-auto mt-4 text-xl md:text-2xl text-zinc-700 leading-relaxed">
                Heard connects you to someone who listens. Just listens.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4">
                <motion.button
                  onClick={() => setShowAuthModal(true)}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-purple-500 text-lg font-semibold text-white rounded-full shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 animate-pulse-slow"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started for Free <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </motion.button>
                
                {/* Scroll cue to create narrative flow to value section */}
                <motion.div 
                  className="mt-12 flex flex-col items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.7, 
                    ease: 'easeOut', 
                    delay: 1.5 
                  }}
                >
                  <p className="text-purple-600 font-medium mb-2">What makes Heard different</p>
                  <motion.div
                    animate={{ 
                      y: [0, 8, 0]
                    }}
                    transition={{
                      duration: 2,
                      ease: "easeInOut",
                      repeat: Infinity,
                    }}
                  >
                    <a href="#value-section">
                      <ArrowRight className="h-6 w-6 text-purple-500 rotate-90" />
                    </a>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* Value Story Section */}
          <section id="value-section" className="container mx-auto px-4 mt-24 md:mt-32">
            <div className="max-w-2xl mx-auto flex flex-col items-center space-y-16 md:space-y-24">

              {/* Value 1: Mutual Support */}
              <motion.div
                className="relative w-full max-w-md bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                animate={{ y: [0, -4, 0] }}
                transition={{ 
                  duration: 0.8, 
                  ease: 'easeOut',
                  y: { 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: 'easeInOut', 
                    delay: 0.5 
                  } 
                }}
                whileHover={{ y: -8, scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              >
                <div className="mb-6 relative h-24 flex justify-center items-center">
                  <FloatingOrbitOrb color="rgba(147, 51, 234, 0.4)" size={80} />
                  <GentleSparkle color="rgba(147, 51, 234, 0.7)" count={10} />
                </div>
                
                <h3 className="text-2xl font-semibold text-zinc-800 mb-3">Mutual Support</h3>
                <p className="text-lg text-zinc-700 leading-relaxed">
                  Give when you can, receive when you need. 
                  A balance that honors both sides of connection.
                </p>
                
                <div className="mt-4">
                  <HandwrittenLine 
                    text="no burnout, no guilt" 
                    color="rgba(147, 51, 234, 0.6)" 
                    width={150} 
                  />
                </div>
              </motion.div>

              <h4 className="uppercase text-sm font-semibold text-purple-600/90 tracking-widest">Built for Balance</h4>
              
              {/* Value 2: Structured Roles */}
              <motion.div
                className="relative w-full max-w-md bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                animate={{ y: [0, -4, 0] }}
                transition={{ 
                  duration: 0.8, 
                  ease: 'easeOut', 
                  delay: 0.2,
                  y: { 
                    duration: 4.5, 
                    repeat: Infinity, 
                    ease: 'easeInOut', 
                    delay: 1 
                  } 
                }}
                whileHover={{ y: -8, scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              >
                <div className="mb-6 relative h-24 flex justify-center items-center">
                  <RisingLightBeam color="rgba(59, 130, 246, 0.4)" size={80} />
                  <GentleSparkle color="rgba(59, 130, 246, 0.7)" count={10} />
                </div>
                
                <h3 className="text-2xl font-semibold text-zinc-800 mb-3">Structured Roles</h3>
                <p className="text-lg text-zinc-700 leading-relaxed">
                  Hold space, or be held. You're never expected to do both at once.
                </p>
                
                <div className="mt-4">
                  <HandwrittenLine 
                    text="clarity in connection" 
                    color="rgba(59, 130, 246, 0.6)" 
                    width={160} 
                  />
                </div>
              </motion.div>

              <h4 className="uppercase text-sm font-semibold text-blue-600/90 tracking-widest">Support, Shared</h4>

              {/* Value 3: Empathy Economy */}
              <motion.div
                className="relative w-full max-w-md bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                animate={{ y: [0, -4, 0] }}
                transition={{ 
                  duration: 0.8, 
                  ease: 'easeOut', 
                  delay: 0.2,
                  y: { 
                    duration: 3.8, 
                    repeat: Infinity, 
                    ease: 'easeInOut', 
                    delay: 0.2 
                  } 
                }}
                whileHover={{ y: -8, scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              >
                <div className="mb-6 relative h-24 flex justify-center items-center">
                  <RhythmicPulse color="rgba(16, 185, 129, 0.4)" size={80} />
                  <GentleSparkle color="rgba(16, 185, 129, 0.7)" count={10} />
                </div>
                
                <h3 className="text-2xl font-semibold text-zinc-800 mb-3">Empathy Economy</h3>
                <p className="text-lg text-zinc-700 leading-relaxed">
                  Your emotional labor is seen, tracked, and honored. 
                  Care becomes a currency that flows both ways.
                </p>
                
                <div className="mt-4">
                  <HandwrittenLine 
                    text="reciprocity matters" 
                    color="rgba(16, 185, 129, 0.6)" 
                    width={160} 
                  />
                </div>
              </motion.div>

              <h4 className="uppercase text-sm font-semibold text-amber-600/90 tracking-widest">Come as you are</h4>

              {/* Value 4: Authentically You */}
              <motion.div
                className="relative w-full max-w-md bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                animate={{ y: [0, -4, 0] }}
                transition={{ 
                  duration: 0.8, 
                  ease: 'easeOut', 
                  delay: 0.2,
                  y: { 
                    duration: 4.2, 
                    repeat: Infinity, 
                    ease: 'easeInOut', 
                    delay: 0.8 
                  } 
                }}
                whileHover={{ y: -8, scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              >
                <div className="mb-6 relative h-24 flex justify-center items-center">
                  <HandDrawnSpiral color="rgba(245, 158, 11, 0.5)" size={80} drawSpeed={6} />
                  <GentleSparkle color="rgba(245, 158, 11, 0.7)" count={10} />
                </div>
                
                <h3 className="text-2xl font-semibold text-zinc-800 mb-3">Authentically You</h3>
                <p className="text-lg text-zinc-700 leading-relaxed">
                  No profiles to curate. No personas to maintain. 
                  Just your real feelings in a real moment.
                </p>
                
                <div className="mt-4">
                  <HandwrittenLine 
                    text="be as you are" 
                    color="rgba(245, 158, 11, 0.6)" 
                    width={120} 
                  />
                </div>
              </motion.div>

              {/* Value 5: Always Held - Anchor Card */}
              <div className="w-full flex flex-col items-center pt-8">
                <h4 className="uppercase text-base font-bold text-pink-600/90 tracking-widest mb-6">Never Left Alone</h4>
                <motion.div
                  className="relative w-full max-w-lg bg-white/80 backdrop-blur-lg rounded-3xl p-10 shadow-2xl hover:shadow-pink-500/20 transition-all duration-500 text-center"
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div className="mb-6 relative h-32 flex justify-center items-center">
                    <LoopedHeartGlow color="#ec4899" size={100} />
                    <GentleSparkle color="#ec4899" count={25} />
                  </div>
                  
                  <h3 className="text-3xl font-bold text-zinc-900 mb-4">Always Held</h3>
                  <p className="text-xl text-zinc-700 leading-relaxed">
                    Even when the world is asleep, our presence is awake. 
                    You're never truly alone here.
                  </p>

                  <div className="mt-4">
                    <HandwrittenLine 
                      text="we show up for you" 
                      color="rgba(236, 72, 153, 0.6)" 
                      width={160} 
                    />
                  </div>
                </motion.div>
              </div>

            </div>
          </section>

          {/* Final CTA */}
          <section className="container mx-auto px-4 mt-20 md:mt-28 text-center">
             <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
             >
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-800 leading-tight">Ready to feel heard?</h2>
                <motion.button
                    onClick={() => setShowAuthModal(true)}
                    className="group mt-8 inline-flex items-center gap-3 px-8 py-4 bg-purple-500 text-lg font-semibold text-white rounded-full shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }} 
                    whileTap={{ scale: 0.95 }}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    Begin Your Journey <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </motion.button>
             </motion.div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-12 text-center">
          <p className="text-zinc-500">
            &copy; {new Date().getFullYear()} heard. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode="signup"
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => { /* Logic to switch between signin/signup */ }}
        />
      )}
    </div>
  )
}

