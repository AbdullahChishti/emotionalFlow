'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim() || !displayName.trim()) {
      setError('Please fill in all fields')
      return
    }
    if (!isOnline) {
      setError('You appear to be offline. Please check your internet connection.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await signUp(email.trim(), password, displayName.trim())
      if (!result.success) {
        const errorMessage = result.error?.userMessage || result.error?.message || 'Signup failed'
        if (errorMessage.toLowerCase().includes('already registered') || errorMessage.toLowerCase().includes('already in use')) {
          setError('This email is already registered. Please try signing in instead.')
        } else {
          setError(errorMessage)
        }
      } else {
        setSuccess(true)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
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
            <h2 className="text-6xl font-extralight text-[#1D1D1F] mb-4 tracking-tight">Begin</h2>
            <p className="text-lg text-[#6E6E73] font-light leading-relaxed">
              Your journey to clarity starts here
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
              <h1 className="text-3xl font-extralight text-[#1D1D1F] mb-2 tracking-tight">Create Account</h1>
              <p className="text-sm text-[#86868B] font-light">Join MindWell today</p>
            </div>

            {success && (
              <div className="mb-6 p-4 bg-[#34C759]/10 border border-[#34C759]/20 rounded-2xl">
                <p className="text-sm text-[#34C759] font-normal mb-2">Account created successfully!</p>
                <Link href="/dashboard" className="text-sm text-[#1D1D1F] hover:text-[#6E6E73] font-normal">
                  Continue to Dashboard →
                </Link>
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

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="displayName" className="mb-2 block">Full Name</Label>
                  <Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" disabled={loading} required />
                </div>

                <div>
                  <Label htmlFor="email" className="mb-2 block">Email address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" disabled={loading} required />
                </div>

                <div>
                  <Label htmlFor="password" className="mb-2 block">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={loading} required />
                </div>

                <Button type="submit" disabled={loading || !isOnline} className="w-full" size="lg">
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E8E8ED]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-[#86868B] font-light">Already have an account?</span>
                  </div>
                </div>

                <Link href="/login">
                  <Button type="button" variant="outline" className="w-full" size="lg">
                    Sign in instead
                  </Button>
                </Link>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-[#A1A1A6] mt-6 font-light">
            By creating an account, you agree to our Terms of Service
          </p>
        </motion.div>
      </div>
    </div>
  )
}
