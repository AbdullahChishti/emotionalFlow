'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import SketchbookBackground from '@/components/ui/SketchbookBackground'
import { DoodleHeart } from '@/components/landing/DoodleIcons'

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
          options: { data: { display_name: displayName.trim() } },
        })
        if (error) throw error
        if (data.user) {
          await supabase.from('profiles').insert({ id: data.user.id, display_name: displayName.trim() })
          setSuccess('Account created! Please check your email to verify.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        setSuccess('Welcome back! Redirecting...')
        setTimeout(() => onClose(), 1500)
      }
    } catch (error: any) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password.')
      } else if (error.message.includes('User already registered')) {
        setError('An account with this email already exists.')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please verify your email before signing in.')
      } else {
        setError(error.message || 'An unexpected error occurred.')
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
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <SketchbookBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="relative bg-zinc-50/95 backdrop-blur-xl p-8 md:p-10 w-full max-w-md max-h-[95vh] overflow-y-auto rounded-2xl border border-zinc-200/50 shadow-2xl shadow-black/10"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:bg-zinc-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100/80 mx-auto mb-5 border border-indigo-200/50">
              <DoodleHeart className="w-9 h-9 text-indigo-500" />
            </div>
            <h2 className="text-3xl font-light text-zinc-800">
              {mode === 'signin' ? 'Welcome Back' : 'Create Your Sketchbook'}
            </h2>
            <p className="text-zinc-500 mt-2 font-normal">
              {mode === 'signin' ? 'Let’s continue your story.' : 'A safe space for your thoughts.'}
            </p>
          </div>

          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-100/80 border border-green-200/80 text-green-800 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> {success}
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-100/80 border border-red-200/80 text-red-800 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="relative flex items-center">
                <User className="absolute left-4 w-5 h-5 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white/70 border border-zinc-300/50 rounded-lg text-zinc-800 px-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-400 transition-all placeholder:text-zinc-400"
                  placeholder="Your Name"
                  required disabled={loading}
                />
              </div>
            )}

            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-5 h-5 text-zinc-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/70 border border-zinc-300/50 rounded-lg text-zinc-800 px-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-400 transition-all placeholder:text-zinc-400"
                placeholder="Email Address"
                required disabled={loading}
              />
            </div>

            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-5 h-5 text-zinc-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/70 border border-zinc-300/50 rounded-lg text-zinc-800 px-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-400 transition-all placeholder:text-zinc-400"
                placeholder="Password"
                required minLength={6} disabled={loading}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-zinc-500 hover:text-indigo-500" disabled={loading}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <LoadingSpinner /> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-dashed border-zinc-300/70" /></div>
            <div className="relative flex justify-center text-sm"><span className="bg-zinc-50/95 px-2 text-zinc-500">or</span></div>
          </div>

          <button onClick={handleGoogleAuth} disabled={loading} className="w-full py-3 bg-white border border-zinc-300/80 text-zinc-700 rounded-lg font-medium shadow-sm hover:bg-zinc-100/80 transition-colors flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="mt-8 text-center text-sm text-zinc-500">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => onSwitchMode(mode === 'signin' ? 'signup' : 'signin')} className="font-semibold text-indigo-600 hover:underline" disabled={loading}>
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
