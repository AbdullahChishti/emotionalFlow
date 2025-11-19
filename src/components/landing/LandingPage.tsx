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

  const features = [
    {
      icon: 'science',
      title: 'Evidence-Based',
      description: 'Professional psychology assessments grounded in clinical research and validated methodologies.'
    },
    {
      icon: 'person_celebrate',
      title: 'Personalized',
      description: 'Tailored insights and recommendations based on your unique responses and emotional patterns.'
    },
    {
      icon: 'lock',
      title: 'Private & Secure',
      description: 'Your data is encrypted and protected. You control what you share and with whom.'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Take Assessment',
      description: 'Complete scientifically-validated questionnaires at your own pace.'
    },
    {
      number: '02',
      title: 'Get Insights',
      description: 'Receive personalized analysis and actionable recommendations.'
    },
    {
      number: '03',
      title: 'Track Progress',
      description: 'Monitor your emotional well-being journey over time.'
    }
  ]

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

        {/* Features Section */}
        <section className="py-24 px-6 bg-white">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-medium mb-4 tracking-tight text-[#1D1D1F]">
                Why MindWell?
              </h2>
              <p className="text-xl text-[#86868B] font-light max-w-2xl mx-auto">
                Professional-grade mental wellness tools designed with your privacy and growth in mind.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="group relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="relative p-8 rounded-3xl bg-[#F5F5F7] hover:bg-white transition-all duration-500 border border-transparent hover:border-[var(--color-primary)]/10 hover:shadow-xl">
                    <motion.div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                      style={{ background: 'var(--gradient-primary)' }}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="material-symbols-outlined text-3xl text-white">{feature.icon}</span>
                    </motion.div>
                    <h3 className="text-2xl font-medium mb-3 text-[#1D1D1F]">{feature.title}</h3>
                    <p className="text-[#86868B] leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-6 bg-gradient-to-b from-white to-[#FAFAFA]">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-medium mb-4 tracking-tight text-[#1D1D1F]">
                How It Works
              </h2>
              <p className="text-xl text-[#86868B] font-light">
                Your journey to better mental wellness in three simple steps.
              </p>
            </motion.div>

            <div className="relative">
              {/* Connecting line */}
              <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-primary)]/20 to-transparent hidden md:block" />

              <div className="grid md:grid-cols-3 gap-12">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="relative text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                  >
                    <motion.div
                      className="relative inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
                      style={{ background: 'var(--gradient-primary)' }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-3xl font-medium text-white">{step.number}</span>
                      <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                    </motion.div>
                    <h3 className="text-2xl font-medium mb-3 text-[#1D1D1F]">{step.title}</h3>
                    <p className="text-[#86868B] leading-relaxed">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-24 px-6 bg-white">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-8">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span className="text-sm font-medium">Trusted by Mental Health Professionals</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-medium mb-6 tracking-tight text-[#1D1D1F]">
                Your Privacy is Our Priority
              </h2>
              <p className="text-lg text-[#86868B] leading-relaxed max-w-2xl mx-auto mb-8">
                We use bank-level encryption to protect your data. Your responses are confidential,
                and you have complete control over your information. We never sell your data to third parties.
              </p>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-[#86868B]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">encrypted</span>
                  <span>End-to-End Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">privacy_tip</span>
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">shield_person</span>
                  <span>Your Data, Your Control</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-32 px-6 relative overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
          {/* Background elements */}
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <div className="container mx-auto max-w-3xl relative z-10">
            <motion.div
              className="text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-medium mb-6 tracking-tight">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-xl text-white/80 font-light mb-12 leading-relaxed">
                Join thousands who have taken the first step toward understanding themselves better.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="px-10 py-6 text-lg"
                    style={{ backgroundColor: 'white', color: 'var(--color-primary)' }}
                  >
                    Start Free Assessment
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-6 text-lg backdrop-blur-sm"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              <p className="text-white/60 text-sm mt-8">
                No credit card required • Free to start • Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>
      </motion.main>
    </motion.div>
  )
}