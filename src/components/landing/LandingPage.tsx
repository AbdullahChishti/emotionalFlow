'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DoodleHeart, DoodleLightbulb, DoodleSparkle, DoodleArrow } from '@/components/landing/DoodleIcons'
import { ScribbleIllustration } from '@/components/landing/ScribbleIllustration'
import { AuthModal } from '@/components/auth/AuthModal'
import SketchbookBackground from '@/components/ui/SketchbookBackground'

const features = [
  {
    icon: DoodleHeart,
    title: 'Find Your Space',
    description: 'A safe, judgment-free zone to share your thoughts and feelings.',
    color: 'text-rose-500',
  },
  {
    icon: DoodleLightbulb,
    title: 'Gain Perspective',
    description: 'Connect with others who have walked similar paths and find new insights.',
    color: 'text-amber-500',
  },
  {
    icon: DoodleSparkle,
    title: 'Feel Understood',
    description: "It's not about fixing, it's about feeling heard and validated.",
    color: 'text-teal-500',
  },
]



export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white font-sans text-slate-700">
      <SketchbookBackground />

      <div className="relative z-10">
        <header className="absolute top-0 left-0 right-0 z-50">
          <div className="container mx-auto px-6 py-5 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <DoodleHeart className="w-8 h-8 text-indigo-500" />
              </motion.div>
              <span className="text-2xl font-medium text-slate-600">heard</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 text-slate-600 font-medium rounded-lg transition-colors hover:bg-slate-100"
              >
                Sign In
              </motion.button>
              <motion.button
                onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                whileHover={{ scale: 1.03, y: -2, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.97 }}
                title="Create a new account"
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Start Your Story
              </motion.button>
            </div>
          </div>
        </header>

        <main className="pt-32 pb-20">
          <section className="text-center px-6">
            <div className="max-w-4xl mx-auto">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-5xl md:text-7xl font-light tracking-tight text-slate-800 mb-6 leading-tight"
              >
                A Digital Sketchbook for Your <br />
                <span className="relative inline-block">
                  <span className="text-violet-600">Emotions</span>
                  <svg
                    className="absolute -bottom-3 left-0 w-full h-4 text-violet-300"
                    viewBox="0 0 120 12"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0.89386,8.82331 C31.1385,2.14342 61.3831,2.14342 91.6278,8.82331 C101.87,11.1633 112.112,11.1633 122.355,8.82331"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto"
              >
                This is your space. To feel. To speak. <span className="text-violet-600">To be heard.</span>
              </motion.p>

              <motion.button
                onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                whileHover={{ scale: 1.03, y: -2, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.97 }}
                title="Create a new account" 
                className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center">
                  Start Your Story
                  <DoodleArrow className="w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </motion.button>
            </div>
          </section>

          <section className="container mx-auto px-6 mt-32">
            <div className="grid md:grid-cols-3 gap-x-8 gap-y-16 text-center">
              {features.map((feature, index) => (
                <motion.div 
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-indigo-100/70">
                    <feature.icon className={`w-12 h-12 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="py-24 mt-24 bg-indigo-50/70">
            <div className="container mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <ScribbleIllustration className="mx-auto h-48 w-auto text-slate-400" />
                <h2 className="mt-8 text-4xl font-light text-slate-800 leading-tight max-w-2xl mx-auto">Your thoughts have a home here.</h2>
                <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">This is a space to untangle the knots, to map out your feelings, and to see your own mind in a new light. No judgment, no expectations.</p>
              </motion.div>
            </div>
          </section>

          <section className="container mx-auto px-6 my-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h2 className="text-4xl font-light text-slate-800 mb-4">Ready to find your people?</h2>
              <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto">
                Create your anonymous sketchbook and connect with a community that understands.
              </p>
              <motion.button
                onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                whileHover={{ scale: 1.03, y: -2, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.97 }}
                title="Create a new account" 
                className="group relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center">
                  Find Your People
                  <DoodleArrow className="w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </motion.button>
            </motion.div>
          </section>
        </main>

        <footer className="py-8 text-center border-t border-slate-200">
          <p className="text-slate-400">
            &copy; 2024 heard. A sketchbook for the heart.
          </p>
        </footer>
      </div>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  )
}
