'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  const [touched, setTouched] = useState<{[key: string]: boolean}>({})
  const router = useRouter()

  // Validation functions
  const validateField = (name: string, value: string) => {
    const errors: {[key: string]: string} = {}

    switch (name) {
      case 'displayName':
        if (!value.trim()) {
          errors.displayName = 'Full name is required'
        } else if (value.trim().length < 2) {
          errors.displayName = 'Full name must be at least 2 characters'
        }
        break

      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address'
        }
        break

      case 'password':
        if (!value) {
          errors.password = 'Password is required'
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(value)) {
          errors.password = 'Password must contain both uppercase and lowercase letters'
        } else if (!/(?=.*\d)/.test(value)) {
          errors.password = 'Password must contain at least one number'
        }
        break
    }

    return errors
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}

    Object.assign(errors, validateField('displayName', displayName))
    Object.assign(errors, validateField('email', email))
    Object.assign(errors, validateField('password', password))

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle field changes with validation
  const handleFieldChange = (field: string, value: string) => {
    const setter = {
      displayName: setDisplayName,
      email: setEmail,
      password: setPassword
    }[field]

    if (setter) {
      setter(value)
    }

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFieldBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const errors = validateField(field, value)
    setFieldErrors(prev => ({ ...prev, ...errors }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched for validation display
    setTouched({
      displayName: true,
      email: true,
      password: true
    })

    // Validate entire form
    if (!validateForm()) {
      setError('Please correct the errors below')
      return
    }

    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          }
        }
      })

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('already registered')) {
          setFieldErrors({ email: 'This email is already registered' })
        } else {
          setError(error.message)
        }
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
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

      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden order-1 lg:order-1">
        {/* Redesigned soothing background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_10%_10%,rgba(51,95,100,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_90%_60%,rgba(51,95,100,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-center opacity-[0.035]" style={{ backgroundSize: '320px' }} />
        <div className="absolute -top-16 -left-10 w-[28rem] h-[28rem] bg-slate-200/20 rounded-[3rem] blur-3xl rotate-6" />
        <div className="absolute -bottom-20 -right-10 w-[24rem] h-[24rem] bg-slate-300/20 rounded-[4rem] blur-3xl -rotate-6" />

        {/* Illustration */}
        <div className="relative z-10 flex items-center justify-center w-full p-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <img
              src="/assets/Mental_health-bro_2.svg"
              alt="Mental health and wellness illustration"
              className="w-full h-auto drop-shadow-xl"
            />
          </motion.div>
        </div>
        {/* Compact benefits card */}
        <div className="absolute bottom-10 left-10 right-10 z-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glassmorphic rounded-2xl p-4"
          >
            <div className="flex items-center justify-center gap-4 text-sm text-slate-900/90 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">shield_lock</span>
                <span>Private & secure</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">ecg_heart</span>
                <span>Evidence-based</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">spa</span>
                <span>Gentle by design</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 lg:px-12 relative order-2 lg:order-2">
        {/* Subtle gradient texture behind form */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/60 via-slate-50/40 to-white/60" />
        <div className="absolute inset-0 -z-10 bg-[url('/images/pattern.svg')] bg-center opacity-[0.03]" style={{ backgroundSize: '300px' }} />
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

        <div className="relative w-full max-w-md mx-auto px-4 sm:px-6">
          <motion.div
            id="main-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              type: "spring",
              stiffness: 120,
              damping: 20
            }}
            style={{ willChange: 'transform, opacity' }}
            className="glassmorphic rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20"
            role="main"
            aria-labelledby="signup-heading"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <Link href="/" className="inline-block">
                <motion.div
                  className="flex items-center justify-center gap-3 mb-5"
                  whileHover={{ scale: 1.02 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    duration: 0.2
                  }}
                  style={{ willChange: 'transform' }}
                >
                  <span className="material-symbols-outlined text-4xl text-slate-700">
                    psychology_alt
                  </span>
                  <h1 className="text-heading-1 text-slate-900">
                    MindWell
                  </h1>
                </motion.div>
              </Link>
              <h1 id="signup-heading" className="text-heading-2 text-slate-900 mb-3">Join your wellness community</h1>
              <p className="text-body text-slate-600">Start your journey to better mental health</p>
            </div>

            {/* Error Message */}
            {error && (
              <ErrorMessage
                message={error}
                className="mb-6"
              />
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <fieldset className="space-y-6">
                <legend className="sr-only">Account Information</legend>
              <FormField
                label="Full name"
                type="text"
                value={displayName}
                onChange={(e) => handleFieldChange('displayName', e.target.value)}
                onBlur={(e) => handleFieldBlur('displayName', e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={loading}
                error={touched.displayName ? fieldErrors.displayName : undefined}
              />

              <FormField
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={(e) => handleFieldBlur('email', e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                error={touched.email ? fieldErrors.email : undefined}
              />

              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                onBlur={(e) => handleFieldBlur('password', e.target.value)}
                placeholder="Create a password"
                required
                disabled={loading}
                error={touched.password ? fieldErrors.password : undefined}
                showStrengthIndicator
              />


              <div className="space-y-6">
                <AuthButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  fullWidth
                  disabled={loading || Object.keys(fieldErrors).length > 0}
                  icon={<span className="material-symbols-outlined text-xl">rocket_launch</span>}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </AuthButton>
              </div>
              </fieldset>
            </form>

            {/* Footer */}
            <div className="text-center pt-5 border-t border-slate-200/50 mt-6">
              <p className="text-body text-slate-700">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-slate-700 hover:text-slate-900 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  )
}
