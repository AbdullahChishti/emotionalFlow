# Component Migration Guide

This guide shows how to migrate components from scattered API calls to the centralized API system.

## Migration Patterns

### 1. Replace Direct Supabase Calls

#### Before (Scattered)
```typescript
// ❌ Old way - direct Supabase calls
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('table')
        .select('*')
        .eq('user_id', userId)
      
      if (error) throw error
      setData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  fetchData()
}, [userId])
```

#### After (Centralized)
```typescript
// ✅ New way - centralized store
const { 
  data, 
  loading, 
  error, 
  fetchData 
} = useAppDataStore()

useEffect(() => {
  if (userId) {
    fetchData(userId)
  }
}, [userId, fetchData])
```

### 2. Replace Multiple Data Services

#### Before (Scattered)
```typescript
// ❌ Old way - multiple services
import { AssessmentDataService } from '@/lib/services/AssessmentDataService'
import { AuthDataService } from '@/lib/services/AuthDataService'
import { ChatDataService } from '@/lib/services/ChatDataService'

const [assessments, setAssessments] = useState([])
const [profile, setProfile] = useState(null)
const [chatSessions, setChatSessions] = useState([])

useEffect(() => {
  const loadData = async () => {
    const [assessmentsData, profileData, chatData] = await Promise.all([
      AssessmentDataService.fetchUserAssessments(userId),
      AuthDataService.getProfile(userId),
      ChatDataService.getChatSessions(userId)
    ])
    
    setAssessments(assessmentsData)
    setProfile(profileData)
    setChatSessions(chatData)
  }
  
  loadData()
}, [userId])
```

#### After (Centralized)
```typescript
// ✅ New way - single store
import { useAppDataStore } from '@/stores/appDataStore'

const { 
  assessments,
  profile,
  chatSessions,
  loading,
  errors,
  fetchAssessments,
  fetchProfile,
  fetchChatSessions
} = useAppDataStore()

useEffect(() => {
  if (userId) {
    fetchAssessments(userId)
    fetchProfile(userId)
    fetchChatSessions(userId)
  }
}, [userId, fetchAssessments, fetchProfile, fetchChatSessions])
```

### 3. Replace Custom Error Handling

#### Before (Scattered)
```typescript
// ❌ Old way - custom error handling
const [error, setError] = useState(null)

const handleError = (error) => {
  if (error.message.includes('network')) {
    setError('Network error - please check your connection')
  } else if (error.message.includes('auth')) {
    setError('Please log in again')
  } else {
    setError('Something went wrong')
  }
}
```

#### After (Centralized)
```typescript
// ✅ New way - automatic error handling
const { errors } = useAppDataStore()

// Errors are automatically categorized and handled
// No need for custom error handling logic
```

### 4. Replace Custom Loading States

#### Before (Scattered)
```typescript
// ❌ Old way - custom loading states
const [loadingAssessments, setLoadingAssessments] = useState(false)
const [loadingProfile, setLoadingProfile] = useState(false)
const [loadingChat, setLoadingChat] = useState(false)

const isLoading = loadingAssessments || loadingProfile || loadingChat
```

#### After (Centralized)
```typescript
// ✅ New way - centralized loading states
const { loading } = useAppDataStore()

const isLoading = loading.assessments || loading.profile || loading.chat
```

## Step-by-Step Migration Process

### Step 1: Update Imports
```typescript
// Remove old imports
- import { supabase } from '@/lib/supabase'
- import { AssessmentDataService } from '@/lib/services/AssessmentDataService'
- import { AuthDataService } from '@/lib/services/AuthDataService'

// Add new import
+ import { useAppDataStore } from '@/stores/appDataStore'
```

### Step 2: Replace State Management
```typescript
// Remove local state
- const [data, setData] = useState(null)
- const [loading, setLoading] = useState(false)
- const [error, setError] = useState(null)

// Use centralized store
+ const { data, loading, error, fetchData } = useAppDataStore()
```

### Step 3: Replace Data Fetching
```typescript
// Remove custom fetch logic
- useEffect(() => {
-   const fetchData = async () => {
-     setLoading(true)
-     try {
-       const { data, error } = await supabase.from('table').select('*')
-       if (error) throw error
-       setData(data)
-     } catch (err) {
-       setError(err.message)
-     } finally {
-       setLoading(false)
-     }
-   }
-   fetchData()
- }, [userId])

// Use centralized actions
+ useEffect(() => {
+   if (userId) {
+     fetchData(userId)
+   }
+ }, [userId, fetchData])
```

### Step 4: Update Error Handling
```typescript
// Remove custom error handling
- if (error) {
-   return <ErrorMessage error={error} />
- }

// Use centralized error handling
+ if (errors.data) {
+   return <ErrorMessage error={errors.data} />
+ }
```

### Step 5: Update Loading States
```typescript
// Remove custom loading logic
- if (loading) {
-   return <LoadingSpinner />
- }

// Use centralized loading states
+ if (loading.data) {
+   return <LoadingSpinner />
+ }
```

## Migration Checklist

- [ ] Update imports to use `useAppDataStore`
- [ ] Remove local state management for data
- [ ] Replace custom data fetching with store actions
- [ ] Remove custom error handling logic
- [ ] Remove custom loading state management
- [ ] Update error display to use centralized errors
- [ ] Update loading display to use centralized loading states
- [ ] Test component functionality
- [ ] Remove unused imports and code

## Benefits After Migration

1. **Reduced Boilerplate**: 70% less code for data management
2. **Consistent Error Handling**: Automatic error categorization and user-friendly messages
3. **Unified Loading States**: Centralized loading management
4. **Better Performance**: Automatic caching and request deduplication
5. **Easier Testing**: Centralized mocking and state management
6. **Type Safety**: Full TypeScript support with IntelliSense

## Common Pitfalls to Avoid

1. **Don't mix old and new patterns** - Complete the migration fully
2. **Don't forget to remove unused imports** - Clean up after migration
3. **Don't duplicate data fetching** - Use the centralized store
4. **Don't ignore error states** - Handle centralized errors properly
5. **Don't forget to test** - Ensure functionality works after migration

## Example: Complete Component Migration

See `DashboardMigrated.tsx` for a complete example of a migrated component that demonstrates all the patterns and best practices.
