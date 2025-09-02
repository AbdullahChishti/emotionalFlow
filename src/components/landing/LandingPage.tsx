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
            className="flex items-center gap-2 text-primary-700"
            href="#"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <span className="material-symbols-outlined text-3xl">psychology</span>
            <h2 className="text-xl font-bold">MindWell</h2>
          </motion.a>

          <nav className="hidden md:flex items-center gap-8">
            <a className="text-base font-medium text-secondary-600 hover:text-primary-600 transition-colors" href="#features">Features</a>
            <a className="text-base font-medium text-secondary-600 hover:text-primary-600 transition-colors" href="#testimonials">Testimonials</a>
            <a className="text-base font-medium text-secondary-600 hover:text-primary-600 transition-colors" href="#how-it-works">How It Works</a>
          </nav>

          <div className="flex items-center gap-4">
          <motion.button
            onClick={showAuthModal}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-primary-500 text-white text-base font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all duration-300 ease-in-out transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
              <span className="truncate">Get Started</span>
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

// Features Section Component
const FeaturesSection = () => {
  const features = [
    {
      icon: 'all_inclusive',
      title: '24/7 Availability',
      description: 'Access support whenever you need it, day or night.'
    },
    {
      icon: 'verified_user',
      title: 'Confidential & Secure',
      description: 'Your privacy is our priority. All conversations are encrypted.'
    },
    {
      icon: 'schedule',
      title: 'Personalized Journeys',
      description: 'Receive guidance and support tailored to your specific needs.'
    }
  ]

  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-secondary-900">Key Features</h2>
          <p className="text-lg text-secondary-600 mt-4 max-w-2xl mx-auto">
            Explore the benefits of our therapy app designed to support your mental well-being.
          </p>
          </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
          <motion.div
              key={feature.title}
              className="flex flex-col items-center text-center p-8 glassmorphic rounded-3xl transition-shadow duration-300 hover:shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-4 bg-primary-500/10 rounded-full mb-6">
                <span className="material-symbols-outlined text-4xl text-primary-600">{feature.icon}</span>
            </div>
              <h3 className="text-xl font-bold text-secondary-800 mb-2">{feature.title}</h3>
              <p className="text-secondary-600">{feature.description}</p>
          </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Testimonials Section Component
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Marketing Manager',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2nEPkFs_hV_XqiWFekNretQEaQT-9dwVAFWhVLaTsnI2PvxrDtJ8ztHucF_3TgVUhsjHoognEgu3xazVE30AqPrXdfQ1LEybTwM6fYqwdQrd2AbSMl_Ytj8WR80q48iwliBG7GxMSZ-s3dSR3nWLbAermzb2dqkYcer6EkUz1RREC9ZWusBrHBaoz9bGR-ImOsGgRUDveA25fQejfvsRkmtqvSTxb87ym8Dwqbv3_KdsIAHtnc8aFM8XwnBavCm5zwseIZwbrQAgp',
      text: 'MindWell has been a game-changer for me. I feel more supported and understood than ever before.'
    },
    {
      name: 'David L.',
      role: 'Software Engineer',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwyj2WcWZu8p6QDifWezsIm3t27itqZjTBLpK-eC57VBKh_xuhtCUpcBu9F27aHgEesTEJunnM1kocFQJw0ei7z4WOlgdam_EF-a9cEm2HfFwAvuS3e0fsn9rIhToQoaJ7VkDVt_9W9jPB5XideQWp3u5jllSgUpkUW2LZV-nV4yLMK8bMxZ_VQSKopiTuqcOQLWXj-ztKsluwM6OQDxbnVUSARL-DgcXScHgGOlM5DqUTjNnq1r6FRPCexVgO3RzQCJICr_Gbj7_7',
      text: 'I was hesitant at first, but the bot\'s responses are incredibly insightful and helpful. It\'s like having a therapist in my pocket.'
    },
    {
      name: 'Emily R.',
      role: 'Student',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYawskb_faE0mAVBwLLqs5-vmjErEz5SQ5RPpDywf6GhNHEOMAIwshkdHUxDLD0EPHBZqc6wL7LExex5qpLPhCzrcR_YloSLxeaG7fnsmQHiZekzgY4cu0568Sc1fgrT5iAvhjIn-jq1drJXBHfPme1dsAR3G_xYQqGx7Pf42wLngHvLRSLqysBjqPAD0rk--rs6u_VxZ1jUfXa9fsr06nywVV7K-gVO2PcyIEMUKXJ7IjIeozdsd4YdozIr8Bkfve6nlRrNS1pg_b',
      text: 'The flexibility of MindWell is amazing. I can fit therapy into my busy schedule without any hassle.'
    }
  ]

    return (
    <section id="testimonials" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-secondary-900">Loved by users worldwide</h2>
          <p className="text-lg text-secondary-600 mt-4 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our users have to say.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="flex flex-col gap-6 glassmorphic p-8 rounded-3xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
            >
              <div className="flex items-center gap-4">
                <img alt={testimonial.name} className="w-14 h-14 rounded-full object-cover" src={testimonial.image} />
                <div>
                  <h4 className="text-lg font-bold text-secondary-800">{testimonial.name}</h4>
                  <p className="text-secondary-500">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-secondary-700">"{testimonial.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Artistic SVG Journey Section - Creative Composition Design
const TherapyJourneySection = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary-50">
      {/* Artistic Background Composition */}
      <div className="absolute inset-0">
        {/* Large central circular pattern */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-5">
          <div className="absolute inset-0 border-2 border-primary-300 rounded-full"></div>
          <div className="absolute inset-8 border border-secondary-300 rounded-full"></div>
          <div className="absolute inset-16 border border-primary-200 rounded-full"></div>
        </div>

        {/* Floating SVG elements as artistic background */}
        <motion.div
          className="absolute top-20 left-20 opacity-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <img src="/assets/Contemplating-bro (1).svg" alt="" className="w-16 h-16" />
        </motion.div>

        <motion.div
          className="absolute bottom-32 right-16 opacity-8"
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        >
          <img src="/assets/Peace of mind-bro (2).svg" alt="" className="w-20 h-20" />
        </motion.div>

        <motion.div
          className="absolute top-40 right-32 opacity-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src="/assets/Thinking face-bro (1).svg" alt="" className="w-14 h-14" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Artistic Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          {/* Artistic SVG arrangement in header */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            >
              <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center">
                <img src="/assets/Contemplating-bro (1).svg" alt="" className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div
              className="px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-white/50 shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <span className="text-primary-700 font-semibold">✨ Your Journey</span>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: 180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
            >
              <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center">
                <img src="/assets/Peace of mind-bro (2).svg" alt="" className="w-6 h-6" />
              </div>
            </motion.div>
          </div>

          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <span className="text-secondary-900">Art of</span>
            <br />
            <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-700 bg-clip-text text-transparent">
              Transformation
            </span>
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-secondary-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Experience the therapeutic journey as a beautiful, artistic evolution of the mind,
            heart, and spirit through compassionate AI guidance.
          </motion.p>
        </motion.div>

        {/* Artistic Three-Act Composition */}
        <div className="relative mb-20">
          {/* Connecting artistic lines */}
          <div className="hidden lg:block absolute top-24 left-0 w-full h-0.5">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary-400 rounded-full"></div>
            <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-secondary-400 rounded-full"></div>
            <div className="absolute top-1/2 right-1/3 transform translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-secondary-400 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                svg: '/assets/Overwhelmed-bro (1).svg',
                title: 'Awakening',
                description: 'The moment of recognition, where overwhelm becomes the catalyst for change.',
                color: 'from-rose-400 to-pink-500',
                rotation: -5,
                scale: 0.95
              },
              {
                svg: '/assets/Psychologist-rafiki (1).svg',
                title: 'Guidance',
                description: 'Finding direction through compassionate support and professional wisdom.',
                color: 'from-emerald-400 to-teal-500',
                rotation: 0,
                scale: 1.05
              },
              {
                svg: '/assets/Peace of mind-bro (2).svg',
                title: 'Harmony',
                description: 'The beautiful culmination of inner peace and emotional balance achieved.',
                color: 'from-purple-400 to-violet-500',
                rotation: 3,
                scale: 0.95
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="group relative"
                initial={{ opacity: 0, y: 50, rotate: item.rotation * 2 }}
                whileInView={{ opacity: 1, y: 0, rotate: item.rotation }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.3,
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{
                  scale: 1.1,
                  rotate: 0,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Artistic card with layered effects */}
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-xl overflow-hidden">
                  {/* Background gradient pattern */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5`}></div>

                  {/* Decorative corner elements */}
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary-200 rounded-tr-lg opacity-30"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-secondary-200 rounded-bl-lg opacity-30"></div>

                  {/* Main SVG with artistic framing */}
                  <div className="relative mb-6 flex justify-center">
                    <motion.div
                      className="relative"
                      style={{ scale: item.scale }}
                      whileHover={{ scale: item.scale * 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Outer decorative ring */}
                      <div className={`absolute inset-0 rounded-full opacity-20 scale-110 border-2 border-primary-200`}></div>

                      {/* SVG container */}
                      <div className="relative w-40 h-40 bg-gradient-to-br from-white via-gray-50 to-white rounded-full shadow-inner p-6 border border-white/50">
                        <img
                          src={item.svg}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Subtle glow effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 rounded-full blur-xl scale-125`}></div>
                    </motion.div>
                  </div>

                  {/* Artistic text layout */}
                  <div className="text-center relative z-10">
                    <motion.h3
                      className="text-2xl font-bold mb-3 bg-gradient-to-r from-secondary-800 to-secondary-600 bg-clip-text text-transparent"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.3 + 0.5, duration: 0.6 }}
                    >
                      {item.title}
                    </motion.h3>

                    <motion.p
                      className="text-secondary-600 leading-relaxed text-sm"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.3 + 0.7, duration: 0.6 }}
                    >
                      {item.description}
                    </motion.p>
                  </div>

                  {/* Floating particles effect */}
                  <div className="absolute top-4 left-4 w-1 h-1 bg-primary-400 rounded-full opacity-40 animate-pulse"></div>
                  <div className="absolute bottom-6 right-6 w-1.5 h-1.5 bg-secondary-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
                  <div className="absolute top-1/2 right-4 w-1 h-1 bg-purple-400 rounded-full opacity-25 animate-pulse delay-2000"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Artistic CTA with SVG integration */}
        <motion.div
          className="text-center relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {/* Artistic SVG border */}
          <div className="flex justify-center items-center gap-8 mb-8">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <img src="/assets/Thinking face-bro (1).svg" alt="" className="w-8 h-8 opacity-60" />
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent flex-1 max-w-32"></div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <img src="/assets/personal growth-bro (1).svg" alt="" className="w-8 h-8 opacity-60" />
            </motion.div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-12 border border-white/50 shadow-2xl max-w-3xl mx-auto relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 left-4 w-16 h-16 border border-primary-300 rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border border-secondary-300 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-purple-300 rounded-full"></div>
            </div>

            <motion.h3
              className="text-2xl md:text-4xl font-bold text-secondary-900 mb-6 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >
              Begin Your
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Artistic Journey
              </span>
            </motion.h3>

            <motion.p
              className="text-secondary-600 mb-8 leading-relaxed max-w-xl mx-auto relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.6, duration: 0.8 }}
            >
              Transform your inner world through the beautiful art of therapeutic discovery.
              Every step is a masterpiece in the making.
            </motion.p>

            <motion.button
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-600 hover:from-primary-600 hover:via-purple-600 hover:to-primary-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.8, duration: 0.8 }}
            >
              {/* Button background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <span className="relative z-10">Start Creating Art</span>
              <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        {/* Artistic Stats with SVG accents */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          {[
            { number: '50K+', label: 'Artistic Journeys', icon: '/assets/Contemplating-bro (1).svg' },
            { number: '98%', label: 'Creative Satisfaction', icon: '/assets/Peace of mind-bro (2).svg' },
            { number: '24/7', label: 'Artistic Support', icon: '/assets/Psychologist-rafiki (1).svg' },
            { number: '∞', label: 'Creative Potential', icon: '/assets/personal growth-bro (1).svg' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="group relative"
              initial={{ opacity: 0, scale: 0.8, rotate: index % 2 === 0 ? -5 : 5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-2 right-2 opacity-10">
                  <img src={stat.icon} alt="" className="w-6 h-6" />
                </div>

                <div className="text-center relative z-10">
                  <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-secondary-600 font-medium text-sm">
                    {stat.label}
                  </div>
                </div>

                {/* Subtle animated border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-200/20 to-purple-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// How It Works Section Component
const HowItWorksSection = () => {
  const steps = [
    {
      step: 1,
      title: 'Create Your Account',
      description: 'Download the MindWell app and sign up in just a few clicks.'
    },
    {
      step: 2,
      title: 'Start Chatting',
      description: 'Begin a conversation with our AI therapy bot and share your thoughts and feelings.'
    },
    {
      step: 3,
      title: 'Grow and Thrive',
      description: 'Receive personalized guidance and support to help you achieve your goals.'
    }
  ]

  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
      className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-secondary-900">How It Works</h2>
          <p className="text-lg text-secondary-600 mt-4 max-w-2xl mx-auto">
            Follow these simple steps to begin your journey towards better mental health.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-primary-200"></div>
          <div className="grid md:grid-cols-3 gap-16">
            {steps.map((step, index) => (
      <motion.div
                key={step.step}
                className="relative flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
              >
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary-500 text-white font-bold text-3xl mb-8 border-4 border-white shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-secondary-800 mb-2">{step.title}</h3>
                <p className="text-secondary-600">{step.description}</p>
      </motion.div>
            ))}
          </div>
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
            <a className="flex items-center gap-2 text-primary-400" href="#">
              <span className="material-symbols-outlined text-3xl">psychology</span>
              <h2 className="text-xl font-bold text-white">MindWell</h2>
            </a>
            <p className="text-secondary-400">Your personal AI therapy companion.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 col-span-2 gap-8">
            <div>
              <h5 className="font-bold text-white mb-4">Product</h5>
              <ul className="space-y-3">
                <li><a className="hover:text-primary-400 transition-colors" href="#features">Features</a></li>
                <li><a className="hover:text-primary-400 transition-colors" href="#testimonials">Testimonials</a></li>
                <li><a className="hover:text-primary-400 transition-colors" href="#">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">Company</h5>
              <ul className="space-y-3">
                <li><a className="hover:text-primary-400 transition-colors" href="#">About Us</a></li>
                <li><a className="hover:text-primary-400 transition-colors" href="#">Careers</a></li>
                <li><a className="hover:text-primary-400 transition-colors" href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">Legal</h5>
              <ul className="space-y-3">
                <li><a className="hover:text-primary-400 transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-primary-400 transition-colors" href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-secondary-700/50 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-secondary-400">© 2024 MindWell. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a className="text-emerald-500 hover:text-emerald-400 transition-colors" href="#">
              <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a className="text-emerald-500 hover:text-emerald-400 transition-colors" href="#">
              <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path clip-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fill-rule="evenodd"></path>
              </svg>
            </a>
            <a className="text-emerald-500 hover:text-emerald-400 transition-colors" href="#">
              <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path clip-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 012.688 2.688c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-2.688 2.688c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-2.688-2.688c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 012.688-2.688c.636-.247 1.363.416 2.427.465C9.53 2.013 9.884 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm5.25-9.75a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" fill-rule="evenodd"></path>
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-40">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            className="flex flex-col gap-8 text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter text-secondary-900">
              Your Personal Therapy Companion
            </h1>
            <p className="text-lg md:text-xl text-secondary-600 max-w-xl mx-auto md:mx-0">
              Connect with our AI-powered therapy bot for personalized support and guidance, anytime, anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-6">
              <motion.button
                onClick={showAuthModal}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-primary-500 text-white text-lg font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-all duration-300 ease-in-out transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="truncate">Get Started For Free</span>
              </motion.button>
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-white/50 text-secondary-700 text-lg font-bold hover:bg-white/80 transition-all duration-300 border border-secondary-200">
                <span className="truncate">Learn More</span>
              </button>
            </div>
          </motion.div>

          <motion.div
            className="relative h-96 w-full"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-200 to-primary-400 rounded-3xl transform -rotate-3 shadow-2xl"></div>
            <img
              alt="Therapy session illustration"
              className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-2xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8_5vhlNDAgIuACYC5Q3hdfWPUFtcaZdPudamg9alF-EbnyuVp_roPTIjjX7DVCgRYHhGKiNizEly9EhTxHSFdxItKwvfG1twSBCQH7GntjBKLYq61KwQD3WKACx3Su5C83F_h8Yyxf28jR15rKZkgpo6BtAB1uSjI5mx-IOLchO9gZwSQWh0ZRGX4aazZdwbqCYtmsfa3NV-OQ7xFfqQD7rDDrYhfZMOkUAc2GvBCMgz4zPkjo_4drPDRqFLnjiVIZN6Bc5wiUtNb"
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
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-gradient-to-br from-primary-100 via-white to-primary-50">

      {/* Header */}
      <ModernHeader showAuthModal={handleShowAuthModal} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection showAuthModal={handleShowAuthModal} />

        {/* Features Section */}
        <FeaturesSection />

        {/* Therapy Journey Section */}
        <TherapyJourneySection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* How It Works Section */}
        <HowItWorksSection />
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