'use client'

import React from 'react'
import Hero from '@/components/design-concepts/concept-2/Hero'
import { Navigation } from '@/components/ui/Navigation'

export default function Concept2Page() {
    return (
        <main className="min-h-screen bg-[#F0F9F4] font-sans text-[#113531]">
            <Navigation />
            <Hero />

            <section className="py-24 px-4 bg-white rounded-t-[3rem] -mt-12 relative z-20 shadow-lg shadow-black/5">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#113531]">Why Choose MindWell?</h2>
                        <p className="text-[#64748B] max-w-2xl mx-auto">
                            We combine clinical expertise with modern technology to provide a supportive environment for your mental health journey.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Evidence Based", icon: "psychology", color: "bg-[#D7EEEA]" },
                            { title: "Secure & Private", icon: "lock", color: "bg-[#C8D6F0]" },
                            { title: "Always Available", icon: "schedule", color: "bg-[#F0F9F4]" }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-white border border-slate-100 hover:shadow-xl hover:shadow-[#2E7D74]/5 transition-all duration-300 group">
                                <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <span className="material-symbols-outlined text-2xl text-[#113531]">{item.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#113531]">{item.title}</h3>
                                <p className="text-[#64748B]">
                                    Designed to help you thrive with tools that adapt to your unique needs and schedule.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}
