'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { authManager } from '@/lib/services/AuthManager'

interface AuthErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorType?: 'session_expired' | 'unauthorized' | 'network_error' | 'unknown'
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void; signOut: () => void }>
}

export class AuthErrorBoundary extends React.Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    console.error('AuthErrorBoundary caught error:', error)

    // Determine error type
    let errorType: AuthErrorBoundaryState['errorType'] = 'unknown'

    if (error.message.includes('session') || error.message.includes('expired')) {
      errorType = 'session_expired'
    } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
      errorType = 'unauthorized'
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorType = 'network_error'
    }

    return {
      hasError: true,
      error,
      errorType
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    console.error('Auth error boundary:', error, errorInfo)

    // You could send this to an error reporting service
    // logError(error, 'auth_error_boundary', { componentStack: errorInfo.componentStack })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorType: undefined })
  }

  handleSignOut = async () => {
    try {
      console.log('🚪 [AUTH_ERROR_BOUNDARY] Signing out due to auth error')
      const result = await authManager.signOut()
      if (!result.success) {
        console.error('❌ [AUTH_ERROR_BOUNDARY] Sign out failed:', result.error)
        // Force redirect to home if sign out fails
        window.location.href = '/'
      }
    } catch (error) {
      console.error('❌ [AUTH_ERROR_BOUNDARY] Sign out exception:', error)
      // Force redirect even if sign out fails
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent
          error={this.state.error!}
          retry={this.handleRetry}
          signOut={this.handleSignOut}
        />
      }

      return <DefaultAuthErrorFallback
        error={this.state.error!}
        errorType={this.state.errorType}
        onRetry={this.handleRetry}
        onSignOut={this.handleSignOut}
      />
    }

    return this.props.children
  }
}

interface DefaultAuthErrorFallbackProps {
  error: Error
  errorType?: AuthErrorBoundaryState['errorType']
  onRetry: () => void
  onSignOut: () => void
}

function DefaultAuthErrorFallback({
  error,
  errorType,
  onRetry,
  onSignOut
}: DefaultAuthErrorFallbackProps) {
  const router = useRouter()

  const getErrorMessage = () => {
    switch (errorType) {
      case 'session_expired':
        return {
          title: 'Session Expired',
          message: 'Your session has expired. Please sign in again.',
          icon: 'schedule'
        }
      case 'unauthorized':
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to access this resource.',
          icon: 'block'
        }
      case 'network_error':
        return {
          title: 'Connection Error',
          message: 'Unable to connect. Please check your internet connection.',
          icon: 'wifi_off'
        }
      default:
        return {
          title: 'Authentication Error',
          message: 'Something went wrong with your authentication.',
          icon: 'error'
        }
    }
  }

  const errorInfo = getErrorMessage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto px-6 py-8"
      >
        <div className="glassmorphic rounded-3xl p-8 shadow-2xl border border-red-200/50 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="material-symbols-outlined text-3xl text-red-600">
              {errorInfo.icon}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-red-900 mb-4"
          >
            {errorInfo.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-red-700 mb-8"
          >
            {errorInfo.message}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            {errorType === 'network_error' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-3xl hover:shadow-3xl hover:shadow-emerald-900/50 border border-emerald-500/20"
              >
                Try Again
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSignOut}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Sign Out
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Go Home
            </motion.button>
          </motion.div>

          {process.env.NODE_ENV === 'development' && (
            <motion.details
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-left"
            >
              <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-red-800 bg-red-50 p-3 rounded-lg overflow-auto">
                {error.stack}
              </pre>
            </motion.details>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// HOC for wrapping components with auth error boundary
export function withAuthErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void; signOut: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <AuthErrorBoundary fallback={fallback}>
      <Component {...props} />
    </AuthErrorBoundary>
  )

  WrappedComponent.displayName = `withAuthErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
