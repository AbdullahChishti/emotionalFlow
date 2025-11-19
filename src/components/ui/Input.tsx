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
          'w-full bg-white border border-[#E8E8ED] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder:text-[#86868B] focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all duration-300 outline-none',
          error && 'border-[#FF3B30] focus:border-[#FF3B30] focus:ring-[#FF3B30]/20',
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
          'w-full bg-white border border-[#E8E8ED] rounded-xl px-4 py-3 text-[#1D1D1F] placeholder:text-[#86868B] focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all duration-300 outline-none resize-none min-h-[80px]',
          error && 'border-[#FF3B30] focus:border-[#FF3B30] focus:ring-[#FF3B30]/20',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> { }

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium text-[#1D1D1F] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          className
        )}
        {...props}
      />
    )
  }
)
Label.displayName = 'Label'
