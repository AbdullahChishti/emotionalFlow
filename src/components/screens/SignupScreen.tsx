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
      {/* Left side - Illustration/Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0071E3] to-[#005BB5] items-center justify-center overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 text-center px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-6xl text-white">psychology_alt</span>
            </div>
            <h2 className="text-4xl font-medium text-white mb-4">Join MindWell</h2>
            <p className="text-xl text-white/80 font-light leading-relaxed">
              Begin your journey to better mental health
            </p>
            <div className="flex justify-center gap-2 mt-12">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white/40 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 relative">
        <Link href="/" className="absolute top-6 left-6">
          <motion.button whileHover={{ x: -2 }} className="flex items-center gap-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="text-sm font-normal">Back to Home</span>
          </motion.button>
        </Link>

        <motion.div className="w-full max-w-md" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-[#E8E8ED]">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0071E3] to-[#005BB5] rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-white">person_add</span>
                </div>
                <div>
                  <h1 className="text-2xl font-medium text-[#1D1D1F]">Create Account</h1>
                  <p className="text-sm text-[#86868B]">Join MindWell today</p>
                </div>
              </div>
            </div>

            {success && (
              <div className="mb-6 p-4 bg-[#34C759]/10 border border-[#34C759]/20 rounded-xl">
                <p className="text-sm text-[#34C759] font-medium mb-2">Account created successfully!</p>
                <Link href="/dashboard" className="text-sm text-[#0071E3] hover:text-[#0077ED] font-medium">
                  Continue to Dashboard →
                </Link>
              </div>
            )}

            {!isOnline && (
              <div className="mb-6 p-4 bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-xl">
                <p className="text-sm text-[#FF9500] font-medium">You appear to be offline</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl">
                <p className="text-sm text-[#FF3B30] font-medium">{error}</p>
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
                    <span className="bg-white px-2 text-[#86868B]">Already have an account?</span>
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

          <p className="text-center text-xs text-[#A1A1A6] mt-6">
            By creating an account, you agree to our Terms of Service
          </p>
        </motion.div>
      </div>
    </div>
  )
}
