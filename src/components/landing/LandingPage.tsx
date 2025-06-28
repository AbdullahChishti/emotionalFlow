'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Users, Shield, ArrowRight, Sparkles } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import dynamic from 'next/dynamic'

const InteractiveStarfield = dynamic(
  () => import('@/components/effects/InteractiveStarfield').then(mod => mod.InteractiveStarfield),
  { ssr: false }
)

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d1117]">
      <InteractiveStarfield />
      {/* Main Landing Content */}
      <div className="relative z-10">
        {/* Minimal Header */}
        <header className="container mx-auto px-6 py-8 flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-400 rounded-full flex items-center justify-center shadow-md shadow-violet-200/50">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-light text-white">EmotionEconomy</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <button
              onClick={() => {
                setAuthMode('signin')
                setShowAuthModal(true)
              }}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('signup')
                setShowAuthModal(true)
              }}
              className="px-6 py-3 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-full hover:from-violet-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl shadow-violet-300/40 font-medium"
            >
              Begin Journey
            </button>
          </motion.div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-700/50 mb-8"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-gray-400 font-medium">Your emotional wellness journey starts here</span>
              </motion.div>
            </div>

            <h1 className="text-5xl md:text-7xl font-extralight mb-8 text-white leading-tight">
              Find Your
              <span className="block bg-gradient-to-r from-primary via-blue-500 to-cyan-400 bg-clip-text text-transparent font-light">
                Emotional Balance
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              A gentle space where empathy flows naturally. 
              Give support when you can, receive it when you need it.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={() => {
                  setAuthMode('signup')
                  setShowAuthModal(true)
                }}
                className="group px-8 py-4 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-full hover:from-violet-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl shadow-violet-300/50 flex items-center gap-3 font-medium text-lg"
              >
                Start Your Healing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section - Minimal */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light mb-6 text-white">
                Designed for Your Wellbeing
              </h2>
              <p className="text-xl text-gray-400 font-light">
                Every feature crafted with care and understanding
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Heart,
                  title: "Empathy Exchange",
                  description: "Give and receive support in perfect balance",
                  gradient: "from-violet-300 to-purple-300",
                },
                {
                  icon: Users,
                  title: "Mindful Matching",
                  description: "Connect with those who truly understand",
                  gradient: "from-blue-300 to-cyan-300",
                },
                {
                  icon: Shield,
                  title: "Gentle Protection",
                  description: "Safeguards that honor your emotional energy",
                  gradient: "from-green-300 to-teal-300",
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  className="group p-8 bg-gray-900/40 backdrop-blur-md rounded-3xl border border-gray-700/50 hover:bg-gray-800/60 transition-all duration-300"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-gray-800/20`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-medium mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400 font-light leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section - Soft */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="p-12 bg-gradient-to-br from-gray-900/50 to-purple-900/20 backdrop-blur-md rounded-3xl border-gray-700/60">
              <h2 className="text-4xl font-light mb-6 text-white">
                Your journey to emotional wellness begins with a single step
              </h2>
              <p className="text-xl text-gray-400 mb-8 font-light">
                Join a community that understands, supports, and grows together
              </p>
              <button
                onClick={() => {
                  setAuthMode('signup')
                  setShowAuthModal(true)
                }}
                className="px-10 py-4 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-full hover:from-violet-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl shadow-violet-300/50 font-medium text-lg"
              >
                Begin Your Journey
              </button>
            </div>
          </motion.div>
        </section>

        {/* Minimal Footer */}
        <footer className="container mx-auto px-6 py-8 text-center">
          <p className="text-gray-500 font-light">
            &copy; 2024 EmotionEconomy. Nurturing emotional connections with care.
          </p>
        </footer>
      </div>

      {/* Auth Modal */}
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
