'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F0F9F4]">
            {/* Organic background shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -top-20 -left-20 w-96 h-96 bg-[#D7EEEA] rounded-full mix-blend-multiply filter blur-3xl opacity-70"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, 40, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-40 -right-20 w-96 h-96 bg-[#C8D6F0] rounded-full mix-blend-multiply filter blur-3xl opacity-70"
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-left"
                    >
                        <div className="inline-block px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full text-[#2E7D74] font-medium text-sm mb-6 shadow-sm">
                            Mental Wellness Reimagined
                        </div>
                        <h1 className="text-5xl md:text-6xl font-sans font-bold text-[#113531] mb-6 leading-tight">
                            Growth begins with <br />
                            <span className="text-[#2E7D74]">understanding.</span>
                        </h1>
                        <p className="text-lg text-[#475569] mb-8 leading-relaxed max-w-lg">
                            A safe, supportive environment to explore your emotions and build resilience.
                            Start your journey to a healthier mind today.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Button
                                size="lg"
                                className="bg-[#2E7D74] hover:bg-[#24685F] text-white rounded-2xl px-8 py-6 shadow-lg shadow-[#2E7D74]/20 transition-all duration-300 hover:-translate-y-1"
                            >
                                Get Started
                            </Button>
                            <Button
                                variant="ghost"
                                size="lg"
                                className="text-[#2E7D74] hover:bg-[#2E7D74]/10 rounded-2xl px-8 py-6"
                            >
                                How it works
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="relative"
                    >
                        {/* Abstract representation of growth/calm */}
                        <div className="relative aspect-square rounded-[2rem] bg-white shadow-2xl shadow-[#2E7D74]/10 overflow-hidden p-8 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-white to-[#F0F9F4]"></div>
                            {/* Placeholder for a nice illustration or 3D element */}
                            <div className="relative z-10 text-center">
                                <div className="w-32 h-32 bg-[#D7EEEA] rounded-full mx-auto mb-6 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-5xl text-[#2E7D74]">spa</span>
                                </div>
                                <h3 className="text-xl font-semibold text-[#113531] mb-2">Daily Reflection</h3>
                                <p className="text-[#64748B]">Small steps lead to big changes.</p>
                            </div>
                        </div>

                        {/* Floating cards */}
                        <motion.div
                            className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl shadow-[#2E7D74]/10 flex items-center gap-3"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <div className="w-10 h-10 bg-[#C8D6F0] rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#1E293B]">favorite</span>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-[#113531]">Self Care</div>
                                <div className="text-xs text-[#64748B]">Priority #1</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
