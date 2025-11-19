'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import 'material-symbols/outlined.css'

export default function SettingsScreen() {
  const { user, profile, signOut } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignOut = async () => {
    setLoading(true)
    setError('')
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
      setError('Failed to sign out. Please try again.')
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    setError('Account deletion feature is coming soon. Please contact support for assistance.')
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Back Button */}
        <Link href="/dashboard" className="inline-block mb-8">
          <motion.button
            whileHover={{ x: -2 }}
            className="flex items-center gap-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="text-sm font-normal">Back to Dashboard</span>
          </motion.button>
        </Link>

        {/* Header with artistic touch */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#0071E3]/30 to-transparent mb-8 mx-auto rounded-full" />
          <h1 className="text-4xl font-medium text-[#1D1D1F] mb-3 tracking-tight">Settings</h1>
          <p className="text-[#86868B] font-light">Manage your account preferences</p>
        </motion.div>

        <div className="space-y-6">
          {/* Account Information - Aesthetic Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8E8ED]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[var(--color-primary)]">person</span>
              </div>
              <h2 className="text-xl font-medium text-[#1D1D1F]">Account Information</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#86868B] text-xl">mail</span>
                  <div>
                    <div className="text-xs text-[#86868B] uppercase tracking-wider mb-1">Email</div>
                    <div className="text-[#1D1D1F] font-normal">{user?.email}</div>
                  </div>
                </div>
                {user?.email_confirmed_at && (
                  <span className="material-symbols-outlined text-[#34C759]">check_circle</span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#86868B] text-xl">badge</span>
                  <div>
                    <div className="text-xs text-[#86868B] uppercase tracking-wider mb-1">Display Name</div>
                    <div className="text-[#1D1D1F] font-normal">{profile?.display_name || 'Not set'}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#86868B] text-xl">calendar_today</span>
                  <div>
                    <div className="text-xs text-[#86868B] uppercase tracking-wider mb-1">Member Since</div>
                    <div className="text-[#1D1D1F] font-normal">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8E8ED]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[var(--color-primary)]">settings</span>
              </div>
              <h2 className="text-xl font-medium text-[#1D1D1F]">Account Actions</h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-2xl">
                <p className="text-sm text-[#FF3B30] font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={handleSignOut}
                disabled={loading}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {loading ? 'Signing out...' : 'Sign Out'}
              </Button>

              <div className="pt-4 border-t border-[#E8E8ED]">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white font-normal rounded-full transition-colors disabled:opacity-50"
                >
                  Delete Account
                </button>
                <p className="text-xs text-[#86868B] text-center mt-3 font-light">
                  This action cannot be undone
                </p>
              </div>
            </div>
          </motion.div>

          {/* App Info - Minimal & Artistic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-8"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary-gradient-from)] to-[var(--color-primary-gradient-to)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="material-symbols-outlined text-white text-xl">psychology_alt</span>
            </div>
            <h3 className="text-lg font-medium text-[#1D1D1F] mb-2">MindWell</h3>
            <p className="text-sm text-[#86868B] font-light mb-3">Your wellness journey companion</p>
            <div className="flex items-center justify-center gap-2 text-xs text-[#A1A1A6]">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>© 2024</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
