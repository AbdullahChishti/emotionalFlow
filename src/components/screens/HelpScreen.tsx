'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import 'material-symbols/outlined.css'

const faqs = [
  {
    question: "How does the empathy credit system work?",
    answer: "You earn empathy credits by listening to others and providing support. You can spend these credits to receive support from the community. The system encourages reciprocal emotional support."
  },
  {
    question: "What should I do if I'm in crisis?",
    answer: "If you're in crisis, please use our Crisis Support feature immediately. You can access it from the navigation or the red alert button in the header. We're here 24/7 for urgent situations."
  },
  {
    question: "How do I start a session?",
    answer: "You can start a session in several ways: 1) Use the Quick Actions on your dashboard, 2) Go to the Therapy page, or 3) Complete a daily check-in and follow the recommended actions based on your mood."
  },
  {
    question: "Is my information private?",
    answer: "Yes, your privacy is our top priority. You can choose to remain anonymous in sessions, and all conversations are confidential. We follow strict privacy guidelines and data protection standards."
  },
  {
    question: "What if I need to cancel a session?",
    answer: "You can end a session at any time. If you started the session, you'll receive your empathy credits back. Please be mindful of others' time when canceling last-minute."
  },
  {
    question: "How do I change my preferences?",
    answer: "Visit your Profile page to update your preferences, including your preferred support mode (therapist-style or friend-style), emotional capacity, and anonymity settings."
  },
  {
    question: "What happens if I run out of empathy credits?",
    answer: "If you run out of credits, you can earn more by listening to others. You can also check out our meditation library or complete daily check-ins to maintain your emotional wellness."
  },
  {
    question: "How do I report inappropriate behavior?",
    answer: "If you encounter inappropriate behavior, please use the report feature during or after a session. Our community guidelines team will review the situation promptly."
  }
]

const guides = [
  {
    title: "Getting Started",
    icon: "rocket_launch",
    steps: [
      "Complete your onboarding to set your preferences",
      "Do your first daily check-in to establish your baseline",
      "Explore the meditation library to build coping skills",
      "Start your first listening or support session"
    ]
  },
  {
    title: "Daily Check-ins",
    icon: "calendar_today",
    steps: [
      "Check in daily to track your emotional patterns",
      "Use the mood slider to record how you're feeling",
      "Add journal entries to process your thoughts",
      "Follow personalized action recommendations"
    ]
  },
  {
    title: "Session Best Practices",
    icon: "chat",
    steps: [
      "Be honest about what you need from the session",
      "Listen actively and show empathy when supporting others",
      "Set boundaries and communicate your capacity",
      "End sessions respectfully when they're complete"
    ]
  },
  {
    title: "Building Emotional Capacity",
    icon: "psychology",
    steps: [
      "Start with shorter sessions if you're new",
      "Use meditation to build self-awareness",
      "Track your emotional capacity in your profile",
      "Take breaks when you need them"
    ]
  }
]

const emergencyContacts = [
  {
    name: "National Suicide Prevention Lifeline",
    number: "988",
    description: "24/7 support for anyone in crisis",
    website: "https://988lifeline.org"
  },
  {
    name: "Crisis Text Line",
    number: "Text HOME to 741741",
    description: "Free, 24/7 crisis counseling via text",
    website: "https://www.crisistextline.org"
  },
  {
    name: "International Association for Suicide Prevention",
    description: "Find local crisis resources worldwide",
    website: "https://www.iasp.info/resources/Crisis_Centres"
  }
]

