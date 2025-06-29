'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Users, Shield, ArrowRight, Sparkles } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { ScrollAnimate } from '@/components/effects/ScrollAnimate'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

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
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(features[0].id)

  useEffect(() => {
    if (selectedFeatureId) {
      const timer = setTimeout(() => {
        setSelectedFeatureId(null);
      }, 5000); // Auto-hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [selectedFeatureId]);

  const selectedFeature = selectedFeatureId ? features.find(f => f.id === selectedFeatureId) : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Therapeutic constellation background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/40 via-blue-50/30 to-indigo-50/40" />

      {/* Constellation stars - therapeutic and calming */}
      <div className="absolute inset-0">
        {/* Major constellation points */}
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-indigo-300 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-32 left-1/3 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse opacity-50" style={{ animationDelay: '1s' }} />
        <div className="absolute top-28 left-1/2 w-2.5 h-2.5 bg-purple-300 rounded-full animate-pulse opacity-70" style={{ animationDelay: '2s' }} />
        <div className="absolute top-40 left-2/3 w-1 h-1 bg-cyan-300 rounded-full animate-pulse opacity-40" style={{ animationDelay: '3s' }} />
        <div className="absolute top-24 right-1/4 w-2 h-2 bg-violet-300 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.5s' }} />

        {/* Mid-section constellation */}
        <div className="absolute top-1/2 left-20 w-1.5 h-1.5 bg-teal-300 rounded-full animate-pulse opacity-50" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-pulse opacity-65" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-45" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-1/2 right-20 w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse opacity-70" style={{ animationDelay: '3.5s' }} />

        {/* Lower constellation */}
        <div className="absolute bottom-32 left-1/5 w-2 h-2 bg-emerald-300 rounded-full animate-pulse opacity-55" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-40 left-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '4.5s' }} />
        <div className="absolute bottom-28 right-1/4 w-1 h-1 bg-indigo-300 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-36 right-1/3 w-2.5 h-2.5 bg-violet-400 rounded-full animate-pulse opacity-75" style={{ animationDelay: '3s' }} />
      </div>

      {/* Connecting constellation lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 800" fill="none">
        {/* Therapeutic constellation patterns */}
        <path d="M300,160 L400,192 L600,176 L800,200 L1000,152" stroke="#6366f1" strokeWidth="0.5" fill="none" className="animate-pulse" style={{ animationDuration: '4s' }} />
        <path d="M80,400 L400,400 L800,400 L1120,400" stroke="#8b5cf6" strokeWidth="0.5" fill="none" className="animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <path d="M240,640 L480,600 L720,640 L960,600" stroke="#06b6d4" strokeWidth="0.5" fill="none" className="animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />

        {/* Gentle connecting lines between stars */}
        <path d="M300,160 L400,400" stroke="#e0e7ff" strokeWidth="0.3" fill="none" opacity="0.6" />
        <path d="M600,176 L800,400" stroke="#e0e7ff" strokeWidth="0.3" fill="none" opacity="0.6" />
        <path d="M480,600 L600,176" stroke="#e0e7ff" strokeWidth="0.3" fill="none" opacity="0.4" />
        <path d="M240,640 L300,160" stroke="#e0e7ff" strokeWidth="0.3" fill="none" opacity="0.5" />
      </svg>

      {/* Soft nebula-like clouds for therapy ambiance */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-indigo-100/30 to-purple-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-blue-100/25 to-cyan-100/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-violet-100/20 to-pink-100/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />

      {/* Therapeutic breathing pattern visualization */}
      <div className="absolute top-0 left-0 w-full h-full">
        <svg className="w-full h-full opacity-15" viewBox="0 0 1200 800" fill="none">
          {/* Gentle breathing waves for relaxation */}
          <path d="M0,400 Q300,350 600,400 Q900,450 1200,400" stroke="url(#breathingGradient1)" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDuration: '6s' }} />
          <path d="M0,420 Q300,370 600,420 Q900,470 1200,420" stroke="url(#breathingGradient2)" strokeWidth="0.8" fill="none" className="animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }} />
          <path d="M0,380 Q300,330 600,380 Q900,430 1200,380" stroke="url(#breathingGradient3)" strokeWidth="0.6" fill="none" className="animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />

          {/* Meditation circles - expanding and contracting */}
          <circle cx="600" cy="400" r="50" stroke="url(#meditationGradient)" strokeWidth="0.5" fill="none" className="animate-pulse" style={{ animationDuration: '4s' }} />
          <circle cx="600" cy="400" r="80" stroke="url(#meditationGradient)" strokeWidth="0.3" fill="none" className="animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          <circle cx="600" cy="400" r="120" stroke="url(#meditationGradient)" strokeWidth="0.2" fill="none" className="animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />

          <defs>
            <linearGradient id="breathingGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="breathingGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="breathingGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
            </linearGradient>
            <radialGradient id="meditationGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Therapeutic constellation stars - scattered mindfully */}
      <div className="absolute inset-0 opacity-40">
        {/* Carefully positioned stars for therapeutic constellations */}
        {[
          { left: '15%', top: '25%', size: 'w-1 h-1', color: 'bg-indigo-300', delay: '0s' },
          { left: '25%', top: '35%', size: 'w-1.5 h-1.5', color: 'bg-blue-300', delay: '1s' },
          { left: '35%', top: '20%', size: 'w-1 h-1', color: 'bg-purple-300', delay: '2s' },
          { left: '45%', top: '30%', size: 'w-2 h-2', color: 'bg-violet-300', delay: '3s' },
          { left: '55%', top: '25%', size: 'w-1 h-1', color: 'bg-cyan-300', delay: '4s' },
          { left: '65%', top: '35%', size: 'w-1.5 h-1.5', color: 'bg-teal-300', delay: '0.5s' },
          { left: '75%', top: '20%', size: 'w-1 h-1', color: 'bg-indigo-400', delay: '1.5s' },
          { left: '85%', top: '30%', size: 'w-2 h-2', color: 'bg-blue-400', delay: '2.5s' },

          { left: '20%', top: '55%', size: 'w-1.5 h-1.5', color: 'bg-emerald-300', delay: '3.5s' },
          { left: '30%', top: '65%', size: 'w-1 h-1', color: 'bg-cyan-400', delay: '4.5s' },
          { left: '40%', top: '50%', size: 'w-2 h-2', color: 'bg-purple-400', delay: '0.2s' },
          { left: '60%', top: '60%', size: 'w-1 h-1', color: 'bg-violet-400', delay: '1.2s' },
          { left: '70%', top: '55%', size: 'w-1.5 h-1.5', color: 'bg-indigo-300', delay: '2.2s' },
          { left: '80%', top: '65%', size: 'w-1 h-1', color: 'bg-blue-300', delay: '3.2s' },

          { left: '10%', top: '75%', size: 'w-2 h-2', color: 'bg-teal-400', delay: '4.2s' },
          { left: '30%', top: '85%', size: 'w-1 h-1', color: 'bg-cyan-300', delay: '0.8s' },
          { left: '50%', top: '80%', size: 'w-1.5 h-1.5', color: 'bg-purple-300', delay: '1.8s' },
          { left: '70%', top: '85%', size: 'w-1 h-1', color: 'bg-violet-300', delay: '2.8s' },
          { left: '90%', top: '75%', size: 'w-2 h-2', color: 'bg-indigo-400', delay: '3.8s' },
        ].map((star, i) => (
          <div
            key={i}
            className={`absolute ${star.size} ${star.color} rounded-full animate-pulse`}
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

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
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-md shadow-primary/30">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-light text-foreground">EmotionEconomy</span>
          </motion.div>
          
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ThemeToggle />
            <button
              onClick={() => {
                setAuthMode('signin')
                setShowAuthModal(true)
              }}
              className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('signup')
                setShowAuthModal(true)
              }}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 font-medium transform hover:scale-105 hover:-translate-y-1"
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
            className="relative max-w-5xl mx-auto"
          >
            {/* Living Heart Nebula Background */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <motion.div
                className="absolute w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-[68%] -translate-y-[45%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0%,transparent_60%)] rounded-full blur-2xl"
                animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-[32%] -translate-y-[45%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0%,transparent_60%)] rounded-full blur-2xl"
                animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
              <motion.div
                className="absolute w-[650px] h-[650px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] bg-[radial-gradient(circle_at_center,rgba(138,43,226,0.1)_0%,transparent_70%)] rounded-full blur-3xl"
                animate={{ scale: [1, 1.03, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <h1 className="text-6xl md:text-8xl font-extralight mb-8 text-foreground leading-tight">
              <span className="inline-block animate-fade-in-up">Find</span>{' '}
              <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>Your</span>
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-light animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                Emotional Balance
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              A gentle space where empathy flows naturally.
              <span className="block mt-2 text-indigo-600/80">Give support when you can, receive it when you need it.</span>
            </p>

            {/* Therapeutic breathing guide */}
            <div className="mb-12 flex flex-col items-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-200 animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute inset-2 rounded-full border border-purple-200 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
                <div className="absolute inset-4 rounded-full border border-blue-200 animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
                <div className="absolute inset-6 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 animate-pulse" style={{ animationDuration: '4s' }} />
              </div>
              <p className="text-sm text-indigo-500/70 font-light">Breathe • Connect • Heal</p>
            </div>

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

        {/* Features Section - Stellar Navigation */}
        <section className="container mx-auto px-6 py-32">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.2 }}
            className="text-center mb-20"
          >
            <motion.h2 
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
              }}
              className="text-5xl font-light mb-6 text-foreground"
            >
              An Ecosystem of Care
            </motion.h2>
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
              }}
              className="text-xl text-muted-foreground font-light max-w-2xl mx-auto"
            >
              Every feature is a star in a constellation, crafted with deep understanding for your wellbeing.
            </motion.p>
          </motion.div>
          
          <div className="relative max-w-5xl mx-auto min-h-[500px] flex items-center justify-center">
            {/* Connecting Lines */}
            <svg className="absolute w-full h-full" style={{ zIndex: 0 }}>
              <defs>
                <linearGradient id="line-glow-gradient">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.9)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                </linearGradient>
              </defs>

              {/* Base track lines */}
              <line x1="15%" y1="20%" x2="50%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1="50%" y1="80%" x2="85%" y2="20%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1="85%" y1="20%" x2="15%" y2="20%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

              {/* Animated light pulses */}
              <motion.line x1="15%" y1="20%" x2="50%" y2="80%" stroke="url(#line-glow-gradient)" strokeWidth="2" strokeDasharray="80 350" animate={{ strokeDashoffset: [0, -430] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />
              <motion.line x1="50%" y1="80%" x2="85%" y2="20%" stroke="url(#line-glow-gradient)" strokeWidth="2" strokeDasharray="80 350" animate={{ strokeDashoffset: [0, -430] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 1.7 }} />
              <motion.line x1="85%" y1="20%" x2="15%" y2="20%" stroke="url(#line-glow-gradient)" strokeWidth="2" strokeDasharray="80 350" animate={{ strokeDashoffset: [0, -430] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 3.4 }} />
            </svg>

            {/* Feature Nodes */}
            <div className="absolute top-[15%] left-[10%]">
              <FeatureNode feature={features[0]} onClick={setSelectedFeatureId} selectedId={selectedFeatureId} />
            </div>
            <div className="absolute top-[75%] left-1/2 -translate-x-1/2">
              <FeatureNode feature={features[1]} onClick={setSelectedFeatureId} selectedId={selectedFeatureId} />
            </div>
            <div className="absolute top-[15%] right-[10%]">
              <FeatureNode feature={features[2]} onClick={setSelectedFeatureId} selectedId={selectedFeatureId} />
            </div>
            
            {/* Contextual Description Display */}
            <div className="absolute w-full h-full pointer-events-none">
              <AnimatePresence>
                {selectedFeature && (
                  <motion.div
                    key={selectedFeature.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, ease: "backOut" } }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: "easeIn" } }}
                    className="absolute w-80"
                    style={getDescriptionPosition(selectedFeature.id)}
                  >
                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/70 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-3">
                        <selectedFeature.icon className="w-8 h-8 text-primary flex-shrink-0"/>
                        <h3 className="text-xl font-light text-foreground">{selectedFeature.title}</h3>
                      </div>
                      <p className="text-md text-muted-foreground font-light leading-relaxed">
                        {selectedFeature.description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* CTA Section - Celestial Vortex */}
        <section className="relative container mx-auto px-6 py-40 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="absolute w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(138,43,226,0.15)_0%,transparent_50%)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(76,147,255,0.1)_0%,transparent_45%)]"></div>
             <div className="absolute w-[1000px] h-[1000px] border border-blue-500/10 rounded-full animate-pulse-slow"></div>
             <div className="absolute w-[700px] h-[700px] border border-primary/10 rounded-full animate-pulse-slower"></div>
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ staggerChildren: 0.3 }}
            className="relative z-10 max-w-2xl mx-auto text-center"
          >
            <motion.h2 
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.8 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
              }}
              className="text-5xl md:text-6xl font-light mb-6 text-foreground leading-tight"
            >
              Ready to Rediscover Balance?
            </motion.h2>
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 } }
              }}
              className="text-xl text-muted-foreground mb-12 font-light"
            >
              Step into a universe designed for genuine connection. Your community is waiting among the stars.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.5 },
                visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10, delay: 0.4 } }
              }}
            >
              <button
                onClick={() => {
                  setAuthMode('signup')
                  setShowAuthModal(true)
                }}
                className="group relative inline-flex items-center justify-center h-16 w-16 sm:h-auto sm:w-auto sm:px-10 sm:py-4 bg-transparent border-2 border-primary/50 text-foreground rounded-full transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_30px_0] hover:shadow-primary/50"
              >
                <span className="hidden sm:inline">Join the Cosmos</span>
                <ArrowRight className="w-6 h-6 sm:hidden" />
                <ArrowRight className="w-5 h-5 hidden sm:inline sm:ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* Minimal Footer */}
        <footer className="container mx-auto px-6 py-8 text-center">
          <p className="text-muted-foreground font-light">
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

