/**
 * UI Slice - Centralized UI State Management
 * Handles global UI state like modals, notifications, loading states
 */

import { StateCreator } from 'zustand'

// UI slice state interface
export interface UiSlice {
  // Modal states
  activeModal: string | null
  modalProps: any

  // Notification states
  notifications: NotificationItem[]
  notificationId: number

  // Global loading states
  globalLoading: boolean
  globalLoadingMessage: string

  // Navigation states
  currentPage: string
  previousPage: string

  // Layout states
  sidebarOpen: boolean
  theme: 'light' | 'dark'

  // Actions
  // Modal operations
  showModal: (modalId: string, props: any) => void
  hideModal: () => void

  // Notification operations
  showNotification: (notification: Omit<NotificationItem, 'id'>) => void
  hideNotification: (id: number) => void
  clearNotifications: () => void

  // Global loading operations
  setGlobalLoading: (loading: boolean, message?: string) => void

  // Navigation operations
  setCurrentPage: (page: string) => void

  // Layout operations
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
}

// Notification item interface
export interface NotificationItem {
  id: number
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration: number
}

// UI slice implementation
export const createUiSlice: StateCreator<
  UiSlice & any, // Will be combined with other slices
  [],
  [],
  UiSlice
> = (set, get) => ({
  // Initial state
  activeModal: null,
  modalProps: {},
  notifications: [],
  notificationId: 0,
  globalLoading: true,
  globalLoadingMessage: 'Initializing...',
  currentPage: '',
  previousPage: '',
  sidebarOpen: false,
  theme: 'light',


  // Modal operations
  showModal: (modalId, props) => {
    set({
      activeModal: modalId,
      modalProps: props
    })
  },

  hideModal: () => {
    const { activeModal } = get()
    set({
      activeModal: null,
      modalProps: {}
    })
  },

  // Notification operations
  showNotification: (notification) => {
    const { notificationId, notifications } = get()
    const id = notificationId + 1

    const notificationItem: NotificationItem = {
      id,
      ...notification,
    }

    set({
      notifications: [...notifications, notificationItem],
      notificationId: id
    })

    // Auto-hide notification
    if (notificationItem.duration > 0) {
      setTimeout(() => {
        get().hideNotification(id)
      }, notificationItem.duration)
    }
  },

  hideNotification: (id) => {
    const { notifications } = get()
    set({
      notifications: notifications.filter(n => n.id !== id)
    })
  },

  clearNotifications: () => {
    set({ notifications: [] })
  },

  // Global loading operations
  setGlobalLoading: (globalLoading, globalLoadingMessage = '') => {
    set({ globalLoading, globalLoadingMessage })
  },

  // Navigation operations
  setCurrentPage: (currentPage) => {
    const { currentPage: previousPage } = get()
    set({
      currentPage,
      previousPage
    })
  },

  // Layout operations
  setSidebarOpen: (sidebarOpen) => {
    set({ sidebarOpen })
  },

  setTheme: (theme) => {
    set({ theme })

    // Apply theme to document
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      root.setAttribute('data-theme', theme)
    }
  },

  toggleSidebar: () => {
    const { sidebarOpen } = get()
    set({ sidebarOpen: !sidebarOpen })
  }
})
