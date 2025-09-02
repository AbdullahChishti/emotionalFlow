'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const communityStats = [
  { label: 'Active Members', value: '2,847', icon: 'people', color: 'text-blue-600' },
  { label: 'Sessions Today', value: '156', icon: 'chat', color: 'text-green-600' },
  { label: 'Credits Shared', value: '12,340', icon: 'volunteer_activism', color: 'text-purple-600' },
  { label: 'Stories Shared', value: '891', icon: 'history_edu', color: 'text-orange-600' }
]

const communityStories = [
  {
    id: 1,
    title: 'Finding Strength Through Connection',
    excerpt: 'After feeling isolated for months, connecting with someone who truly listened made all the difference...',
    author: 'Anonymous',
    timeAgo: '2 hours ago',
    category: 'Connection',
    likes: 24,
    comments: 8
  },
  {
    id: 2,
    title: 'The Power of Daily Check-ins',
    excerpt: 'Starting my day with a simple mood check-in helped me recognize patterns I never noticed before...',
    author: 'Anonymous',
    timeAgo: '5 hours ago',
    category: 'Growth',
    likes: 31,
    comments: 12
  },
  {
    id: 3,
    title: 'Breaking the Silence',
    excerpt: 'For the first time, I felt safe sharing my struggles. The empathy I received was life-changing...',
    author: 'Anonymous',
    timeAgo: '1 day ago',
    category: 'Support',
    likes: 45,
    comments: 16
  }
]

const communityGuidelines = [
  {
    icon: 'heart_plus',
    title: 'Be Kind & Empathetic',
    description: 'Always approach conversations with compassion and understanding'
  },
  {
    icon: 'verified_user',
    title: 'Respect Privacy',
    description: 'Keep shared experiences confidential and respect anonymity choices'
  },
  {
    icon: 'psychology',
    title: 'Practice Active Listening',
    description: 'Focus on understanding rather than just responding'
  },
  {
    icon: 'self_improvement',
    title: 'Encourage Growth',
    description: 'Support others in their journey of emotional well-being'
  },
  {
    icon: 'warning',
    title: 'Know Your Limits',
    description: 'Recognize when to suggest professional help or crisis resources'
  },
  {
    icon: 'diversity_3',
    title: 'Celebrate Diversity',
    description: 'Embrace different experiences and perspectives'
  }
]

const peerSupportOptions = [
  {
    type: 'Support Group',
    title: 'Anxiety & Worry Circle',
    participants: 12,
    nextSession: 'Tomorrow 7:00 PM',
    description: 'Weekly peer-led discussion for managing anxiety',
    category: 'Weekly'
  },
  {
    type: 'Study Session',
    title: 'Emotional Intelligence Workshop',
    participants: 8,
    nextSession: 'Friday 6:30 PM',
    description: 'Learn practical skills for better emotional awareness',
    category: 'Workshop'
  },
  {
    type: 'Walking Group',
    title: 'Mindful Movement',
    participants: 15,
    nextSession: 'Saturday 9:00 AM',
    description: 'Gentle walking and mindfulness in nature',
    category: 'Outdoor'
  }
]

