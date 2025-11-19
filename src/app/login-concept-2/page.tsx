'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import 'material-symbols/outlined.css'

export default function LoginConcept2() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#faf8f3] to-[#e8e5df]">
            {/* Organic flowing shapes */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <motion.path
                    d="M0,100 Q150,50 300,100 T600,100 T900,100 T1200,100 L1200,0 L0,0 Z"
                    fill="url(#gradient1)"
                    initial={{ d: "M0,100 Q150,50 300,100 T600,100 T900,100 T1200,100 L1200,0 L0,0 Z" }}
                    animate={{ d: "M0,120 Q150,70 300,120 T600,120 T900,120 T1200,120 L1200,0 L0,0 Z" }}
                    transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                />
                <motion.path
                    d="M0,300 Q200,250 400,300 T800,300 T1200,300 L1200,600 L0,600 Z"
                    fill="url(#gradient2)"
                    initial={{ d: "M0,300 Q200,250 400,300 T800,300 T1200,300 L1200,600 L0,600 Z" }}
                    animate={{ d: "M0,280 Q200,230 400,280 T800,280 T1200,280 L1200,600 L0,600 Z" }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                />
                <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a8c09a" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#c9b8db" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#c9b8db" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#a8c09a" stopOpacity="0.3" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Floating organic circles */}
            <motion.div
                className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-[#a8c09a]/20 to-[#c9b8db]/20 blur-2xl"
                animate={{
                    y: [0, -20, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Back button */}
            <Link href="/" className="absolute top-6 left-6 z-20">
                <motion.button
                    whileHover={{ x: -2 }}
                    className="flex items-center gap-2 text-[#4a4a4a] hover:text-[#1D1D1F] transition-colors"
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
                    {/* Card with organic shadow */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
                        {/* Organic accent shape */}
                        <div className="flex justify-center mb-6">
                            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                                <motion.path
                                    d="M30 5 Q45 10 50 25 Q55 40 40 50 Q25 55 15 45 Q5 35 10 20 Q15 10 30 5 Z"
                                    fill="url(#organicGradient)"
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <defs>
                                    <linearGradient id="organicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#a8c09a" />
                                        <stop offset="100%" stopColor="#c9b8db" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-medium text-[#4a4a4a] mb-2">Welcome Back</h1>
                            <p className="text-[#86868B] font-light">Your mindful space awaits</p>
                        </div>

                        {/* Form */}
                        <form className="space-y-5">
                            <div>
                                <Label htmlFor="email" className="mb-2 block">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="border-[#d6e4e9] focus:border-[#a8c09a]"
                                />
                            </div>

                            <div>
                                <Label htmlFor="password" className="mb-2 block">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="border-[#d6e4e9] focus:border-[#a8c09a]"
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer text-[#4a4a4a]">
                                    <input type="checkbox" className="rounded border-[#d6e4e9]" />
                                    <span>Remember me</span>
                                </label>
                                <Link href="/forgot-password" className="text-[#a8c09a] hover:text-[#8da87e] transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#a8c09a] to-[#8da87e] hover:from-[#8da87e] hover:to-[#a8c09a]"
                                size="lg"
                            >
                                Sign In
                            </Button>
                        </form>

                        {/* Sign up link */}
                        <p className="mt-6 text-center text-sm text-[#86868B]">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-[#a8c09a] font-medium hover:text-[#8da87e] transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
