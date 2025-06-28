'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, Heart, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface AuthModalProps {
  mode: 'signin' | 'signup'
  onClose: () => void
  onSwitchMode: (mode: 'signin' | 'signup') => void
}

export function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form validation
  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!password) {
      setError('Password is required')
      return false
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (mode === 'signup' && !displayName.trim()) {
      setError('Display name is required')
      return false
    }
    if (mode === 'signup' && displayName.length < 2) {
      setError('Display name must be at least 2 characters')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) return

    setLoading(true)

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: displayName.trim(),
            },
          },
        })

        if (error) throw error

        if (data.user) {
          // Create profile in our database
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              display_name: displayName.trim(),
              empathy_credits: 10, // Starting credits
              total_credits_earned: 10,
              total_credits_spent: 0,
              emotional_capacity: 'medium',
              preferred_mode: 'both',
              is_anonymous: false,
              last_active: new Date().toISOString(),
            })

          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't throw here, user is still created
          }

          setSuccess('Account created successfully! Please check your email to verify your account.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) throw error

        setSuccess('Welcome back! Redirecting...')
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      
      // Handle specific error messages
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (error.message.includes('User already registered')) {
        setError('An account with this email already exists. Try signing in instead.')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please check your email and click the verification link before signing in.')
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        {/* Background gradients matching landing page */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-green-50/30" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="modal p-8 w-full max-w-md max-h-[90vh] overflow-y-auto relative"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-muted/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-3xl font-light text-foreground mb-2">
              {mode === 'signin' ? 'Welcome Back' : 'Join Our Community'}
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-muted-foreground mb-8 text-center font-light text-lg">
            {mode === 'signin'
              ? 'Continue your journey of emotional wellness and connection'
              : 'Begin your path to balanced emotional support and healing'
            }
          </p>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="status-success mb-4 p-3 border border-green-200 rounded-lg flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700 text-sm">{success}</span>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="status-error mb-4 p-3 border border-red-200 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input w-full pl-10 pr-4"
                    placeholder="How should we call you?"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full pl-10 pr-4"
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pl-10 pr-12"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 6 characters long
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-full hover:from-violet-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl shadow-violet-300/50 flex items-center justify-center gap-2 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="btn-outline w-full mt-4 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-text-primary">
                Continue with Google
              </span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-text-secondary">
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => onSwitchMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-primary hover:text-primary/80 font-medium hover:underline"
              disabled={loading}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          {/* Terms */}
          {mode === 'signup' && (
            <p className="mt-4 text-xs text-muted-foreground text-center">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
