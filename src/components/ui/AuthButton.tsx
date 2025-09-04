'use client'

import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { LoadingSpinner } from './LoadingSpinner'

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'social'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    disabled,
    icon,
    iconPosition = 'left',
    className = '',
    ...props
  }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center gap-3
      font-semibold rounded-xl
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:cursor-not-allowed disabled:opacity-60
      ${fullWidth ? 'w-full' : ''}
    `.trim()

    const variantClasses = {
      primary: `
        text-white
        shadow-md hover:shadow-lg
        focus:ring-offset-2
        ${loading ? '' : ''}
      `,
      secondary: `
        bg-slate-100 hover:bg-slate-200
        text-slate-900
        focus:ring-slate-500
        shadow-sm hover:shadow-md
        ${loading ? 'hover:bg-slate-100' : ''}
      `,
      outline: `
        bg-transparent hover:bg-brand-600
        text-brand-600 hover:text-white
        border-2 border-brand-600
        focus:ring-brand-600
        ${loading ? 'hover:bg-transparent hover:text-brand-600' : ''}
      `,
      social: `
        bg-white hover:bg-slate-50
        text-slate-700 hover:text-slate-900
        border border-slate-300
        focus:ring-slate-500
        shadow-sm hover:shadow-md
        ${loading ? 'hover:bg-white hover:text-slate-700' : ''}
      `
    }

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[52px]'
    }

    const finalClasses = `
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `.trim()

    const content = (
      <>
        {loading && <LoadingSpinner size="sm" />}
        {icon && iconPosition === 'left' && !loading && icon}
        <span className={loading ? 'opacity-70' : ''}>
          {loading ? 'Processing...' : children}
        </span>
        {icon && iconPosition === 'right' && !loading && icon}
      </>
    )

    return (
      <motion.button
        ref={ref}
        className={finalClasses}
        disabled={disabled || loading}
        style={variant === 'primary' ? {
          backgroundColor: '#335f64',
          '--tw-ring-color': '#335f64'
        } : {}}
        whileHover={variant === 'primary' && !loading ? {
          scale: 1.02,
          backgroundColor: '#2a4f52'
        } : loading ? {} : { scale: 1.02 }}
        whileTap={loading ? {} : { scale: 0.98 }}
        {...props}
      >
        {content}
      </motion.button>
    )
  }
)

AuthButton.displayName = 'AuthButton'
