'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/ui/Navigation'
import Hero from '@/components/landing/Hero'
import { buildUserSnapshot, Snapshot } from '@/lib/snapshot'
import { ASSESSMENTS } from '@/data/assessments'
import { AssessmentManager } from '@/lib/services/AssessmentManager'
// Auth is optional on landing; guard access
import { useAuth } from '@/components/providers/AuthProvider'




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
            Connect with a compassionate listener who understands. Our chat is designed to provide support, understanding, 
            and a judgment-free space to share what's on your mind—whenever you need it.
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

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
            <button
              onClick={() => router.push('/login')}
              className="flex min-w-[200px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 text-white text-base font-bold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              style={{
                backgroundColor: '#335f64',
                boxShadow: '0 10px 15px -3px rgba(51, 95, 100, 0.3)',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2a4f52';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#335f64';
              }}
            >
              <span className="truncate">Start Chatting Now</span>
            </button>
            <button
              onClick={() => router.push('/assessments')}
              className="flex min-w-[200px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 text-slate-700 text-base font-bold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 border border-slate-300 bg-white hover:bg-slate-50"
            >
              <span className="truncate">Take Wellness Assessment</span>
            </button>
          </div>
          <p className="text-slate-500 text-sm">Free • Private • No Judgement</p>
        </div>
      </div>
    </section>
  )
}

