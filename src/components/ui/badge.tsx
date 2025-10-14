import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'neutral'
    | 'gradient'
  size?: 'sm' | 'md' | 'lg'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant = 'default', size = 'md', children, ...props },
    ref,
  ) => {
    const baseClasses =
      'inline-flex items-center font-semibold rounded-full transition-all duration-200'

    const variants = {
      default: 'bg-neutral-100 text-neutral-800 border border-neutral-200',
      primary:
        'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25',
      secondary:
        'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg shadow-secondary-500/25',
      success:
        'bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg shadow-success-500/25',
      warning:
        'bg-gradient-to-r from-warning-500 to-warning-600 text-white shadow-lg shadow-warning-500/25',
      error:
        'bg-gradient-to-r from-error-500 to-error-600 text-white shadow-lg shadow-error-500/25',
      neutral: 'bg-neutral-200 text-neutral-700 border border-neutral-300',
      gradient:
        'bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25',
    }

    const sizes = {
      sm: 'px-3 py-1 text-xs',
      md: 'px-4 py-1.5 text-sm',
      lg: 'px-5 py-2 text-base',
    }

    return (
      <span
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    )
  },
)

Badge.displayName = 'Badge'
