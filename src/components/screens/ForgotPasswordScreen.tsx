'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClientComponentClient } from '@/lib/supabase'

// Material Symbols icons import
import 'material-symbols/outlined.css'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClientComponentClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
        <div className="m-auto w-full max-w-md px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20 text-center"
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
              <p className="text-slate-600">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined mr-2">arrow_back</span>
                Back to Login
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-white z-0" />
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-center opacity-[0.03] z-0" style={{ backgroundSize: '300px' }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-300/15 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            <img
              src="/assets/Peace_of_mind-bro_2.svg"
              alt="Password reset illustration"
              className="w-full h-auto drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
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
                    style={{
                      color: '#1f3d42',
                      fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24'
                    }}
                  >
                    psychology_alt
                  </span>
                  <h1
                    className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent"
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
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Reset your password</h2>
              <p className="text-slate-600 text-sm">Enter your email address and we'll send you a link to reset your password</p>
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

            {/* Form */}
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
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  style={{
                    backgroundColor: '#059669',
                    '--tw-ring-color': '#059669',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    letterSpacing: '0.01em'
                  }}
                  whileHover={{
                    scale: loading ? 1 : 1.01,
                    backgroundColor: '#047857'
                  }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-xl">
                          send
                        </span>
                        <span>Send reset link</span>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              className="text-center pt-6 border-t border-gray-100 mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-gray-600 text-sm font-normal">
                Remember your password?{' '}
                <Link
                  href="/login"
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
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

