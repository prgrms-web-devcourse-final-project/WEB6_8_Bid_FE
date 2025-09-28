import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, leftIcon, rightIcon, id, ...props },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <div className="text-neutral-400">{leftIcon}</div>
            </div>
          )}

          <input
            id={inputId}
            className={cn(
              'focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-neutral-300 px-3 py-2 placeholder-neutral-400 shadow-sm focus:ring-2 focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error &&
                'border-error-500 focus:ring-error-500 focus:border-error-500',
              className,
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="text-neutral-400">{rightIcon}</div>
            </div>
          )}
        </div>

        {error && <p className="text-error-500 text-sm">{error}</p>}

        {helperText && !error && (
          <p className="text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
