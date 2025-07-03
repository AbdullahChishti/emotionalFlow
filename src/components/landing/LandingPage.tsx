'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, ArrowRight } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { EmpathyWalletGraph } from './EmpathyWalletGraph'
import { SplitPortraitIllustration } from './SplitPortraitIllustration'
import { ReachingHandsIllustration } from './ReachingHandsIllustration'



export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [scrollBg, setScrollBg] = useState('from-blue-50 via-purple-50 to-green-50')

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
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br ${scrollBg} font-sans text-zinc-800 overflow-x-hidden transition-all duration-1000 ease-in-out`}>
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
                <a href="#features" className="text-zinc-500 hover:text-zinc-700 transition-colors text-sm">
                    See how it works ↓
                </a>
              </div>
            </motion.div>
          </section>

          {/* Features Section */}
          <section id="features" className="container mx-auto px-4 mt-32 md:mt-48">
            <div className="space-y-32 md:space-y-48">

              {/* Section 1: Give support, feel connection. */}
              <motion.div
                className="flex flex-col md:flex-row items-center gap-12 md:gap-24"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <div className="w-full md:w-1/2 flex justify-center">
                  <ReachingHandsIllustration />
                </div>
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <h3 className="text-3xl font-bold text-zinc-800 mb-4">Give support, feel connection.</h3>
                  <p className="text-lg text-zinc-600 leading-relaxed">
                    Sometimes listening is the most powerful gift. Give support, earn empathy credits, and know someone’s there when you need to reach out.
                  </p>
                </div>
              </motion.div>

              {/* Section 2: We pair you with someone who truly gets it. */}
              <motion.div
                className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <div className="w-full md:w-1/2 flex justify-center">
                  <SplitPortraitIllustration />
                </div>
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <h3 className="text-3xl font-bold text-zinc-800 mb-4">We pair you with someone who truly gets it.</h3>
                  <p className="text-lg text-zinc-600 leading-relaxed">
                    You’ll connect with someone who understands your state of mind — not just listens, but really hears you.
                  </p>
                  <a href="#" className="inline-block mt-4 text-purple-500 font-semibold hover:text-purple-600 transition-colors">
                    See how it works →
                  </a>
                </div>
              </motion.div>

              {/* Section 3: Track the emotional support you give and receive. */}
              <motion.div
                className="flex flex-col md:flex-row items-center gap-12 md:gap-24"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <div className="w-full md:w-1/2 flex justify-center">
                  <EmpathyWalletGraph />
                </div>
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <h3 className="text-3xl font-bold text-zinc-800 mb-4">Track the emotional support you give and receive.</h3>
                  <p className="text-lg text-zinc-600 leading-relaxed">
                    Your emotional labor matters. Keep track of how much care you’ve shared — and how much has come your way.
                  </p>
                </div>
              </motion.div>

            </div>
          </section>

          {/* Final CTA */}
          <section className="container mx-auto px-4 mt-24 md:mt-32 text-center">
             <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
             >
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-800 leading-tight">Ready to Begin Your Journey?</h2>
                <motion.button
                    onClick={() => setShowAuthModal(true)}
                    className="group mt-8 inline-flex items-center gap-3 px-8 py-4 bg-purple-500 text-lg font-semibold text-white rounded-full shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                >
                    Start Exploring <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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

