'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/stores/authStore'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
// Material Symbols icons import
import 'material-symbols/outlined.css'

interface NavigationItem {
  name: string
  href: string
  icon: string
  exact?: boolean
  isCrisis?: boolean
}

interface NavigationProps {
  className?: string
  currentPage?: string
  onPageChange?: (page: string) => void
}

export function Navigation({ className = '', currentPage, onPageChange }: NavigationProps) {
  let user = null
  try {
    const auth = useAuth()
    user = auth.user
  } catch (error) {
    // AuthProvider not available, user stays null
  }
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Navigation items for authenticated users
  const authenticatedNavigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'dashboard',
      exact: true
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
    // Support option removed from header navigation per request
    {
      name: 'Profile',
      href: '/profile',
      icon: 'person'
    }
  ]

  // Navigation items for non-authenticated users (landing page)
  const landingNavigationItems: NavigationItem[] = [
    { name: 'Home', href: '/', icon: 'home', exact: true },
    { name: 'Features', href: '#features', icon: 'star' },
    { name: 'About', href: '#about', icon: 'info' },
    { name: 'Contact', href: '#contact', icon: 'mail' }
  ]

  // Use appropriate navigation items based on authentication status
  const navigationItems = user ? authenticatedNavigationItems : landingNavigationItems

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${className}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <motion.div
          className={`flex justify-between items-center glassmorphic rounded-3xl px-6 py-4 transition-all duration-500 ${
            scrolled ? 'shadow-2xl' : 'shadow-lg'
          }`}
          animate={{
            scale: scrolled ? 0.98 : 1,
            y: scrolled ? -2 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Enhanced Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="relative">
                <motion.div
                  className="p-2 rounded-xl glassmorphic-light"
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <span className="material-symbols-outlined text-2xl transition-all duration-300" style={{ color: '#335f64' }}>
                    psychology
                  </span>
                </motion.div>
                <motion.div
                  className="absolute -inset-1 rounded-xl blur opacity-0 group-hover:opacity-100"
                  style={{
                    background: 'linear-gradient(to right, rgba(51, 95, 100, 0.2), rgba(51, 95, 100, 0.1))'
                  }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <div className="flex flex-col relative z-10">
                <span className="text-lg font-bold drop-shadow-md" style={{ color: '#335f64' }}>
                  MindWell
                </span>
                <span className="text-xs font-medium -mt-1 drop-shadow-md" style={{ color: '#2a4f52' }}>
                  Mental Wellness
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation Items - Only show for authenticated users */}
          {user && (
            <div className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item, index) => {
                const isActive = isClient && (
                  item.exact
                    ? pathname === item.href
                    : pathname?.startsWith(item.href)
                )
                const isCrisis = item.isCrisis
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <motion.div
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Link href={item.href}>
                        <motion.div
                          className={`glassmorphic-nav-item flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-300 relative ${
                            isCrisis
                              ? isActive
                                ? 'text-red-600 bg-red-50/30 border border-red-200/50'
                                : 'text-red-600 hover:text-red-700 hover:bg-red-50/20 border border-red-200/30 hover:border-red-300/50'
                              : isActive
                              ? 'text-slate-700 bg-white/20'
                              : 'text-secondary-600 hover:text-slate-600 hover:bg-white/10'
                          }`}
                        >
                        <span className="material-symbols-outlined text-lg">
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                        {isActive && !isCrisis && (
                          <motion.div
                            className="absolute -bottom-1 left-1/2 w-6 h-1 rounded-full"
                            style={{
                              background: 'linear-gradient(to right, #335f64, #2a4f52)',
                              x: '-50%'
                            }}
                            layoutId="activeIndicator"
                            initial={false}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        {isActive && isCrisis && (
                          <motion.div
                            className="absolute -bottom-1 left-1/2 w-6 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                            layoutId="crisisIndicator"
                            initial={false}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            style={{ x: '-50%' }}
                          />
                        )}
                        </motion.div>
                      </Link>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!user && (
              // Landing page - only show Find Peace button for non-authenticated users
              <motion.button
                onClick={() => router.push('/login')}
                className="flex items-center gap-3 rounded-2xl px-8 py-3 text-sm font-bold text-white shadow-2xl transition-all duration-500 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #335f64 0%, #2a4f54 50%, #1e3a3e 100%)',
                  boxShadow: '0 10px 40px rgba(51, 95, 100, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
                whileHover={{
                  scale: 1.05,
                  y: -3,
                  boxShadow: '0 15px 50px rgba(51, 95, 100, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)'
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.span
                  className="material-symbols-outlined text-xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  spa
                </motion.span>
                Find Peace
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 rounded-2xl glassmorphic-light relative"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.span
                className="material-symbols-outlined text-2xl text-secondary-700"
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? 'close' : 'menu'}
              </motion.span>
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mt-4 glassmorphic-mobile-menu rounded-3xl overflow-hidden"
            >
              <nav className="p-6 space-y-3">
                {user ? (
                  // Show navigation items for authenticated users
                  navigationItems.map((item, index) => {
                    const isActive = isClient && (
                      item.exact
                        ? pathname === item.href
                        : pathname?.startsWith(item.href)
                    )
                    const isCrisis = item.isCrisis
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        <motion.div
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Link href={item.href} onClick={() => setIsMenuOpen(false)}>
                            <motion.div
                              className={`glassmorphic-nav-item w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                                isCrisis
                                  ? isActive
                                    ? 'text-red-600 bg-red-50/30 border border-red-200/50'
                                    : 'text-red-600 hover:text-red-700 hover:bg-red-50/20 border border-red-200/30'
                                  : isActive
                                  ? 'text-slate-700 bg-white/30'
                                  : 'text-secondary-600 hover:text-slate-600 hover:bg-white/20'
                              }`}
                            >
                              <span className="material-symbols-outlined text-xl">
                                {item.icon}
                              </span>
                              {item.name}
                            </motion.div>
                          </Link>
                        </motion.div>
                      </motion.div>
                    )
                  })
                ) : (
                  // Show only Find Peace button for non-authenticated users
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.button
                      onClick={() => {
                        router.push('/login')
                        setIsMenuOpen(false)
                      }}
                      className="w-full px-6 py-4 rounded-2xl text-sm font-bold text-white shadow-2xl flex items-center justify-center gap-3 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #335f64 0%, #2a4f54 50%, #1e3a3e 100%)',
                        boxShadow: '0 10px 40px rgba(51, 95, 100, 0.4)'
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="material-symbols-outlined text-xl">spa</span>
                      Find Peace
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                    </motion.button>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
