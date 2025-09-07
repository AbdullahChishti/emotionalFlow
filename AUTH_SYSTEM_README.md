# Authentication System Documentation

## Overview

The MindWell authentication system has been completely redesigned to provide enterprise-grade reliability, comprehensive error handling, and excellent user experience. This document covers the new unified authentication architecture implemented in Phase 1-3.

## Architecture

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AuthProvider  │    │  AuthManager    │    │     Stores      │
│   (React)       │◄──►│ (Singleton)     │◄──►│ (Zustand)      │
│                 │    │                 │    │                 │
│ • Network status│    │ • Supabase auth │    │ • State mgmt    │
│ • Error handling│    │ • Profile mgmt  │    │ • Persistence   │
│ • User feedback │    │ • Error recovery│    │ • Persistence   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│Network Resilience│    │ Error Constants │    │ Auth Redirects  │
│                 │    │                 │    │                 │
│ • Timeouts       │    │ • Error codes   │    │ • URL building  │
│ • Retries        │    │ • User messages │    │ • Redirect logic│
│ • Offline detect │    │ • Recovery      │    │ • Route handling│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Key Features

### 1. Unified Authentication Manager

The `AuthManager` is the single source of truth for all authentication operations:

```typescript
import { authManager } from '@/lib/services/AuthManager'

// Sign in with automatic error handling and network resilience
const result = await authManager.signIn(email, password)
if (!result.success) {
  // Structured error with user-friendly message
  console.error(result.error.userMessage)
  if (result.error.canRetry) {
    // Show retry option
  }
}
```

**Features:**
- Singleton pattern prevents multiple instances
- Request deduplication prevents race conditions
- Automatic network resilience with timeouts and retries
- Comprehensive error classification and user-friendly messages
- Profile management with caching and deduplication

### 2. Network Resilience

Automatic handling of network issues with intelligent retry logic:

```typescript
// Automatic timeout (10s), retry (2 attempts), offline detection
const result = await authManager.signIn(email, password)

// Manual network resilience for custom operations
const result = await NetworkResilience.executeResiliently(
  () => myApiCall(),
  'Custom operation',
  { timeout: 5000 },
  { maxRetries: 3 }
)
```

**Features:**
- Automatic online/offline detection
- Configurable timeouts and retry attempts
- Exponential backoff for retries
- Graceful degradation when offline
- Real-time network status monitoring

### 3. Comprehensive Error Handling

Structured error system with user-friendly messages and recovery options:

```typescript
// Error classification with specific handling
if (result.error?.code === 'INVALID_CREDENTIALS') {
  // Show specific message and retry option
} else if (result.error?.code === 'NETWORK_ERROR') {
  // Show network-specific message
} else if (result.error?.code === 'SERVICE_UNAVAILABLE') {
  // Show maintenance message
}
```

**Error Categories:**
- **Network Errors**: Connection issues, timeouts, offline status
- **Authentication Errors**: Invalid credentials, email confirmation, rate limits
- **Session Errors**: Expired sessions, invalid tokens
- **Service Errors**: Server unavailability, maintenance
- **Profile Errors**: Creation failures, missing profiles

### 4. Enhanced User Experience

```typescript
// React component with enhanced auth context
function MyComponent() {
  const {
    user,
    isAuthenticated,
    isOnline,        // Network status
    currentError,    // Structured error object
    clearError,      // Error clearing function
    signIn,
    signOut
  } = useAuthContext()

  return (
    <div>
      {!isOnline && <OfflineBanner />}
      {currentError && (
        <ErrorMessage
          error={currentError}
          onRetry={currentError.canRetry ? handleRetry : undefined}
          onDismiss={clearError}
        />
      )}
      {/* Rest of component */}
    </div>
  )
}
```

## Usage Guide

### Basic Authentication

