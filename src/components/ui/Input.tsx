import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'w-full bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-secondary-800 placeholder:text-secondary-400 focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all duration-300 outline-none',
          error && 'border-red-300 focus:border-red-300 focus:ring-red-200',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'w-full bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-secondary-800 placeholder:text-secondary-400 focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all duration-300 outline-none resize-none min-h-[80px]',
          error && 'border-red-300 focus:border-red-300 focus:ring-red-200',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-semibold text-secondary-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          className
        )}
        {...props}
      />
    )
  }
)
Label.displayName = 'Label'
