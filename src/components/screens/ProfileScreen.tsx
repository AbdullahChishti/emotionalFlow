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
    <div className="min-h-screen w-full bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(51, 95, 100, 0.15) 0%, transparent 70%)',
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

      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <motion.div
          className="w-full max-w-2xl glassmorphic rounded-3xl shadow-xl p-8 space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Header */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-brand-green-400 to-brand-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-white">person</span>
            </div>
            <h1 className="text-3xl font-bold text-secondary-800">Your Profile</h1>
            <p className="text-secondary-600 mt-2">Manage your account and preferences</p>
          </motion.div>

          {/* Profile Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-center p-4 bg-white/50 rounded-xl">
              <div className="text-2xl font-bold text-brand-green-600">{profile.empathy_credits}</div>
              <div className="text-sm text-secondary-600">Credits</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-xl">
              <div className="text-2xl font-bold text-brand-green-600">{profile.total_credits_earned}</div>
              <div className="text-sm text-secondary-600">Earned</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-xl">
              <div className="text-2xl font-bold text-brand-green-600">{profile.total_credits_spent}</div>
              <div className="text-sm text-secondary-600">Spent</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-xl">
              <div className="text-2xl font-bold text-brand-green-600">
                {new Date(profile.last_active).toLocaleDateString()}
              </div>
              <div className="text-sm text-secondary-600">Last Active</div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <h3 className="text-lg font-semibold text-secondary-800">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                onClick={() => router.push('/wallet')}
                className="p-4 bg-white/60 hover:bg-white/80 rounded-xl border border-white/50 hover:border-brand-green-200 transition-all duration-300 flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 bg-brand-green-100 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-brand-green-600">account_balance_wallet</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-secondary-800">Wallet</div>
                  <div className="text-sm text-secondary-600">View credits & transactions</div>
                </div>
              </motion.button>

              <motion.button
                onClick={() => router.push('/community')}
                className="p-4 bg-white/60 hover:bg-white/80 rounded-xl border border-white/50 hover:border-brand-green-200 transition-all duration-300 flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 bg-brand-green-100 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-brand-green-600">people</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-secondary-800">Community</div>
                  <div className="text-sm text-secondary-600">Connect with others</div>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Wellness Options */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-secondary-800">Wellness Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                onClick={() => router.push('/check-in')}
                className="p-4 bg-white/60 hover:bg-white/80 rounded-xl border border-white/50 hover:border-brand-green-200 transition-all duration-300 flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-brand-green-400 to-brand-green-600 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">sentiment_satisfied</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-secondary-800">Daily Check-in</div>
                  <div className="text-sm text-secondary-600">Track your mood</div>
                </div>
              </motion.button>

              <motion.button
                onClick={() => router.push('/meditation')}
                className="p-4 bg-white/60 hover:bg-white/80 rounded-xl border border-white/50 hover:border-brand-green-200 transition-all duration-300 flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-brand-green-500 to-brand-green-700 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">self_improvement</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-secondary-800">Meditation</div>
                  <div className="text-sm text-secondary-600">Find peace & clarity</div>
                </div>
              </motion.button>

              <motion.button
                onClick={() => router.push('/session')}
                className="p-4 bg-white/60 hover:bg-white/80 rounded-xl border border-white/50 hover:border-brand-green-200 transition-all duration-300 flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-brand-green-600 to-brand-green-800 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">chat</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-secondary-800">Therapy Sessions</div>
                  <div className="text-sm text-secondary-600">Connect with listeners</div>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Settings Form */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Display Name
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Preferred Support Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'therapist', label: 'Therapist', icon: 'psychology' },
                  { value: 'friend', label: 'Friend', icon: 'group' },
                  { value: 'both', label: 'Both', icon: 'balance' }
                ].map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setPreferredMode(mode.value as any)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferredMode === mode.value
                        ? 'border-brand-green-500 bg-brand-green-50'
                        : 'border-white/50 hover:border-brand-green-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl block mb-2">
                      {mode.icon}
                    </span>
                    <span className="text-sm font-medium">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Emotional Capacity
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'low', label: 'Low', color: 'text-red-500' },
                  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
                  { value: 'high', label: 'High', color: 'text-green-500' }
                ].map((capacity) => (
                  <button
                    key={capacity.value}
                    onClick={() => setEmotionalCapacity(capacity.value as any)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      emotionalCapacity === capacity.value
                        ? 'border-brand-green-500 bg-brand-green-50'
                        : 'border-white/50 hover:border-brand-green-300'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-2xl block mb-2 ${capacity.color}`}>
                      {capacity.value === 'low' ? 'battery_1_bar' :
                       capacity.value === 'medium' ? 'battery_3_bar' : 'battery_full'}
                    </span>
                    <span className="text-sm font-medium">{capacity.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="anonymous" className="text-sm text-secondary-700">
                Remain anonymous in sessions
              </label>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex-1"
            >
              Sign Out
            </Button>
          </motion.div>


        </motion.div>
      </div>
    </div>
  )
}
