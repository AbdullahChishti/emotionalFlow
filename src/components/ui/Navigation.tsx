'use client'

import React from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
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
      href: '/'
    },
    {
      name: 'Check-in',
      href: '/check-in'
    },
    {
      name: 'Therapy',
      href: '/session'
    },
    {
      name: 'Meditation',
      href: '/meditation'
    },
    {
      name: 'Progress',
      href: '/dashboard'
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
              <span className="material-symbols-outlined text-2xl text-primary-600">psychology</span>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                MindWell
              </span>
            </motion.div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-8">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <motion.button
                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                      isActive
                        ? 'text-primary-600 bg-primary-50 shadow-sm'
                        : 'text-secondary-600 hover:text-primary-600 hover:bg-white/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.name}
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
