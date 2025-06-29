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
      {/* Ethereal artistic background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-blue-50/20 to-purple-50/30" />

      {/* Floating artistic elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-full blur-2xl animate-pulse" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-violet-200/30 to-pink-200/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full blur-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '2s' }} />

      {/* Flowing lines */}
      <div className="absolute top-0 left-0 w-full h-full">
        <svg className="w-full h-full opacity-20" viewBox="0 0 1200 800" fill="none">
          <path d="M0,400 Q300,200 600,400 T1200,400" stroke="url(#gradient1)" strokeWidth="2" fill="none" className="animate-pulse" />
          <path d="M0,300 Q400,100 800,300 T1200,300" stroke="url(#gradient2)" strokeWidth="1.5" fill="none" className="animate-pulse" style={{ animationDelay: '1s' }} />
          <path d="M0,500 Q200,300 400,500 T800,500 T1200,500" stroke="url(#gradient3)" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDelay: '2s' }} />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Subtle particle effect */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
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
