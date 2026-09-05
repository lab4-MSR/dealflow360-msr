import { useState, forwardRef, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || `password-${label.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="text-label font-medium text-foreground"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            autoComplete={props.autoComplete || 'current-password'}
            className={cn(
              'flex h-10 w-full rounded-lg border bg-surface px-3 py-2 pr-10 text-body-small text-foreground',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-danger focus:ring-danger'
                : 'border-input focus:ring-primary',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-caption text-danger" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-caption text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

PasswordField.displayName = 'PasswordField'
