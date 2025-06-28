'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Users, Shield, ArrowRight, Sparkles } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import dynamic from 'next/dynamic'
import { ScrollAnimate } from '@/components/effects/ScrollAnimate'

const InteractiveStarfield = dynamic(
  () => import('@/components/effects/InteractiveStarfield').then(mod => mod.InteractiveStarfield),
  { ssr: false }
)

const AmbientStarfield = dynamic(
  () => import('@/components/effects/AmbientStarfield').then(mod => mod.AmbientStarfield),
  { ssr: false }
)

const features = [
  {
    icon: Heart,
    title: "Empathy Exchange",
    description: "Give and receive support in a beautifully balanced ecosystem. Your emotional wellness is nurtured through genuine, reciprocal connections.",
    id: "empathy",
  },
  {
    icon: Users,
    title: "Mindful Matching",
    description: "Our algorithm connects you with individuals who truly understand your current emotional state, ensuring every interaction is meaningful and supportive.",
    id: "matching",
  },
  {
    icon: Shield,
    title: "Gentle Protection",
    description: "Advanced safeguards and burnout prevention tools honor your emotional energy, creating a sustainable and safe space for healing.",
    id: "protection",
  }
];

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [hoveredFeature, setHoveredFeature] = useState(features[0].id)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d1117]">
      <AmbientStarfield />
      <InteractiveStarfield />
      {/* Main Landing Content */}
      <div className="relative z-20">
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
        <section className="container mx-auto px-6 py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-6xl md:text-8xl font-extralight mb-8 text-white leading-tight">
              Find Your
              <span className="block bg-gradient-to-r from-primary via-blue-500 to-cyan-400 bg-clip-text text-transparent font-light">
                Emotional Balance
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              A gentle space where empathy flows naturally. Give support when you can, receive it when you need it.
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

        {/* Features Section - Modern & Interactive */}
        <ScrollAnimate>
          <section className="container mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-light mb-6 text-white">
                An Ecosystem of Care
              </h2>
              <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
                Every feature is crafted with deep understanding and a commitment to your wellbeing.
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-center border-b border-gray-800 mb-12">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    onMouseOver={() => setHoveredFeature(feature.id)}
                    className="relative px-8 py-4 text-center cursor-pointer"
                  >
                    <p className={`transition-colors text-lg ${hoveredFeature === feature.id ? 'text-white' : 'text-gray-500'}`}>
                      {feature.title}
                    </p>
                    {hoveredFeature === feature.id && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        layoutId="underline"
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="relative min-h-[12rem]">
                <AnimatePresence mode="wait">
                  {features.map(feature => 
                    hoveredFeature === feature.id && (
                      <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left"
                      >
                        <div className="w-20 h-20 bg-gray-800/50 rounded-2xl flex-shrink-0 flex items-center justify-center border border-gray-700">
                          <feature.icon className="w-10 h-10 text-primary"/>
                        </div>
                        <p className="text-xl text-gray-300 font-light max-w-xl">
                          {feature.description}
                        </p>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </ScrollAnimate>

        {/* CTA Section - Soft */}
        <ScrollAnimate delay={0.2}>
          <section className="container mx-auto px-6 py-20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="p-12 bg-gradient-to-br from-gray-900/50 to-purple-900/20 backdrop-blur-md rounded-3xl border-gray-700/60 hover:shadow-2xl hover:shadow-primary/10 transition-shadow duration-500">
                <h2 className="text-4xl font-light mb-6 text-white">
                  Ready to Rediscover Balance?
                </h2>
                <p className="text-xl text-gray-400 mb-8 font-light">
                  Step into a space designed for genuine connection and mindful support. Your community is waiting.
                </p>
                <button
                  onClick={() => {
                    setAuthMode('signup')
                    setShowAuthModal(true)
                  }}
                  className="px-10 py-4 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-full hover:from-violet-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl shadow-violet-300/50 font-medium text-lg"
                >
                  Join the Economy of Emotion
                </button>
              </div>
            </div>
          </section>
        </ScrollAnimate>

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
