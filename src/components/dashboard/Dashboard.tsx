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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background gradients matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-green-50/30" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-200/40 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-200/40 to-transparent rounded-full blur-3xl" />

      <DashboardHeader profile={profile} />
      
      <main className="container mx-auto px-6 py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            <CreditBalance 
              credits={profile.empathy_credits}
              totalEarned={profile.total_credits_earned}
              totalSpent={profile.total_credits_spent}
            />
            
            <QuickActions 
              profile={profile}
              currentMood={currentMood}
              onMoodUpdate={fetchDashboardData}
            />
            
            <RecentActivity sessions={recentSessions} userId={user!.id} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-28">
              <EmotionalMetrics 
                profile={profile}
                recentMoods={recentMoods}
                recentSessions={recentSessions}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
