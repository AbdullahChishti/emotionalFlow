'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'
import 'material-symbols/outlined.css'

export function ProfileScreen() {
  const { user, profile, refreshProfile, signOut, isLoading: authLoading } = useAuthContext()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // Form state
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">Loading your profile...</h2>
          <p className="text-gray-500 mb-6 font-light">Setting up your personalized experience</p>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating curved lines */}
        <div className="absolute top-20 left-10 w-32 h-32 border-l-2 border-t-2 border-slate-400/20 rounded-tl-full" />
        <div className="absolute top-40 right-20 w-24 h-24 border-r-2 border-b-2 border-slate-500/25 rounded-br-full" />

        {/* Organic therapy symbols - leaf shapes */}
        <div className="absolute top-16 right-1/4 w-16 h-16">
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path
              d="M32 8 Q48 16 56 32 Q48 48 32 56 Q16 48 8 32 Q16 16 32 8 Z"
              fill="#335f64"
              opacity="0.08"
            />
            <path
              d="M32 12 Q44 18 50 32 Q44 46 32 52 Q20 46 14 32 Q20 18 32 12 Z"
              fill="#335f64"
              opacity="0.12"
            />
          </svg>
        </div>

        {/* Flowing emotional healing waves */}
        <div className="absolute bottom-20 left-1/3 w-40 h-20">
          <svg viewBox="0 0 160 80" fill="none" className="w-full h-full">
            <path
              d="M0 40 Q20 20 40 40 T80 40 T120 40 T160 40"
              stroke="#335f64"
              strokeWidth="1"
              fill="none"
              opacity="0.12"
            />
            <path
              d="M0 50 Q20 30 40 50 T80 50 T120 50 T160 50"
              stroke="#335f64"
              strokeWidth="0.8"
              fill="none"
              opacity="0.08"
            />
          </svg>
        </div>

        {/* Paint splash / emotional expression */}
        <div className="absolute top-1/2 right-10 w-16 h-16">
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path
              d="M32 8 Q44 12 52 24 Q56 36 48 48 Q40 56 32 52 Q24 48 16 40 Q12 28 20 20 Q28 12 32 8 Z"
              fill="#335f64"
              opacity="0.06"
            />
            <path
              d="M28 16 Q36 18 40 26 Q42 34 38 42 Q34 48 28 46 Q22 44 18 36 Q16 28 22 22 Q26 18 28 16 Z"
              fill="#335f64"
              opacity="0.10"
            />
          </svg>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative line above title */}
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-slate-500 to-transparent mb-6 mx-auto" />

            <h1 className="text-4xl md:text-5xl font-light text-slate-700 mb-6 tracking-tight">
              Your Profile
            </h1>

            {/* Decorative therapy symbol - heart with flowing lines */}
            <div className="flex items-center justify-center gap-3 text-slate-600 opacity-60 mb-6">
              <div className="w-8 h-0.5 bg-slate-500"></div>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 20 20">
                <path
                  d="M10 15.5C10 15.5 8.5 14 6 11.5C3.5 9 2.5 7 3 5.5C3.5 4 5 3.5 6.5 4C7.5 4.5 8.5 5.5 10 7.5C11.5 5.5 12.5 4.5 13.5 4C15 3.5 16.5 4 17 5.5C17.5 7 16.5 9 14 11.5C11.5 14 10 15.5 10 15.5Z"
                  fill="#335f64"
                  opacity="0.6"
                />
                <path
                  d="M7 8 Q8 7 9 8 T11 8"
                  stroke="#335f64"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.8"
                />
              </svg>
              <div className="w-8 h-0.5 bg-slate-500"></div>
            </div>

            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-loose font-light tracking-wide">
              Manage your account settings and preferences with care and compassion
            </p>

            {/* Decorative line below text */}
            <div className="w-32 h-0.5 bg-gradient-to-r from-slate-500 via-slate-600 to-transparent mt-6 mx-auto" />
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >

            {/* Profile Overview Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-2xl text-white">person</span>
                </div>
                <div>
                  <h2 className="text-3xl font-light text-slate-700 mb-2">{profile.display_name || 'User'}</h2>
                  <p className="text-slate-500 font-light text-lg">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-slate-50/60 rounded-xl border border-slate-200/40">
                  <div className="text-4xl font-light text-slate-700 mb-3">
                    {Math.floor((profile?.total_credits_earned || 0) / 5)}
                  </div>
                  <div className="text-sm text-slate-600 uppercase tracking-wider font-light">Sessions Completed</div>
                </div>
                <div className="text-center p-6 bg-slate-50/60 rounded-xl border border-slate-200/40">
                  <div className="text-4xl font-light text-slate-700 mb-3">
                    {profile?.total_credits_earned || 0}
                  </div>
                  <div className="text-sm text-slate-600 uppercase tracking-wider font-light">Credits Earned</div>
                </div>
                <div className="text-center p-6 bg-slate-50/60 rounded-xl border border-slate-200/40">
                  <div className="text-4xl font-light text-slate-700 mb-3">
                    {profile?.created_at ? new Date(profile.created_at).getFullYear() : '—'}
                  </div>
                  <div className="text-sm text-slate-600 uppercase tracking-wider font-light">Member Since</div>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
              <h3 className="text-2xl font-light text-slate-700 mb-8">Personal Information</h3>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-4 uppercase tracking-wider">
                    Display Name
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full border-slate-200 focus:border-slate-400 bg-slate-50/50 text-slate-700 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-4 uppercase tracking-wider">
                    Email Address
                  </label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="w-full border-slate-200 bg-slate-50/30 text-slate-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200/50">
                  <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl hover:bg-slate-50/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-5 h-5 text-slate-700 border-slate-300 rounded focus:ring-slate-500"
                    />
                    <span className="text-slate-600 font-medium">Remain anonymous in therapy sessions</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-6 pt-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex min-w-[200px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 text-white text-base font-bold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 mx-auto"
                style={{
                  backgroundColor: '#335f64',
                  boxShadow: '0 10px 15px -3px rgba(51, 95, 100, 0.3)',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a4f52';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#335f64';
                }}
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg mr-2">save</span>
                    Save Changes
                  </>
                )}
              </button>

              <button
                onClick={handleSignOut}
                disabled={authLoading}
                className="flex min-w-[200px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 text-slate-700 text-base font-bold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 mx-auto bg-white border border-slate-200 hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-lg mr-2">logout</span>
                Sign Out
              </button>

              <p className="text-slate-500 text-sm text-center mt-4 font-light">Your privacy and well-being are our highest priorities</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
