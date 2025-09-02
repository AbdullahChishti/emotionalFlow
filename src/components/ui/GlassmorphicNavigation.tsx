/**
 * Glassmorphic Navigation Component
 * Ethereal navigation with therapeutic UX considerations
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { glassmorphicPalette, glassStyles, glassAnimations } from '@/styles/glassmorphic-design-system'

interface NavigationItem {
  id: string
  label: string
  icon: string
  isActive?: boolean
  badge?: number | string
}

interface GlassmorphicNavigationProps {
  items: NavigationItem[]
  onNavigate: (itemId: string) => void
  position?: 'bottom' | 'top' | 'side'
  variant?: 'floating' | 'inline' | 'minimal'
}

export function GlassmorphicNavigation({
  items,
  onNavigate,
  position = 'bottom',
  variant = 'floating'
}: GlassmorphicNavigationProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'fixed bottom-6 left-1/2 transform -translate-x-1/2'
      case 'top':
        return 'fixed top-6 left-1/2 transform -translate-x-1/2'
      case 'side':
        return 'fixed right-6 top-1/2 transform -translate-y-1/2 flex-col'
      default:
        return 'fixed bottom-6 left-1/2 transform -translate-x-1/2'
    }
  }

  const getContainerClasses = () => {
    const baseClasses = 'flex items-center backdrop-blur-xl border rounded-2xl p-2'
    const positionClasses = position === 'side' ? 'flex-col space-y-2' : 'space-x-2'

    switch (variant) {
      case 'floating':
        return `${baseClasses} ${positionClasses} ${
          position === 'side' ? 'py-6 px-3' : 'px-4 py-3'
        }`
      case 'inline':
        return `${baseClasses} ${positionClasses} bg-white/10 border-white/20`
      case 'minimal':
        return `${baseClasses} ${positionClasses} bg-transparent border-transparent p-1`
      default:
        return `${baseClasses} ${positionClasses}`
    }
  }

  const getItemClasses = (item: NavigationItem) => {
    const baseClasses = 'relative p-3 rounded-xl transition-all duration-300 cursor-pointer'
    const hoverClasses = 'hover:scale-105 hover:backdrop-blur-xl'
    const activeClasses = item.isActive
      ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-300/30'
      : 'hover:bg-white/10 text-gray-600 hover:text-gray-800'

    return `${baseClasses} ${hoverClasses} ${activeClasses}`
  }

  return (
    <motion.nav
      className={`${getPositionClasses()} z-50`}
      style={{
        background: variant === 'floating' ? glassmorphicPalette.glass.primary : 'transparent',
        borderColor: variant === 'floating' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
        boxShadow: variant === 'floating'
          ? '0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 0 rgba(255, 255, 255, 0.2) inset'
          : 'none'
      }}
      initial={glassAnimations.fadeInGlass.initial}
      animate={glassAnimations.fadeInGlass.animate}
      transition={glassAnimations.fadeInGlass.transition}
    >
      <div className={getContainerClasses()}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            className={getItemClasses(item)}
            onClick={() => onNavigate(item.id)}
            onHoverStart={() => setHoveredItem(item.id)}
            onHoverEnd={() => setHoveredItem(null)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.1,
              type: 'spring',
              stiffness: 300,
              damping: 20
            }}
            whileHover={{
              scale: 1.1,
              backdropFilter: 'blur(16px)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Icon */}
            <motion.span
              className="text-xl block"
              animate={hoveredItem === item.id ? { rotate: [0, -10, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              {item.icon}
            </motion.span>

            {/* Badge */}
            {item.badge && (
              <motion.span
                className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                {item.badge}
              </motion.span>
            )}

            {/* Tooltip */}
            <AnimatePresence>
              {hoveredItem === item.id && position !== 'side' && (
                <motion.div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900/90 text-white text-sm rounded-lg backdrop-blur-xl border border-white/20 whitespace-nowrap"
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900/90"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.nav>
  )
}

// Specialized navigation for therapeutic contexts
export function TherapeuticNavigation({
  currentScreen,
  onNavigate
}: {
  currentScreen: string
  onNavigate: (screen: string) => void
}) {
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      isActive: currentScreen === 'dashboard'
    },
    {
      id: 'session',
      label: 'New Session',
      icon: '💬',
      isActive: currentScreen === 'session'
    },
    {
      id: 'meditation',
      label: 'Meditation',
      icon: '🧘',
      isActive: currentScreen === 'meditation'
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: '📝',
      isActive: currentScreen === 'journal'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      isActive: currentScreen === 'profile'
    }
  ]

  return (
    <GlassmorphicNavigation
      items={navigationItems}
      onNavigate={onNavigate}
      position="bottom"
      variant="floating"
    />
  )
}

// Minimal status indicator for therapeutic sessions
export function GlassmorphicStatusIndicator({
  status,
  emotionalState,
  duration
}: {
  status: 'active' | 'paused' | 'completed'
  emotionalState: string
  duration: number
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return glassmorphicPalette.therapeutic.trust
      case 'paused':
        return glassmorphicPalette.therapeutic.warmth
      case 'completed':
        return glassmorphicPalette.therapeutic.serenity
      default:
        return glassmorphicPalette.glass.secondary
    }
  }

  const getEmotionalIcon = () => {
    switch (emotionalState) {
      case 'calm':
        return '😌'
      case 'anxious':
        return '😰'
      case 'overwhelmed':
        return '😵'
      case 'hopeful':
        return '🌟'
      case 'sad':
        return '😢'
      default:
        return '😐'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  return (
    <motion.div
      className="fixed top-6 right-6 z-40"
      style={{
        background: glassmorphicPalette.glass.primary,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 0 rgba(255, 255, 255, 0.2) inset'
      }}
      initial={glassAnimations.fadeInGlass.initial}
      animate={glassAnimations.fadeInGlass.animate}
      transition={glassAnimations.fadeInGlass.transition}
    >
      <div className="flex items-center space-x-3 px-4 py-3">
        {/* Status Indicator */}
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: getStatusColor() }}
          animate={status === 'active' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Emotional State */}
        <span className="text-lg">{getEmotionalIcon()}</span>

        {/* Duration */}
        <span className="text-sm text-gray-700 font-medium">
          {formatTime(duration)}
        </span>

        {/* Status Text */}
        <span className="text-sm text-gray-600 capitalize">
          {status}
        </span>
      </div>
    </motion.div>
  )
}

export default GlassmorphicNavigation