export function HelpScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'faq' | 'guides' | 'tutorial' | 'emergency'>('faq')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: 'help' },
    { id: 'guides', label: 'Guides', icon: 'menu_book' },
    { id: 'tutorial', label: 'Tutorial', icon: 'school' },
    { id: 'emergency', label: 'Emergency', icon: 'emergency' }
  ]

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-100 via-white to-primary-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 250,
            height: 250,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
            top: '15%',
            left: '10%'
          }}
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      <div className="min-h-screen p-4 relative">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl text-white">help_center</span>
            </div>
            <h1 className="text-3xl font-bold text-secondary-800">Help & Support</h1>
            <p className="text-secondary-600 mt-2">Find answers to your questions and get the support you need</p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 border border-white/50">
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'text-white shadow-lg'
                        : 'text-secondary-600 hover:bg-white/50'
                    }`}
                    className={`${activeTab === tab.id ? 'bg-emerald-600' : ''}`}
                  >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'faq' && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-secondary-800 mb-6">Frequently Asked Questions</h2>
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/30 transition-colors"
                    >
                      <span className="font-semibold text-secondary-800">{faq.question}</span>
                      <motion.span
                        className="material-symbols-outlined text-secondary-600"
                        animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        expand_more
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {expandedFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-4"
                        >
                          <p className="text-secondary-600 leading-relaxed">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'guides' && (
              <motion.div
                key="guides"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <h2 className="text-2xl font-bold text-secondary-800 mb-6 col-span-full">User Guides</h2>
                {guides.map((guide, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary-600">{guide.icon}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-secondary-800">{guide.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-3">
                          <span className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-primary-600">{stepIndex + 1}</span>
                          </span>
                          <span className="text-secondary-600 text-sm">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'tutorial' && (
              <motion.div
                key="tutorial"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-secondary-800 mb-2">MindWell Tutorial</h2>
                  <p className="text-secondary-600">Learn how to make the most of your experience</p>
                </div>

                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-3xl p-8">
                  <h3 className="text-xl font-bold text-secondary-800 mb-4">What would you like to learn about?</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => router.push('/assessments')}
                      className="p-4 bg-white/60 rounded-2xl hover:bg-white/80 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-primary-600">assessment</span>
                        <span className="font-semibold text-secondary-800">Assessments</span>
                      </div>
                      <p className="text-sm text-secondary-600">Track your mental health journey</p>
                    </button>

                    <button
                      onClick={() => router.push('/session')}
                      className="p-4 bg-white/60 rounded-2xl hover:bg-white/80 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-primary-600">chat</span>
                        <span className="font-semibold text-secondary-800">Sessions</span>
                      </div>
                      <p className="text-sm text-secondary-600">How to start and manage conversations</p>
                    </button>

                    <button
                      onClick={() => router.push('/check-in')}
                      className="p-4 bg-white/60 rounded-2xl hover:bg-white/80 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-primary-600">sentiment_satisfied</span>
                        <span className="font-semibold text-secondary-800">Daily Check-ins</span>
                      </div>
                      <p className="text-sm text-secondary-600">Building emotional awareness habits</p>
                    </button>

                    <button
                      onClick={() => router.push('/crisis-support')}
                      className="p-4 bg-white/60 rounded-2xl hover:bg-white/80 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-primary-600">verified_user</span>
                        <span className="font-semibold text-secondary-800">Safety & Privacy</span>
                      </div>
                      <p className="text-sm text-secondary-600">Your well-being and privacy matter</p>
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-amber-600">lightbulb</span>
                    <span className="font-semibold text-amber-800">Pro Tip</span>
                  </div>
                  <p className="text-amber-700 text-sm">
                    The best way to learn is by doing! Try each feature and explore at your own pace.
                    Remember, there's no "right" way to use MindWell - it's about what works for you.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'emergency' && (
              <motion.div
                key="emergency"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-2xl text-white">emergency</span>
                  </div>
                  <h2 className="text-2xl font-bold text-secondary-800 mb-4">Emergency Resources</h2>
                  <p className="text-secondary-600 max-w-2xl mx-auto">
                    If you're in crisis or having thoughts of self-harm, please reach out immediately.
                    These resources are available 24/7 and can provide immediate support.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {emergencyContacts.map((contact, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h3 className="font-semibold text-secondary-800 mb-2">{contact.name}</h3>
                      <p className="text-lg font-bold text-primary-600 mb-2">{contact.number}</p>
                      <p className="text-sm text-secondary-600 mb-4">{contact.description}</p>
                      <a
                        href={contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 hover:bg-primary-200 rounded-lg text-primary-700 text-sm font-medium transition-colors"
                      >
                        <span>Visit Website</span>
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </a>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="bg-red-50/80 backdrop-blur-sm rounded-2xl p-6 border border-red-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-600">warning</span>
                    </div>
                    <h3 className="font-semibold text-red-800">Important Notice</h3>
                  </div>
                  <p className="text-red-700 text-sm leading-relaxed">
                    MindWell is not a crisis intervention service. If you or someone you know is in immediate danger,
                    please call emergency services (911 in the US) or go to the nearest emergency room.
                    The resources listed above can provide additional support.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>


        </motion.div>
      </div>
    </div>
  )
}
