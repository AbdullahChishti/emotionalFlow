'use client'

import { motion, Variants } from 'framer-motion'
import { Ear, Users, Heart } from 'lucide-react'

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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-4 font-sans">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 py-12 flex flex-col items-center justify-center flex-grow text-center"
      >
        <motion.div variants={itemVariants} className="mb-10">
          <motion.div
            className="relative w-24 h-24 mx-auto flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-purple-300 rounded-full blur-xl opacity-50"></div>
            <Heart className="relative w-16 h-16 text-purple-500" fill="currentColor" />
          </motion.div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-zinc-800 leading-tight mb-4">
          You’re not alone here.
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg text-zinc-600 max-w-md mb-12 leading-relaxed"
        >
          This is a safe space where support flows both ways. You can speak, you can listen. Either way, you’re part of something healing.
        </motion.p>

        <motion.div variants={itemVariants} className="w-full max-w-sm space-y-6">
          <div>
            <motion.button
              onClick={handleSupportPress}
              className="w-full py-4 bg-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 group text-lg"
              whileTap={{ scale: 0.98 }}
            >
              <Users className="w-5 h-5" />
              I need support
            </motion.button>
            <p className="text-sm text-zinc-500 mt-2 px-4">Spend your empathy credits and share freely.</p>
          </div>

          <div>
            <motion.button
              onClick={handleListenPress}
              className="w-full py-4 bg-white/80 backdrop-blur-sm border border-zinc-300/60 text-zinc-700 rounded-xl hover:bg-white transition-all duration-300 shadow-md shadow-zinc-900/5 flex items-center justify-center gap-3 group font-medium text-lg"
              whileTap={{ scale: 0.98 }}
            >
              <Ear className="w-5 h-5" />
              I want to listen
            </motion.button>
            <p className="text-sm text-zinc-500 mt-2 px-4">Be there for someone and earn empathy credits.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
