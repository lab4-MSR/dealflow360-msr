import { useState, forwardRef, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  showIcon?: boolean
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, helperText, className, id, showIcon = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || `password-${label.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="text-label font-medium text-foreground block"
        >
          {label}
        </label>
        <div className="relative">
          {showIcon && (
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80 pointer-events-none" />
          )}
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            autoComplete={props.autoComplete || 'current-password'}
            className={cn(
              'flex h-10 w-full rounded-xl border bg-surface/80 px-3.5 py-2 pr-10 text-body-small text-foreground shadow-xs transition-all duration-200',
              'placeholder:text-muted-foreground/70',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              showIcon && 'pl-10',
              error
                ? 'border-danger focus:ring-danger/20 focus:border-danger'
                : 'border-input focus:ring-primary/20',
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
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
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
          <p id={`${inputId}-error`} className="text-caption text-danger flex items-center gap-1" role="alert">
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
