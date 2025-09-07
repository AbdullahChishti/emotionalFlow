'use client'

import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useId } from 'react'
import { motion } from 'framer-motion'

interface BaseFormFieldProps {
  label: string
  error?: string
  required?: boolean
  hint?: string
  className?: string
  disabled?: boolean
}

interface InputFormFieldProps extends BaseFormFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url'
  multiline?: false
}

interface TextareaFormFieldProps extends BaseFormFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  type?: never
  multiline: true
}

type FormFieldProps = InputFormFieldProps | TextareaFormFieldProps

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  ({
    label,
    error,
    required,
    hint,
    className = '',
    disabled,
    multiline,
    ...props
  }, ref) => {
    const fieldId = useId()
    const errorId = error ? `${fieldId}-error` : undefined
    const hintId = hint ? `${fieldId}-hint` : undefined

    const baseClasses = `
      w-full px-4 py-3
      bg-white/90 border border-slate-300 rounded-xl
      text-slate-900 placeholder-slate-500
      focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600
      transition-all duration-200
      disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
      ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
      ${className}
    `.trim()

    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

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

        {multiline ? (
          <textarea
            id={fieldId}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={baseClasses}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={fieldId}
            ref={ref as React.Ref<HTMLInputElement>}
            className={baseClasses}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

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

        {hint && !error && (
          <div
            className="text-sm text-slate-500"
            id={hintId}
          >
            {hint}
          </div>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'
