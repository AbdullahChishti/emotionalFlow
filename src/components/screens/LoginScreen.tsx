'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { track } from '@/lib/analytics'

// Material Symbols icons import
import 'material-symbols/outlined.css'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Analytics + redirect when authenticated
  useEffect(() => {
    track('signin_view')
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      track('signin_submit', { method: 'password' })
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        track('signin_error', { message: error.message })
      } else {
        track('signin_success', { method: 'password' })
        // Navigation will be handled by useEffect when user state updates
        // The AuthProvider will update the user state, triggering the redirect
      }
    } catch (err) {
      setError('An unexpected error occurred')
      track('signin_error', { message: 'unexpected' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      track('sso_click', { provider: 'google' })
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen isolate overflow-hidden flex">
      <div className="absolute inset-0 hero-radial" />
      <div aria-hidden className="pointer-events-none absolute -top-10 -left-10 h-48 w-48 rounded-full bg-accent-300/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-1/3 -right-8 h-36 w-36 rounded-full bg-slate-100/60 blur-2xl" />
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Glassmorphic Background Elements */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-white z-0" />
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-center opacity-[0.03] z-0" style={{ backgroundSize: '300px' }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-300/15 rounded-full blur-3xl"></div>

        {/* SVG Illustration */}
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            <img
              src="/assets/Peace_of_mind-bro_2.svg"
              alt="Peace of mind illustration"
              className="w-full h-auto drop-shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Inspirational Text Overlay */}
        <div className="absolute bottom-12 left-12 right-12 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glassmorphic rounded-2xl p-6 text-center"
          >
            <div className="space-y-3 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                  <span className="text-lg font-light text-slate-600 tracking-wide">
                    Find <span className="text-emerald-600 font-medium">calm</span> in the chaos.
                  </span>
                  <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex items-center justify-center gap-1 text-xs text-slate-400"
              >
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                  Safe
                </span>
                <span className="mx-1">•</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
                  Compassionate
                </span>
                <span className="mx-1">•</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                  Supportive
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 lg:px-12">
        {/* Back to Home Button */}
        <Link 
          href="/" 
          className="absolute top-6 left-6 z-10 group"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white/90 backdrop-blur-sm rounded-full border border-white/20 shadow-lg transition-all duration-300 text-zinc-700 hover:text-zinc-900"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="text-sm font-medium">Back to Home</span>
          </motion.button>
        </Link>

        {/* Mobile Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-300/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <Link href="/" className="inline-block">
                <motion.div
                  className="flex items-center justify-center gap-3 mb-7"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <span
                    className="material-symbols-outlined text-5xl"
                    style={{ 
                      color: '#1f3d42',
                      fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24'
                    }}
                  >
                    psychology_alt
                  </span>
                  <h1
                    className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      letterSpacing: '-0.025em',
                      lineHeight: '1.2'
                    }}
                  >
                    MindWell
                  </h1>
                </motion.div>
              </Link>
              {/* Welcome text removed as per request */}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-1.5"
              >
                <label 
                  htmlFor="email" 
                  className="block text-[13px] font-medium text-gray-700 tracking-wide"
                >
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3.5 text-[15px] bg-white border border-gray-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600/60 focus:border-slate-600 transition-all duration-200 font-normal"
                    placeholder="your@email.com"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      color: '#1f2937',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-xl">
                      mail
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-1.5"
              >
                <label 
                  htmlFor="password" 
                  className="block text-[13px] font-medium text-gray-700 tracking-wide"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3.5 text-[15px] bg-white border border-gray-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600/60 focus:border-slate-600 transition-all duration-200 font-normal"
                    placeholder="••••••••"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      color: '#1f2937',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-xl">
                      lock
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-center justify-between text-sm"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="flex items-center group cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-700"></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600 font-medium group-hover:text-gray-700 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-slate-700 hover:text-slate-800 transition-colors font-medium text-sm"
                  style={{ 
                    color: '#1f3d42',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    textUnderlineOffset: '2px',
                    textDecoration: 'none',
                    borderBottom: '1px solid transparent',
                    transition: 'all 0.2s ease',
                    lineHeight: '1.5'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderBottomColor = '#1f3d42';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}
                >
                  Forgot password?
                </Link>
              </motion.div>

              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  style={{
                    backgroundColor: '#335f64',
                    '--tw-ring-color': '#335f64',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    letterSpacing: '0.01em'
                  }}
                  whileHover={{
                    scale: loading ? 1 : 1.01,
                    backgroundColor: '#2a4f52'
                  }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-xl">
                          login
                        </span>
                        <span>Sign in</span>
                      </>
                    )}
                  </span>
                </motion.button>

                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 font-medium text-xs tracking-wide">
                      OR CONTINUE WITH
                    </span>
                  </div>
                </motion.div>

                <motion.button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white hover:bg-slate-50 border border-gray-200 text-slate-700 font-semibold py-3.5 rounded-xl transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    letterSpacing: '0.01em'
                  }}
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                >
                  <span className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </span>
                </motion.button>
              </motion.div>
            </form>

            {/* Trust */}
            <div className="mt-5 space-y-2 text-[13px] leading-[22px] text-ink-600/90" aria-label="Trust and privacy">
              <ul className="list-none p-0 m-0 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span aria-hidden className="mt-0.5 inline-flex h-4 w-4 rounded-full bg-slate-500/10 text-slate-600 items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-slate-600">
                      <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <path d="M9.5 12.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v1.5h-5v-1.5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </span>
                  <span className="font-normal">Private & secure — your data stays with you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden className="mt-0.5 inline-flex h-4 w-4 rounded-full bg-slate-500/10 text-slate-600 items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-slate-600">
                      <path d="M4 17l6-6 4 4 6-6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </span>
                  <span className="font-normal">Evidence-based tools created with clinicians</span>
                </li>
              </ul>
            </div>

            {/* Footer */}
            <motion.div 
              className="text-center pt-6 border-t border-gray-100 mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <p className="text-gray-600 text-sm font-normal">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  className="text-slate-700 hover:text-slate-800 font-medium transition-colors relative group"
                  style={{ 
                    color: '#1f3d42',
                    textUnderlineOffset: '2px',
                    textDecoration: 'none',
                    borderBottom: '1px solid transparent',
                    transition: 'all 0.2s ease',
                    paddingBottom: '1px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderBottomColor = '#1f3d42';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