// Recent assessment preview (shows up to 3, with View all)
const RecentResultsPreview = () => {
  // AuthProvider may not be available on landing for unauthenticated users
  let user: any = null
  try {
    user = useAuth().user
  } catch {
    user = null
  }

  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!user?.id) return
      setLoading(true)
      try {
        const history = await AssessmentManager.getAssessmentHistory(user.id)
        if (!mounted) return
        // Sort newest first and take top 3
        const sorted = (history || []).sort((a: any, b: any) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())
        setEntries(sorted.slice(0, 3))
      } catch (e) {
        // Silent fail on landing
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [user?.id])

  if (!user?.id) return null
  if (loading && entries.length === 0) return null
  if (entries.length === 0) return null

  const handleViewAll = () => {
    router.push('/assessments')
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your Assessment Results</h2>
            <p className="text-slate-600">Most recent results</p>
          </div>
          <button
            onClick={handleViewAll}
            className="text-sm font-medium text-brand-green-700 hover:text-brand-green-800 underline-offset-4 hover:underline"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => {
            const assessment = ASSESSMENTS[entry.assessmentId as keyof typeof ASSESSMENTS]
            if (!assessment) return null
            const maxRange = assessment.scoring.ranges[assessment.scoring.ranges.length - 1]
            const maxScore = maxRange?.max ?? 100

            return (
              <button
                key={entry.id}
                onClick={() => router.push(`/results?assessment=${entry.assessmentId}`)}
                className="text-left bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-600">analytics</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{assessment.shortTitle}</div>
                      <div className="text-xs text-slate-500">{new Date(entry.takenAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </div>
                <div className="flex items-end gap-2">
                  <div className="text-2xl font-bold text-slate-900">{entry.score}</div>
                  <div className="text-xs text-slate-600">/ {maxScore}</div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-brand-green-500 to-brand-green-600"
                      style={{ width: `${Math.min(100, (entry.score / maxScore) * 100)}%` }}
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-secondary-900/80 text-secondary-300 glassmorphic">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="flex flex-col gap-4">
            <a className="flex items-center gap-2" style={{ color: '#335f64' }} href="#">
              <span className="material-symbols-outlined text-3xl">psychology</span>
              <h2 className="text-xl font-bold text-white">MindWell</h2>
            </a>
            <p className="text-secondary-400">Where love meets understanding. Your heart's healing journey is our deepest honor—offered with gentle care, always free, always here.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 col-span-2 gap-8">
            <div>
              <h5 className="font-bold text-white mb-4">Product</h5>
              <ul className="space-y-3">
                <li><a className="hover:transition-colors" style={{ color: '#335f64' }} href="#features">Features</a></li>
                <li><a className="hover:transition-colors" style={{ color: '#335f64' }} href="#testimonials">Testimonials</a></li>
                <li><a className="hover:transition-colors" style={{ color: '#335f64' }} href="#">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">Company</h5>
              <ul className="space-y-3">
                <li><a className="hover:transition-colors" style={{ color: '#335f64' }} href="#">About Us</a></li>
                <li><a className="hover:transition-colors" style={{ color: '#335f64' }} href="#">Careers</a></li>
                <li><a className="hover:transition-colors" style={{ color: '#335f64' }} href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">Legal</h5>
              <ul className="space-y-3">
                <li><a className="hover:transition-colors" style={{ color: '#335f64' }} href="#">Privacy Policy</a></li>
                <li><a className="hover:transition-colors" style={{ color: '#335f64' }} href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-secondary-700/50 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-secondary-400">© 2024 MindWell. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a style={{ color: '#335f64' }} className="hover:opacity-80 transition-opacity" href="#">
              <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a style={{ color: '#335f64' }} className="hover:opacity-80 transition-opacity" href="#">
              <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fillRule="evenodd"></path>
              </svg>
            </a>
            <a style={{ color: '#335f64' }} className="hover:opacity-80 transition-opacity" href="#">
              <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 012.688 2.688c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-2.688 2.688c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-2.688-2.688c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 012.688-2.688c.636-.247 1.363.416 2.427.465C9.53 2.013 9.884 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm5.25-9.75a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" fillRule="evenodd"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Old hero removed; replaced by spec-driven Hero component

export default function LandingPage() {
  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Unified Header */}
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 pt-20">
        <Hero />
        <AuthenticatedSnapshot />
        <HealingJourneySection />
        <ChatExperienceSection />
        <RecentResultsPreview />
      </main>
    </div>
  )
}

function AuthenticatedSnapshot() {
  // Snapshot is shown only for authenticated users
  let auth: any = null
  try { auth = useAuth() } catch { auth = null }
  const user = auth?.user
  const router = useRouter()
  const [snapshot, setSnapshot] = React.useState<Snapshot | null>(null)
  const [loadingSnapshot, setLoadingSnapshot] = React.useState(false)
  const [whyOpen, setWhyOpen] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    const run = async () => {
      if (!user?.id) return
      setLoadingSnapshot(true)
      const s = await buildUserSnapshot(user.id)
      if (mounted) setSnapshot(s)
      if (mounted) setLoadingSnapshot(false)
    }
    run()
    return () => { mounted = false }
  }, [user?.id])

  if (!user?.id) return null

  return (
    <section className="px-4 sm:px-6 lg:px-8 mt-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-md p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">Your current snapshot</h3>
              <p className="text-slate-600 text-sm">
                {loadingSnapshot && 'Loading a gentle summary…'}
                {!loadingSnapshot && snapshot && snapshot.dimensions.length > 0 && (
                  'Based on your recent assessments, you may be experiencing patterns we can support today. This isn’t a diagnosis—just insights to tailor care.'
                )}
                {!loadingSnapshot && !snapshot && 'Complete a quick assessment to see your personalized snapshot.'}
              </p>
            </div>
            <a className="text-sm text-brand-green-700 hover:text-brand-green-800 cursor-pointer" onClick={() => setWhyOpen(v => !v)}>
              {whyOpen ? 'Hide why' : 'Why am I seeing this?'}
            </a>
          </div>

          {/* Chips */}
          {snapshot && snapshot.dimensions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {snapshot.dimensions.slice(0, 3).map((d) => (
                <span key={d.key} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                  {`${d.key.replace('_', ' ')}: ${d.level}`}
                </span>
              ))}
            </div>
          )}

          {/* Explainability */}
          {whyOpen && snapshot && (
            <div className="mt-3 text-xs text-slate-600">
              <p className="mb-1">Informed by {snapshot.explainability.assessments_used.join(', ')} from the last 30–90 days.</p>
              <p className="italic">Non-diagnostic. For urgent help, visit <a href="/crisis-support" className="underline text-slate-700">Crisis Support</a>.</p>
            </div>
          )}

          {/* Next best steps */}
          {snapshot && snapshot.next_best_actions.length > 0 && (
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">What might help today</h4>
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                {snapshot.next_best_actions.map((a, idx) => (
                  <li key={idx}>{a.title}{a.duration_min ? ` (${a.duration_min} min)` : ''}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/session')}
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#335f64' }}
            >
              Start Session
            </button>
            <button
              onClick={() => router.push('/assessments')}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium bg-white hover:bg-slate-50"
            >
              Take Assessment
            </button>
          </div>
        </div>

        {/* Coverage row */}
        <CoverageRow userId={user.id} />
      </div>
    </section>
  )
}

// Coverage row helper: shows ✔ assessed, ! stale, ☐ missing (last 30 days)
function CoverageRow({ userId }: { userId: string }) {
  const [states, setStates] = React.useState<Record<string, 'assessed' | 'stale' | 'missing'>>({})
  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      const history = await AssessmentManager.getAssessmentHistory(userId)
      const latest = new Map<string, Date>()
      for (const h of history) {
        const t = new Date(h.takenAt)
        const prev = latest.get(h.assessmentId)
        if (!prev || t > prev) latest.set(h.assessmentId, t)
      }
      const now = Date.now()
      const list = ['phq9','gad7','pss10','who5','cd-risc','pcl5','ace']
      const result: Record<string, 'assessed' | 'stale' | 'missing'> = {}
      for (const id of list) {
        const d = latest.get(id)
        if (!d) result[id] = 'missing'
        else if (now - d.getTime() > 30 * 24 * 60 * 60 * 1000) result[id] = 'stale'
        else result[id] = 'assessed'
      }
      if (mounted) setStates(result)
    }
    load()
    return () => { mounted = false }
  }, [userId])

  const label = (id: string) => {
    const a = ASSESSMENTS[id as keyof typeof ASSESSMENTS]
    return a?.shortTitle || a?.title || id.toUpperCase()
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(states).map(([id, s]) => (
          <span key={id} className={`px-2 py-1 rounded-md border ${
            s === 'assessed' ? 'bg-green-50 border-green-200 text-green-700' :
            s === 'stale' ? 'bg-amber-50 border-amber-200 text-amber-800' :
            'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            {s === 'assessed' ? '✔' : s === 'stale' ? '!' : '☐'} {label(id)}
          </span>
        ))}
      </div>
    </div>
  )
}
