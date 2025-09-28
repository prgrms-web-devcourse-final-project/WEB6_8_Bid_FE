import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'mt-1 flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
