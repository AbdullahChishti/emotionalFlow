'use client'

import { motion, Variants } from 'framer-motion'
import { Ear, Users } from 'lucide-react'
import SketchbookBackground from '@/components/ui/SketchbookBackground'
import { DoodleHeart } from '@/components/landing/DoodleIcons'

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
      transition: { duration: 0.6, ease: 'easeInOut' },
    },
  }

  return (
    <div className="min-h-screen bg-zinc-50 relative overflow-hidden flex flex-col">
      <SketchbookBackground />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 py-12 flex flex-col items-center justify-center flex-grow text-center"
      >
        <motion.div variants={itemVariants} className="mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-100/80 border border-indigo-200/50">
            <DoodleHeart className="w-12 h-12 text-indigo-500" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-4xl md:text-5xl font-light text-zinc-800 leading-tight">
            Welcome to your
            <br />
            <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
              safe space
            </span>
          </h1>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-lg text-zinc-600 max-w-md mb-12 leading-relaxed"
        >
          Here, you can be yourself. Choose whether you'd like to share your story or listen to another's.
        </motion.p>

        <motion.div variants={itemVariants} className="w-full max-w-xs space-y-4">
          <button
            onClick={handleSupportPress}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.03] transition-all duration-300 flex items-center justify-center gap-3 group text-lg"
          >
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            I need support
          </button>

          <button
            onClick={handleListenPress}
            className="w-full py-4 bg-white/80 backdrop-blur-sm border border-zinc-300/60 text-zinc-700 rounded-xl hover:bg-white transition-all duration-300 shadow-md shadow-zinc-900/5 flex items-center justify-center gap-3 group font-medium text-lg"
          >
            <Ear className="w-5 h-5 group-hover:scale-110 transition-transform" />
            I want to listen
          </button>
        </motion.div>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="text-center py-6 px-4"
      >
        <p className="text-sm text-zinc-500">
          heard &copy; 2024 &middot; A more empathetic world, together.
        </p>
      </motion.footer>
    </div>
  )
}
