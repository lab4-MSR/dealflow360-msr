import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-input bg-surface/90 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-2xs transition-all duration-150 ease-out',
          'hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          error && 'border-danger focus:ring-danger/20 focus:border-danger',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
