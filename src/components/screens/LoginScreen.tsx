'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Shield, Apple } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import { track } from '@/lib/analytics'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')

  const emailRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user } = useAuth()
  const enableApple = process.env.NEXT_PUBLIC_ENABLE_APPLE === 'true'

  useEffect(() => {
    emailRef.current?.focus()
    const device = typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop'
    track('signin_view', { device, abBucket: 'default' })
    const savedRemember = typeof window !== 'undefined' && localStorage.getItem('rememberMe') === 'true'
    setRememberMe(savedRemember)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false')
    }
  }, [rememberMe])

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const validate = () => {
    let valid = true
    setEmailError('')
    setPasswordError('')

    if (!email) {
      setEmailError('Please enter your email.')
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('That doesn’t look like a valid email.')
      valid = false
    }

    if (!password) {
      setPasswordError('Please enter your password.')
      valid = false
    }

    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!validate()) {
      track('signin_error', { type: 'validation' })
      return
    }

    setLoading(true)
    track('signin_submit', { method: 'password', rememberMe })

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setPasswordError('Email or password didn’t match. Try again or reset your password.')
        track('signin_error', { type: 'auth' })
      } else {
        track('signin_success', { method: 'password' })
      }
    } catch {
      setFormError('We couldn’t reach the server. Please try again.')
      track('signin_error', { type: 'network' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    track('sso_click', { provider: 'google' })
    track('signin_submit', { method: 'google', rememberMe: false })
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) {
        setFormError('We couldn’t reach the server. Please try again.')
        track('signin_error', { type: 'network' })
        setLoading(false)
      } else {
        track('signin_success', { method: 'google' })
      }
    } catch {
      setFormError('We couldn’t reach the server. Please try again.')
      track('signin_error', { type: 'network' })
      setLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    track('sso_click', { provider: 'apple' })
    track('signin_submit', { method: 'apple', rememberMe: false })
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) {
        setFormError('We couldn’t reach the server. Please try again.')
        track('signin_error', { type: 'network' })
        setLoading(false)
      } else {
        track('signin_success', { method: 'apple' })
      }
    } catch {
      setFormError('We couldn’t reach the server. Please try again.')
      track('signin_error', { type: 'network' })
      setLoading(false)
    }
  }

  const isValid =
    email.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length > 0

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center items-center bg-[radial-gradient(circle,var(--brand-50),transparent)] p-8">
        <img src="/assets/signin_reflection_v2.webp" alt="" className="max-w-md w-full mb-8" />
        <div className="max-w-md text-center">
          <h5 className="text-xl font-semibold text-[var(--ink-900)] mb-2">Find Your Inner Peace</h5>
          <p className="text-sm text-[var(--ink-600)]">Welcome back to a calmer you. We’re here, judgment-free and always on your side.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white rounded-[1.25rem] shadow-xl p-7 space-y-5">
          <header className="space-y-2">
            <h2 className="text-2xl font-semibold text-[var(--ink-900)]">Welcome back. Your safe space is waiting.</h2>
            <p className="text-sm text-[var(--ink-600)]">Sign in to continue your journey to emotional wellness.</p>
          </header>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-[var(--ink-900)]">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ink-400)]" aria-hidden="true" />
                <input
                  ref={emailRef}
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full h-12 pl-10 pr-3 rounded-lg border border-[var(--color-input)] text-[var(--ink-900)] placeholder-[var(--ink-400)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:border-[var(--brand-500)]"
                  aria-describedby={emailError ? 'email-error' : undefined}
                  aria-invalid={emailError ? 'true' : 'false'}
                />
              </div>
              {emailError && <p id="email-error" className="text-sm text-[var(--error-600)]">{emailError}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-[var(--ink-900)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ink-400)]" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-10 pr-10 rounded-lg border border-[var(--color-input)] text-[var(--ink-900)] placeholder-[var(--ink-400)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:border-[var(--brand-500)]"
                  aria-describedby={`${passwordError ? 'password-error ' : ''}privacy-note`.trim()}
                  aria-invalid={passwordError ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-[var(--ink-600)] flex items-center justify-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p id="privacy-note" className="text-xs text-[var(--ink-400)] flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                Your information is private and secure.
              </p>
              {passwordError && <p id="password-error" className="text-sm text-[var(--error-600)]">{passwordError}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="remember" className="flex items-center gap-2 text-sm text-[var(--ink-600)]">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--color-input)] text-[var(--brand-500)] focus:ring-[var(--brand-500)]"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <Link href="/reset-password" className="text-sm text-[var(--brand-500)] hover:text-[var(--brand-600)]">Forgot password?</Link>
            </div>

            {formError && <p className="text-sm text-[var(--error-600)]">{formError}</p>}

            <button
              type="submit"
              id="signin-submit"
              disabled={loading || !isValid}
              className="w-full h-12 rounded-lg bg-[var(--brand-500)] text-white font-semibold hover:bg-[var(--brand-600)] disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-2">
            <hr className="flex-grow border-[var(--color-input)]" />
            <span className="text-sm text-[var(--ink-400)]">or continue with</span>
            <hr className="flex-grow border-[var(--color-input)]" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-12 rounded-lg border border-[var(--color-input)] flex items-center justify-center gap-2 hover:bg-[var(--brand-50)] text-[var(--ink-600)]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            {enableApple && (
              <button
                type="button"
                onClick={handleAppleSignIn}
                className="w-full h-12 rounded-lg border border-[var(--color-input)] flex items-center justify-center gap-2 hover:bg-[var(--brand-50)] text-[var(--ink-600)]"
              >
                <Apple className="h-5 w-5" aria-hidden="true" />
                Continue with Apple
              </button>
            )}
          </div>

          <p className="text-center text-sm text-[var(--ink-600)]">
            New here?{' '}
            <Link href="/signup" className="text-[var(--brand-500)] hover:text-[var(--brand-600)]">
              Create your free safe space.
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
