/**
 * Advanced Caching Manager
 * Provides intelligent caching with invalidation strategies
 */

import { AssessmentResult } from '@/data/assessments'
import { UserProfile } from '@/data/assessment-integration'
import { errorLogger } from './error-logger'

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
  version: number
  metadata?: Record<string, any>
}

export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  clears: number
  hitRate: number
  size: number
  memoryUsage: number
}

export class CacheManager {
  private static memoryCache = new Map<string, CacheEntry>()

  /**
   * Clear all assessment-related cache entries
   */
  static clearAssessmentCache(): void {
    console.log('🧹 Clearing assessment-related cache entries...')

    const keysToDelete: string[] = []

    for (const [key] of this.memoryCache) {
      if (key.includes('assessment') || key.includes('profile') || key.includes('dashboard')) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      this.memoryCache.delete(key)
      this.stats.deletes++
    })

    this.stats.clears++

    console.log(`✅ Cleared ${keysToDelete.length} assessment-related cache entries`)

    // Also clear localStorage items that might contain cached data
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        let clearedCount = 0

        keys.forEach(key => {
          if (key.includes('assessment') || key.includes('profile') || key.includes('cache')) {
            localStorage.removeItem(key)
            clearedCount++
          }
        })

        if (clearedCount > 0) {
          console.log(`🗑️ Cleared ${clearedCount} localStorage cache items`)
        }
      } catch (error) {
        console.warn('Failed to clear localStorage cache:', error)
      }
    }
  }
  private static stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    clears: 0,
    hitRate: 0,
    size: 0,
    memoryUsage: 0
  }

  private static readonly DEFAULT_TTL = {
    assessment: 30 * 60 * 1000, // 30 minutes
    profile: 15 * 60 * 1000,    // 15 minutes
    chat: 5 * 60 * 1000,        // 5 minutes
    dashboard: 10 * 60 * 1000,  // 10 minutes
    api: 5 * 60 * 1000         // 5 minutes
  }

  private static readonly MAX_MEMORY_SIZE = 50 * 1024 * 1024 // 50MB
  private static cleanupInterval: NodeJS.Timeout | null = null

  /**
   * Initialize cache manager
   */
  static initialize() {
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.performCleanup()
    }, 5 * 60 * 1000) // Clean up every 5 minutes

    // Load from localStorage on initialization
    this.loadFromPersistentStorage()

    console.log('🗄️ Cache manager initialized')
  }

  /**
   * Set cache entry with TTL
   */
  static set<T>(
    key: string,
    data: T,
    options: {
      ttl?: number
      category?: keyof typeof CacheManager.DEFAULT_TTL
      metadata?: Record<string, any>
      version?: number
    } = {}
  ): void {
    try {
      const ttl = options.ttl || this.DEFAULT_TTL[options.category || 'api']
      const version = options.version || Date.now()

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        version,
        metadata: options.metadata
      }

      // Check memory limits
      if (this.getMemoryUsage() + this.estimateSize(entry) > this.MAX_MEMORY_SIZE) {
        this.evictOldEntries()
      }

      this.memoryCache.set(key, entry)
      this.stats.sets++

      // Persist to localStorage for important data
      if (options.category === 'assessment' || options.category === 'profile') {
        this.persistToStorage(key, entry)
      }

    } catch (error) {
      console.error('Cache set error:', error)
      errorLogger.logError(error instanceof Error ? error : new Error('Cache set failed'), {
        context: 'cache_manager',
        operation: 'set',
        key
      })
    }
  }

  /**
   * Get cache entry with validation
   */
  static get<T>(key: string): T | null {
    try {
      const entry = this.memoryCache.get(key) as CacheEntry<T> | undefined

      if (!entry) {
        this.stats.misses++
        return null
      }

      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key)
        this.stats.misses++
        return null
      }

      this.stats.hits++
      return entry.data
    } catch (error) {
      console.error('Cache get error:', error)
      this.stats.misses++
      return null
    }
  }

  /**
   * Get cache entry with metadata
   */
  static getWithMetadata<T>(key: string): { data: T; metadata: CacheEntry['metadata'] } | null {
    try {
      const entry = this.memoryCache.get(key) as CacheEntry<T> | undefined

      if (!entry || Date.now() - entry.timestamp > entry.ttl) {
        this.stats.misses++
        return null
      }

      this.stats.hits++
      return { data: entry.data, metadata: entry.metadata }
    } catch (error) {
      console.error('Cache getWithMetadata error:', error)
      this.stats.misses++
      return null
    }
  }

  /**
   * Check if key exists and is valid
   */
  static has(key: string): boolean {
    const entry = this.memoryCache.get(key)
    return entry ? Date.now() - entry.timestamp <= entry.ttl : false
  }

  /**
   * Delete cache entry
   */
  static delete(key: string): boolean {
    try {
      const deleted = this.memoryCache.delete(key)
      if (deleted) {
        this.stats.deletes++
        this.removeFromStorage(key)
      }
      return deleted
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  /**
   * Clear all cache entries
   */
  static clear(): void {
    try {
      this.memoryCache.clear()
      this.stats.clears++
      this.clearPersistentStorage()
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }

  /**
   * Clear cache by category
   */
  static clearCategory(category: keyof typeof CacheManager.DEFAULT_TTL): void {
    try {
      const keysToDelete: string[] = []

      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.metadata?.category === category) {
          keysToDelete.push(key)
        }
      }

      keysToDelete.forEach(key => this.memoryCache.delete(key))
      this.stats.deletes += keysToDelete.length

      console.log(`🗑️ Cleared ${keysToDelete.length} ${category} cache entries`)
    } catch (error) {
      console.error('Cache clear category error:', error)
    }
  }

  /**
   * Invalidate cache by pattern
   */
  static invalidatePattern(pattern: string): void {
    try {
      const keysToDelete: string[] = []

      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern)) {
          keysToDelete.push(key)
        }
      }

      keysToDelete.forEach(key => this.memoryCache.delete(key))
      this.stats.deletes += keysToDelete.length

      console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries matching "${pattern}"`)
    } catch (error) {
      console.error('Cache invalidate pattern error:', error)
    }
  }

  /**
   * Get cache statistics
   */
  static getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses
    this.stats.hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0
    this.stats.size = this.memoryCache.size
    this.stats.memoryUsage = this.getMemoryUsage()

    return { ...this.stats }
  }

  /**
   * Get all cache keys
   */
  static getKeys(): string[] {
    return Array.from(this.memoryCache.keys())
  }

  /**
   * Get cache entry metadata
   */
  static getMetadata(key: string): CacheEntry['metadata'] | null {
    const entry = this.memoryCache.get(key)
    return entry ? entry.metadata || null : null
  }

  /**
   * Set cache entry version for optimistic locking
   */
  static setVersion(key: string, version: number): boolean {
    try {
      const entry = this.memoryCache.get(key)
      if (entry) {
        entry.version = version
        return true
      }
      return false
    } catch (error) {
      console.error('Cache set version error:', error)
      return false
    }
  }

  /**
   * Get cache entry version
   */
  static getVersion(key: string): number | null {
    const entry = this.memoryCache.get(key)
    return entry ? entry.version : null
  }

  /**
   * Batch operations
   */
  static batchSet(entries: Array<{ key: string; data: any; options?: any }>): void {
    entries.forEach(({ key, data, options }) => {
      this.set(key, data, options)
    })
  }

  /**
   * Batch get operations
   */
  static batchGet<T>(keys: string[]): (T | null)[] {
    return keys.map(key => this.get<T>(key))
  }

  /**
   * Perform cleanup of expired entries
   */
  private static performCleanup(): void {
    try {
      const now = Date.now()
      const keysToDelete: string[] = []

      for (const [key, entry] of this.memoryCache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          keysToDelete.push(key)
        }
      }

      keysToDelete.forEach(key => this.memoryCache.delete(key))

      if (keysToDelete.length > 0) {
        console.log(`🧹 Cleaned up ${keysToDelete.length} expired cache entries`)
      }
    } catch (error) {
      console.error('Cache cleanup error:', error)
    }
  }

  /**
   * Evict old entries when memory limit is reached
   */
  private static evictOldEntries(): void {
    try {
      const entries = Array.from(this.memoryCache.entries())
        .map(([key, entry]) => ({ key, entry, age: Date.now() - entry.timestamp }))
        .sort((a, b) => b.age - a.age) // Sort by age (oldest first)

      // Remove oldest 20% of entries
      const toRemove = Math.ceil(entries.length * 0.2)
      for (let i = 0; i < toRemove; i++) {
        this.memoryCache.delete(entries[i].key)
      }

      console.log(`🗑️ Evicted ${toRemove} old cache entries due to memory limit`)
    } catch (error) {
      console.error('Cache eviction error:', error)
    }
  }

  /**
   * Estimate memory size of cache entry
   */
  private static estimateSize(entry: CacheEntry): number {
    try {
      const jsonString = JSON.stringify(entry)
      return jsonString.length * 2 // Rough estimate: 2 bytes per character
    } catch {
      return 1024 // Default estimate if serialization fails
    }
  }

  /**
   * Get current memory usage
   */
  private static getMemoryUsage(): number {
    try {
      let totalSize = 0
      for (const [key, entry] of this.memoryCache.entries()) {
        totalSize += key.length * 2 + this.estimateSize(entry)
      }
      return totalSize
    } catch {
      return 0
    }
  }

  /**
   * Persist important data to localStorage
   */
  private static persistToStorage(key: string, entry: CacheEntry): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storageKey = `cache_${key}`
        const dataToStore = {
          data: entry.data,
          timestamp: entry.timestamp,
          ttl: entry.ttl,
          version: entry.version,
          metadata: entry.metadata
        }
        localStorage.setItem(storageKey, JSON.stringify(dataToStore))
      }
    } catch (error) {
      console.error('Cache persistence error:', error)
    }
  }

  /**
   * Load data from localStorage
   */
  private static loadFromPersistentStorage(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return

      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'))

      for (const storageKey of keys) {
        try {
          const data = localStorage.getItem(storageKey)
          if (data) {
            const entry: CacheEntry = JSON.parse(data)
            const key = storageKey.replace('cache_', '')

            // Only load if not expired
            if (Date.now() - entry.timestamp <= entry.ttl) {
              this.memoryCache.set(key, entry)
            } else {
              localStorage.removeItem(storageKey)
            }
          }
        } catch (error) {
          console.error(`Error loading cache entry ${storageKey}:`, error)
          localStorage.removeItem(storageKey)
        }
      }

      console.log(`📥 Loaded ${this.memoryCache.size} cache entries from storage`)
    } catch (error) {
      console.error('Cache loading error:', error)
    }
  }

  /**
   * Remove from persistent storage
   */
  private static removeFromStorage(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(`cache_${key}`)
      }
    } catch (error) {
      console.error('Cache removal error:', error)
    }
  }

  /**
   * Clear persistent storage
   */
  private static clearPersistentStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'))
        keys.forEach(key => localStorage.removeItem(key))
      }
    } catch (error) {
      console.error('Cache clear storage error:', error)
    }
  }

  /**
   * Destroy cache manager
   */
  static destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  CacheManager.initialize()
}
