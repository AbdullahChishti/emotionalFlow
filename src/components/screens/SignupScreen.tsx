'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useRouter } from 'next/navigation'

export function SignupScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !displayName) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-10"
          style={{
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(51, 95, 100, 0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
            top: '10%',
            left: '10%'
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute rounded-full opacity-10"
          style={{
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(51, 95, 100, 0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
            bottom: '20%',
            right: '15%'
          }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 10
          }}
        />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="inline-block">
              <motion.div
                className="flex items-center justify-center gap-3 mb-6"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <span className="material-symbols-outlined text-4xl text-brand-green-700">psychology</span>
                <h1 className="text-3xl font-bold text-brand-green-700">
                  MindWell
                </h1>
              </motion.div>
            </Link>
            <h2 className="text-2xl font-light text-zinc-800 mb-2">Join your wellness community</h2>
            <p className="text-zinc-600">Start your journey to better mental health</p>
          </motion.div>

          {/* Signup Form */}
          <motion.div
            className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/30 shadow-lg space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {error && (
              <motion.div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl">person</span>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white/80 border border-zinc-200 rounded-xl py-4 pl-12 pr-4 text-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-green-300 focus:border-brand-green-300 transition-all outline-none"
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl">mail</span>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/80 border border-zinc-200 rounded-xl py-4 pl-12 pr-4 text-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-green-300 focus:border-brand-green-300 transition-all outline-none"
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl">lock</span>
                  <input
                    type="password"
                    placeholder="Password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/80 border border-zinc-200 rounded-xl py-4 pl-12 pr-4 text-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-green-300 focus:border-brand-green-300 transition-all outline-none"
                    disabled={loading}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-green-700 hover:bg-brand-green-800 text-white font-medium py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </motion.button>
            </form>

            <div className="text-center pt-4 border-t border-zinc-200">
              <p className="text-zinc-600 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-brand-green-700 hover:text-brand-green-800 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
