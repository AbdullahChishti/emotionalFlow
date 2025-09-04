'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useRouter } from 'next/navigation'

// Material Symbols icons import
import 'material-symbols/outlined.css'

export function SignupScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !displayName) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError('')

    try {
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
    <div className="min-h-screen bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100 flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Glassmorphic Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-green-100/50 to-brand-green-200/30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-green-300/15 rounded-full blur-3xl"></div>

        {/* SVG Illustration */}
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            <img
              src="/assets/Mental_health-bro_2.svg"
              alt="Mental health and wellness illustration"
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
            <h3 className="text-xl font-semibold text-brand-green-800 mb-2">
              Begin Your Healing Journey
            </h3>
            <p className="text-brand-green-700/80 text-sm leading-relaxed">
              Join a supportive community dedicated to mental wellness and personal growth.
              Your transformation starts here.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-green-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-green-300/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block">
                <motion.div
                  className="flex items-center justify-center gap-3 mb-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <span
                    className="material-symbols-outlined text-4xl"
                    style={{ color: '#1f3d42' }}
                  >
                    psychology
                  </span>
                  <h1
                    className="text-3xl font-bold"
                    style={{ color: '#1f3d42' }}
                  >
                    MindWell
                  </h1>
                </motion.div>
              </Link>
              <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Join your wellness community</h2>
              <p className="text-zinc-700 font-medium">Start your journey to better mental health</p>
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

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-semibold text-zinc-800 mb-2">
                  Full name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-4 bg-white/90 border border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-green-600 focus:border-brand-green-600 transition-all duration-300 font-medium"
                  placeholder="Enter your full name"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#111827'
                  }}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-zinc-800 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-4 bg-white/90 border border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-green-600 focus:border-brand-green-600 transition-all duration-300 font-medium"
                  placeholder="Enter your email"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#111827'
                  }}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-zinc-800 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-4 bg-white/90 border border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-green-600 focus:border-brand-green-600 transition-all duration-300 font-medium"
                  placeholder="Create a password (min. 6 characters)"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#111827'
                  }}
                />
              </div>

              <div className="text-xs text-zinc-600 bg-zinc-50/50 rounded-lg p-3">
                <p className="mb-1 font-medium">By creating an account, you agree to our:</p>
                <div className="flex flex-wrap gap-1">
                  <Link
                    href="/terms"
                    className="text-brand-green-700 hover:text-brand-green-800 transition-colors font-semibold"
                    style={{ color: '#1f3d42' }}
                  >
                    Terms of Service
                  </Link>
                  <span className="font-medium">and</span>
                  <Link
                    href="/privacy"
                    className="text-brand-green-700 hover:text-brand-green-800 transition-colors font-semibold"
                    style={{ color: '#1f3d42' }}
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-green-700 hover:bg-brand-green-800 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-0"
                  style={{
                    backgroundColor: loading ? '#1f3d42' : '#1f3d42',
                    color: '#ffffff',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span style={{ color: '#ffffff' }}>Creating account...</span>
                    </>
                  ) : (
                    <span style={{ color: '#ffffff' }}>Create account</span>
                  )}
                </motion.button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-300/50"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 text-zinc-500 font-medium">or continue with</span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 border border-zinc-300 text-zinc-700 font-semibold py-4 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    textShadow: 'none'
                  }}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span style={{ color: '#374151' }}>Continue with Google</span>
                </motion.button>
              </div>
            </form>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-zinc-200/50 mt-8">
              <p className="text-zinc-700 text-sm font-medium">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-brand-green-700 hover:text-brand-green-800 font-semibold transition-colors"
                  style={{ color: '#1f3d42' }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
