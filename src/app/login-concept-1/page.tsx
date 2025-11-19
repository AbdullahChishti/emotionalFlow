'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import 'material-symbols/outlined.css'

export default function LoginConcept1() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb]">
            {/* Animated floating shapes */}
            <motion.div
                className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                animate={{
                    y: [0, -30, 0],
                    x: [0, 20, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                animate={{
                    y: [0, 30, 0],
                    x: [0, -20, 0],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl"
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Back button */}
            <Link href="/" className="absolute top-6 left-6 z-20">
                <motion.button
                    whileHover={{ x: -2 }}
                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    <span className="text-sm font-normal">Back to Home</span>
                </motion.button>
            </Link>

            {/* Main content */}
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Glassmorphic card */}
                    <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl pointer-events-none" />

                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-white">psychology_alt</span>
                                </div>
                            </div>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-medium text-white mb-2">Welcome Back</h1>
                                <p className="text-white/80 font-light">Continue your wellness journey</p>
                            </div>

                            {/* Form */}
                            <form className="space-y-5">
                                <div>
                                    <Label htmlFor="email" className="mb-2 block text-white/90">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="password" className="mb-2 block text-white/90">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm"
                                    />
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer text-white/90">
                                        <input type="checkbox" className="rounded bg-white/20 border-white/30" />
                                        <span>Remember me</span>
                                    </label>
                                    <Link href="/forgot-password" className="text-white hover:text-white/80 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-white text-[#667eea] hover:bg-white/90"
                                    size="lg"
                                >
                                    Sign In
                                </Button>
                            </form>

                            {/* Sign up link */}
                            <p className="mt-6 text-center text-sm text-white/80">
                                Don't have an account?{' '}
                                <Link href="/signup" className="text-white font-medium hover:text-white/80 transition-colors">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
