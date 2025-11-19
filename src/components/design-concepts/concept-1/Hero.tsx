'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export default function Hero() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] overflow-hidden">

            {/* The "Product" - A single, perfect, breathing circle representing the mind */}
            <motion.div
                className="absolute w-[60vh] h-[60vh] rounded-full bg-gradient-to-b from-white to-[#F0F0F0] shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                    scale: 1,
                    opacity: 1,
                    y: [0, -10, 0]
                }}
                transition={{
                    scale: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 1.5, ease: "easeOut" },
                    y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
            />

            <div className="relative z-10 text-center max-w-3xl px-6">
                <motion.h1
                    className="text-5xl md:text-7xl font-medium tracking-tight text-[#1D1D1F] mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                    Clarity.
                </motion.h1>

                <motion.p
                    className="text-xl md:text-2xl text-[#86868B] font-normal leading-relaxed mb-12 tracking-wide"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                    A space designed to listen. <br className="hidden md:block" />
                    Profoundly simple mental health support.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Button
                        className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-full px-8 py-6 text-lg font-normal transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        Begin Journey
                    </Button>
                </motion.div>
            </div>
        </section>
    )
}
