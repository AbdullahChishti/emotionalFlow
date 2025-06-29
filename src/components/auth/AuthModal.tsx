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
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        {/* Background gradients matching landing page */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="modal bg-card text-card-foreground p-8 w-full max-w-md max-h-[90vh] overflow-y-auto relative border border-border rounded-2xl shadow-2xl shadow-primary/10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-muted/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
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
              className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-400 text-sm">{success}</span>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-400 text-sm">{error}</span>
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
                    className="input w-full pl-10 pr-4 bg-background border-border/50 focus:border-primary focus:ring-primary"
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
                  className="input w-full pl-10 pr-4 bg-background border-border/50 focus:border-primary focus:ring-primary"
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
                  className="input w-full pl-10 pr-10 bg-background border-border/50 focus:border-primary focus:ring-primary"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 font-semibold rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50"
            >
              {loading ? <LoadingSpinner /> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-border/20"></div>
            <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase">Or continue with</span>
            <div className="flex-grow border-t border-border/20"></div>
          </div>

          {/* Social Auth */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full btn-secondary py-3 flex items-center justify-center gap-2 rounded-lg transition-colors duration-300 ease-in-out disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.75 8.36,4.73 12.19,4.73C14.03,4.73 15.6,5.33 16.85,6.45L18.81,4.5C17.02,2.73 14.71,1.5 12.19,1.5C7.02,1.5 3,5.58 3,12C3,18.42 7.02,22.5 12.19,22.5C17.8,22.5 21.7,18.33 21.7,11.35C21.7,10.74 21.35,11.1 21.35,11.1Z"
              />
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>
          
          {/* Switch Mode */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => onSwitchMode(mode === 'signin' ? 'signup' : 'signin')}
                className="font-semibold text-primary hover:text-primary/80 transition-colors ml-2"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
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
