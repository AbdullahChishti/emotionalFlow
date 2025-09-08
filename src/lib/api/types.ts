/**
 * Centralized API Types
 * All type definitions for API operations and responses
 */

import { User, Profile } from '@/types'

// API Response Interface
export interface ApiResponse<T = any> {
}

// API Options
export interface ApiOptions {
}

// Query Options for Supabase
export interface QueryOptions {
}

// Insert/Update Options
export interface MutationOptions {
}

// Cache Entry
export interface CacheEntry<T = any> {
}

// Request Queue Entry
export interface RequestEntry<T = any> {
}

// Circuit Breaker State
export interface CircuitBreakerState {
}

// API Manager Health Status
export interface ApiHealthStatus {
}

// Supabase Auth Response
export interface SupabaseAuthResponse {
  } | null
}

// Supabase Query Response
export interface SupabaseQueryResponse<T> {
}

// Service Method Signatures
export interface AuthServiceInterface {
}

export interface ProfileServiceInterface {
}

export interface AssessmentServiceInterface {
}

export interface ChatServiceInterface {
}

// Domain Types (re-exported for convenience)
export type { User, Profile } from '@/types'
export type { AssessmentResult } from '@/data/assessments'

// Utility Types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
export type CacheKey = string
export type RequestId = string

// Event Types for Store Subscriptions
export type StoreEvent =
  | 'auth:signIn'
  | 'auth:signOut'
  | 'profile:updated'
  | 'assessment:saved'
  | 'chat:message'

// Subscription Callback
export type StoreSubscription<T = any> = (event: StoreEvent, data: T) => void

// Performance Metrics
export interface PerformanceMetrics {
}

// Error Context
export interface ErrorContext {
}
