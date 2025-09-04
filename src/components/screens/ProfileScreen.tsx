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
        <span className="text-sm text-gray-600">Loading assessment history…</span>
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
    } catch (error) {
      console.error('Error updating profile:', error)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Loading your profile...</h2>
          <p className="text-gray-600 mb-6">Setting up your personalized experience</p>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </motion.div>

          {/* Tab Navigation - Aesthetic Pill Buttons */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-full p-1.5 border border-gray-200 shadow-lg">
              <button
                onClick={() => setActiveTab('profile')}
                className={`relative px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                  activeTab === 'profile'
                    ? 'text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'profile' ? {
                  background: 'linear-gradient(135deg, #335f64 0%, #2a4f52 100%)',
                  boxShadow: '0 4px 12px rgba(51, 95, 100, 0.3)'
                } : {}}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">person</span>
                  Profile Settings
                </span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`relative px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                  activeTab === 'history'
                    ? 'text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'history' ? {
                  background: 'linear-gradient(135deg, #335f64 0%, #2a4f52 100%)',
                  boxShadow: '0 4px 12px rgba(51, 95, 100, 0.3)'
                } : {}}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">assessment</span>
                  Assessment History
                </span>
              </button>
            </div>
          </motion.div>

          {/* Main Content */}
          {activeTab === 'profile' ? (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Profile Overview Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-2xl text-white">person</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{profile.display_name || 'User'}</h2>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {Math.floor((profile?.total_credits_earned || 0) / 5)}
                    </div>
                    <div className="text-sm text-gray-600">Sessions Completed</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {profile?.total_credits_earned || 0}
                    </div>
                    <div className="text-sm text-gray-600">Credits Earned</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Member Since</div>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-emerald-600 text-xl">edit</span>
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-gray-50"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
                      Remain anonymous in therapy sessions
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: '#335f64'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4f52'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#335f64'}
                >
                  {saving ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    <span className="material-symbols-outlined text-lg">save</span>
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Sign Out
                </button>
              </div>
            </motion.div>
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
