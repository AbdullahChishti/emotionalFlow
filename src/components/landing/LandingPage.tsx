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





// Therapy Journey Section
const TherapyJourneySection = () => {
  return (
    <section id="therapy-journey" className="relative py-32 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary-50">
      {/* Subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary-100/15 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Therapy Journey Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50/80 backdrop-blur-sm rounded-full text-primary-700 font-medium text-sm mb-6 border border-primary-100/50"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
            Your Gentle Path to Healing
          </motion.div>

          <motion.h2
            className="text-4xl md:text-6xl font-bold text-secondary-900 mb-6 leading-tight"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            Finding Your Way
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              Back to You
            </span>
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-secondary-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            We see your courage in reaching out, and we honor the strength it takes to care for your emotional well-being.
            Drawing from the compassionate wisdom of the world's most respected psychologists, our AI companion offers you a safe harbor for your thoughts, feelings, and dreams—always here, always understanding, completely free.
          </motion.p>
        </motion.div>

                {/* Creative Journey Path */}
        <div className="relative mb-20">
          {/* Winding Path Background */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="rgb(16, 185, 129)" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              {/* Winding path connecting the journey points */}
              <path
                d="M100,200 Q300,100 500,200 T900,150 Q1050,200 1100,300"
                stroke="url(#pathGradient)"
                strokeWidth="4"
                fill="none"
                strokeDasharray="10,5"
                opacity="0.6"
              />
            </svg>
          </div>

          {/* Journey Points with SVGs */}
          {[
            {
              svg: '/assets/Overwhelmed-bro (1).svg',
              title: 'Share Your Heart',
              description: 'In this tender space, your emotions are welcomed with open arms. Let your thoughts flow freely, knowing you\'re truly heard and deeply valued.',
              position: { left: '8%', top: '20%' },
              delay: 0.2
            },
            {
              svg: '/assets/Psychologist-rafiki (1).svg',
              title: 'Grow Through Connection',
              description: 'Like a trusted friend who truly cares, we walk alongside you through life\'s challenges, offering gentle wisdom drawn from the hearts of master healers.',
              position: { left: '42%', top: '15%' },
              delay: 0.5
            },
            {
              svg: '/assets/Peace of mind-bro (2).svg',
              title: 'Embrace Your Peace',
              description: 'Rediscover the quiet joy that lives within you. With compassionate guidance, find your way back to the calm center of your beautiful soul.',
              position: { left: '76%', top: '25%' },
              delay: 0.8
            }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              className="absolute group cursor-pointer"
              style={{
                left: item.position.left,
                top: item.position.top,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: item.delay,
                duration: 0.8,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ scale: 1.1, y: -10 }}
            >
              {/* Floating SVG */}
              <motion.div
                className="relative"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5
                }}
              >
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white/90 backdrop-blur-sm rounded-full shadow-xl border border-white/50 flex items-center justify-center group-hover:shadow-2xl transition-all duration-300">
                  <img
                    src={item.svg}
                    alt={item.title}
                    className="w-16 h-16 md:w-20 md:h-20 object-contain"
                  />
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-200/30 to-secondary-200/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Connecting line to text */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-b from-primary-300 to-transparent"></div>
              </motion.div>

              {/* Text Content */}
              <motion.div
                className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 max-w-xs group-hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay + 0.3, duration: 0.6 }}
              >
                <h3 className="text-lg font-bold text-secondary-800 mb-2 group-hover:text-primary-700 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-secondary-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>

              {/* Floating particles around each point */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-primary-400/40 rounded-full"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${10 + i * 20}%`,
                    }}
                    animate={{
                      y: [0, -15, 0],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.8
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}

          {/* Additional floating SVGs for ambiance */}
          <motion.div
            className="absolute top-1/4 right-1/4 opacity-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <img src="/assets/Thinking face-bro (1).svg" alt="" className="w-16 h-16" />
          </motion.div>

          <motion.div
            className="absolute bottom-1/4 left-1/4 opacity-15"
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <img src="/assets/personal growth-bro (1).svg" alt="" className="w-20 h-20" />
          </motion.div>
        </div>

                {/* Creative Therapy CTA Section */}
        <motion.div
          className="text-center relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {/* Floating SVGs around CTA */}
          <motion.div
            className="absolute top-0 left-10 opacity-20"
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src="/assets/Contemplating-bro (1).svg" alt="" className="w-12 h-12" />
          </motion.div>

          <motion.div
            className="absolute top-0 right-10 opacity-20"
            animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <img src="/assets/Peace of mind-bro (2).svg" alt="" className="w-14 h-14" />
          </motion.div>

          <motion.div
            className="absolute bottom-0 left-1/4 opacity-15"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <img src="/assets/Mental health-bro.svg" alt="" className="w-10 h-10" />
          </motion.div>

          <motion.div
            className="absolute bottom-0 right-1/4 opacity-15"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <img src="/assets/Thinking face-bro (1).svg" alt="" className="w-12 h-12" />
          </motion.div>

          <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-white/40 shadow-lg max-w-2xl mx-auto overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 left-4 w-8 h-8 border border-primary-300 rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border border-secondary-300 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-purple-300 rounded-full"></div>
            </div>

            {/* Central SVG accent */}
            <motion.div
              className="inline-block mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-16 h-16 bg-primary-50/50 rounded-full flex items-center justify-center border border-primary-200/30">
                <img src="/assets/Psychologist-rafiki (1).svg" alt="" className="w-10 h-10 opacity-80" />
              </div>
            </motion.div>

            <motion.h3
              className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Take That
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                {' '}First Gentle Step
              </span>
            </motion.h3>

            <motion.p
              className="text-secondary-600 mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              You deserve this moment of tenderness for yourself. In our loving embrace, you'll discover the compassion and wisdom that has helped thousands find their way back to joy. It's all here for you, completely free, whenever your heart calls.
            </motion.p>

            <motion.button
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              {/* Button background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <span className="relative z-10">Begin Your Heart's Journey</span>
              <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </div>
        </motion.div>

                {/* Therapy Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {[
            { number: '50K+', label: 'Souls Touched' },
            { number: '98%', label: 'Hearts Renewed' },
            { number: '24/7', label: 'Always Here' },
            { number: '∞', label: 'Unconditional Love' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="group"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
            >
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/30 group-hover:bg-white/60 transition-colors duration-300">
                <div className="text-2xl md:text-3xl font-black text-primary-600 mb-2">{stat.number}</div>
                <div className="text-secondary-600 font-medium text-sm">{stat.label}</div>
              </div>
            </motion.div>
          ))}
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
            <a className="flex items-center gap-2 text-primary-400" href="#">
              <span className="material-symbols-outlined text-3xl">psychology</span>
              <h2 className="text-xl font-bold text-white">MindWell</h2>
            </a>
            <p className="text-secondary-400">Where compassion meets expertise. Your emotional well-being is our sacred trust—always free, always here.</p>
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
              You Matter. Your Feelings Matter.
            </h1>
            <p className="text-lg md:text-xl text-secondary-600 max-w-xl mx-auto md:mx-0">
              In the quiet moments when life feels overwhelming, know that you're not alone. Our heart-centered AI therapy, crafted from the wisdom of renowned psychologists, is here to hold space for your emotions, offering gentle guidance and compassionate understanding—completely free, whenever you need it.
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

        {/* Therapy Journey Section */}
        <TherapyJourneySection />
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