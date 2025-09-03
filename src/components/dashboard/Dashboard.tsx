'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Profile, MoodEntry, ListeningSession } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useRouter } from 'next/navigation'

// Material Symbols icons import
import 'material-symbols/outlined.css'

// Reusable Components
interface StatCardProps {
  icon: string
  value: string | number
  label: string
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
}

function StatCard({ icon, value, label, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-white/50 shadow-lg">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-slate-200 rounded-lg mb-4"></div>
          <div className="w-16 h-8 bg-slate-200 rounded mb-2"></div>
          <div className="w-20 h-4 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-white/50 shadow-lg hover:shadow-xl transition-shadow h-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-green-100 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-brand-green-600 text-lg sm:text-xl">{icon}</span>
        </div>
        {trend && (
          <span className={`material-symbols-outlined text-sm ${
            trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'
          }`}>
            {trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat'}
          </span>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-1">{value}</div>
      <div className="text-xs sm:text-sm text-secondary-600 leading-relaxed">{label}</div>
    </motion.div>
  )
}

interface SectionCardProps {
  title: string
  icon: string
  children: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  loading?: boolean
}

function SectionCard({ title, icon, children, action, loading }: SectionCardProps) {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-6 bg-slate-200 rounded"></div>
            <div className="w-6 h-6 bg-slate-200 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="w-full h-16 bg-slate-200 rounded-xl"></div>
            <div className="w-full h-16 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-shadow"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-secondary-900">{title}</h3>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-brand-green-600">{icon}</span>
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm font-medium text-brand-green-700 hover:text-brand-green-800 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  )
}

interface ActionPillProps {
  icon: string
  label: string
  description: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

function ActionPill({ icon, label, description, onClick, variant = 'primary', disabled }: ActionPillProps) {
  const baseClasses = "flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-full transition-all duration-300 transform w-full"
  const variantClasses = variant === 'primary'
    ? "text-white shadow-lg hover:scale-105"
    : "bg-white/80 backdrop-blur-sm border-2 border-brand-green-300 text-secondary-900 shadow-lg hover:shadow-xl hover:scale-105 hover:border-brand-green-400"

  const primaryStyle = variant === 'primary' ? {
    backgroundColor: '#335f64',
    boxShadow: '0 10px 15px -3px rgba(51, 95, 100, 0.3)'
  } : {}

  const secondaryStyle = variant === 'secondary' ? {
    boxShadow: '0 10px 15px -3px rgba(51, 95, 100, 0.2)'
  } : {}

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={variant === 'primary' ? primaryStyle : secondaryStyle}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
          variant === 'primary' ? 'bg-white/20' : 'bg-brand-green-100'
        }`}>
          <span className={`material-symbols-outlined text-lg sm:text-xl ${
            variant === 'primary' ? 'text-white' : 'text-brand-green-600'
          }`}>{icon}</span>
        </div>
        <div className="text-left flex-1 min-w-0">
          <div className="font-bold text-sm sm:text-base truncate">{label}</div>
          <div className={`text-xs sm:text-sm ${variant === 'primary' ? 'text-white/80' : 'text-secondary-600'} leading-relaxed`}>
            {description}
          </div>
        </div>
        <span className={`material-symbols-outlined text-lg sm:text-xl flex-shrink-0 ${
          variant === 'primary' ? 'text-white/60' : 'text-secondary-400'
        }`}>arrow_forward</span>
    </motion.button>
  )
}

export function Dashboard() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [recentSessions, setRecentSessions] = useState<ListeningSession[]>([])
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([])
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null)

  useEffect(() => {
    if (user && profile) {
      fetchDashboardData()
    }
  }, [user, profile])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Fetch recent sessions (handle missing table gracefully)
      try {
        const { data: sessions, error: sessionsError } = await supabase
          .from('listening_sessions')
          .select(`
            *,
            listener:profiles!listening_sessions_listener_id_fkey(display_name, avatar_url),
            speaker:profiles!listening_sessions_speaker_id_fkey(display_name, avatar_url)
          `)
          .or(`listener_id.eq.${user.id},speaker_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(3)

        if (sessionsError) {
          console.warn('Listening sessions table not available:', sessionsError.message)
          setRecentSessions([])
        } else if (sessions) {
          setRecentSessions(sessions)
        }
      } catch (sessionsError: any) {
        console.warn('Error fetching listening sessions:', sessionsError?.message || sessionsError)
        setRecentSessions([])
      }

      // Fetch recent mood entries (handle missing table gracefully)
      try {
        const { data: moods, error: moodsError } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(7)

        if (moodsError) {
          console.warn('Mood entries table not available:', moodsError.message)
          setRecentMoods([])
          setCurrentMood(null)
        } else if (moods) {
          setRecentMoods(moods)
          setCurrentMood(moods[0] || null)
        }
      } catch (moodsError: any) {
        console.warn('Error fetching mood entries:', moodsError?.message || moodsError)
        setRecentMoods([])
        setCurrentMood(null)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const handleMoodUpdate = () => {
    fetchDashboardData()
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return '😊'
    if (score >= 6) return '🙂'
    if (score >= 4) return '😐'
    if (score >= 2) return '😔'
    return '😢'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
        <div className="text-center">
          <h2 className="text-2xl font-light text-secondary-700 mb-4">Setting up your profile...</h2>
          <p className="text-secondary-600 font-light">This will only take a moment.</p>
          <LoadingSpinner size="lg" className="mt-6" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="space-y-8 md:space-y-12 lg:space-y-16">
          {/* Header Section */}
          <motion.div
            className="text-center space-y-3 md:space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hidden md:block w-16 h-0.5 bg-gradient-to-r from-transparent via-brand-green-400 to-transparent mx-auto mb-3 md:mb-5"></div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 leading-tight px-4">
              {getGreeting()}, {profile.display_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-secondary-600 max-w-2xl mx-auto px-4">
              {getFormattedDate()} • You're doing your best today.
            </p>
          </motion.div>

          {/* Action Band */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto px-4">
              <ActionPill
                icon="chat"
                label="Start Session"
                description="Connect with a listener or offer support"
                onClick={() => handleNavigate('/session')}
                variant="primary"
              />
              <ActionPill
                icon="psychology"
                label="Take Assessment"
                description="Complete a personalized mental health assessment"
                onClick={() => handleNavigate('/assessments')}
                variant="secondary"
              />
            </div>
          </motion.div>

          {/* Main Content - Centered SVG */}
          <motion.div
            className="max-w-7xl mx-auto px-4 -mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              className="h-[31rem] flex items-start justify-center pt-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <img
                src="/assets/Mental_health-bro_2.svg"
                alt="Mental wellness illustration"
                className="w-full h-full max-h-[31rem] object-contain"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
