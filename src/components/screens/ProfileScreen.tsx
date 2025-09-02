'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
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
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <div className="text-2xl font-bold text-primary-600">{profile.empathy_credits}</div>
              <div className="text-sm text-secondary-600">Credits</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{profile.total_credits_earned}</div>
              <div className="text-sm text-secondary-600">Earned</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{profile.total_credits_spent}</div>
              <div className="text-sm text-secondary-600">Spent</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                {new Date(profile.last_active).toLocaleDateString()}
              </div>
              <div className="text-sm text-secondary-600">Last Active</div>
            </div>
          </motion.div>

          {/* Settings Form */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
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
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-white/50 hover:border-primary-300'
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
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-white/50 hover:border-primary-300'
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
            transition={{ duration: 0.6, delay: 0.5 }}
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
