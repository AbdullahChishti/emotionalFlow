'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Input, Label } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import 'material-symbols/outlined.css'

export function ProfileScreen() {
  const { user, profile, refreshProfile, signOut, isLoading: authLoading } = useAuthContext()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

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
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header with subtle art */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Subtle decorative element */}
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#0071E3]/30 to-transparent mb-8 mx-auto rounded-full" />

          <h1 className="text-4xl font-medium text-[#1D1D1F] mb-3 tracking-tight">
            Your Profile
          </h1>
          <p className="text-[#86868B] font-light text-lg">
            Manage your wellness journey
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Overview - Aesthetic Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8E8ED]"
          >
            <div className="flex items-center gap-6 mb-8">
              {/* Artistic avatar */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0071E3] to-[#005BB5] rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-3xl text-white">person</span>
                </div>
                {/* Subtle accent dot */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#34C759] rounded-full border-2 border-white" />
              </div>

              <div>
                <h2 className="text-2xl font-medium text-[#1D1D1F] mb-1">
                  {profile.display_name || 'User'}
                </h2>
                <p className="text-[#86868B] font-light">{user?.email}</p>
              </div>
            </div>

            {/* Stats Grid - Minimal & Aesthetic */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-6 bg-[#FAFAFA] rounded-2xl">
                <div className="text-3xl font-light text-[#1D1D1F] mb-2">
                  {Math.floor((profile?.total_credits_earned || 0) / 5)}
                </div>
                <div className="text-xs text-[#86868B] uppercase tracking-wider">Sessions</div>
              </div>
              <div className="text-center p-6 bg-[#FAFAFA] rounded-2xl">
                <div className="text-3xl font-light text-[#1D1D1F] mb-2">
                  {profile?.total_credits_earned || 0}
                </div>
                <div className="text-xs text-[#86868B] uppercase tracking-wider">Credits</div>
              </div>
              <div className="text-center p-6 bg-[#FAFAFA] rounded-2xl">
                <div className="text-3xl font-light text-[#1D1D1F] mb-2">
                  {profile?.created_at ? new Date(profile.created_at).getFullYear() : '—'}
                </div>
                <div className="text-xs text-[#86868B] uppercase tracking-wider">Since</div>
              </div>
            </div>
          </motion.div>

          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8E8ED]"
          >
            <h3 className="text-xl font-medium text-[#1D1D1F] mb-6">Personal Information</h3>

            <div className="space-y-5">
              <div>
                <Label htmlFor="displayName" className="mb-2 block">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div>
                <Label htmlFor="email" className="mb-2 block">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-[#F5F5F7] cursor-not-allowed"
                />
              </div>

              {/* Aesthetic toggle */}
              <div className="pt-4">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl hover:bg-[#FAFAFA] transition-colors">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-5 h-5 text-[#0071E3] border-[#D2D2D7] rounded focus:ring-[#0071E3]/20"
                  />
                  <span className="text-[#1D1D1F] font-normal">Remain anonymous in sessions</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons - Minimal & Clean */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
              size="lg"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </Button>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Sign Out
            </Button>

            {/* Subtle footer text */}
            <p className="text-center text-sm text-[#86868B] font-light mt-2">
              Your privacy is our priority
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
