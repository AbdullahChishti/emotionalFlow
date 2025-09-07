# Centralized API System

This directory contains the centralized API management system that replaces scattered API calls throughout the application.

## Architecture

### 1. ApiManager (`ApiManager.ts`)
- **Single source of truth** for all API calls
- **Unified error handling** with context-aware error messages
- **Automatic retry logic** with exponential backoff and jitter
- **Centralized authentication** validation and refresh
- **Request deduplication** to prevent duplicate calls
- **Built-in caching** with TTL support
- **Timeout handling** for all requests

### 2. DataService (`DataService.ts`)
- **High-level data operations** using ApiManager
- **Type-safe** data transformations
- **Consistent response formats** across all operations
- **Specialized methods** for different data types
- **Bulk operations** for efficient data fetching

### 3. AppDataStore (`appDataStore.ts`)
- **Unified state management** for all application data
- **Automatic caching** with stale-while-revalidate pattern
- **Centralized loading states** and error handling
- **Computed getters** for derived data
- **Optimistic updates** for better UX

## Migration Guide

### Before (Scattered API Calls)

```typescript
// ❌ Old way - scattered throughout components
const { data, error } = await supabase
  .from('assessment_results')
  .select('*')
  .eq('user_id', userId)

if (error) {
  console.error('Error:', error)
  setError(error.message)
  return
}

setAssessments(data)
```

### After (Centralized API)

```typescript
// ✅ New way - centralized and consistent
const { assessments, loading, error } = useAppDataStore()

// Fetch data
await fetchAssessments(userId)

// Data is automatically available in store
// Loading states are managed automatically
// Errors are handled consistently
```

## Usage Examples

### Basic Data Fetching

```typescript
import { useAppDataStore } from '@/stores/appDataStore'

function MyComponent() {
  const { 
    assessments, 
    profile, 
    loading, 
    errors,
    fetchAssessments,
    fetchProfile 
  } = useAppDataStore()

  useEffect(() => {
    if (userId) {
      fetchAssessments(userId)
      fetchProfile(userId)
    }
  }, [userId])

  if (loading.assessments) return <LoadingSpinner />
  if (errors.assessments) return <ErrorMessage error={errors.assessments} />

  return <div>{/* Render assessments */}</div>
}
```

### Data Operations

```typescript
import { useAppDataStore } from '@/stores/appDataStore'

function AssessmentForm() {
  const { saveAssessment, fetchAssessments } = useAppDataStore()

  const handleSubmit = async (assessmentData) => {
    const success = await saveAssessment(userId, assessmentData)
    if (success) {
      // Data is automatically updated in store
      toast.success('Assessment saved!')
    }
  }
}
```

### Direct API Usage (Advanced)

```typescript
import { api } from '@/lib/api/ApiManager'

// Generic HTTP calls
const response = await api.get<User[]>('/api/users', {
  cache: true,
  cacheTTL: 300000
})

// Supabase operations
const assessments = await api.query<AssessmentResult[]>(
  'assessment_results',
  { select: '*', match: { user_id: userId } },
  { cache: true }
)

// Edge Functions
const lifeImpacts = await api.function<LifeImpactsResult>(
  'daily-life-impacts',
  { assessmentData },
  { timeout: 60000 }
)
```

## Benefits

### 1. Consistency
- **Unified error handling** across all API calls
- **Consistent loading states** and user feedback
- **Standardized response formats** for all operations

### 2. Performance
- **Automatic caching** reduces redundant API calls
- **Request deduplication** prevents duplicate requests
- **Optimistic updates** improve perceived performance

### 3. Maintainability
- **Single place** to update API logic
- **Centralized logging** and debugging
- **Type-safe** operations throughout

### 4. Developer Experience
- **Simplified components** with less boilerplate
- **Automatic state management** for data operations
- **Built-in error handling** and retry logic

## Migration Steps

### Phase 1: Install New System
1. ✅ Create `ApiManager.ts`
2. ✅ Create `DataService.ts` 
3. ✅ Create `appDataStore.ts`

### Phase 2: Migrate Components
1. Replace direct Supabase calls with `useAppDataStore`
2. Remove local state management for data
3. Update error handling to use centralized errors

### Phase 3: Clean Up
1. Remove old data services
2. Remove scattered API logic
3. Update tests to use new system

## Configuration

### ApiManager Options

```typescript
const options: ApiOptions = {
  maxRetries: 3,           // Number of retry attempts
  baseDelay: 1000,         // Base delay between retries (ms)
  validateAuth: true,      // Validate auth before request
  timeout: 30000,          // Request timeout (ms)
  cache: true,             // Enable caching
  cacheTTL: 300000         // Cache TTL (ms)
}
```

### Store Configuration

```typescript
// Cache TTLs for different data types
const CACHE_TTL = {
  assessments: 300000,    // 5 minutes
  profile: 600000,        // 10 minutes
  chat: 300000,           // 5 minutes
  mood: 300000,           // 5 minutes
  listening: 300000,      // 5 minutes
  overall: 600000,        // 10 minutes
  lifeImpacts: 1800000    // 30 minutes
}
```

## Error Handling

The centralized system provides consistent error handling:

```typescript
// Automatic error categorization
if (error.message.includes('Authentication failed')) {
  // Redirect to login
} else if (error.message.includes('timeout')) {
  // Show retry option
} else if (error.message.includes('network')) {
  // Show network error message
} else {
  // Show generic error message
}
```

## Monitoring

Built-in monitoring and debugging:

```typescript
// Health check
const health = await api.healthCheck()

// Cache statistics
const stats = api.getCacheStats()

// Clear cache
api.clearCache()
```

This centralized system provides a solid foundation for scalable, maintainable API management throughout the application.
