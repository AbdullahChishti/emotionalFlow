'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, ArrowRight, Smile, Wind, TrendingUp } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'

const features = [
  {
    icon: Smile,
    title: 'Daily Check-In',
    description: 'Connect with your feelings through guided mood tracking and journaling.',
  },
  {
    icon: Wind,
    title: 'Meditation Library',
    description: 'Find peace and clarity with a curated collection of guided meditations.',
  },
  {
    icon: TrendingUp,
    title: 'Track Your Growth',
    description: 'Visualize your journey and celebrate your progress with a personal dashboard.',
  },
]

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 font-sans text-zinc-800 overflow-x-hidden">
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
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-zinc-800 leading-tight md:leading-snug">
                Find Your Calm, <br /> Understand Your Mind.
              </h1>
              <p className="max-w-2xl mx-auto mt-6 text-lg md:text-xl text-zinc-600">
                A safe and supportive space to navigate your emotions, practice mindfulness, and foster personal growth.
              </p>
              <motion.button
                onClick={() => setShowAuthModal(true)}
                className="group mt-10 inline-flex items-center gap-3 px-8 py-4 bg-purple-500 text-lg font-semibold text-white rounded-full shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started for Free <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          </section>

          {/* Features Section */}
          <section className="container mx-auto px-4 mt-24 md:mt-32">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-zinc-800">A Space for Your Inner World</h2>
                <p className="text-lg text-zinc-500 mt-2">Everything you need to feel supported on your journey.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-white/50 backdrop-blur-lg border border-purple-200/30 rounded-2xl p-8 text-center shadow-lg shadow-purple-500/5"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl text-purple-500">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-800 mb-2">{feature.title}</h3>
                  <p className="text-zinc-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
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

