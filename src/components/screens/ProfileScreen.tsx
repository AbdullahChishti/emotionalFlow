'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/TestAuthProvider'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'
import 'material-symbols/outlined.css'

export function ProfileScreen() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [displayName, setDisplayName] = useState('')
  const [preferredMode, setPreferredMode] = useState<'therapist' | 'friend' | 'both'>('both')
  const [emotionalCapacity, setEmotionalCapacity] = useState<'low' | 'medium' | 'high'>('medium')
  const [isAnonymous, setIsAnonymous] = useState(false)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setPreferredMode(profile.preferred_mode || 'both')
      setEmotionalCapacity(profile.emotional_capacity || 'medium')
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
          preferred_mode: preferredMode,
          emotional_capacity: emotionalCapacity,
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
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-slate-700 mb-4">Loading your profile...</h2>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Modern Header Section */}
      <motion.div
        className="relative bg-white border-b border-slate-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-6">
            {/* Profile Avatar */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-brand-green-500 to-brand-green-700 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-4xl text-white">person</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-white">edit</span>
              </div>
            </motion.div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                {profile.display_name || 'Your Profile'}
              </h1>
              <p className="text-slate-600 text-lg">
                Welcome back to your wellness journey
              </p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-brand-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                  <span className="text-sm text-slate-600">
                    Last active {new Date(profile.last_active).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Stats & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-green-100 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-brand-green-600 text-xl">account_balance_wallet</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{profile.empathy_credits}</div>
                    <div className="text-sm text-slate-600">Empathy Credits</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600 text-xl">trending_up</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{profile.total_credits_earned}</div>
                    <div className="text-sm text-slate-600">Total Earned</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-xl">payments</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{profile.total_credits_spent}</div>
                    <div className="text-sm text-slate-600">Total Spent</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-slate-800">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  onClick={() => router.push('/wallet')}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 bg-brand-green-100 rounded-xl flex items-center justify-center group-hover:bg-brand-green-200 transition-colors">
                    <span className="material-symbols-outlined text-brand-green-600 text-xl">account_balance_wallet</span>
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-slate-800 group-hover:text-brand-green-700 transition-colors">Wallet</div>
                    <div className="text-sm text-slate-600">View credits & transactions</div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-brand-green-600 transition-colors">arrow_forward</span>
                </motion.button>

                <motion.button
                  onClick={() => router.push('/community')}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 bg-brand-green-100 rounded-xl flex items-center justify-center group-hover:bg-brand-green-200 transition-colors">
                    <span className="material-symbols-outlined text-brand-green-600 text-xl">people</span>
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-slate-800 group-hover:text-brand-green-700 transition-colors">Community</div>
                    <div className="text-sm text-slate-600">Connect with others</div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-brand-green-600 transition-colors">arrow_forward</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Wellness Tools */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-slate-800">Wellness Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                  onClick={() => router.push('/check-in')}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-green-400 to-brand-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-white text-2xl">sentiment_satisfied</span>
                  </div>
                  <div className="font-semibold text-slate-800 group-hover:text-brand-green-700 transition-colors mb-2">Daily Check-in</div>
                  <div className="text-sm text-slate-600">Track your mood</div>
                </motion.button>

                <motion.button
                  onClick={() => router.push('/meditation')}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-green-500 to-brand-green-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-white text-2xl">self_improvement</span>
                  </div>
                  <div className="font-semibold text-slate-800 group-hover:text-brand-green-700 transition-colors mb-2">Meditation</div>
                  <div className="text-sm text-slate-600">Find peace & clarity</div>
                </motion.button>

                <motion.button
                  onClick={() => router.push('/session')}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-green-600 to-brand-green-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-white text-2xl">chat</span>
                  </div>
                  <div className="font-semibold text-slate-800 group-hover:text-brand-green-700 transition-colors mb-2">Therapy Sessions</div>
                  <div className="text-sm text-slate-600">Connect with listeners</div>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            
            {/* Settings Card */}
            <motion.div
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Account Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Display Name
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="w-full border-slate-200 focus:border-brand-green-500 focus:ring-brand-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Preferred Support Mode
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'therapist', label: 'Therapist', icon: 'psychology' },
                      { value: 'friend', label: 'Friend', icon: 'group' },
                      { value: 'both', label: 'Both', icon: 'balance' }
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => setPreferredMode(mode.value as any)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          preferredMode === mode.value
                            ? 'border-brand-green-500 bg-brand-green-50'
                            : 'border-slate-200 hover:border-brand-green-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-xl text-slate-600">
                            {mode.icon}
                          </span>
                          <span className="font-medium text-slate-800">{mode.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Emotional Capacity
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'low', label: 'Low', color: 'text-red-500', icon: 'battery_1_bar' },
                      { value: 'medium', label: 'Medium', color: 'text-yellow-500', icon: 'battery_3_bar' },
                      { value: 'high', label: 'High', color: 'text-green-500', icon: 'battery_full' }
                    ].map((capacity) => (
                      <button
                        key={capacity.value}
                        onClick={() => setEmotionalCapacity(capacity.value as any)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          emotionalCapacity === capacity.value
                            ? 'border-brand-green-500 bg-brand-green-50'
                            : 'border-slate-200 hover:border-brand-green-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-xl ${capacity.color}`}>
                            {capacity.icon}
                          </span>
                          <span className="font-medium text-slate-800">{capacity.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-5 h-5 text-brand-green-600 border-slate-300 rounded focus:ring-brand-green-500"
                  />
                  <label htmlFor="anonymous" className="text-sm font-medium text-slate-700">
                    Remain anonymous in sessions
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-8">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-brand-green-600 hover:bg-brand-green-700 border-0"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>

                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Sign Out
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
