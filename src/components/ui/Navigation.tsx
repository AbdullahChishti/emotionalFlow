'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { handleSignOutError } from '@/lib/utils/authRedirects'

interface NavigationProps {
  className?: string
  currentPage?: string
  onPageChange?: (page: string) => void
  user?: any
  onSignOut?: () => void
}

export function Navigation({ className = '', user, onSignOut, currentPage }: NavigationProps) {
  const { signOut: authSignOut } = useAuthContext()
  const router = useRouter()

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-40 ${className || ''}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <motion.div 
          className="relative flex justify-between items-center overflow-hidden rounded-3xl px-8 py-5"
          whileHover={{ y: -1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Multi-layered sophisticated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/90 to-white/95"></div>
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
          
          {/* Subtle animated gradient orbs */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-emerald-100/20 via-green-50/10 to-teal-100/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-br from-teal-100/20 via-emerald-50/10 to-green-100/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

          {/* Enhanced Brand Logo */}
          <Link href="/" className="relative z-10">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <span className="material-symbols-outlined text-white text-lg">psychology</span>
              </motion.div>
              <motion.span 
                className="text-xl font-light text-slate-900 tracking-tight"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                Mind<span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent font-normal">Well</span>
              </motion.span>
            </motion.div>
          </Link>

          {user && (
            <div className="relative z-10 flex items-center gap-2">
              <Link href="/dashboard">
                <motion.div
                  className={`relative px-5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-300 overflow-hidden ${
                    currentPage === 'dashboard'
                      ? 'text-white shadow-lg'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                  whileHover={{ y: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentPage === 'dashboard' && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  )}
                  {currentPage !== 'dashboard' && (
                    <div className="absolute inset-0 bg-slate-50/0 hover:bg-slate-50/60 rounded-2xl transition-colors duration-300"></div>
                  )}
                  <span className="relative flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">dashboard</span>
                    Dashboard
                  </span>
                </motion.div>
              </Link>
              
              <Link href="/assessments">
                <motion.div
                  className={`relative px-5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-300 overflow-hidden ${
                    currentPage === 'assessments'
                      ? 'text-white shadow-lg'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                  whileHover={{ y: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentPage === 'assessments' && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  )}
                  {currentPage !== 'assessments' && (
                    <div className="absolute inset-0 bg-slate-50/0 hover:bg-slate-50/60 rounded-2xl transition-colors duration-300"></div>
                  )}
                  <span className="relative flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">assignment</span>
                    Assessments
                  </span>
                </motion.div>
              </Link>
              <div className="relative group">
                <motion.button
                  className={`relative px-5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-300 overflow-hidden ${
                    currentPage === 'therapy'
                      ? 'text-white shadow-lg'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                  whileHover={{ y: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => router.push('/session')}
                >
                  {currentPage === 'therapy' && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  )}
                  {currentPage !== 'therapy' && (
                    <div className="absolute inset-0 bg-slate-50/0 hover:bg-slate-50/60 rounded-2xl transition-colors duration-300"></div>
                  )}
                  <span className="relative flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">psychology</span>
                    Therapy
                    <motion.span 
                      className="material-symbols-outlined text-sm"
                      animate={{ rotate: 0 }}
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      expand_more
                    </motion.span>
                  </span>
                </motion.button>
                
                {/* Ultra-sophisticated dropdown menu */}
                <motion.div 
                  className="absolute top-full left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50"
                  initial={{ opacity: 0, y: -10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div className="relative">
                    {/* Multi-layered background with depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/90 to-white/95 rounded-2xl"></div>
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-2xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
                    
                    {/* Subtle animated gradient orb */}
                    <div className="absolute -top-5 -right-5 w-16 h-16 bg-gradient-to-br from-emerald-100/30 via-green-50/20 to-teal-100/30 rounded-full blur-xl animate-pulse"></div>

                    <div className="relative p-2">
                      <Link href="/session">
                        <motion.div 
                          className="group/item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-slate-50/60"
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            className="w-8 h-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center group-hover/item:shadow-md transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                          >
                            <span className="material-symbols-outlined text-emerald-600 text-base">psychology</span>
                          </motion.div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-900 group-hover/item:text-emerald-700 transition-colors duration-300">
                              Therapy Session
                            </h4>
                            <p className="text-xs text-slate-500 font-light">Start your healing journey</p>
                          </div>
                        </motion.div>
                      </Link>
                      
                      <Link href="/meditation">
                        <motion.div 
                          className="group/item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-slate-50/60"
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            className="w-8 h-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center group-hover/item:shadow-md transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                          >
                            <span className="material-symbols-outlined text-emerald-600 text-base">self_improvement</span>
                          </motion.div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-900 group-hover/item:text-emerald-700 transition-colors duration-300">
                              Meditation
                            </h4>
                            <p className="text-xs text-slate-500 font-light">Find inner peace</p>
                          </div>
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
              <motion.button
                onClick={async () => {
                  const navSessionId = Math.random().toString(36).substr(2, 9)
                  console.log('🚪 [NAV_SIGN_OUT_CLICK] Navigation: Sign out button clicked', {
                    hasOnSignOut: !!onSignOut,
                    timestamp: new Date().toISOString(),
                    navSessionId
                  })

                  try {
                    if (onSignOut) {
                      console.log('🔄 [NAV_SIGN_OUT_CALL] Navigation: Calling onSignOut handler', {
                        navSessionId
                      })
                      await onSignOut()
                    } else {
                      console.log('🔄 [NAV_SIGN_OUT_AUTH_MANAGER] Navigation: Using AuthManager sign out', {
                        navSessionId
                      })
                      await authSignOut()
                    }
                  } catch (error) {
                    console.error('❌ [NAV_SIGN_OUT_ERROR] Navigation: Sign out failed', {
                      error,
                      navSessionId
                    })
                    // Fallback to redirect if sign out fails
                    handleSignOutError(error instanceof Error ? error.message : 'Unknown error')
                  }
                }}
                className="group relative px-5 py-2.5 bg-transparent border border-emerald-600/60 rounded-2xl font-medium text-sm transition-all duration-300 overflow-hidden hover:border-emerald-600"
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2 text-emerald-600 group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-base">logout</span>
                  Sign Out
                </span>
              </motion.button>
            </div>
          )}

          {!user && (
            <motion.button
              onClick={() => router.push('/login')}
              className="group relative px-8 py-3 text-white rounded-2xl font-medium text-sm transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
              }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-2">
                <span className="material-symbols-outlined text-base">psychology</span>
                Find Peace
              </span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.nav>
  )
}
