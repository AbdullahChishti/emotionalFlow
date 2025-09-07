'use client'

/**
 * Performance Optimization Utilities
 * Provides memoization, virtualization, and performance monitoring
 */

import { useMemo, useCallback, memo, useRef, useEffect, useState } from 'react'
import React from 'react'
import { logPerformanceIssue } from '@/lib/error-logger'

// ==================== MEMOIZATION UTILITIES ====================

/**
 * Memoized component wrapper with performance logging
 */
export function withPerformanceLogging<T extends React.ComponentType<any>>(
  Component: T,
  componentName: string
): T {
  return memo(Component, (prevProps, nextProps) => {
    const startTime = performance.now()
    
    // Shallow comparison
    const isEqual = Object.keys(nextProps).every(key => {
      return prevProps[key] === nextProps[key]
    })
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Log performance issues
    if (duration > 5) { // More than 5ms for comparison
      logPerformanceIssue(
        `Slow prop comparison in ${componentName}`,
        duration,
        { component: componentName, propsCount: Object.keys(nextProps).length }
      )
    }
    
    return isEqual
  }) as T
}

/**
 * Memoized callback with dependency tracking
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  callbackName?: string
): T {
  const callbackRef = useRef(callback)
  const depsRef = useRef(deps)
  
  // Update callback ref
  callbackRef.current = callback
  
  // Check if dependencies changed
  const depsChanged = depsRef.current.length !== deps.length ||
    depsRef.current.some((dep, index) => dep !== deps[index])
  
  if (depsChanged) {
    depsRef.current = deps
  }
  
  return useCallback((...args: Parameters<T>) => {
    const startTime = performance.now()
    const result = callbackRef.current(...args)
    const endTime = performance.now()
    
    if (endTime - startTime > 10 && callbackName) { // More than 10ms
      logPerformanceIssue(
        `Slow callback execution: ${callbackName}`,
        endTime - startTime,
        { callback: callbackName }
      )
    }
    
    return result
  }, deps) as T
}

/**
 * Memoized value with performance tracking
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList,
  valueName?: string
): T {
  return useMemo(() => {
    const startTime = performance.now()
    const result = factory()
    const endTime = performance.now()
    
    if (endTime - startTime > 5 && valueName) { // More than 5ms
      logPerformanceIssue(
        `Slow value computation: ${valueName}`,
        endTime - startTime,
        { value: valueName }
      )
    }
    
    return result
  }, deps)
}

// ==================== VIRTUALIZATION UTILITIES ====================

/**
 * Virtual list hook for large datasets
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const scrollTop = useRef(0)
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop.current / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop.current + containerHeight) / itemHeight) + overscan
    )
    
    return { startIndex, endIndex }
  }, [items.length, itemHeight, containerHeight, overscan])
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
  }, [items, visibleRange])
  
  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight
  
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    scrollTop.current = event.currentTarget.scrollTop
  }, [])
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex: visibleRange.startIndex
  }
}

// ==================== PERFORMANCE MONITORING ====================

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const lastRenderTime = useRef(performance.now())
  
  useEffect(() => {
    renderCount.current += 1
    const currentTime = performance.now()
    const timeSinceLastRender = currentTime - lastRenderTime.current
    
    // Log frequent re-renders
    if (timeSinceLastRender < 16 && renderCount.current > 1) { // Less than 16ms between renders
      logPerformanceIssue(
        `Frequent re-renders in ${componentName}`,
        timeSinceLastRender,
        { component: componentName, renderCount: renderCount.current }
      )
    }
    
    lastRenderTime.current = currentTime
  })
  
  return {
    renderCount: renderCount.current,
    timeSinceLastRender: performance.now() - lastRenderTime.current
  }
}

/**
 * Measure component render time
 */
export function useRenderTime(componentName: string) {
  const startTime = useRef(performance.now())
  
  useEffect(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTime.current
    
    if (renderTime > 16) { // More than one frame (16ms)
      logPerformanceIssue(
        `Slow render in ${componentName}`,
        renderTime,
        { component: componentName }
      )
    }
    
    startTime.current = performance.now()
  })
}

// ==================== DEBOUNCING UTILITIES ====================

/**
 * Debounced callback hook
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay, ...deps]) as T
}

/**
 * Debounced value hook
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(timeout)
  }, [value, delay])
  
  return debouncedValue
}

// ==================== LAZY LOADING UTILITIES ====================

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  threshold: number = 0.1,
  rootMargin: string = '0px'
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<HTMLElement>(null)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold, rootMargin }
    )
    
    observer.observe(element)
    
    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin])
  
  return { ref, isIntersecting }
}

/**
 * Lazy component wrapper
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  return React.lazy(importFunc)
}

// ==================== MEMORY OPTIMIZATION ====================

/**
 * Cleanup hook for preventing memory leaks
 */
export function useCleanup() {
  const cleanupFunctions = useRef<(() => void)[]>([])
  
  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup)
  }, [])
  
  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(cleanup => {
        try {
          cleanup()
        } catch (error) {
          console.error('Cleanup function error:', error)
        }
      })
      cleanupFunctions.current = []
    }
  }, [])
  
  return addCleanup
}

// ==================== EXPORTS ====================

export default {
  withPerformanceLogging,
  useMemoizedCallback,
  useMemoizedValue,
  useVirtualList,
  usePerformanceMonitor,
  useRenderTime,
  useDebouncedCallback,
  useDebouncedValue,
  useIntersectionObserver,
  createLazyComponent,
  useCleanup
}
