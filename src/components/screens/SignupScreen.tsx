'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, User, Mail, KeyRound } from 'lucide-react'

export function SignupScreen() {
  const [intent, setIntent] = useState<'listen' | 'support' | null>(null)

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
          <h1 className="text-4xl font-bold leading-tight mb-4">You deserve to be heard. <br/> And so does everyone else.</h1>
          <p className="max-w-md mx-auto text-lg text-zinc-600">
            Heard is a safe space where care goes both ways. You give support. You get support. You never have to carry it alone.
          </p>
          <p className="mt-8 text-sm text-zinc-500 italic">“Healing starts with being seen.”</p>
        </motion.div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full flex items-center justify-center bg-zinc-50 py-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <Heart className="w-10 h-10 text-purple-400 mx-auto mb-3" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold text-zinc-800">Welcome to Heard</h1>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg shadow-zinc-500/10 space-y-6">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input type="text" placeholder="Your Name" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-3 pl-12 pr-4 text-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all outline-none" />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input type="email" placeholder="Your Email" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-3 pl-12 pr-4 text-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all outline-none" />
            </div>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input type="password" placeholder="Password" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-3 pl-12 pr-4 text-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all outline-none" />
            </div>

            <div className="pt-4 space-y-4">
              <p className="text-center text-sm text-zinc-600 font-medium">I'm here to...</p>
              <div className="grid grid-cols-2 gap-4">
                <motion.button 
                  className={`w-full text-center p-4 rounded-lg border-2 font-semibold transition-all duration-300 ${intent === 'listen' ? 'bg-purple-500 border-purple-500 text-white' : 'bg-zinc-50 border-zinc-200 hover:border-purple-300'}`}
                  onClick={() => setIntent('listen')}
                  whileTap={{ scale: 0.97 }}
                >
                  Listen
                </motion.button>
                <motion.button 
                  className={`w-full text-center p-4 rounded-lg border-2 font-semibold transition-all duration-300 ${intent === 'support' ? 'bg-blue-500 border-blue-500 text-white' : 'bg-zinc-50 border-zinc-200 hover:border-blue-300'}`}
                  onClick={() => setIntent('support')}
                  whileTap={{ scale: 0.97 }}
                >
                  Get Support
                </motion.button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button className="w-full bg-zinc-800 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-zinc-700 transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed" disabled={!intent}>
              Enter Heard
            </button>
            <p className="text-sm text-zinc-500 mt-4">
              Already have an account? <a href="#" className="font-medium text-purple-600 hover:underline">Sign In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
