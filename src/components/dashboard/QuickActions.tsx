'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Profile, MoodEntry } from '@/types'
import { Heart, Ear, BarChart3, Shield, ArrowRight, LucideIcon } from 'lucide-react'
import { MoodSelector } from './MoodSelector'
import { cn } from '@/lib/utils'

interface QuickActionsProps {
  profile: Profile
  currentMood: MoodEntry | null
  onMoodUpdate: () => void
  onNavigate?: (path: string) => void
}

interface ActionCardProps {
  icon: LucideIcon
  title: string
  description: string
  available: boolean
  action: () => void
  gradient: string
  className?: string
}

function ActionCard({ icon: Icon, title, description, available, action, gradient, className }: ActionCardProps) {
  return (
    <motion.button
      onClick={action}
      disabled={!available}
      whileHover={available ? { scale: 1.03 } : {}}
      whileTap={available ? { scale: 0.98 } : {}}
      className={cn(
        "p-8 rounded-3xl text-left text-white overflow-hidden relative transition-all duration-300",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        gradient,
        className
      )}
    >
      <div className="relative z-10">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-white/80 max-w-xs">{description}</p>
        <div className="mt-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
            <span>{available ? 'Begin' : 'Unavailable'}</span>
            {available && <ArrowRight className="w-4 h-4" />}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
    </motion.button>
  )
}

export function QuickActions({ profile, currentMood, onMoodUpdate, onNavigate }: QuickActionsProps) {
  const [showMoodSelector, setShowMoodSelector] = useState(false)

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return '😊'
    if (score >= 6) return '🙂'
    if (score >= 4) return '😐'
    if (score >= 2) return '😔'
    return '😢'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-2xl font-semibold text-secondary-900">How can we help?</h2>
        {currentMood && (
          <button 
            onClick={() => setShowMoodSelector(true)} 
            className="flex items-center space-x-2 text-sm text-secondary-600 hover:text-secondary-900 transition-colors"
          >
            <span>Your mood:</span>
            <span className="text-2xl">{getMoodEmoji(currentMood.mood_score)}</span>
            <span>{currentMood.mood_score}/10</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ActionCard
          title="I want to listen"
          description="Earn empathy credits by providing a listening ear for others in the community."
          icon={Ear}
          available={profile.emotional_capacity !== 'low'}
          action={() => onNavigate?.('/session')}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-700"
        />
        <ActionCard
          title="I need support"
          description="Use your empathy credits to connect with a listener for confidential support."
          icon={Heart}
          available={profile.empathy_credits >= 5}
          action={() => onNavigate?.('/session')}
          gradient="bg-gradient-to-br from-[#2a4f54] to-[#1f3d42]"
        />
      </div>

      {/* Burnout Warning */}
      {profile.emotional_capacity === 'low' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h4 className="font-semibold text-yellow-700">Burnout Protection is Active</h4>
              <p className="text-sm text-yellow-600">
                Listening is unavailable as your emotional capacity is low. Focus on self-care.
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Secondary Actions */}
      <div className="mt-8 grid grid-cols-2 gap-4 text-center">
         <button
            onClick={() => setShowMoodSelector(true)}
            className="px-4 py-3 bg-white/60 hover:bg-white/80 rounded-2xl text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
          >
            Update Mood
          </button>
      </div>

      {/* Mood Selector Modal */}
      {showMoodSelector && (
        <MoodSelector
          onClose={() => setShowMoodSelector(false)}
          onMoodSubmitted={() => {
            setShowMoodSelector(false)
            onMoodUpdate()
          }}
        />
      )}
    </div>
  )
}
