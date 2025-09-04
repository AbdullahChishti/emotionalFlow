'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { track, getOrAssignABBuck } from '@/lib/analytics'

type Props = {
  variant?: 'A' | 'B'
}

export function Hero({ variant = 'B' }: Props) {
  const router = useRouter()

  useEffect(() => {
    const abBucket = getOrAssignABBuck()
    track('hero_view', { variant, abBucket })
  }, [variant])

  const onAssessment = () => {
    track('cta_click', { id: 'assessment' })
    // For unauthenticated users, drive to signup for highest conversion
    router.push('/signup?next=assessments')
  }

  const onChat = () => {
    track('cta_click', { id: 'chat' })
    // Gate via login, pass intent
    router.push('/login?intent=chat')
  }

  return (
    <section aria-label="MindWell hero" className="relative isolate overflow-hidden">
      {/* Removed hero-radial fade effect */}
      {/* Gentle floating elements */}
      <div aria-hidden className="pointer-events-none absolute -top-4 -left-4 h-32 w-32 rounded-full bg-accent-300/25 blur-3xl animate-floaty-slower" />
      <div aria-hidden className="pointer-events-none absolute top-20 -right-6 h-24 w-24 rounded-full bg-brand-green-100/40 blur-2xl animate-floaty-slow" />

      <div className="mx-auto max-w-[1200px] px-6 md:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Copy */}
          <div className="order-2 md:order-1 space-y-8">
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tighter text-slate-700">
                Find <span className="text-brand-green-600 font-medium">calm</span> in the chaos.
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-[36rem] mx-auto md:mx-0 leading-loose font-light tracking-wide">
                When life feels heavy, you deserve a gentle space to breathe. We listen with care and offer tools that help—always here, always free.
              </p>
            </div>

            {/* CTA Group */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Primary: Assessment */}
              <button
                id="cta-assessment"
                aria-label="Start free assessment"
                onClick={onAssessment}
                className="inline-flex h-12 min-h-[44px] items-center justify-center rounded-full px-6 text-white font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-sm transition-colors"
                style={{ backgroundColor: '#4a7c59', boxShadow: '0 4px 6px -1px rgba(74, 124, 89, 0.3)' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3d6b4a'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4a7c59'}
              >
                Start free assessment
              </button>

              {/* Secondary: Chat */}
              <button
                id="cta-chat"
                aria-label="Chat with MindWell"
                onClick={onChat}
                className="inline-flex h-12 min-h-[44px] items-center justify-center rounded-full px-6 text-slate-700 font-semibold bg-white border border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-sm transition-colors"
              >
                Chat with MindWell
              </button>
            </div>
            <p className="mt-3 text-[12px] leading-5 text-slate-500">Takes less than 2 minutes</p>

            {/* Trust Cluster */}
            <div className="mt-8 space-y-4 text-[14px] leading-[24px] text-slate-600" aria-label="Trust and privacy">
              <ul className="list-none p-0 m-0 space-y-3">
                <li className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 inline-flex h-4 w-4 rounded-full bg-brand-green-500/10 text-brand-green-600 items-center justify-center">
                    {/* shield/lock icon */}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-brand-green-600">
                      <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <path d="M9.5 12.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v1.5h-5v-1.5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </span>
                  <span className="font-normal">Private & secure — your data stays with you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 inline-flex h-4 w-4 rounded-full bg-brand-green-500/10 text-brand-green-600 items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-brand-green-600">
                      <path d="M4 17l6-6 4 4 6-6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </span>
                  <span className="font-normal">Evidence-based tools created with clinicians</span>
                </li>
              </ul>
              {/* Testimonial - lighter, quote-like styling */}
              <figure className="mt-4">
                <blockquote className="italic text-slate-600 pl-4 border-l-2 border-brand-green-200">
                  “I felt heard and calmer in minutes.” — Amina, 27
                </blockquote>
              </figure>
              <p className="text-[12px] leading-5 text-slate-500 mt-4">
                MindWell is for support and self-help. It's not a substitute for emergency care.
              </p>
            </div>
          </div>

          {/* Illustration */}
          <div className="order-1 md:order-2 relative w-full">
            <div className="relative mx-auto max-w-[560px] aspect-[4/3] w-full">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-brand-green-50 to-white shadow-xl ring-1 ring-black/5" />
              <Image
                src="/assets/Psychologist-rafiki_1.svg"
                alt="Warm, inclusive therapy illustration"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 560px"
                className="rounded-3xl object-cover shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
