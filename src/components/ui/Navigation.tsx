'use client'

import React from 'react'
import { useAuth } from '@/components/providers/TestAuthProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
// Material Symbols icons import
import 'material-symbols/outlined.css'

interface NavigationProps {
  className?: string
}

export function Navigation({ className = '' }: NavigationProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) {
    return null
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: 'dashboard'
    },
    {
      name: 'Assessments',
      href: '/assessments',
      icon: 'psychology'
    },

    {
      name: 'Therapy',
      href: '/session',
      icon: 'chat'
    },
    {
      name: 'Support',
      href: '/crisis-support',
      isCrisis: true,
      icon: 'emergency'
    },

    {
      name: 'Profile',
      href: '/profile',
      icon: 'person'
    }
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 glassmorphic ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <span className="material-symbols-outlined text-2xl text-brand-green-600">psychology</span>
              <span className="text-lg font-bold bg-gradient-to-r from-brand-green-600 to-brand-green-700 bg-clip-text text-transparent">
                MindWell
              </span>
            </motion.div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-6">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const isCrisis = item.isCrisis
              return (
                <Link key={item.href} href={item.href}>
                  <motion.button
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                      isCrisis
                        ? isActive
                          ? 'text-red-600 bg-red-50 shadow-sm border border-red-200'
                          : 'text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300'
                        : isActive
                        ? 'text-brand-green-600 bg-brand-green-50 shadow-sm'
                        : 'text-secondary-600 hover:text-brand-green-600 hover:bg-white/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="material-symbols-outlined text-base">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </motion.button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
