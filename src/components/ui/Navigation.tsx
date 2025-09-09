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
      style={{
        fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <motion.div 
          className="relative flex justify-between items-center overflow-hidden rounded-3xl px-8 py-5"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
          whileHover={{ y: -1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Multi-layered sophisticated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/5 via-teal-50/3 to-emerald-50/5"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
          
          {/* Floating animated gradient orbs */}
          <motion.div 
            className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-2xl"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
              opacity: 0.15
            }}
            animate={{
              y: [0, -10, 0],
              x: [0, 5, 0],
              scale: [1, 1.1, 1],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-2xl"
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #134e4a 100%)',
              opacity: 0.12
            }}
            animate={{
              y: [0, 8, 0],
              x: [0, -4, 0],
              scale: [1, 0.95, 1],
              opacity: [0.12, 0.22, 0.12]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />

          {/* Enhanced Brand Logo */}
          <Link href="/" className="relative z-10">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
                whileHover={{ 
                  rotate: 5, 
                  scale: 1.05,
                  boxShadow: '0 12px 40px -8px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)'
                }}
                transition={{ duration: 0.3 }}
              >
                <span className="material-symbols-outlined text-white text-lg">psychology</span>
              </motion.div>
              <motion.span 
                className="text-xl font-light text-slate-900 tracking-tight"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.02em',
                  fontWeight: '200'
                }}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                Mind<span 
                  className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent font-normal"
                  style={{
                    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.02em',
                    fontWeight: '400'
                  }}
                >Well</span>
              </motion.span>
            </motion.div>
          </Link>

          {user && (
            <div className="relative z-10 flex items-center gap-2">
              <Link href="/dashboard">
                <motion.div
                  className={`relative px-5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-500 overflow-hidden ${
                    currentPage === 'dashboard'
                      ? 'text-white shadow-lg'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                  style={{
                    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.005em',
                    fontWeight: '500'
                  }}
                  whileHover={{ y: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentPage === 'dashboard' && (
                    <>
                      <div 
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                          boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    </>
                  )}
                  {currentPage !== 'dashboard' && (
                    <div 
                      className="absolute inset-0 rounded-2xl transition-all duration-300"
                      style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(16, 185, 129, 0.1)'
                      }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">dashboard</span>
                    Dashboard
                  </span>
                </motion.div>
              </Link>
              
              <Link href="/assessments">
                <motion.div
                  className={`relative px-5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-500 overflow-hidden ${
                    currentPage === 'assessments'
                      ? 'text-white shadow-lg'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                  style={{
                    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.005em',
                    fontWeight: '500'
                  }}
                  whileHover={{ y: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentPage === 'assessments' && (
                    <>
                      <div 
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                          boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    </>
                  )}
                  {currentPage !== 'assessments' && (
                    <div 
                      className="absolute inset-0 rounded-2xl transition-all duration-300"
                      style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(16, 185, 129, 0.1)'
                      }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">assignment</span>
                    Assessments
                  </span>
                </motion.div>
              </Link>
              <div className="relative group">
                <motion.button
                  className={`relative px-5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-500 overflow-hidden ${
                    currentPage === 'therapy'
                      ? 'text-white shadow-lg'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                  style={{
                    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.005em',
                    fontWeight: '500'
                  }}
                  whileHover={{ y: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => router.push('/session')}
                >
                  {currentPage === 'therapy' && (
                    <>
                      <div 
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                          boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    </>
                  )}
                  {currentPage !== 'therapy' && (
                    <div 
                      className="absolute inset-0 rounded-2xl transition-all duration-300"
                      style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(16, 185, 129, 0.1)'
                      }}
                    />
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
                    <div 
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(16, 185, 129, 0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 via-teal-50/5 to-emerald-50/10 rounded-2xl"></div>
                    
                    {/* Floating animated gradient orb */}
                    <motion.div 
                      className="absolute -top-5 -right-5 w-16 h-16 rounded-full blur-xl"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                        opacity: 0.2
                      }}
                      animate={{
                        y: [0, -5, 0],
                        x: [0, 3, 0],
                        scale: [1, 1.05, 1],
                        opacity: [0.2, 0.3, 0.2]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />

                    <div className="relative p-2">
                      <Link href="/session">
                        <motion.div 
                          className="group/item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500"
                          style={{
                            background: 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(16, 185, 129, 0.1)'
                          }}
                          whileHover={{ 
                            x: 2,
                            background: 'rgba(16, 185, 129, 0.05)',
                            boxShadow: '0 4px 12px -4px rgba(16, 185, 129, 0.15)'
                          }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300"
                            style={{
                              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                              boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.1)'
                            }}
                            whileHover={{ 
                              scale: 1.05,
                              boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            <span className="material-symbols-outlined text-emerald-600 text-base">psychology</span>
                          </motion.div>
                          <div>
                            <h4 
                              className="text-sm font-medium text-slate-900 group-hover/item:text-emerald-700 transition-colors duration-300"
                              style={{
                                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                letterSpacing: '-0.005em',
                                fontWeight: '500'
                              }}
                            >
                              Therapy Session
                            </h4>
                            <p 
                              className="text-xs text-slate-500 font-light"
                              style={{
                                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                letterSpacing: '-0.005em',
                                fontWeight: '300'
                              }}
                            >
                              Start your healing journey
                            </p>
                          </div>
                        </motion.div>
                      </Link>
                      
                      <Link href="/meditation">
                        <motion.div 
                          className="group/item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500"
                          style={{
                            background: 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(16, 185, 129, 0.1)'
                          }}
                          whileHover={{ 
                            x: 2,
                            background: 'rgba(16, 185, 129, 0.05)',
                            boxShadow: '0 4px 12px -4px rgba(16, 185, 129, 0.15)'
                          }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300"
                            style={{
                              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                              boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.1)'
                            }}
                            whileHover={{ 
                              scale: 1.05,
                              boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            <span className="material-symbols-outlined text-emerald-600 text-base">self_improvement</span>
                          </motion.div>
                          <div>
                            <h4 
                              className="text-sm font-medium text-slate-900 group-hover/item:text-emerald-700 transition-colors duration-300"
                              style={{
                                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                letterSpacing: '-0.005em',
                                fontWeight: '500'
                              }}
                            >
                              Meditation
                            </h4>
                            <p 
                              className="text-xs text-slate-500 font-light"
                              style={{
                                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                letterSpacing: '-0.005em',
                                fontWeight: '300'
                              }}
                            >
                              Find inner peace
                            </p>
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
                className="group relative px-5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-500 overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.1)'
                }}
                whileHover={{ 
                  y: -1, 
                  scale: 1.02,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <span 
                  className="relative flex items-center gap-2 transition-colors duration-300 group-hover:text-white"
                  style={{
                    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.005em',
                    fontWeight: '500'
                  }}
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Sign Out
                </span>
              </motion.button>
            </div>
          )}

          {!user && (
            <motion.button
              onClick={() => router.push('/login')}
              className="group relative px-8 py-3 text-white rounded-2xl font-medium text-sm transition-all duration-500 overflow-hidden shadow-lg hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              }}
              whileHover={{ 
                y: -2, 
                scale: 1.02,
                boxShadow: '0 12px 40px -8px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)'
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span 
                className="relative flex items-center gap-2"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.005em',
                  fontWeight: '500'
                }}
              >
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
