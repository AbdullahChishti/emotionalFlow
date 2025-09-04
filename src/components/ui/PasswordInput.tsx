'use client'

import React, { useState, forwardRef, InputHTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  required?: boolean
  showStrengthIndicator?: boolean
  className?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({
    label,
    error,
    required,
    showStrengthIndicator = true,
    className = '',
    onChange,
    value,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState(value as string || '')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value)
      onChange?.(e)
    }

    const getPasswordStrength = (value: string) => {
      if (!value) return null

      let score = 0
      if (value.length >= 6) score++
      if (/[A-Z]/.test(value)) score++
      if (/[a-z]/.test(value)) score++
      if (/[0-9]/.test(value)) score++
      if (/[^A-Za-z0-9]/.test(value)) score++

      if (score <= 2) return {
        label: 'Weak',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        width: 'w-1/5',
        description: 'Use at least 6 characters with mixed case'
      }
      if (score === 3) return {
        label: 'Fair',
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        width: 'w-2/5',
        description: 'Add numbers or special characters'
      }
      if (score === 4) return {
        label: 'Good',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        width: 'w-3/5',
        description: 'Consider adding special characters'
      }
      return {
        label: 'Strong',
        color: 'bg-green-600',
        textColor: 'text-green-700',
        width: 'w-full',
        description: 'Excellent password strength!'
      }
    }

    const strength = getPasswordStrength(password)

    const fieldId = `password-${Math.random().toString(36).substr(2, 9)}`
    const errorId = error ? `${fieldId}-error` : undefined

    return (
      <div className="space-y-2">
        <label
          htmlFor={fieldId}
          className="block text-sm font-semibold text-slate-800"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        <div className="relative">
          <input
            id={fieldId}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handleChange}
            className={`
              w-full px-4 py-3 pr-12
              bg-white/90 border border-slate-300 rounded-xl
              text-slate-900 placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600
              transition-all duration-200
              disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              ${className}
            `.trim()}
            aria-invalid={!!error}
            aria-describedby={errorId}
            {...props}
          />

          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute inset-y-0 right-0 pr-3
              flex items-center
              text-slate-500 hover:text-slate-700
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 rounded
            "
            disabled={props.disabled}
          >
            <span className="material-symbols-outlined text-xl">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>

        <AnimatePresence>
          {showStrengthIndicator && strength && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    initial={{ width: 0 }}
                    animate={{ width: strength.width }}
                  />
                </div>
                <span className={`text-xs font-medium ${strength.textColor}`}>
                  {strength.label}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {strength.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-red-600"
            id={errorId}
            role="alert"
          >
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </motion.div>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