```typescript
import { useAuthContext } from '@/components/providers/AuthProvider'

function LoginForm() {
  const { signIn, isOnline, currentError, clearError } = useAuthContext()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isOnline) {
      alert('No internet connection. Please check your network.')
      return
    }

    const result = await signIn(email, password)

    if (!result.success) {
      // Error is automatically set in context
      // UI will show error message
      if (result.error.canRetry) {
        // Could show retry button
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {currentError && (
        <div className="error-message">
          {currentError.userMessage}
          {currentError.suggestedAction && (
            <div className="suggestion">
              {currentError.suggestedAction}
            </div>
          )}
          {currentError.canRetry && (
            <button onClick={clearError}>Try Again</button>
          )}
        </div>
      )}
    </form>
  )
}
```

### Advanced Error Handling

```typescript
import { AUTH_ERROR_CODES } from '@/lib/constants/auth-errors'

function handleAuthError(error) {
  switch (error.code) {
    case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
      // Show specific invalid credentials UI
      break

    case AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED:
      // Show email confirmation UI
      break

    case AUTH_ERROR_CODES.NETWORK_ERROR:
      // Show network troubleshooting UI
      break

    case AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS:
      // Show rate limit UI with countdown
      break

    default:
      // Show generic error UI
      break
  }
}
```

### Network-Aware Components

```typescript
import { NetworkResilience } from '@/lib/utils/network-resilience'

function NetworkAwareComponent() {
  const [isOnline, setIsOnline] = useState(NetworkResilience.getIsOnline())

  useEffect(() => {
    const unsubscribe = NetworkResilience.onConnectionChange(setIsOnline)
    return unsubscribe
  }, [])

  return (
    <div>
      {isOnline ? (
        <OnlineContent />
      ) : (
        <OfflineContent />
      )}
    </div>
  )
}
```

## Configuration

### Default Settings

```typescript
// Network resilience defaults (can be overridden)
const DEFAULT_TIMEOUT = 10000        // 10 seconds
const DEFAULT_RETRIES = 2           // 2 retry attempts
const DEFAULT_BASE_DELAY = 1000     // 1 second base delay
const DEFAULT_BACKOFF_FACTOR = 2    // Exponential backoff
```

### Custom Configuration

```typescript
// Custom timeout and retry settings
const result = await authManager.signIn(email, password, {
  timeout: 15000,      // 15 second timeout
  maxRetries: 3,       // 3 retry attempts
  baseDelay: 2000      // 2 second base delay
})
```

## Error Codes Reference

| Error Code | Description | Can Retry | Severity |
|------------|-------------|-----------|----------|
| `NETWORK_ERROR` | Network connection issues | ✅ | Medium |
| `TIMEOUT_ERROR` | Operation timeout | ✅ | Medium |
| `INVALID_CREDENTIALS` | Wrong email/password | ✅ | Low |
| `EMAIL_NOT_CONFIRMED` | Email not verified | ❌ | Low |
| `ACCOUNT_DISABLED` | Account suspended | ❌ | High |
| `TOO_MANY_ATTEMPTS` | Rate limited | ❌ | Medium |
| `SESSION_EXPIRED` | Session timeout | ✅ | Low |
| `SERVICE_UNAVAILABLE` | Server maintenance | ✅ | High |
| `PROFILE_NOT_FOUND` | Profile missing | ✅ | Low |

## Testing

### Unit Tests

```bash
# Run all auth-related tests
npm test -- AuthManager.test.ts
npm test -- AuthProvider.integration.test.tsx
npm test -- NetworkResilience.test.ts

# Run E2E tests
npm test -- AuthE2E.test.ts
```

### Test Coverage

- ✅ AuthManager unit tests (100% coverage)
- ✅ AuthProvider integration tests
- ✅ Network resilience tests
- ✅ E2E edge case tests
- ✅ Error handling scenario tests

## Migration Guide

### From Old Auth System

```typescript
// OLD WAY
const { signIn } = useAuthStore()
const result = await signIn(email, password)

// NEW WAY
const { signIn } = useAuthContext()
const result = await signIn(email, password)

// Benefits:
// - Automatic error handling
// - Network resilience
// - Better user feedback
// - Consistent error messages
```

