/**
 * Glassmorphic Showcase Component
 * Demonstrates various glassmorphic effects and components
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { glassmorphicPalette, glassStyles, glassAnimations } from '@/styles/glassmorphic-design-system'

interface ShowcaseItem {
  title: string
  description: string
  component: React.ReactNode
  category: 'panel' | 'button' | 'input' | 'effect' | 'animation'
}

export function GlassmorphicShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const showcaseItems: ShowcaseItem[] = [
    {
      title: 'Floating Glass Panel',
      description: 'Semi-transparent panel with backdrop blur and subtle shadows',
      category: 'panel',
      component: (
        <motion.div
          className="p-6 rounded-2xl max-w-sm"
          style={{
            background: glassmorphicPalette.glass.primary,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.3) inset'
          }}
          whileHover={glassAnimations.hoverLift}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-light text-gray-800 mb-2">Glass Panel</h3>
          <p className="text-sm text-gray-600">This is a floating glass panel with backdrop blur effects.</p>
        </motion.div>
      )
    },
    {
      title: 'Therapeutic Button',
      description: 'Calming button with glassmorphic styling',
      category: 'button',
      component: (
        <motion.button
          className="px-6 py-3 rounded-xl font-medium text-white"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3))',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15), 0 1px 0 rgba(255, 255, 255, 0.2) inset'
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.2), 0 2px 0 rgba(255, 255, 255, 0.25) inset'
          }}
          whileTap={{ scale: 0.95 }}
        >
          Therapeutic Action
        </motion.button>
      )
    },
    {
      title: 'Glass Input Field',
      description: 'Transparent input with glassmorphic styling',
      category: 'input',
      component: (
        <motion.div
          className="p-4 rounded-xl"
          style={{
            background: glassmorphicPalette.glass.secondary,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255, 255, 255, 0.15) inset'
          }}
        >
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-500"
          />
        </motion.div>
      )
    },
    {
      title: 'Ambient Orb Effect',
      description: 'Floating orb with breathing animation',
      category: 'effect',
      component: (
        <div className="relative w-32 h-32">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
              filter: 'blur(20px)'
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className="absolute inset-4 rounded-full bg-emerald-200/20 backdrop-blur-sm border border-white/20 flex items-center justify-center"
            animate={glassAnimations.breathe}
          >
            <span className="text-2xl">✨</span>
          </motion.div>
        </div>
      )
    },
    {
      title: 'Emotional Aura',
      description: 'Dynamic background that responds to emotional state',
      category: 'effect',
      component: (
        <motion.div
          className="relative w-64 h-32 rounded-2xl overflow-hidden"
          style={{
            background: glassmorphicPalette.glass.tertiary,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Emotional aura overlay */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
              filter: 'blur(15px)'
            }}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <div className="relative z-10 p-4 text-center">
            <h4 className="text-lg font-light text-gray-800">Calm State</h4>
            <p className="text-sm text-gray-600">Peaceful emotional background</p>
          </div>
        </motion.div>
      )
    },
    {
      title: 'Message Bubble',
      description: 'Glassmorphic message with emotional coloring',
      category: 'animation',
      component: (
        <motion.div
          className="flex justify-end mb-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="max-w-xs px-4 py-3 rounded-2xl ml-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1), 0 1px 0 rgba(255, 255, 255, 0.15) inset'
            }}
            whileHover={{
              scale: 1.02,
              rotateX: 2,
              rotateY: -2
            }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-white">This is a calming message with glassmorphic styling.</p>
            <div className="text-xs text-emerald-100 mt-1">2:30 PM</div>
          </motion.div>
        </motion.div>
      )
    }
  ]

  const categories = ['all', 'panel', 'button', 'input', 'effect', 'animation']
  const filteredItems = selectedCategory === 'all'
    ? showcaseItems
    : showcaseItems.filter(item => item.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/60 to-emerald-50/40 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-light text-gray-800 mb-4">
            🌟 Glassmorphic Showcase
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore the complete glassmorphic design system optimized for therapeutic UX
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex space-x-2 p-2 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-300/30'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Showcase Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          layout
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.title}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1
                }}
                className="group cursor-pointer"
                onClick={() => setSelectedItem(selectedItem === item.title ? null : item.title)}
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                  {/* Component Preview */}
                  <div className="flex justify-center items-center h-48 mb-6">
                    {item.component}
                  </div>

                  {/* Item Info */}
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {item.description}
                    </p>
                    <span className="inline-block px-3 py-1 bg-gray-100/50 text-gray-700 text-xs rounded-full">
                      {item.category}
                    </span>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {selectedItem === item.title && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-white/20"
                      >
                        <div className="text-sm text-gray-600 space-y-2">
                          <div>
                            <strong>Category:</strong> {item.category}
                          </div>
                          <div>
                            <strong>Use Case:</strong> Therapeutic user interfaces
                          </div>
                          <div>
                            <strong>Accessibility:</strong> Full WCAG compliance
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Technical Details */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="inline-block p-6 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20">
            <h3 className="text-xl font-light text-gray-800 mb-4">Technical Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-800">Backdrop Blur</div>
                <div className="text-gray-600">8px - 24px</div>
              </div>
              <div>
                <div className="font-medium text-gray-800">Transparency</div>
                <div className="text-gray-600">10% - 25%</div>
              </div>
              <div>
                <div className="font-medium text-gray-800">Animation Duration</div>
                <div className="text-gray-600">0.3s - 4s</div>
              </div>
              <div>
                <div className="font-medium text-gray-800">Performance</div>
                <div className="text-gray-600">60fps target</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default GlassmorphicShowcase
