'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Profile, MoodEntry, ListeningSession } from '@/types'
import { DashboardHeader } from './DashboardHeader'
import { CreditBalance } from './CreditBalance'
import { QuickActions } from './QuickActions'
import { RecentActivity } from './RecentActivity'
import { EmotionalMetrics } from './EmotionalMetrics'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export function Dashboard() {
  const { user, profile } = useAuth()
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
      // Fetch recent sessions
      const { data: sessions } = await supabase
        .from('listening_sessions')
        .select(`
          *,
          listener:profiles!listening_sessions_listener_id_fkey(display_name, avatar_url),
          speaker:profiles!listening_sessions_speaker_id_fkey(display_name, avatar_url)
        `)
        .or(`listener_id.eq.${user.id},speaker_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5)

      if (sessions) {
        setRecentSessions(sessions)
      }

      // Fetch recent mood entries
      const { data: moods } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7)

      if (moods) {
        setRecentMoods(moods)
        setCurrentMood(moods[0] || null)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Setting up your profile...</h2>
          <p className="text-muted-foreground">This will only take a moment.</p>
          <LoadingSpinner size="lg" className="mt-6" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <DashboardHeader profile={profile} />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-light text-slate-800 leading-tight">
              Welcome back, {profile.display_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto">
              How are you feeling today?
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-light text-slate-800">Your Progress</h2>
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-sm">📈</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-light text-emerald-600 mb-2">12</div>
                <p className="text-sm text-slate-600 font-light">Days in a row</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-blue-600 mb-2">8</div>
                <p className="text-sm text-slate-600 font-light">Sessions this month</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-purple-600 mb-2">85%</div>
                <p className="text-sm text-slate-600 font-light">Goal completion</p>
              </div>
            </div>
          </div>

          {/* Quick Access Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Sessions */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light text-slate-800">Upcoming Sessions</h2>
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">📅</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-800">Therapy Session</p>
                    <p className="text-sm text-slate-600">Tomorrow at 3:00 PM</p>
                  </div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-800">Group Support</p>
                    <p className="text-sm text-slate-600">Friday at 6:30 PM</p>
                  </div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Recent Journal Entries */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light text-slate-800">Recent Entries</h2>
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">📝</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50/50 rounded-xl">
                  <p className="text-sm text-slate-600 mb-2">Yesterday</p>
                  <p className="text-slate-800">Feeling more grounded after today's meditation session...</p>
                </div>
                <div className="p-4 bg-purple-50/50 rounded-xl">
                  <p className="text-sm text-slate-600 mb-2">2 days ago</p>
                  <p className="text-slate-800">Grateful for the small moments of peace...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mood Tracker */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-light text-slate-800">How are you feeling?</h2>
              <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center">
                <span className="text-rose-600 text-sm">💙</span>
              </div>
            </div>
            <div className="flex justify-center space-x-4 mb-6">
              <button className="flex flex-col items-center p-4 rounded-xl hover:bg-blue-50/50 transition-colors">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-amber-600">☀️</span>
                </div>
                <span className="text-sm font-medium text-slate-700">Energetic</span>
              </button>
              <button className="flex flex-col items-center p-4 rounded-xl hover:bg-blue-50/50 transition-colors">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-slate-600">☁️</span>
                </div>
                <span className="text-sm font-medium text-slate-700">Calm</span>
              </button>
              <button className="flex flex-col items-center p-4 rounded-xl hover:bg-blue-50/50 transition-colors">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-indigo-600">🌙</span>
                </div>
                <span className="text-sm font-medium text-slate-700">Peaceful</span>
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600 font-light">
                Track your mood to understand your emotional patterns
              </p>
            </div>
          </div>

          {/* Daily Reflection */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-white/50 shadow-sm text-center">
            <h2 className="text-3xl font-light text-slate-800 mb-6">Daily Reflection</h2>
            <blockquote className="text-xl text-slate-600 font-light leading-relaxed max-w-3xl mx-auto italic">
              "Every emotion you feel is valid. Every step you take toward understanding yourself is a victory."
            </blockquote>
            <div className="mt-8 text-sm text-slate-500 font-light">
              Take a moment to breathe and be kind to yourself today.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
