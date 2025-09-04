import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {

    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:scale-105'

    const variantClasses = {
      primary: 'text-white border border-transparent shadow-lg',
      secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-800 border border-secondary-200',
      outline: 'bg-transparent hover:bg-slate-50 text-slate-600 border border-slate-300',
      glass: 'glassmorphic text-secondary-800 hover:bg-white/50 border border-white/30'
    }

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg'
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
        style={variant === 'primary' ? {
          backgroundColor: '#335f64',
          '--tw-ring-color': '#335f64'
        } : {}}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
