'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/providers/AuthProvider'

// Remove unused LoadingSpinner import - now handled by AuthButton
// import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Material Symbols icons import
import 'material-symbols/outlined.css'

// Import new reusable components
import { FormField } from '@/components/ui/FormField'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { AuthButton } from '@/components/ui/AuthButton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

export default function SignupScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const router = useRouter()
  const { signUp } = useAuthContext()

  // Check network connectivity
  useEffect(() => {
    const checkOnline = () => setIsOnline(navigator.onLine)
    checkOnline()
    window.addEventListener('online', checkOnline)
    window.addEventListener('offline', checkOnline)
    return () => {
      window.removeEventListener('online', checkOnline)
      window.removeEventListener('offline', checkOnline)
    }
  }, [])

  // Handle field changes
  const handleFieldChange = (field: string, value: string) => {
    const setter = {
      displayName: setDisplayName,
      email: setEmail,
      password: setPassword
    }[field]

    if (setter) {
      setter(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation before API call
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!password.trim()) {
      setError('Password is required')
      return
    }
    if (!displayName.trim()) {
      setError('Full name is required')
      return
    }

    // Check network connectivity first
    if (!isOnline) {
      setError('You appear to be offline. Please check your internet connection and try again.')
      return
    }

    setLoading(true)
    setError('')

    console.log('🚀 [SIGNUP_DEBUG] Starting signup process', {
      email: email.trim(),
      displayName: displayName.trim(),
      hasPassword: !!password.trim(),
      isOnline
    })

    try {
      const result = await signUp(email.trim(), password, displayName.trim())

      console.log('📋 [SIGNUP_DEBUG] Signup result received', {
        success: result.success,
        hasError: !!result.error,
        errorMessage: result.error,
        hasUser: !!result.user
      })

      if (!result.success) {
        // Show specific error messages
        const errorMessage = typeof result.error === 'string' ? result.error : String(result.error || 'Unknown error')
        
        if (errorMessage.includes('already registered') || errorMessage.includes('already in use')) {
          setError('This email is already registered. Please try signing in instead.')
        } else if (errorMessage.includes('password')) {
          setError('Password does not meet requirements. Please choose a stronger password.')
        } else if (errorMessage.includes('email')) {
          setError('Please enter a valid email address.')
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          setError('Network error. Please check your internet connection and try again.')
        } else {
          setError(`Signup failed: ${errorMessage}`)
        }
      } else {
        // Show success message instead of redirecting
        console.log('✅ [SIGNUP_DEBUG] Signup successful')
        setSuccess(true)
      }
    } catch (err) {
      console.error('💥 [SIGNUP_DEBUG] Unexpected error during signup:', err)

      // Show more specific error information
      if (err instanceof Error) {
        const errorMessage = typeof err.message === 'string' ? err.message : String(err.message || 'Unknown error')
        
        if (errorMessage.includes('fetch')) {
          setError('Network error: Unable to connect to the server. Please check your internet connection.')
        } else if (errorMessage.includes('timeout')) {
          setError('Request timed out. Please try again.')
        } else {
          setError(`Error: ${errorMessage}`)
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }



  return (
    <>
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Header with Illustration */}
      <div className="lg:hidden flex items-center justify-center py-8 px-4 order-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          style={{ willChange: 'transform, opacity' }}
          className="w-32 h-32 sm:w-40 sm:h-40"
        >
          <img
            src="/assets/Mental_health-bro_2.svg"
            alt="Mental health and wellness illustration"
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </motion.div>
      </div>

      {/* Ultra-Sophisticated Left Side - Illustration */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Multi-layered sophisticated backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/60 via-white to-white z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-50/10 to-transparent"></div>

        {/* Enhanced floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-100/20 to-teal-50/10 rounded-full blur-3xl"
            animate={{
              y: [0, -20, 0],
              x: [0, 15, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-teal-100/15 to-green-50/8 rounded-full blur-2xl"
            animate={{
              y: [0, 15, 0],
              x: [0, -10, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-green-100/10 to-emerald-50/5 rounded-full blur-2xl"
            animate={{
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Enhanced SVG Illustration */}
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative w-full max-w-lg"
          >
            {/* Multi-layered background effects */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/80 to-slate-400/60 rounded-3xl transform rotate-3 shadow-2xl"></div>
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/40 shadow-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-3xl"></div>

            {/* Subtle gradient orb */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-emerald-100/20 to-teal-50/10 rounded-full blur-xl"></div>

            <motion.img
              src="/assets/Mental_health-bro_2.svg"
              alt="Mental health and wellness illustration"
              className="relative w-full h-auto drop-shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        </div>
        {/* Johnny Ive-inspired Text Overlay */}
        <div className="absolute bottom-20 left-16 right-16 z-20">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 1.2, 
              delay: 1.0, 
              ease: [0.25, 0.1, 0.25, 1],
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
            className="text-center"
          >
            <div className="relative">
              {/* Subtle background blur for depth */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-3xl -m-4"></div>
              
              {/* Refined typography with perfect spacing */}
              <p 
                className="relative text-3xl font-extralight text-slate-800 leading-tight tracking-wide" 
                style={{ 
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.02em',
                  fontWeight: '200'
                }}
              >
                Your journey to{' '}
                <span 
                  className="relative inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: '300'
                  }}
                >
                  wellness
                </span>
                {' '}starts here.
              </p>
              
              {/* Subtle underline accent */}
              <motion.div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ duration: 1.5, delay: 1.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Johnny Ive-inspired Right Side - Signup Form */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:px-16 relative order-2 lg:order-2"
        initial={{ opacity: 0, x: 60, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ 
          duration: 1.0, 
          delay: 0.4, 
          ease: [0.25, 0.1, 0.25, 1],
          type: "spring",
          stiffness: 120,
          damping: 25
        }}
      >
        {/* Subtle gradient texture behind form */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/60 via-slate-50/40 to-white/60" />
        {/* Pattern removed - causing 404 */}
        {/* Back to Home Button */}
        <Link 
          href="/" 
          className="absolute top-6 left-6 z-10 group"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              duration: 0.15
            }}
            style={{ willChange: 'transform' }}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white/90 backdrop-blur-sm rounded-full border border-white/20 shadow-lg transition-all duration-300 text-slate-700 hover:text-slate-900"
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

        <div className="relative w-full max-w-lg mx-auto px-4 sm:px-6">
          <motion.div
            id="main-content"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 1.0, 
              delay: 0.6, 
              ease: [0.25, 0.1, 0.25, 1],
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
            style={{ 
              willChange: 'transform, opacity',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}
            className="relative overflow-hidden rounded-2xl p-10 shadow-2xl"
            role="main"
            aria-labelledby="signup-heading"
          >
            {/* Ultra-subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 pointer-events-none"></div>
            
            {/* Refined ambient lighting */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-br from-emerald-50/30 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -right-32 w-48 h-48 bg-gradient-to-br from-teal-50/20 to-transparent rounded-full blur-3xl"></div>
            <div className="relative z-10">
              {/* Johnny Ive-inspired Header */}
              <div className="text-center mb-10">
                <Link href="/" className="inline-block">
                  <motion.div
                    className="flex items-center justify-center gap-4 mb-7"
                    whileHover={{ scale: 1.02 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      duration: 0.2
                    }}
                    style={{ willChange: 'transform' }}
                  >
                    <motion.div
                      className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg"
                      whileHover={{ rotate: 5, scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span
                        className="material-symbols-outlined text-white text-2xl"
                        style={{
                          fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24'
                        }}
                      >
                        psychology_alt
                      </span>
                    </motion.div>

                    <motion.h1
                      className="text-4xl font-light tracking-tight text-slate-700"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      Mind<span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent font-normal">Well</span>
                    </motion.h1>
                  </motion.div>
                </Link>
                <h1 id="signup-heading" className="text-2xl font-light text-slate-900 mb-3 tracking-tight">Join your wellness community</h1>
                <p className="text-lg text-slate-600 font-light tracking-wide">Start your journey to better mental health</p>
              </div>

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  <div>
                    <p className="font-medium">Account created successfully!</p>
                    <p className="text-sm mt-1">
                      A confirmation email has been sent to <strong>{email}</strong>. 
                      Please check your inbox and click the link to confirm your account.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <ErrorMessage
                message={error}
                className="mb-6"
              />
            )}

            {/* Signup Form */}
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <fieldset className="space-y-6">
                <legend className="sr-only">Account Information</legend>
              <FormField
                label="Full name"
                type="text"
                value={displayName}
                onChange={(e) => handleFieldChange('displayName', e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
              />

              <FormField
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
              />

              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                placeholder="Create a password"
                disabled={loading}
              />


              <div className="space-y-6">
                <AuthButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  fullWidth
                  disabled={loading || !isOnline}
                  icon={<span className="material-symbols-outlined text-xl">rocket_launch</span>}
                >
                  {!isOnline ? 'No internet connection' : loading ? 'Creating account...' : 'Create account'}
                </AuthButton>

                {/* Login Link */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
                      style={{ 
                        textUnderlineOffset: '2px',
                        textDecoration: 'none',
                        borderBottom: '1px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderBottomColor = '#059669';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderBottomColor = 'transparent';
                      }}
                    >
                      Sign in here
                    </Link>
                  </p>
                </motion.div>
              </div>
              </fieldset>
            </form>
            ) : (
              /* Success State - Back to Login Button */
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined mr-2">arrow_back</span>
                  Back to Login
                </Link>
              </div>
            )}

            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
    </>
  )
}
