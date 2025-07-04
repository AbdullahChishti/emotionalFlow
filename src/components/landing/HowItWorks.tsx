'use client'

import { motion, Variants } from 'framer-motion'
import { UserPlus, Ear, MessageSquareHeart } from 'lucide-react'

const steps = [
  {
    icon: <UserPlus className="w-10 h-10 text-purple-500" />,
    title: 'Create Your Account',
    description: 'Join our community with a simple and secure sign-up process.',
  },
  {
    icon: <MessageSquareHeart className="w-10 h-10 text-rose-500" />,
    title: 'Connect with a Listener',
    description: 'Get matched with a trained, empathetic listener ready to hear you out.',
  },
  {
    icon: <Ear className="w-10 h-10 text-amber-500" />,
    title: 'Start Your Conversation',
    description: 'Share what’s on your mind in a safe, non-judgmental space.',
  },
]

export function HowItWorks() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  }

  return (
    <section className="py-20 sm:py-28 bg-white/50 backdrop-blur-lg">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-800">How It Works</h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-zinc-600">
            A simple path to feeling understood.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {steps.map((step, index) => (
            <motion.div key={index} className="flex flex-col items-center" variants={itemVariants}>
              <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-white to-gray-100 rounded-full shadow-md mb-6 border border-gray-200">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-zinc-800 mb-2">{step.title}</h3>
              <p className="text-zinc-600 max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