const getDescriptionPosition = (id: string) => {
  switch (id) {
    case 'empathy':
      return { top: '15%', left: 'calc(10% + 140px)', transform: 'translateY(-20%)' };
    case 'matching':
      return { top: 'calc(75% - 200px)', left: '50%', transform: 'translateX(-50%)' };
    case 'protection':
      return { top: '15%', right: 'calc(10% + 140px)', transform: 'translateY(-20%)' };
    default:
      return {};
  }
};

const FeatureNode = ({ feature, onClick, selectedId }: { feature: any, onClick: (id: string) => void, selectedId: string | null }) => {
  const isSelected = feature.id === selectedId;
  return (
    <motion.button
      onClick={() => onClick(feature.id)}
      className="relative w-28 h-28 flex flex-col items-center justify-center z-10"
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div 
        className="absolute inset-0 rounded-full border-2"
        animate={{ 
          borderColor: isSelected ? 'rgba(138, 43, 226, 0.8)' : 'rgba(255, 255, 255, 0.1)',
          boxShadow: isSelected ? '0 0 20px rgba(138, 43, 226, 0.5)' : 'none',
          opacity: isSelected ? 1 : 0.5,
        }}
        transition={{ duration: 0.5 }}
      />
      <motion.div 
        className="w-2 h-2 rounded-full"
        animate={{ 
          backgroundColor: isSelected ? 'rgba(138, 43, 226, 1)' : 'rgba(255, 255, 255, 0.5)',
          scale: isSelected ? 1.5 : 1
        }}
        transition={{ duration: 0.5 }}
      />
      <motion.span 
        className="mt-4 text-center text-sm font-light text-muted-foreground"
        animate={{ opacity: isSelected ? 1 : 0.7 }}
      >
        {feature.title}
      </motion.span>
    </motion.button>
  )
};
