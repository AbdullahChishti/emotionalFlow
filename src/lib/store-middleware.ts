/**
 * Store Middleware
 * Enhanced middleware for Zustand stores with logging and persistence
 */

import { StateCreator, StoreApi } from 'zustand'

// Logging middleware
export function withLogging<T>(
  config: StateCreator<T, [], [], T>,
  storeName: string
): StateCreator<T, [], [], T> {
  return (set, get, api) => {
    const loggedSet = (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => {
      const prevState = get()
      const nextState = typeof partial === 'function'
        ? partial(prevState)
        : { ...prevState, ...partial }

      console.log(`🔄 ${storeName} Update:`, {
        partial: typeof partial === 'function' ? 'function' : partial,
        replace,
        changes: getStateChanges(prevState, nextState)
      })

      set(partial, replace)

      console.log(`✅ ${storeName} Updated:`, nextState)
    }

    const loggedGet = () => {
      const state = get()
      console.log(`📖 ${storeName} Get:`, state)
      return state
    }

    const loggedApi = {
      ...api,
      setState: loggedSet,
      getState: loggedGet
    }

    return config(loggedSet, loggedGet, loggedApi)
  }
}

// Enhanced persistence middleware
export function withEnhancedPersistence<T>(
  config: StateCreator<T, [], [], T>,
  options: {
    name: string
    version?: number
    migrate?: (persistedState: any, version: number) => T | Promise<T>
    onRehydrateStorage?: (state: T) => void
    onHydrate?: (state: T) => void
    serialize?: (state: T) => string
    deserialize?: (str: string) => T
  }
): StateCreator<T, [], [], T> {
  return (set, get, api) => {
    // Enhanced storage with versioning and error handling
    const storage = {
      getItem: (name: string): string | null => {
        try {
          if (typeof window === 'undefined') return null
          const item = localStorage.getItem(name)
          if (!item) return null

          const parsed = JSON.parse(item)
          const currentVersion = options.version || 1

          // Handle version migration
          if (parsed.version && parsed.version !== currentVersion) {
            console.log(`🔄 Migrating ${name} from v${parsed.version} to v${currentVersion}`)
            if (options.migrate) {
              const migratedState = options.migrate(parsed.state, parsed.version)
              storage.setItem(name, migratedState)
              return JSON.stringify({ state: migratedState, version: currentVersion })
            }
          }

          return JSON.stringify(parsed)
        } catch (error) {
          console.error(`❌ Failed to get ${name} from localStorage:`, error)
          return null
        }
      },

      setItem: (name: string, value: T): void => {
        try {
          if (typeof window === 'undefined') return
          const data = {
            state: value,
            version: options.version || 1,
            timestamp: Date.now()
          }
          localStorage.setItem(name, JSON.stringify(data))
          console.log(`💾 Persisted ${name} to localStorage`)
        } catch (error) {
          console.error(`❌ Failed to persist ${name} to localStorage:`, error)
        }
      },

      removeItem: (name: string): void => {
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(name)
            console.log(`🗑️ Removed ${name} from localStorage`)
          }
        } catch (error) {
          console.error(`❌ Failed to remove ${name} from localStorage:`, error)
        }
      }
    }

    // Create the store with persistence
    const store = config(set, get, api)

    // Rehydrate from storage
    const storedData = storage.getItem(options.name)
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        set(parsed.state || parsed, true)
        console.log(`🔄 Rehydrated ${options.name} from localStorage`)

        if (options.onRehydrateStorage) {
          options.onRehydrateStorage(parsed.state || parsed)
        }
      } catch (error) {
        console.error(`❌ Failed to rehydrate ${options.name}:`, error)
      }
    }

    // Enhanced set function with persistence
    const persistentSet = (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => {
      set(partial, replace)
      const newState = get()
      storage.setItem(options.name, newState)
    }

    // Override the set function
    api.setState = persistentSet

    return store
  }
}

// Error boundary middleware
export function withErrorBoundary<T>(
  config: StateCreator<T, [], [], T>,
  storeName: string,
  onError?: (error: Error, action: string) => void
): StateCreator<T, [], [], T> {
  return (set, get, api) => {
    const safeSet = (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => {
      try {
        set(partial, replace)
      } catch (error) {
        console.error(`💥 ${storeName} Error:`, error)
        if (onError) {
          onError(error as Error, 'setState')
        }
      }
    }

    const safeGet = () => {
      try {
        return get()
      } catch (error) {
        console.error(`💥 ${storeName} Get Error:`, error)
        if (onError) {
          onError(error as Error, 'getState')
        }
        return {} as T
      }
    }

    return config(safeSet, safeGet, api)
  }
}

// Performance monitoring middleware
export function withPerformance<T>(
  config: StateCreator<T, [], [], T>,
  storeName: string,
  thresholdMs: number = 10
): StateCreator<T, [], [], T> {
  return (set, get, api) => {
    const monitoredSet = (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => {
      const start = performance.now()
      set(partial, replace)
      const end = performance.now()
      const duration = end - start

      if (duration > thresholdMs) {
        console.warn(`⚡ ${storeName} Update took ${duration.toFixed(2)}ms (threshold: ${thresholdMs}ms)`)
      }
    }

    const monitoredGet = () => {
      const start = performance.now()
      const result = get()
      const end = performance.now()
      const duration = end - start

      if (duration > thresholdMs) {
        console.warn(`⚡ ${storeName} Get took ${duration.toFixed(2)}ms (threshold: ${thresholdMs}ms)`)
      }

      return result
    }

    return config(monitoredSet, monitoredGet, api)
  }
}

// Utility function to get state changes
function getStateChanges(prevState: any, nextState: any): any {
  const changes: any = {}
  const allKeys = new Set([...Object.keys(prevState), ...Object.keys(nextState)])

  for (const key of allKeys) {
    if (JSON.stringify(prevState[key]) !== JSON.stringify(nextState[key])) {
      changes[key] = {
        from: prevState[key],
        to: nextState[key]
      }
    }
  }

  return changes
}

// Combined middleware for production use
export function withProductionEnhancements<T>(
  config: StateCreator<T, [], [], T>,
  options: {
    name: string
    storeName: string
    version?: number
    performanceThreshold?: number
    onError?: (error: Error, action: string) => void
  }
): StateCreator<T, [], [], T> {
  return withErrorBoundary(
    withPerformance(
      withEnhancedPersistence(
        config,
        {
          name: options.name,
          version: options.version,
          onRehydrateStorage: (state) => {
            console.log(`🚀 ${options.storeName} store rehydrated successfully`)
          }
        }
      ),
      options.storeName,
      options.performanceThreshold
    ),
    options.storeName,
    options.onError
  )
}
