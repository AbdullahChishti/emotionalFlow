'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, ArrowRight, HeartHandshake, Link2, Wallet } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'

const features = [
  {
    icon: HeartHandshake,
    title: 'Support, Shared.',
    description: 'Give support to others and earn empathy credits. Use those credits to ask for support when you need it — guilt-free.',
  },
  {
    icon: Link2,
    title: 'Emotional Matching.',
    description: 'We connect you with someone who’s emotionally available and understands what you’re going through.',
  },
  {
    icon: Wallet,
    title: 'Your Empathy Wallet.',
    description: 'Keep track of how much you’ve given and received. Because emotional labor deserves recognition.',
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
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-zinc-800 leading-tight md:leading-snug">
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
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-zinc-800">A New Kind of Support System</h2>
              <p className="text-lg text-zinc-500 mt-2">Built on mutual respect and reciprocity.</p>
            </div>
            <div className="space-y-20 md:space-y-28">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={`group flex flex-col md:flex-row items-center gap-12 md:gap-16 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <div className="w-full md:w-1/2 flex justify-center">
                    <div className="relative w-64 h-64 flex items-center justify-center">
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-purple-200 via-blue-200 to-green-200 rounded-full blur-2xl opacity-80 transition-all duration-500 ease-in-out group-hover:blur-3xl group-hover:scale-110"
                      />
                      <feature.icon className="relative w-32 h-32 text-purple-500/80 transition-transform duration-500 ease-in-out group-hover:scale-110" strokeWidth={1} />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-zinc-800 mb-4">{feature.title}</h3>
                    <p className="text-lg text-zinc-600 leading-relaxed">{feature.description}</p>
                  </div>
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

