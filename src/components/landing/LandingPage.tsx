'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/ui/Navigation'
import Hero from '@/components/landing/Hero'
import { useApp } from '@/hooks/useApp'

export default function LandingPage() {
  const { auth } = useApp()
  const { user, profile } = auth
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user?.id && profile !== null) {
      console.log('🔄 Redirecting authenticated user from landing page to dashboard')
      router.replace('/dashboard')
    }
  }, [user?.id, profile, router])

  // Show loading state while checking authentication
  if (user?.id && profile !== null) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <motion.div
          className="relative max-w-md mx-4"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl"></div>
          <div className="relative p-8 text-center">
            <motion.div
              className="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <span className="material-symbols-outlined text-2xl text-white animate-spin">psychology</span>
            </motion.div>
            <h2 className="text-3xl font-medium text-[#1D1D1F] mb-4 tracking-tight">
              Taking you to your{' '}
              <span className="text-[var(--color-primary)]">dashboard</span>
            </h2>
            <p className="text-[#86868B] font-light text-lg">
              Preparing your personalized wellness experience...
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show landing page for non-authenticated users
  return (
    <motion.div
      className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-[#FAFAFA]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Navigation />

      <motion.main
        className="flex-1 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1.2,
          delay: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
      >
        <Hero />

        <section className="py-32 px-6 bg-white">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="text-4xl font-medium mb-6 tracking-tight text-[#1D1D1F]">Essential.</h2>
                <p className="text-xl text-[#86868B] leading-relaxed font-light">
                  We stripped away the noise to focus on what truly matters: your state of mind.
                  Every interaction is designed to be frictionless, allowing you to access support the moment you need it.
                </p>
              </motion.div>
              <motion.div
                className="aspect-square rounded-[2rem] bg-[#F5F5F7] flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="w-32 h-32 rounded-full bg-white shadow-lg opacity-50"></div>
              </motion.div>
            </div>
          </div>
        </section>
      </motion.main>
    </motion.div>
  )
}