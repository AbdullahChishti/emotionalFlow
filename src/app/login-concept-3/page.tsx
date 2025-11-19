'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import 'material-symbols/outlined.css'

export default function LoginConcept3() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex">
            {/* Left side - Illustration/Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0071E3] to-[#005BB5] items-center justify-center overflow-hidden">
                {/* Animated background elements */}
                <motion.div
                    className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Content */}
                <div className="relative z-10 text-center px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <span className="material-symbols-outlined text-6xl text-white">psychology_alt</span>
                        </div>
                        <h2 className="text-4xl font-medium text-white mb-4">MindWell</h2>
                        <p className="text-xl text-white/80 font-light leading-relaxed">
                            Your journey to mental wellness starts here
                        </p>

                        {/* Decorative dots */}
                        <div className="flex justify-center gap-2 mt-12">
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 bg-white/40 rounded-full"
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.4, 0.8, 0.4],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.3,
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 relative">
                {/* Back button */}
                <Link href="/" className="absolute top-6 left-6">
                    <motion.button
                        whileHover={{ x: -2 }}
                        className="flex items-center gap-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        <span className="text-sm font-normal">Back to Home</span>
                    </motion.button>
                </Link>

                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="bg-white rounded-3xl p-10 shadow-sm border border-[#E8E8ED]">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#0071E3] to-[#005BB5] rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl text-white">lock</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-medium text-[#1D1D1F]">Sign In</h1>
                                    <p className="text-sm text-[#86868B]">to continue to MindWell</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form className="space-y-5">
                            <div>
                                <Label htmlFor="email" className="mb-2 block">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="/forgot-password" className="text-xs text-[#0071E3] hover:text-[#0077ED] transition-colors">
                                        Forgot?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="remember" className="rounded w-4 h-4 text-[#0071E3] border-[#D2D2D7]" />
                                <label htmlFor="remember" className="text-sm text-[#86868B] cursor-pointer">
                                    Keep me signed in
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                            >
                                Sign In
                            </Button>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[#E8E8ED]"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-white px-2 text-[#86868B]">New to MindWell?</span>
                                </div>
                            </div>

                            {/* Sign up button */}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                size="lg"
                            >
                                Create an account
                            </Button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-[#A1A1A6] mt-6">
                        Protected by industry-standard encryption
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
