'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Wind, Moon, Brain, Play } from 'lucide-react'

const meditationData = {
  Anxiety: [
    { id: 1, title: 'Calm Your Mind', duration: '10 min', image: '/images/anxiety-1.jpg' },
    { id: 2, title: 'Letting Go of Worry', duration: '15 min', image: '/images/anxiety-2.jpg' },
    { id: 3, title: 'Breathing Anchor', duration: '5 min', image: '/images/anxiety-3.jpg' },
  ],
  Sleep: [
    { id: 4, title: 'Deep Sleep Story', duration: '25 min', image: '/images/sleep-1.jpg' },
    { id: 5, title: 'Relaxing Body Scan', duration: '20 min', image: '/images/sleep-2.jpg' },
  ],
  Focus: [
    { id: 6, title: 'Mindful Productivity', duration: '10 min', image: '/images/focus-1.jpg' },
    { id: 7, title: 'Sharpen Your Attention', duration: '12 min', image: '/images/focus-2.jpg' },
    { id: 8, title: 'Clarity Boost', duration: '8 min', image: '/images/focus-3.jpg' },
  ],
}

const categories = [
  { name: 'Anxiety', icon: Wind },
  { name: 'Sleep', icon: Moon },
  { name: 'Focus', icon: Brain },
]

export default function MeditationLibraryScreen() {
  const [activeCategory, setActiveCategory] = useState('Anxiety')

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100 font-sans p-4 sm:p-6 md:p-8">
      <motion.div 
        className="w-full max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-700">Meditation Library</h1>
          <p className="text-zinc-500 mt-1">Find a moment of peace and clarity.</p>
        </header>

        {/* Search and Categories */}
        <div className="mb-8 space-y-6">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search for a meditation..."
              className="w-full p-3 pl-12 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-full focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all duration-300"
            />
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {categories.map(({ name, icon: Icon }) => (
              <motion.button
                key={name}
                onClick={() => setActiveCategory(name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${activeCategory === name ? 'text-white shadow-md' : 'bg-white/70 text-zinc-600 hover:bg-white'}`}
                style={activeCategory === name ? {
                  backgroundColor: '#335f64'
                } : {}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5" />
                <span>{name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Meditation Grid */}
        <motion.div 
          key={activeCategory} // Animate when category changes
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {meditationData[activeCategory as keyof typeof meditationData].map((meditation) => (
            <motion.div 
              key={meditation.id}
              className="group bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg shadow-purple-500/5 overflow-hidden cursor-pointer"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ y: -5 }}
            >
              <div className="relative h-40 bg-gradient-to-br from-purple-200 to-blue-200">
                {/* Placeholder for image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-purple-500 font-bold">Image</p>
                </div>
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Play className="w-12 h-12 text-white fill-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-zinc-700">{meditation.title}</h3>
                <p className="text-sm text-zinc-500">{meditation.duration}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </motion.div>
    </div>
  )
}
