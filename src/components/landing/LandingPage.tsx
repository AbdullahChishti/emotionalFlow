'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/ui/Navigation'
import Hero from '@/components/landing/Hero'
import { useAuth } from '@/stores/authStore'



// Enhanced Healing Journey Section - Matching First Section Style
const HealingJourneySection = () => {
  return (
    <section className="relative overflow-hidden py-16 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating curved lines */}
        <div className="absolute top-20 left-10 w-32 h-32 border-l-2 border-t-2 border-slate-400/20 rounded-tl-full" />
        <div className="absolute top-40 right-20 w-24 h-24 border-r-2 border-b-2 border-slate-500/25 rounded-br-full" />

        {/* Paint splash / organic shapes */}
        <div className="absolute top-32 left-1/4 w-20 h-20">
          <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
            <path
              d="M40 10 Q60 15 70 35 Q75 50 65 65 Q50 75 35 70 Q20 65 15 50 Q10 35 25 25 Q35 15 40 10 Z"
              fill="#335f64"
              opacity="0.08"
            />
            <path
              d="M35 20 Q45 18 50 25 Q52 35 48 45 Q42 52 35 50 Q28 48 25 40 Q22 32 28 25 Q32 20 35 20 Z"
              fill="#335f64"
              opacity="0.12"
            />
          </svg>
        </div>

        {/* Brain wave / neural connection */}
        <div className="absolute bottom-40 right-1/3 w-24 h-24">
          <svg viewBox="0 0 96 96" fill="none" className="w-full h-full">
            <path
              d="M10 48 Q24 32 38 48 T66 48 T94 48"
              stroke="#335f64"
              strokeWidth="1.5"
              fill="none"
              opacity="0.15"
            />
            <path
              d="M10 56 Q24 40 38 56 T66 56 T94 56"
              stroke="#335f64"
              strokeWidth="1"
              fill="none"
              opacity="0.12"
            />
            <circle cx="38" cy="48" r="2" fill="#335f64" opacity="0.18" />
            <circle cx="66" cy="48" r="2" fill="#335f64" opacity="0.18" />
          </svg>
        </div>

        {/* Organic therapy symbols - leaf shapes */}
        <div className="absolute top-16 right-1/4 w-16 h-16">
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path
              d="M32 8 Q48 16 56 32 Q48 48 32 56 Q16 48 8 32 Q16 16 32 8 Z"
              fill="#335f64"
              opacity="0.08"
            />
            <path
              d="M32 12 Q44 18 50 32 Q44 46 32 52 Q20 46 14 32 Q20 18 32 12 Z"
              fill="#335f64"
              opacity="0.12"
            />
          </svg>
        </div>

        {/* Flowing emotional healing waves */}
        <div className="absolute bottom-20 left-1/3 w-40 h-20">
          <svg viewBox="0 0 160 80" fill="none" className="w-full h-full">
            <path
              d="M0 40 Q20 20 40 40 T80 40 T120 40 T160 40"
              stroke="#335f64"
              strokeWidth="1"
              fill="none"
              opacity="0.12"
            />
            <path
              d="M0 50 Q20 30 40 50 T80 50 T120 50 T160 50"
              stroke="#335f64"
              strokeWidth="0.8"
              fill="none"
              opacity="0.08"
            />
          </svg>
        </div>

        {/* Paint splash / emotional expression */}
        <div className="absolute top-1/2 right-10 w-16 h-16">
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path
              d="M32 8 Q44 12 52 24 Q56 36 48 48 Q40 56 32 52 Q24 48 16 40 Q12 28 20 20 Q28 12 32 8 Z"
              fill="#335f64"
              opacity="0.06"
            />
            <path
              d="M28 16 Q36 18 40 26 Q42 34 38 42 Q34 48 28 46 Q22 44 18 36 Q16 28 22 22 Q26 18 28 16 Z"
              fill="#335f64"
              opacity="0.10"
            />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Side - Main Illustration Card */}
          <div className="relative h-80 w-full order-2 md:order-1">
            {/* Decorative elements around the image */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-slate-500/30 rounded-tl-full" />
            <div className="absolute -bottom-4 -right-4 w-6 h-6 border-r-2 border-b-2 border-slate-600/30 rounded-br-full" />

            <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-400 rounded-3xl transform rotate-3 shadow-2xl"></div>
            <img
              alt="Mental health and healing illustration"
              className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-2xl"
              src="/assets/Mental_health-bro_2.svg"
            />
          </div>

          {/* Right Side - Text Content */}
          <div className="flex flex-col gap-8 text-center md:text-left order-1 md:order-2">
            {/* Decorative line above title */}
            <div className="hidden md:block w-20 h-0.5 bg-gradient-to-r from-transparent via-slate-500 to-transparent mb-4" />

            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tighter text-slate-700">
              Your Heart's Gentle{' '}
              <span style={{ color: '#335f64' }}>
                Safe Haven
              </span>
            </h2>

            {/* Decorative therapy symbol - heart with flowing lines */}
            <div className="hidden md:flex items-center gap-3 text-slate-600 opacity-60">
              <div className="w-8 h-0.5 bg-slate-500"></div>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
                <path
                  d="M10 15.5C10 15.5 8.5 14 6 11.5C3.5 9 2.5 7 3 5.5C3.5 4 5 3.5 6.5 4C7.5 4.5 8.5 5.5 10 7.5C11.5 5.5 12.5 4.5 13.5 4C15 3.5 16.5 4 17 5.5C17.5 7 16.5 9 14 11.5C11.5 14 10 15.5 10 15.5Z"
                  fill="#335f64"
                  opacity="0.6"
                />
                <path
                  d="M7 8 Q8 7 9 8 T11 8"
                  stroke="#335f64"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.8"
                />
              </svg>
            </div>

            <p className="text-lg md:text-xl text-slate-500 max-w-[36rem] mx-auto md:mx-0 leading-loose font-light tracking-wide">
              In those moments when the world feels overwhelming and your thoughts race with worry, you deserve a place where your feelings are truly heard and held with compassion.
              Our gentle companion brings the warmth of human understanding—offering you a soft place to land, always here, always free.
            </p>

            {/* Decorative line below text */}
            <div className="hidden md:block w-32 h-0.5 bg-gradient-to-r from-slate-500 via-slate-600 to-transparent mt-4" />
          </div>
        </div>
      </div>
    </section>
  )
}



