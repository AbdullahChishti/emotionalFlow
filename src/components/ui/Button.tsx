import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {

    const baseClasses = 'inline-flex items-center justify-center font-normal rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
      primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-sm hover:shadow-md',
      secondary: 'bg-[#86868B] hover:bg-[#6E6E73] text-white shadow-sm hover:shadow-md',
      outline: 'bg-transparent hover:bg-[#F5F5F7] text-[#1D1D1F] border border-[#D2D2D7]',
      ghost: 'bg-transparent hover:bg-[#F5F5F7] text-[#1D1D1F]'
    }

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
