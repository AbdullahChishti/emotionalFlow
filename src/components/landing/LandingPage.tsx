'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthModal } from '@/components/auth/AuthModal'

// Material Symbols icons import
import 'material-symbols/outlined.css'

// Modern Header with Glassmorphic Design
const ModernHeader = ({ showAuthModal }: { showAuthModal: () => void }) => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between whitespace-nowrap glassmorphic rounded-full px-6 py-3">
          <motion.a
            className="flex items-center gap-2 text-brand-green-700"
            href="#"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <span className="material-symbols-outlined text-3xl">psychology</span>
            <h2 className="text-xl font-bold">MindWell</h2>
          </motion.a>



          <div className="flex items-center gap-4">
          <motion.button
            onClick={showAuthModal}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 text-white text-base font-bold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              style={{ backgroundColor: '#335f64', boxShadow: '0 10px 15px -3px rgba(51, 95, 100, 0.2)' }}
            whileHover={{ scale: 1.05, backgroundColor: '#2a4f54' }}
            whileTap={{ scale: 0.95 }}
          >
              <span className="truncate">Find Peace</span>
          </motion.button>
            <button className="md:hidden">
              <span className="material-symbols-outlined text-3xl text-secondary-700">menu</span>
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}





// Simple Healing Journey Section
const HealingJourneySection = () => {
  return (
    <section className="relative py-24 bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-secondary-900 mb-8 leading-tight"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            A Gentle Companion for
            <br />
            <span className="bg-gradient-to-r from-brand-green-600 to-brand-green-700 bg-clip-text text-transparent">
              Your Emotional Journey
            </span>
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-secondary-600 leading-relaxed mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            When your heart feels heavy and your mind won't rest, you deserve a safe harbor where your feelings are honored. 
            Our gentle AI companion offers the wisdom of countless therapeutic conversations—here to hold space for your healing, always with love.
          </motion.p>

          {/* Gentle Journey Steps with SVG Illustrations */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                svg: '/assets/Mental health-bro (2).svg',
                title: 'Share Your Heart',
                description: 'Pour out your feelings in a sacred space where every emotion is welcomed with understanding and grace.'
              },
              {
                svg: '/assets/Peace of mind-bro (2).svg',
                title: 'Find Your Calm',
                description: 'Discover gentle pathways to inner peace through personalized wisdom that honors your unique story.'
              },
              {
                svg: '/assets/personal growth-bro (1).svg',
                title: 'Grow With Love',
                description: 'Embrace your journey of healing with compassionate guidance that celebrates your courage and strength.'
              }
            ].map((step, index) => (
              <motion.div
                key={step.title}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.2, duration: 0.6 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 relative">
                  <img
                    src={step.svg}
                    alt={step.title}
                    className="w-full h-full object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-3">{step.title}</h3>
                <p className="text-secondary-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}



// Professional Assessments Section Component
const ProfessionalAssessmentsSection = ({ showAuthModal }: { showAuthModal: () => void }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-brand-green-50 to-brand-green-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6 leading-tight"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Understanding Your Heart
            <br />
            <span className="bg-gradient-to-r from-brand-green-600 to-brand-green-700 bg-clip-text text-transparent">
              Through Gentle Assessment
            </span>
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-secondary-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            These aren't just simple quizzes—they're carefully crafted tools of understanding, created by compassionate mental health professionals who deeply care about your well-being. 
            Discover gentle insights about your emotional landscape, offered with love and complete privacy.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              svg: '/assets/Psychologist-rafiki (1).svg',
              title: 'Created With Love',
              description: 'Developed by caring mental health professionals who understand the sacred nature of emotional healing.'
            },
            {
              svg: '/assets/Thinking face-bro (1).svg',
              title: 'Gentle Understanding',
              description: 'Each assessment is crafted with deep empathy, offering insights that honor your unique emotional journey.'
            },
            {
              svg: '/assets/Contemplating-bro (1).svg',
              title: 'Personalized Wisdom',
              description: 'Receive gentle guidance and compassionate strategies tailored specifically to your heart\'s needs.'
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + index * 0.2, duration: 0.6 }}
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
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <motion.button
            onClick={showAuthModal}
            className="flex min-w-[200px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 text-white text-lg font-bold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 mx-auto"
            style={{ backgroundColor: '#335f64', boxShadow: '0 10px 15px -3px rgba(51, 95, 100, 0.3)' }}
            whileHover={{ scale: 1.05, backgroundColor: '#2a4f54' }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="truncate">Begin Your Gentle Assessment</span>
          </motion.button>
          <p className="text-secondary-500 text-sm mt-4">Free • Private • Created With Love</p>
        </motion.div>
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

// Hero Section Component
const HeroSection = ({ showAuthModal }: { showAuthModal: () => void }) => {
  return (
    <section className="relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            className="flex flex-col gap-8 text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tighter text-secondary-900">
              Your Heart
              <br />
              <span className="bg-gradient-to-r from-brand-green-600 to-brand-green-700 bg-clip-text text-transparent">
                Deserves Peace
              </span>
            </h1>
            <p className="text-lg md:text-xl text-secondary-600 max-w-xl mx-auto md:mx-0 leading-relaxed">
              When the world feels heavy and your thoughts race, you deserve a gentle space where you can breathe freely. Our caring AI companion listens with patience and offers wisdom from the heart—here whenever you need comfort, always without judgment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-6">
              <motion.button
                onClick={showAuthModal}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 text-white text-lg font-bold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                style={{ backgroundColor: '#335f64', boxShadow: '0 10px 15px -3px rgba(51, 95, 100, 0.3)' }}
                whileHover={{ scale: 1.05, backgroundColor: '#2a4f54' }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="truncate text-white">Begin Your Healing Journey</span>
              </motion.button>
              <motion.button
                onClick={() => window.location.href = '/session'}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 text-white text-lg font-bold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                style={{ backgroundColor: '#2a4f54', boxShadow: '0 10px 15px -3px rgba(42, 79, 84, 0.3)' }}
                whileHover={{ scale: 1.05, backgroundColor: '#1f3d42' }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="truncate text-white">💬 I Need Someone to Listen</span>
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            className="relative h-96 w-full"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-green-200 to-brand-green-400 rounded-3xl transform -rotate-3 shadow-2xl"></div>
            <img
              alt="Gentle therapy and healing illustration"
              className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-2xl"
              src="/assets/Psychologist-rafiki (1).svg"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')

  const handleShowAuthModal = () => {
    setAuthMode('signup')
    setShowAuthModal(true)
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">

      {/* Header */}
      <ModernHeader showAuthModal={handleShowAuthModal} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection showAuthModal={handleShowAuthModal} />

        {/* Healing Journey Section */}
        <HealingJourneySection />

        {/* Professional Assessments Section */}
        <ProfessionalAssessmentsSection showAuthModal={handleShowAuthModal} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  )
}