export function CommunityScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [showGuidelines, setShowGuidelines] = useState(false)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'stories', label: 'Stories', icon: 'history_edu' },
    { id: 'connect', label: 'Connect', icon: 'people' },
    { id: 'guidelines', label: 'Guidelines', icon: 'gavel' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Community Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {communityStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-3 bg-current/10`}>
                    <span className="material-symbols-outlined text-2xl text-current">
                      {stat.icon}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-secondary-800 mb-1">{stat.value}</div>
                  <div className="text-sm text-secondary-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Recent Community Stories */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-800">Recent Community Stories</h3>
                <button
                  onClick={() => setActiveTab('stories')}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-4">
                {communityStories.slice(0, 2).map((story, index) => (
                  <motion.div
                    key={story.id}
                    className="bg-white/40 rounded-2xl p-4 hover:bg-white/60 transition-colors cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-lg">
                          {story.category === 'Connection' ? 'people' : story.category === 'Growth' ? 'trending_up' : 'favorite'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                            {story.category}
                          </span>
                          <span className="text-xs text-secondary-500">{story.timeAgo}</span>
                        </div>
                        <h4 className="font-semibold text-secondary-800 mb-1">{story.title}</h4>
                        <p className="text-secondary-600 text-sm leading-relaxed">{story.excerpt}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-secondary-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">favorite</span>
                            {story.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">chat</span>
                            {story.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                onClick={() => router.push('/session')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl p-6 text-left shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">chat</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Start a Session</h3>
                    <p className="text-green-100 text-sm">Connect with someone who cares</p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                onClick={() => router.push('/wellness')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-6 text-left shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">spa</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Daily Wellness</h3>
                    <p className="text-blue-100 text-sm">Check-in and find peace</p>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )

      case 'stories':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-secondary-800 mb-2">Community Stories</h2>
              <p className="text-secondary-600">Real experiences from our community members</p>
            </div>

            {communityStories.map((story, index) => (
              <motion.div
                key={story.id}
                className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-white text-xl">
                      {story.category === 'Connection' ? 'people' : story.category === 'Growth' ? 'trending_up' : 'favorite'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                        {story.category}
                      </span>
                      <span className="text-sm text-secondary-500">{story.timeAgo}</span>
                    </div>
                    <h3 className="text-xl font-bold text-secondary-800 mb-3">{story.title}</h3>
                    <p className="text-secondary-600 leading-relaxed mb-4">{story.excerpt}</p>
                    <div className="flex items-center gap-6 text-sm text-secondary-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">favorite</span>
                        {story.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">chat</span>
                        {story.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">share</span>
                        Share
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )

      case 'connect':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-secondary-800 mb-2">Connect with Others</h2>
              <p className="text-secondary-600">Join peer support groups and community activities</p>
            </div>

            {peerSupportOptions.map((option, index) => (
              <motion.div
                key={index}
                className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-white text-xl">
                      {option.type === 'Support Group' ? 'groups' : option.type === 'Study Session' ? 'school' : 'directions_walk'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                        {option.category}
                      </span>
                      <span className="text-sm text-secondary-500">{option.participants} participants</span>
                    </div>
                    <h3 className="text-lg font-bold text-secondary-800 mb-1">{option.title}</h3>
                    <p className="text-secondary-600 text-sm leading-relaxed mb-3">{option.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary-600">{option.nextSession}</span>
                      <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                        Join Group
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-3xl p-6">
              <h3 className="font-bold text-secondary-800 mb-2">Want to start your own group?</h3>
              <p className="text-secondary-600 text-sm mb-4">
                Create a peer support group focused on your interests and experiences.
              </p>
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors">
                Start a Group
              </button>
            </div>
          </motion.div>
        )

      case 'guidelines':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-secondary-800 mb-2">Community Guidelines</h2>
              <p className="text-secondary-600">Our shared values for creating a supportive community</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communityGuidelines.map((guideline, index) => (
                <motion.div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-white text-xl">
                      {guideline.icon}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-secondary-800 mb-2">{guideline.title}</h3>
                  <p className="text-secondary-600 text-sm leading-relaxed">{guideline.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-amber-600">info</span>
                <span className="font-semibold text-amber-800">Need Help?</span>
              </div>
              <p className="text-amber-700 text-sm mb-4">
                If you encounter behavior that violates these guidelines or makes you uncomfortable,
                please report it immediately. Our community team is here to help.
              </p>
              <button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors">
                Report an Issue
              </button>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-100 via-white to-primary-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            top: '10%',
            left: '10%'
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      <div className="min-h-screen p-4 relative">
        <motion.div
          className="max-w-6xl mx-auto"
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
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl text-white">people</span>
            </div>
            <h1 className="text-4xl font-bold text-secondary-800 mb-4">Our Community</h1>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto leading-relaxed">
              You're not alone. Connect with others who understand, share your journey, and grow together.
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 border border-white/50">
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-secondary-600 hover:bg-white/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>

          {/* Community Impact */}
          <motion.div
            className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-secondary-800 mb-4">Making a Difference Together</h3>
            <p className="text-secondary-600 max-w-2xl mx-auto leading-relaxed mb-6">
              Every conversation, every check-in, every act of kindness contributes to a more compassionate world.
              Your participation matters and creates ripples of positive change.
            </p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">1,247</div>
                <div className="text-sm text-secondary-600">Lives Touched</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">89%</div>
                <div className="text-sm text-secondary-600">Report Feeling Better</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">4.8/5</div>
                <div className="text-sm text-secondary-600">Average Rating</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
