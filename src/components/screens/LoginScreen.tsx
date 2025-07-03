'use client'

import { motion } from 'framer-motion'
import { Heart, Mail, KeyRound } from 'lucide-react'

export function LoginScreen() {
  return (
    <div className="min-h-screen w-full font-sans lg:grid lg:grid-cols-2">
      {/* Left Panel - Emotional Branding */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 text-center text-zinc-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.div 
            className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-purple-300 rounded-full blur-xl opacity-50"></div>
            <Heart className="relative w-16 h-16 text-purple-500" fill="currentColor" />
          </motion.div>
          <h1 className="text-4xl font-bold leading-tight mb-4">Welcome back. <br/> We're glad you're here.</h1>
          <p className="max-w-md mx-auto text-lg text-zinc-600">
            Your space for safe, reciprocal support is waiting for you.
          </p>
          <p className="mt-8 text-sm text-zinc-500 italic">“Healing starts with being seen.”</p>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full flex items-center justify-center bg-zinc-50 py-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <Heart className="w-10 h-10 text-purple-400 mx-auto mb-3" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold text-zinc-800">Welcome Back</h1>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg shadow-zinc-500/10 space-y-6">
             <h2 className="text-xl font-semibold text-center text-zinc-700">Sign in to your account</h2>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input type="email" placeholder="Your Email" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-3 pl-12 pr-4 text-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all outline-none" />
            </div>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input type="password" placeholder="Password" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-3 pl-12 pr-4 text-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all outline-none" />
            </div>
          </div>

          <div className="mt-8 text-center">
            <button className="w-full bg-zinc-800 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-zinc-700 transition-colors">
              Sign In
            </button>
            <p className="text-sm text-zinc-500 mt-4">
              Don't have an account? <a href="/signup" className="font-medium text-purple-600 hover:underline">Sign Up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