### Breaking Changes

1. **Error Format**: Errors now include structured data instead of plain strings
2. **Network Awareness**: Components should handle offline state
3. **Retry Logic**: Manual retry handling replaced with automatic retries
4. **Loading States**: Enhanced loading states with network status

## Troubleshooting

### Common Issues

**1. "Sign in already in progress"**
- Multiple sign-in attempts detected
- Wait for current operation to complete
- Check for duplicate form submissions

**2. "No internet connection"**
- Check network connectivity
- Wait for connection to restore
- Try again when online

**3. "Operation timed out"**
- Network may be slow
- Try again
- Check server status

**4. "Invalid credentials"**
- Verify email and password
- Check for typos
- Reset password if needed

### Debug Logging

Enable detailed logging:

```typescript
// In browser console
localStorage.setItem('debug', 'auth:*')
```

### Performance Monitoring

Monitor auth operations:

```typescript
// Track auth performance
const startTime = Date.now()
const result = await authManager.signIn(email, password)
const duration = Date.now() - startTime

console.log(`Sign in took ${duration}ms`)
```

## Security Considerations

### Best Practices

1. **Never log sensitive data** (passwords, tokens)
2. **Use HTTPS in production**
3. **Implement proper CORS policies**
4. **Regular security audits**
5. **Monitor for unusual auth patterns**

### Security Features

- ✅ Automatic token refresh
- ✅ Secure session management
- ✅ Rate limiting protection
- ✅ CSRF protection via Supabase
- ✅ Secure password policies

## API Reference

### AuthManager Methods

```typescript
interface AuthManager {
  // Authentication
  signIn(email: string, password: string): Promise<SignInResult>
  signUp(email: string, password: string, displayName: string): Promise<SignUpResult>
  signOut(): Promise<SignOutResult>
  refreshSession(): Promise<{ success: boolean; error?: AuthError }>

  // Initialization
  initialize(): Promise<void>
  cleanup(): void
}
```

### AuthProvider Context

```typescript
interface AuthContextType {
  // User state
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean

  // Network state
  isOnline: boolean

  // Error state
  currentError: AuthError | null

  // Methods
  signIn(email: string, password: string): Promise<SignInResult>
  signUp(email: string, password: string, displayName: string): Promise<SignUpResult>
  signOut(): Promise<void>
  refreshProfile(): Promise<void>
  updateProfile(profile: Profile): void
  clearError(): void
}
```

### NetworkResilience Methods

```typescript
interface NetworkResilience {
  // Status
  getIsOnline(): boolean
  onConnectionChange(callback: (online: boolean) => void): () => void

  // Operations
  withTimeout<T>(operation: () => Promise<T>, options: TimeoutOptions): Promise<T>
  withRetry<T>(operation: () => Promise<T>, operationName: string, options?: RetryOptions): Promise<T>
  executeResiliently<T>(operation: () => Promise<T>, operationName: string, timeoutOptions?: TimeoutOptions, retryOptions?: RetryOptions): Promise<T>

  // Initialization
  initialize(): void
}
```

## Support

For issues or questions about the authentication system:

1. Check the troubleshooting guide above
2. Review the test files for usage examples
3. Check browser console for detailed error logs
4. Contact the development team with operation IDs from logs

## Changelog

### Phase 3 (Current)
- ✅ Comprehensive error handling system
- ✅ Network resilience with timeouts and retries
- ✅ Enhanced user feedback and offline detection
- ✅ Structured error messages with recovery options
- ✅ Automatic network status monitoring

### Phase 2
- ✅ Unified sign out behavior
- ✅ Standardized redirect logic
- ✅ Removed redundant logout implementations
- ✅ Consistent error messages and user feedback

### Phase 1
- ✅ Unified AuthManager architecture
- ✅ Fixed auth store race conditions
- ✅ Standardized profile management
- ✅ Enhanced state synchronization

---

**Last Updated**: Phase 3 Implementation
**Version**: 3.0.0
**Status**: Production Ready 🚀
