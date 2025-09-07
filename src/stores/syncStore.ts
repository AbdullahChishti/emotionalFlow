/**
 * Sync Store
 * Manages real-time synchronization of all user data
 */

import React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AssessmentDataService } from '@/lib/services/AssessmentDataService'
import { AuthDataService } from '@/lib/services/AuthDataService'
import { ChatDataService } from '@/lib/services/ChatDataService'

interface SyncState {
  // Sync status
  lastSyncTime: Date | null
  isSyncing: boolean
  syncErrors: string[]

  // Sync configuration
  autoSyncEnabled: boolean
  syncInterval: number // minutes
  maxRetries: number

  // Sync actions
  startSync: () => Promise<void>
  stopSync: () => void
  setAutoSync: (enabled: boolean) => void
  setSyncInterval: (minutes: number) => void
  clearSyncErrors: () => void

  // Sync status getters
  getTimeSinceLastSync: () => number | null
  isSyncStale: () => boolean
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      // Initial state
      lastSyncTime: null,
      isSyncing: false,
      syncErrors: [],
      autoSyncEnabled: true,
      syncInterval: 5, // 5 minutes
      maxRetries: 3,

      // Main sync action
      startSync: async () => {
        const { isSyncing, maxRetries } = get()
        if (isSyncing) {
          console.log('🔄 Sync already in progress')
          return
        }

        console.log('🚀 Starting data synchronization...')
        set({ isSyncing: true, syncErrors: [] })

        const errors: string[] = []
        let retryCount = 0

        const performSync = async (): Promise<void> => {
          try {
            // Sync all data sources
            const syncPromises = [
              AssessmentDataService.fetchUserAssessments(undefined, true),
              AuthDataService.refreshUserProfile(undefined),
              // Chat sync would be handled by ChatDataService if needed
            ]

            await Promise.allSettled(syncPromises)

            // Check for errors
            const results = await Promise.allSettled(syncPromises)
            results.forEach((result, index) => {
              if (result.status === 'rejected') {
                const serviceName = ['Assessment', 'Auth', 'Chat'][index]
                errors.push(`${serviceName}: ${result.reason?.message || 'Unknown error'}`)
              }
            })

            if (errors.length > 0 && retryCount < maxRetries) {
              retryCount++
              console.log(`🔄 Sync retry ${retryCount}/${maxRetries} in 2 seconds...`)
              await new Promise(resolve => setTimeout(resolve, 2000))
              return performSync()
            }

            set({
              lastSyncTime: new Date(),
              isSyncing: false,
              syncErrors: errors
            })

            if (errors.length === 0) {
              console.log('✅ Data synchronization completed successfully')
            } else {
              console.warn('⚠️ Data synchronization completed with errors:', errors)
            }

          } catch (error) {
            console.error('❌ Sync failed:', error)
            set({
              isSyncing: false,
              syncErrors: [...errors, error.message]
            })
          }
        }

        await performSync()
      },

      // Stop sync
      stopSync: () => {
        console.log('⏹️ Stopping data synchronization')
        set({ isSyncing: false })
      },

      // Toggle auto sync
      setAutoSync: (enabled: boolean) => {
        console.log(`${enabled ? '🔄' : '⏹️'} Auto sync ${enabled ? 'enabled' : 'disabled'}`)
        set({ autoSyncEnabled: enabled })
      },

      // Set sync interval
      setSyncInterval: (minutes: number) => {
        console.log(`⏰ Sync interval set to ${minutes} minutes`)
        set({ syncInterval: minutes })
      },

      // Clear sync errors
      clearSyncErrors: () => {
        set({ syncErrors: [] })
      },

      // Get time since last sync
      getTimeSinceLastSync: () => {
        const { lastSyncTime } = get()
        if (!lastSyncTime) return null
        return Date.now() - lastSyncTime.getTime()
      },

      // Check if sync is stale
      isSyncStale: () => {
        const { lastSyncTime, syncInterval } = get()
        if (!lastSyncTime) return true

        const timeSinceSync = Date.now() - lastSyncTime.getTime()
        const staleThreshold = syncInterval * 60 * 1000 // Convert minutes to milliseconds
        return timeSinceSync > staleThreshold
      }
    }),
    {
      name: 'sync-storage',
      partialize: (state) => ({
        autoSyncEnabled: state.autoSyncEnabled,
        syncInterval: state.syncInterval,
        lastSyncTime: state.lastSyncTime
      })
    }
  )
)

// Auto-sync hook
export function useAutoSync() {
  const {
    autoSyncEnabled,
    syncInterval,
    startSync,
    isSyncStale,
    lastSyncTime
  } = useSyncStore()

  // Auto-sync effect
  React.useEffect(() => {
    if (!autoSyncEnabled) return

    const checkAndSync = () => {
      if (isSyncStale()) {
        console.log('🔄 Auto-sync triggered (data is stale)')
        startSync()
      }
    }

    // Initial check
    checkAndSync()

    // Set up interval
    const interval = setInterval(checkAndSync, syncInterval * 60 * 1000)

    return () => clearInterval(interval)
  }, [autoSyncEnabled, syncInterval, startSync, isSyncStale])

  return {
    lastSyncTime,
    isStale: isSyncStale(),
    autoSyncEnabled
  }
}
