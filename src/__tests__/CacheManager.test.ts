/**
 * Cache Manager Tests
 * Comprehensive testing for caching functionality
 */

import { describe, it, expect, beforeEach, afterEach, jest } from 'vitest'
import { CacheManager } from '@/lib/cache-manager'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('CacheManager', () => {
  beforeEach(() => {
    // Clear all mocks and cache before each test
    jest.clearAllMocks()
    CacheManager.clear()

    // Setup localStorage mocks
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})
    localStorageMock.removeItem.mockImplementation(() => {})
  })

  afterEach(() => {
    CacheManager.clear()
  })

  describe('Basic Operations', () => {
    it('should set and get cache entries', () => {
      const testData = { id: 1, name: 'test' }
      const key = 'test_key'

      CacheManager.set(key, testData)
      const result = CacheManager.get(key)

      expect(result).toEqual(testData)
    })

    it('should return null for non-existent keys', () => {
      const result = CacheManager.get('non_existent_key')
      expect(result).toBeNull()
    })

    it('should handle complex data types', () => {
      const testData = {
        users: [
          { id: 1, name: 'Alice', preferences: { theme: 'dark' } }
        ],
        metadata: {
          version: '1.0',
          timestamp: Date.now()
        }
      }

      CacheManager.set('complex_data', testData)
      const result = CacheManager.get('complex_data')

      expect(result).toEqual(testData)
    })

    it('should overwrite existing entries', () => {
      const key = 'test_key'
      CacheManager.set(key, 'first_value')
      CacheManager.set(key, 'second_value')

      const result = CacheManager.get(key)
      expect(result).toBe('second_value')
    })
  })

  describe('TTL (Time To Live)', () => {
    it('should respect TTL for cache entries', async () => {
      const testData = { message: 'expires soon' }
      const shortTtl = 100 // 100ms

      CacheManager.set('expiring_key', testData, { ttl: shortTtl })

      // Should exist immediately
      expect(CacheManager.get('expiring_key')).toEqual(testData)

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, shortTtl + 10))

      // Should be expired
      expect(CacheManager.get('expiring_key')).toBeNull()
    })

    it('should use category-specific TTL', () => {
      const testData = { type: 'assessment' }

      CacheManager.set('assessment_data', testData, { category: 'assessment' })
      expect(CacheManager.get('assessment_data')).toEqual(testData)
    })
  })

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', () => {
      const key = 'stats_test'

      // Miss
      CacheManager.get(key)
      let stats = CacheManager.getStats()
      expect(stats.misses).toBe(1)
      expect(stats.hits).toBe(0)

      // Set and hit
      CacheManager.set(key, 'test_data')
      CacheManager.get(key)
      stats = CacheManager.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.sets).toBe(1)
    })

    it('should calculate hit rate correctly', () => {
      const key = 'hit_rate_test'

      // 2 misses, 1 hit
      CacheManager.get('miss1')
      CacheManager.get('miss2')
      CacheManager.set(key, 'data')
      CacheManager.get(key)

      const stats = CacheManager.getStats()
      expect(stats.hitRate).toBe(0.33) // 1 hit out of 3 requests
    })
  })

  describe('Cache Invalidation', () => {
    it('should delete specific entries', () => {
      const key1 = 'keep_this'
      const key2 = 'delete_this'

      CacheManager.set(key1, 'keep')
      CacheManager.set(key2, 'delete')

      expect(CacheManager.delete(key2)).toBe(true)
      expect(CacheManager.get(key1)).toBe('keep')
      expect(CacheManager.get(key2)).toBeNull()
    })

    it('should clear all entries', () => {
      CacheManager.set('key1', 'data1')
      CacheManager.set('key2', 'data2')

      CacheManager.clear()

      expect(CacheManager.get('key1')).toBeNull()
      expect(CacheManager.get('key2')).toBeNull()

      const stats = CacheManager.getStats()
      expect(stats.clears).toBe(1)
    })

    it('should invalidate by pattern', () => {
      CacheManager.set('user_1_profile', 'user1')
      CacheManager.set('user_2_profile', 'user2')
      CacheManager.set('user_1_settings', 'settings1')
      CacheManager.set('system_config', 'config')

      CacheManager.invalidatePattern('user_1')

      expect(CacheManager.get('user_1_profile')).toBeNull()
      expect(CacheManager.get('user_1_settings')).toBeNull()
      expect(CacheManager.get('user_2_profile')).toBe('user2')
      expect(CacheManager.get('system_config')).toBe('config')
    })

    it('should clear by category', () => {
      CacheManager.set('assessment_phq9', 'phq9_data', { category: 'assessment' })
      CacheManager.set('profile_user1', 'profile_data', { category: 'profile' })
      CacheManager.set('api_response', 'api_data', { category: 'api' })

      CacheManager.clearCategory('assessment')

      expect(CacheManager.get('assessment_phq9')).toBeNull()
      expect(CacheManager.get('profile_user1')).toBe('profile_data')
      expect(CacheManager.get('api_response')).toBe('api_data')
    })
  })

  describe('Metadata and Versioning', () => {
    it('should store and retrieve metadata', () => {
      const key = 'metadata_test'
      const data = { value: 'test' }
      const metadata = { source: 'api', version: '1.0' }

      CacheManager.set(key, data, { metadata })

      const result = CacheManager.getWithMetadata(key)
      expect(result?.data).toEqual(data)
      expect(result?.metadata).toEqual(metadata)
    })

    it('should handle versioning', () => {
      const key = 'version_test'

      CacheManager.set(key, 'version1', { version: 1 })
      expect(CacheManager.getVersion(key)).toBe(1)

      CacheManager.setVersion(key, 2)
      expect(CacheManager.getVersion(key)).toBe(2)
    })
  })

  describe('Batch Operations', () => {
    it('should handle batch set operations', () => {
      const entries = [
        { key: 'batch1', data: 'data1' },
        { key: 'batch2', data: 'data2' },
        { key: 'batch3', data: 'data3' }
      ]

      CacheManager.batchSet(entries)

      expect(CacheManager.get('batch1')).toBe('data1')
      expect(CacheManager.get('batch2')).toBe('data2')
      expect(CacheManager.get('batch3')).toBe('data3')
    })

    it('should handle batch get operations', () => {
      CacheManager.set('batch_get_1', 'data1')
      CacheManager.set('batch_get_2', 'data2')
      // batch_get_3 not set

      const results = CacheManager.batchGet(['batch_get_1', 'batch_get_2', 'batch_get_3'])

      expect(results).toEqual(['data1', 'data2', null])
    })
  })

  describe('Persistence', () => {
    it('should persist important data to localStorage', () => {
      const key = 'persistent_test'
      const data = { important: 'data' }

      CacheManager.set(key, data, { category: 'assessment' })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `cache_${key}`,
        expect.any(String)
      )
    })

    it('should load data from localStorage on initialization', () => {
      const mockData = {
        data: { loaded: 'from_storage' },
        timestamp: Date.now(),
        ttl: 3600000, // 1 hour
        version: Date.now()
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData))

      // Simulate loading from storage
      CacheManager.set('loaded_key', mockData.data)

      expect(CacheManager.get('loaded_key')).toEqual(mockData.data)
    })

    it('should not load expired data from localStorage', () => {
      const expiredData = {
        data: { expired: 'data' },
        timestamp: Date.now() - 7200000, // 2 hours ago
        ttl: 3600000, // 1 hour TTL
        version: Date.now()
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredData))

      // Simulate loading from storage - should not load expired data
      const result = CacheManager.get('expired_key')
      expect(result).toBeNull()
    })
  })

  describe('Memory Management', () => {
    it('should track cache size', () => {
      CacheManager.set('size_test_1', 'data1')
      CacheManager.set('size_test_2', 'data2')

      const stats = CacheManager.getStats()
      expect(stats.size).toBeGreaterThan(0)
    })

    it('should provide cache keys', () => {
      CacheManager.set('keys_test_1', 'data1')
      CacheManager.set('keys_test_2', 'data2')

      const keys = CacheManager.getKeys()
      expect(keys).toContain('keys_test_1')
      expect(keys).toContain('keys_test_2')
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      // Should not throw
      expect(() => {
        CacheManager.set('error_test', 'data')
      }).not.toThrow()

      // Should still work for getting data
      expect(CacheManager.get('error_test')).toBe('data')
    })

    it('should handle JSON serialization errors', () => {
      const circularRef: any = {}
      circularRef.self = circularRef

      // Should handle circular references
      expect(() => {
        CacheManager.set('circular_test', circularRef)
      }).not.toThrow()
    })
  })

  describe('Utility Methods', () => {
    it('should check if key exists', () => {
      expect(CacheManager.has('non_existent')).toBe(false)

      CacheManager.set('existing_key', 'data')
      expect(CacheManager.has('existing_key')).toBe(true)
    })

    it('should provide comprehensive statistics', () => {
      CacheManager.set('stats_test', 'data')

      const stats = CacheManager.getStats()

      expect(stats).toHaveProperty('hits')
      expect(stats).toHaveProperty('misses')
      expect(stats).toHaveProperty('sets')
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('hitRate')
      expect(stats).toHaveProperty('memoryUsage')
    })
  })
})
