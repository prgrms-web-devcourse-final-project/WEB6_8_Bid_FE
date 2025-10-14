import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]',
      fullWidth && 'w-full',
    )

    const variants = {
      primary: cn(
        'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25',
        'hover:from-primary-600 hover:to-primary-700 hover:shadow-xl hover:shadow-primary-500/30',
        'focus:ring-primary-500 focus:shadow-glow',
      ),
      secondary: cn(
        'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg shadow-secondary-500/25',
        'hover:from-secondary-600 hover:to-secondary-700 hover:shadow-xl hover:shadow-secondary-500/30',
        'focus:ring-secondary-500 focus:shadow-glow',
      ),
      gradient: cn(
        'bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25',
        'hover:shadow-xl hover:shadow-primary-500/30 hover:from-primary-600 hover:via-secondary-600 hover:to-primary-700',
        'focus:ring-primary-500 focus:shadow-glow',
      ),
      outline: cn(
        'border-2 border-primary-200 text-primary-700 bg-white/80 backdrop-blur-sm',
        'hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800',
        'focus:ring-primary-500 focus:border-primary-400',
      ),
      ghost: cn(
        'text-neutral-700 bg-transparent',
        'hover:bg-neutral-100 hover:text-neutral-900',
        'focus:ring-primary-500',
      ),
      danger: cn(
        'bg-gradient-to-r from-error-500 to-error-600 text-white shadow-lg shadow-error-500/25',
        'hover:from-error-600 hover:to-error-700 hover:shadow-xl hover:shadow-error-500/30',
        'focus:ring-error-500 focus:shadow-glow',
      ),
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm h-9',
      md: 'px-6 py-3 text-sm h-11',
      lg: 'px-8 py-4 text-base h-13',
      xl: 'px-10 py-5 text-lg h-15',
    }

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'

export const buttonVariants = (
  variant: ButtonProps['variant'] = 'primary',
  size: ButtonProps['size'] = 'md',
) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]'

  const variants = {
    primary:
      'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:from-primary-600 hover:to-primary-700 hover:shadow-xl hover:shadow-primary-500/30 focus:ring-primary-500 focus:shadow-glow',
    secondary:
      'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg shadow-secondary-500/25 hover:from-secondary-600 hover:to-secondary-700 hover:shadow-xl hover:shadow-secondary-500/30 focus:ring-secondary-500 focus:shadow-glow',
    gradient:
      'bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:from-primary-600 hover:via-secondary-600 hover:to-primary-700 focus:ring-primary-500 focus:shadow-glow',
    outline:
      'border-2 border-primary-200 text-primary-700 bg-white/80 backdrop-blur-sm hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 focus:ring-primary-500 focus:border-primary-400',
    ghost:
      'text-neutral-700 bg-transparent hover:bg-neutral-100 hover:text-neutral-900 focus:ring-primary-500',
    danger:
      'bg-gradient-to-r from-error-500 to-error-600 text-white shadow-lg shadow-error-500/25 hover:from-error-600 hover:to-error-700 hover:shadow-xl hover:shadow-error-500/30 focus:ring-error-500 focus:shadow-glow',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm h-9',
    md: 'px-6 py-3 text-sm h-11',
    lg: 'px-8 py-4 text-base h-13',
    xl: 'px-10 py-5 text-lg h-15',
  }

  return `${baseClasses} ${variants[variant]} ${sizes[size]}`
}