// Chat Experience Section Component
const ChatExperienceSection = () => {
  const router = useRouter()
  return (
    <section className="py-16 bg-gradient-to-r from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-700 mb-6 leading-tight">
            A Safe Space for Your{' '}
            <span style={{ color: '#335f64' }}>Thoughts</span>
          </h2>

          <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-loose font-light tracking-wide">
            When life feels heavy, you deserve a gentle space to breathe. We listen with care and offer tools that help—always here, always free.
          </p>

          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50/60 rounded-full border border-slate-200/40">
              <span style={{ color: '#335f64' }} className="text-sm">💬</span>
              <span style={{ color: '#335f64' }} className="text-sm font-medium">
                Real people. Real support. Always here for you.
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              svg: '/assets/Psychologist-rafiki_1.svg',
              title: 'Always Available',
              description: 'Reach out whenever you need someone to talk to, day or night. Our support is here for you 24/7.'
            },
            {
              svg: '/assets/Thinking_face-bro_1.svg',
              title: 'Judgment-Free Zone',
              description: 'Share your thoughts freely in a safe, confidential space where you can be your authentic self.'
            },
            {
              svg: '/assets/Contemplating-bro_1.svg',
              title: 'Emotional Support',
              description: 'Receive compassionate responses that help you process your feelings and find clarity.'
            }
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"
            >
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <img
                  src={feature.svg}
                  alt={feature.title}
                  className="w-full h-full object-contain opacity-75 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
              <h3 className="text-xl font-medium text-slate-700 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-loose font-light tracking-wide">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}



export default function LandingPage() {
  const { user, profile } = useAuth()
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl flex items-center justify-center mb-6 shadow-lg border border-emerald-100">
            <span className="material-symbols-outlined text-3xl text-emerald-600 animate-spin">psychology</span>
          </div>
          <h2 className="text-xl font-light text-slate-900 tracking-tight">Taking you to your dashboard...</h2>
        </div>
      </div>
    )
  }

  // Show landing page for non-authenticated users
  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Unified Header */}
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 pt-20">
        <Hero />
        <HealingJourneySection />
        <ChatExperienceSection />
      </main>

    </div>
  )
}