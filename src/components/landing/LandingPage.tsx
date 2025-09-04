'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/ui/Navigation'
import Hero from '@/components/landing/Hero'




// Enhanced Healing Journey Section - Matching First Section Style
const HealingJourneySection = () => {
  return (
    <section className="relative overflow-hidden py-16 bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating curved lines */}
        <div className="absolute top-20 left-10 w-32 h-32 border-l-2 border-t-2 border-brand-green-300/20 rounded-tl-full" />
        <div className="absolute top-40 right-20 w-24 h-24 border-r-2 border-b-2 border-brand-green-400/25 rounded-br-full" />
        
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
            <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-brand-green-400/30 rounded-tl-full" />
            <div className="absolute -bottom-4 -right-4 w-6 h-6 border-r-2 border-b-2 border-brand-green-500/30 rounded-br-full" />
            
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-green-200 to-brand-green-400 rounded-3xl transform rotate-3 shadow-2xl"></div>
            <img
              alt="Mental health and healing illustration"
              className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-2xl"
              src="/assets/Mental_health-bro_2.svg"
            />
          </div>

          {/* Right Side - Text Content */}
          <div className="flex flex-col gap-8 text-center md:text-left order-1 md:order-2">
            {/* Decorative line above title */}
            <div className="hidden md:block w-20 h-0.5 bg-gradient-to-r from-transparent via-brand-green-400 to-transparent mb-4" />
            
            <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tighter text-secondary-900">
              A Gentle Companion for{' '}
              <span style={{ color: '#335f64' }}>
                Your Emotional Journey
              </span>
            </h2>
            
            {/* Decorative therapy symbol - heart with flowing lines */}
            <div className="hidden md:flex items-center gap-3 text-brand-green-600 opacity-60">
              <div className="w-8 h-0.5 bg-brand-green-400"></div>
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
            
            <p className="text-base md:text-lg text-secondary-600 max-w-xl mx-auto md:mx-0 leading-relaxed">
              When your heart feels heavy and your mind won't rest, you deserve a safe harbor where your feelings are honored. 
              Our gentle AI companion offers the wisdom of countless therapeutic conversations—here to hold space for your healing, always with love.
            </p>
            
            {/* Decorative line below text */}
            <div className="hidden md:block w-32 h-0.5 bg-gradient-to-r from-brand-green-400 via-brand-green-500 to-transparent mt-4" />
          </div>
        </div>
      </div>
    </section>
  )
}



// Professional Assessments Section Component
const ProfessionalAssessmentsSection = () => {
  const router = useRouter()
  return (
    <section className="py-16 bg-gradient-to-r from-brand-green-50 to-brand-green-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-6 leading-tight">
            Understanding Your Heart
            <br />
            <span className="bg-gradient-to-r from-brand-green-600 to-brand-green-700 bg-clip-text text-transparent">
              Through Gentle Assessment
            </span>
          </h2>

          <p className="text-base md:text-lg text-secondary-600 max-w-3xl mx-auto leading-relaxed">
            These aren't just simple quizzes—they're carefully crafted tools of understanding, created by compassionate mental health professionals who deeply care about your well-being. 
            Discover gentle insights about your emotional landscape, offered with love and complete privacy.
          </p>
          
          {/* Subtle value proposition */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green-50/60 rounded-full border border-brand-green-200/40">
              <span className="text-brand-green-600 text-sm">💚</span>
              <span className="text-brand-green-700 text-sm font-medium">
                Professional assessments worth hundreds, offered freely with love
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              svg: '/assets/Psychologist-rafiki_1.svg',
              title: 'Created With Love',
              description: 'Developed by caring mental health professionals who understand the sacred nature of emotional healing.'
            },
            {
              svg: '/assets/Thinking_face-bro_1.svg',
              title: 'Gentle Understanding',
              description: 'Each assessment is crafted with deep empathy, offering insights that honor your unique emotional journey.'
            },
            {
              svg: '/assets/Contemplating-bro_1.svg',
              title: 'Personalized Wisdom',
              description: 'Receive gentle guidance and compassionate strategies tailored specifically to your heart\'s needs.'
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
              <h3 className="text-xl font-semibold text-secondary-800 mb-3">{feature.title}</h3>
              <p className="text-secondary-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="flex min-w-[200px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 text-white text-base font-bold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 mx-auto"
            style={{ backgroundColor: '#335f64', boxShadow: '0 10px 15px -3px rgba(51, 95, 100, 0.3)' }}
          >
            <span className="truncate">Start free assessment</span>
          </button>
          <p className="text-secondary-500 text-sm mt-4">Free • Private • Created With Love</p>
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
            <a className="flex items-center gap-2 text-brand-green-400" href="#">
              <span className="material-symbols-outlined text-3xl">psychology</span>
              <h2 className="text-xl font-bold text-white">MindWell</h2>
            </a>
            <p className="text-secondary-400">Where love meets understanding. Your heart's healing journey is our deepest honor—offered with gentle care, always free, always here.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 col-span-2 gap-8">
            <div>
              <h5 className="font-bold text-white mb-4">Product</h5>
              <ul className="space-y-3">
                <li><a className="hover:text-brand-green-400 transition-colors" href="#features">Features</a></li>
                <li><a className="hover:text-brand-green-400 transition-colors" href="#testimonials">Testimonials</a></li>
                <li><a className="hover:text-brand-green-400 transition-colors" href="#">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">Company</h5>
              <ul className="space-y-3">
                <li><a className="hover:text-brand-green-400 transition-colors" href="#">About Us</a></li>
                <li><a className="hover:text-brand-green-400 transition-colors" href="#">Careers</a></li>
                <li><a className="hover:text-brand-green-400 transition-colors" href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">Legal</h5>
              <ul className="space-y-3">
                <li><a className="hover:text-brand-green-400 transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-brand-green-400 transition-colors" href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-secondary-700/50 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-secondary-400">© 2024 MindWell. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a className="text-brand-green-500 hover:text-brand-green-400 transition-colors" href="#">
              <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a className="text-brand-green-500 hover:text-brand-green-400 transition-colors" href="#">
              <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fillRule="evenodd"></path>
              </svg>
            </a>
            <a className="text-brand-green-500 hover:text-brand-green-400 transition-colors" href="#">
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
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
      {/* Unified Header */}
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 pt-20">
        <Hero />
        <HealingJourneySection />
        <ProfessionalAssessmentsSection />
      </main>
    </div>
  )
}