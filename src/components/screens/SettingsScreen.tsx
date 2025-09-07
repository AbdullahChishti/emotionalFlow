'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuthContext } from '@/components/providers/AuthProvider'
// Account deletion not yet implemented in centralized API

// Material Symbols icons import
import 'material-symbols/outlined.css'

export default function SettingsScreen() {
  const { user, profile, signOut } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [message] = useState('')
  const [error, setError] = useState('')

  const handleSignOut = async () => {
    setLoading(true)
    setError('')
    try {
      await signOut()
      // AuthProvider handles the redirect automatically
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

    setLoading(true)
    setError('')
    try {
      // TODO: Implement account deletion in centralized API
      // For now, show a message that this feature is coming soon
      setError('Account deletion feature is coming soon. Please contact support for assistance.')

      // Uncomment when implemented:
      // const success = await useAppDataStore.getState().deleteAccount(user?.id!)
      // if (success) {
      //   setMessage('Account deleted successfully.')
      //   setTimeout(() => {
      //     router.push('/login?message=account_deleted')
      //   }, 2000)
      // } else {
      //   setError('Failed to delete account. Please try again.')
      // }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white/90 backdrop-blur-sm rounded-full border border-white/20 shadow-lg transition-all duration-300 text-slate-700 hover:text-slate-900 mb-6"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
            <p className="text-slate-600">Manage your account and preferences</p>
          </motion.div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Account Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-600">person</span>
              Account Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="material-symbols-outlined text-slate-400">mail</span>
                  <span className="text-slate-900">{user?.email}</span>
                  {user?.email_confirmed_at && (
                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="material-symbols-outlined text-slate-400">badge</span>
                  <span className="text-slate-900">{profile?.display_name || 'Not set'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Created</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="material-symbols-outlined text-slate-400">calendar_today</span>
                  <span className="text-slate-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-600">settings</span>
              Account Actions
            </h2>

            <div className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                  {message}
                </div>
              )}

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">logout</span>
                    Sign Out
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">delete_forever</span>
                      Delete Account
                    </>
                  )}
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </div>
          </motion.div>

          {/* App Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 text-center"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">MindWell</h2>
            <p className="text-slate-600 text-sm mb-4">
              Your wellness journey companion
            </p>
            <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>© 2024 MindWell</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

