'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/ui/Navigation'
import Hero from '@/components/landing/Hero'
import { useApp } from '@/hooks/useApp'
import { Button } from '@/components/ui/Button'

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          className="relative max-w-md mx-4"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="absolute inset-0 bg-[#FAFAFA] rounded-3xl shadow-sm"></div>
          <div className="relative p-8 text-center">
            <motion.div
              className="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mb-6 shadow-sm mx-auto"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <span className="material-symbols-outlined text-2xl text-white animate-spin">psychology</span>
            </motion.div>
            <h2 className="text-3xl font-light text-[#1D1D1F] mb-4 tracking-tight">
              Welcome back
            </h2>
            <p className="text-[#86868B] font-light text-lg">
              Preparing your experience...
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  const features = [
    {
      icon: 'science',
      title: 'Evidence-Based',
      description: 'Grounded in clinical research and validated methodologies.'
    },
    {
      icon: 'person_celebrate',
      title: 'Personalized',
      description: 'Tailored insights based on your unique patterns.'
    },
    {
      icon: 'lock',
      title: 'Private',
      description: 'Your data is encrypted and protected. Always.'
    }
  ]

  const steps = [
    {
      number: '1',
      title: 'Assess',
      description: 'Complete scientifically-validated questionnaires.'
    },
    {
      number: '2',
      title: 'Understand',
      description: 'Receive personalized insights and analysis.'
    },
    {
      number: '3',
      title: 'Grow',
      description: 'Track your journey over time.'
    }
  ]

  // Show landing page for non-authenticated users
  return (
    <motion.div
      className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-white"
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

        {/* Features Section - Minimal */}
        <section className="py-32 px-6 bg-[#FAFAFA]">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight text-[#1D1D1F]">
                Why MindWell
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="group relative text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <motion.div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="material-symbols-outlined text-2xl text-white">{feature.icon}</span>
                  </motion.div>
                  <h3 className="text-xl font-normal mb-3 text-[#1D1D1F]">{feature.title}</h3>
                  <p className="text-[#86868B] leading-relaxed font-light">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section - Streamlined */}
        <section className="py-32 px-6 bg-white">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              className="text-center mb-24"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight text-[#1D1D1F]">
                How It Works
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-16">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="relative text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <div className="text-6xl font-extralight text-[var(--color-primary)] mb-6 opacity-40">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-normal mb-3 text-[#1D1D1F]">{step.title}</h3>
                  <p className="text-[#86868B] leading-relaxed font-light">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section - Refined */}
        <section className="py-32 px-6 bg-[#FAFAFA]">
          <div className="container mx-auto max-w-3xl">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-light mb-6 tracking-tight text-[#1D1D1F]">
                Your Privacy Matters
              </h2>
              <p className="text-lg text-[#86868B] leading-relaxed max-w-2xl mx-auto mb-12 font-light">
                Bank-level encryption. Complete confidentiality.<br />
                Your data is never sold to third parties.
              </p>

              <div className="flex flex-wrap justify-center gap-8 text-sm text-[#86868B]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-primary)] text-lg">encrypted</span>
                  <span className="font-light">End-to-End Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-primary)] text-lg">privacy_tip</span>
                  <span className="font-light">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-primary)] text-lg">shield_person</span>
                  <span className="font-light">Your Control</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section - Clean */}
        <section className="py-40 px-6 relative overflow-hidden bg-white">
          <div className="container mx-auto max-w-3xl relative z-10">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-light mb-8 tracking-tight text-[#1D1D1F]">
                Begin Your Journey
              </h2>
              <p className="text-xl text-[#86868B] font-light mb-12 leading-relaxed">
                Join thousands discovering clarity.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="px-10 py-4 text-base font-normal rounded-full"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    Start Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#FAFAFA] px-10 py-4 text-base font-normal rounded-full"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              <p className="text-[#86868B] text-sm mt-8 font-light">
                No credit card required
              </p>
            </motion.div>
          </div>
        </section>
      </motion.main>
    </motion.div>
  )
}