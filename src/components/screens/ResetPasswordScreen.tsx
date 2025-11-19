'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    if (!accessToken || !refreshToken) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClientComponentClient()
      const { error } = await supabase.auth.updateUser({ password: password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => {
        router.push('/login?message=password_updated')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-[#E8E8ED] p-10 text-center">
          <div className="w-16 h-16 bg-[#34C759]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-[#34C759]">check_circle</span>
          </div>
          <h1 className="text-2xl font-medium text-[#1D1D1F] mb-2">Password Updated!</h1>
          <p className="text-[#86868B] mb-6">Your password has been successfully updated. Redirecting to login...</p>
          <Link href="/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[var(--color-primary-gradient-from)] to-[var(--color-primary-gradient-to)] items-center justify-center overflow-hidden">
        <motion.div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
        <div className="relative z-10 text-center px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-6xl text-white">lock_open</span>
            </div>
            <h2 className="text-4xl font-medium text-white mb-4">New Password</h2>
            <p className="text-xl text-white/80 font-light leading-relaxed">
              Choose a strong password for your account
            </p>
          </motion.div>
        </div>
      </div>

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
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary-gradient-from)] to-[var(--color-primary-gradient-to)] rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-white">vpn_key</span>
                </div>
                <div>
                  <h1 className="text-2xl font-medium text-[#1D1D1F]">Set New Password</h1>
                  <p className="text-sm text-[#86868B]">Enter your new password</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl">
                <p className="text-sm text-[#FF3B30] font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="password" className="mb-2 block">New Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={loading} required />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="mb-2 block">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" disabled={loading} required />
              </div>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? 'Updating...' : 'Update Password'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8E8ED]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-[#86868B]">Remember your password?</span>
                </div>
              </div>

              <Link href="/login">
                <Button type="button" variant="outline" className="w-full" size="lg">
                  Back to Sign In
                </Button>
              </Link>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
