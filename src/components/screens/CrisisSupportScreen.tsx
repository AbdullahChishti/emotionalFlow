'use client'

import { motion } from 'framer-motion'
import { Phone, Shield, LifeBuoy, Wind } from 'lucide-react'

const calmingTips = [
  {
    icon: Wind,
    title: 'Breathe Deeply',
    description: 'Inhale for 4 seconds, hold for 7, and exhale for 8. Repeat until you feel calmer.',
  },
  {
    icon: LifeBuoy,
    title: 'Ground Yourself',
    description: 'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.',
  },
  {
    icon: Shield,
    title: 'Create a Safe Space',
    description: 'Visualize a place where you feel completely safe and calm. Spend a few moments there in your mind.',
  },
]

export function CrisisSupportScreen() {
  const handleEmergencyCall = () => {
    // In a real app, this would link to a crisis hotline, e.g., tel:988
    alert('Connecting to emergency services... (This is a demo)')
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-100 via-rose-100 to-orange-100 font-sans p-4 sm:p-6">
      <motion.div 
        className="w-full max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Header */}
        <header className="mb-8">
          <LifeBuoy className="mx-auto w-12 h-12 text-red-500 mb-2" />
          <h1 className="text-4xl font-bold text-zinc-800">Crisis Support</h1>
          <p className="text-zinc-600 mt-2 max-w-md mx-auto">You are not alone. Help is available right now.</p>
        </header>

        {/* Emergency Contact Button */}
        <motion.div className="mb-12" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button
            onClick={handleEmergencyCall}
            className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 px-6 py-4 bg-red-500 text-white text-xl font-bold rounded-full shadow-lg shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/50 transition-all duration-300"
          >
            <Phone className="w-6 h-6" />
            Get Immediate Help
          </button>
          <p className="text-sm text-zinc-500 mt-3">Connect to a 24/7 crisis hotline.</p>
        </motion.div>

        {/* Calming Tips */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-zinc-700">Calming Tips & Exercises</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {calmingTips.map((tip, index) => (
              <motion.div
                key={tip.title}
                className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg shadow-rose-500/5 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <tip.icon className="w-8 h-8 text-red-400 mb-3 mx-auto" />
                <h3 className="text-lg font-bold text-zinc-800 mb-1">{tip.title}</h3>
                <p className="text-zinc-600 text-sm">{tip.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  )
}
