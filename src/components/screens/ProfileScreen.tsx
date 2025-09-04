'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
const AssessmentHistory = dynamic(() => import('@/components/assessment/AssessmentHistory'), {
  ssr: false,
  loading: () => (
    <div className="py-12 text-center">
      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 border border-white/50 shadow">
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
        <span className="text-sm text-secondary-700">Loading assessment history…</span>
      </div>
    </div>
  )
})
import 'material-symbols/outlined.css'

export function ProfileScreen() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [displayName, setDisplayName] = useState('')

  const [isAnonymous, setIsAnonymous] = useState(false)

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [sessionReminders, setSessionReminders] = useState(true)

  // Tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile')

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setIsAnonymous(profile.is_anonymous || false)
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          is_anonymous: isAnonymous,
        })
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile()
      // Show success message or toast
    } catch (error) {
      console.error('Error updating profile:', error)
      // Show error message
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      setLoading(false)
    }
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
          <h2 className="text-2xl font-semibold text-secondary-900 mb-4">Loading your profile...</h2>
          <p className="text-secondary-600 mb-6">Setting up your personalized experience</p>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-secondary-900 mb-2">Profile Settings</h1>
            <p className="text-secondary-600">Manage your account and preferences</p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-white/50 shadow-lg">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'profile'
                    ? 'text-white shadow-md'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-white/50'
                }`}
                style={activeTab === 'profile' ? { backgroundColor: '#335f64' } : { border: '2px solid #335f64' }}
              >
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'history'
                    ? 'text-white shadow-md'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-white/50'
                }`}
                style={activeTab === 'history' ? { backgroundColor: '#335f64' } : { border: '2px solid #335f64' }}
              >
                Assessment History
              </button>
            </div>
          </motion.div>

          {/* Main Content */}
          {activeTab === 'profile' ? (
            /* Main Grid Layout */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Sidebar - 1/3 width */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border-2 border-brand-green-200/80 shadow-lg sticky top-8 transition-all duration-300 hover:border-brand-green-300/80 hover:shadow-xl">

                {/* Profile Avatar */}
                <div className="text-center mb-6">
                  <div className="relative mx-auto w-24 h-24 mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-brand-green-500 to-brand-green-700 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30">
                      <span className="material-symbols-outlined text-3xl text-white">person</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900">{profile.display_name || 'User'}</h3>
                  <p className="text-sm text-secondary-600">{user?.email}</p>
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-3">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-2xl bg-brand-green-50/80 text-brand-green-700 font-medium border-2 border-brand-green-200 hover:border-brand-green-300 transition-all duration-200 hover:shadow-md">
                    <span className="material-symbols-outlined text-xl">person</span>
                    Personal Information
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-2xl bg-white/80 hover:bg-brand-green-50/60 text-secondary-600 transition-all duration-200 border-2 border-slate-100 hover:border-brand-green-200 hover:shadow-md">
                    <span className="material-symbols-outlined text-xl">notifications</span>
                    Notifications
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-2xl bg-white/80 hover:bg-brand-green-50/60 text-secondary-600 transition-all duration-200 border-2 border-slate-100 hover:border-brand-green-200 hover:shadow-md">
                    <span className="material-symbols-outlined text-xl">settings</span>
                    Account
                  </button>
                </nav>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm bg-slate-50/60 p-3 rounded-xl border-2 border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-brand-green-600" style={{fontSize: '18px'}}>emoji_people</span>
                        <span className="text-secondary-600 font-medium">Sessions</span>
                      </div>
                      <span className="font-semibold text-brand-green-700 bg-white/80 px-3 py-1 rounded-lg border border-slate-200">
                        {Math.floor((profile?.total_credits_earned || 0) / 5)} completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content - 2/3 width */}
            <motion.div
              className="lg:col-span-2 space-y-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >

              {/* Personal Information Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-brand-green-600 text-2xl">person</span>
                  <h2 className="text-2xl font-semibold text-secondary-900">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Display Name
                    </label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-slate-50"
                    />
                  </div>


                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-5 h-5 text-brand-green-600 border-slate-300 rounded focus:ring-brand-green-500"
                    />
                    <label htmlFor="anonymous" className="text-sm font-medium text-secondary-700">
                      Remain anonymous in sessions
                    </label>
                  </div>
                </div>
              </div>

              {/* Notifications Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-brand-green-600 text-2xl">notifications</span>
                  <h2 className="text-2xl font-semibold text-secondary-900">Notifications</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-secondary-900">Email Notifications</div>
                      <div className="text-sm text-secondary-600">Receive updates via email</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#335f64]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-secondary-900">Push Notifications</div>
                      <div className="text-sm text-secondary-600">Receive push notifications on your device</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#335f64]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-secondary-900">Session Reminders</div>
                      <div className="text-sm text-secondary-600">Get reminded about upcoming sessions</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sessionReminders}
                        onChange={(e) => setSessionReminders(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#335f64]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Account Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-brand-green-600 text-2xl">settings</span>
                  <h2 className="text-2xl font-semibold text-secondary-900">Account</h2>
                </div>

                <div className="space-y-4">


                  <button className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-brand-green-200 hover:border-brand-green-400 hover:bg-brand-green-50 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-brand-green-600">help</span>
                      <span className="font-medium text-secondary-900">Help & Support</span>
                    </div>
                    <span className="material-symbols-outlined text-secondary-400">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all border-2"
                  style={{
                    backgroundColor: '#335f64',
                    color: 'white',
                    opacity: saving ? 0.7 : 1,
                    borderColor: '#335f64'
                  }}
                >
                  {saving ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    <span className="material-symbols-outlined">save</span>
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-red-600 text-white rounded-2xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 border-2 border-red-600 hover:border-red-700"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
          ) : (
            /* Assessment History Tab */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <AssessmentHistory />
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
