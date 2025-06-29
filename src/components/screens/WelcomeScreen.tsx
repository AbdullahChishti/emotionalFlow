'use client'

import { motion } from 'framer-motion'
import { Heart, Ear, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface WelcomeScreenProps {
  onNavigate: (screen: string, params?: any) => void
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const handleListenPress = () => {
    onNavigate('MoodSelection', { mode: 'listen' })
  }

  const handleSupportPress = () => {
    onNavigate('MoodSelection', { mode: 'support' })
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradients matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-8 py-16 flex flex-col items-center justify-center min-h-screen relative">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center shadow-lg">
            <Heart className="w-12 h-12 text-primary" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            How are you
          </h1>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            feeling{' '}
            <span className="text-primary">today?</span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg text-muted-foreground text-center max-w-md mb-12 leading-relaxed"
        >
          Connect with others, share your feelings, and find support in our community.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full max-w-sm space-y-4"
        >
          <button
            onClick={handleListenPress}
            className="w-full py-4 bg-white/80 backdrop-blur-sm border border-white/30 text-foreground rounded-full hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group font-medium text-lg"
          >
            <Ear className="w-5 h-5 group-hover:scale-110 transition-transform" />
            I want to listen
          </button>

          <button
            onClick={handleSupportPress}
            className="w-full py-4 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-full hover:from-violet-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl shadow-violet-300/50 flex items-center justify-center gap-3 group font-medium text-lg transform hover:scale-105"
          >
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            I need support
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 left-0 right-0"
        >
          <p className="text-sm text-text-tertiary text-center px-8">
            EmotionEconomy © 2024. Building a more empathetic world, together.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
