'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasNavigated, setHasNavigated] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isOnline, currentError, signIn, clearError } = useAuthContext()

  useEffect(() => {
    const message = searchParams.get('message')
    const errorParam = searchParams.get('error')
    if (message === 'email_confirmed') {
      setSuccessMessage('Email confirmed successfully! Please sign in.')
    }
    if (errorParam) {
      setError('An error occurred. Please try again.')
    }
  }, [searchParams])

  useEffect(() => {
    const message = searchParams.get('message')
    if (isAuthenticated && user && !message && !loading && !isSubmitting && !hasNavigated) {
      const redirectTimer = setTimeout(() => {
        setHasNavigated(true)
        router.push('/dashboard')
      }, 100)
      return () => clearTimeout(redirectTimer)
    }
  }, [user, isAuthenticated, loading, isSubmitting, hasNavigated, router, searchParams])

  useEffect(() => {
    if (currentError && !loading) {
      setError(currentError.userMessage)
    }
  }, [currentError, loading])

  useEffect(() => {
    return () => {
      if (currentError) {
        clearError()
      }
    }
  }, [currentError, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || loading) return
    if (isAuthenticated && user) {
      router.push('/dashboard')
      return
    }
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    setLoading(true)
    setError('')

    try {
      const result = await signIn(email, password)
      if (!result.success) {
        setError(result.error?.userMessage || 'An error occurred.')
      } else {
        setTimeout(() => {
          setHasNavigated(true)
          router.push('/dashboard')
        }, 150)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
    } finally {
      setTimeout(() => {
        setIsSubmitting(false)
        setLoading(false)
      }, 0)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Left side - Minimal visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white items-center justify-center overflow-hidden">
        {/* Soft breathing circle */}
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #E8F5F3, var(--color-primary-light) 50%, var(--color-primary) 100%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="relative z-10 text-center px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-6xl font-extralight text-[#1D1D1F] mb-4 tracking-tight">Welcome</h2>
            <p className="text-lg text-[#6E6E73] font-light leading-relaxed">
              Your journey to clarity continues
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 relative">
        <Link href="/" className="absolute top-6 left-6">
          <motion.button whileHover={{ x: -2 }} className="flex items-center gap-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="text-sm font-light">Back to Home</span>
          </motion.button>
        </Link>

        <motion.div className="w-full max-w-md" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-[#E8E8ED]">
            <div className="mb-8">
              <h1 className="text-3xl font-extralight text-[#1D1D1F] mb-2 tracking-tight">Sign In</h1>
              <p className="text-sm text-[#86868B] font-light">to continue to MindWell</p>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-[#34C759]/10 border border-[#34C759]/20 rounded-2xl">
                <p className="text-sm text-[#34C759] font-normal">{successMessage}</p>
              </div>
            )}

            {!isOnline && (
              <div className="mb-6 p-4 bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-2xl">
                <p className="text-sm text-[#FF9500] font-normal">You appear to be offline</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-2xl">
                <p className="text-sm text-[#FF3B30] font-normal">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="mb-2 block">Email address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" disabled={loading} required />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-[#1D1D1F] hover:text-[#6E6E73] transition-colors font-light">
                    Forgot?
                  </Link>
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={loading} required />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="rounded w-4 h-4 text-[#1D1D1F] border-[#D2D2D7]" />
                <label htmlFor="remember" className="text-sm text-[#86868B] cursor-pointer font-light">Keep me signed in</label>
              </div>

              <Button type="submit" disabled={loading || isSubmitting || !isOnline} className="w-full" size="lg">
                {(loading || isSubmitting) ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8E8ED]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-[#86868B] font-light">New to MindWell?</span>
                </div>
              </div>

              <Link href="/signup">
                <Button type="button" variant="outline" className="w-full" size="lg">
                  Create an account
                </Button>
              </Link>
            </form>
          </div>

          <p className="text-center text-xs text-[#A1A1A6] mt-6 font-light">
            Protected by industry-standard encryption
          </p>
        </motion.div>
      </div>
    </div>
  )
}
