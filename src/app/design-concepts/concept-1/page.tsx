'use client'

import React from 'react'
import Hero from '@/components/design-concepts/concept-1/Hero'
import { Navigation } from '@/components/ui/Navigation'

export default function Concept1Page() {
    return (
        <main className="min-h-screen bg-[#FAFAFA] font-sans text-[#1D1D1F]">
            <Navigation />
            <Hero />

            <section className="py-32 px-6 bg-white">
                <div className="container mx-auto max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-medium mb-6 tracking-tight">Essential.</h2>
                            <p className="text-xl text-[#86868B] leading-relaxed font-light">
                                We stripped away the noise to focus on what truly matters: your state of mind.
                                Every interaction is designed to be frictionless, allowing you to access support the moment you need it.
                            </p>
                        </div>
                        <div className="aspect-square rounded-[2rem] bg-[#F5F5F7] flex items-center justify-center">
                            {/* Placeholder for a high-fidelity, simple UI mock or abstract form */}
                            <div className="w-32 h-32 rounded-full bg-white shadow-lg opacity-50"></div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
