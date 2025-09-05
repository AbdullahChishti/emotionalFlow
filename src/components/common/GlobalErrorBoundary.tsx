/**
 * Global Error Boundary
 * Catches and handles errors throughout the application
 */

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and external service
    console.error('🚨 Global Error Boundary caught an error:', error, errorInfo)
    
    // Log to external service (e.g., Sentry, LogRocket, etc.)
    this.logErrorToService(error, errorInfo)

    this.setState({
      error,
      errorInfo
    })
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // In production, this would send to an external logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo })
      console.log('📊 Error logged to external service:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full mx-4"
          >
            <div className="glassmorphic p-8 rounded-3xl shadow-2xl border border-white/20 text-center">
              {/* Error Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-3xl text-red-600">
                  error
                </span>
              </motion.div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold text-zinc-900 mb-4">
                Oops! Something went wrong
              </h1>
              
              <p className="text-zinc-600 mb-6 leading-relaxed">
                We're sorry, but something unexpected happened. Our team has been notified and we're working to fix it.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-zinc-700 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="bg-zinc-100 p-4 rounded-lg text-xs font-mono text-zinc-800 overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleRetry}
                  className="px-6 py-3 bg-brand-green-500 hover:bg-brand-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  Try Again
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleReload}
                  className="px-6 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg font-medium transition-colors"
                >
                  Reload Page
                </motion.button>
              </div>

              {/* Support Link */}
              <div className="mt-6 pt-6 border-t border-zinc-200">
                <p className="text-sm text-zinc-500 mb-2">
                  Still having trouble?
                </p>
                <a
                  href="/help"
                  className="text-brand-green-600 hover:text-brand-green-700 font-medium text-sm"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default GlobalErrorBoundary
