import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  'aria-label'?: string
}

/**
 * Accessible switch control. Uses a native role="switch" button so it works
 * with keyboard navigation and screen readers without an extra dependency.
 */
const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled, onClick, onKeyDown, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          onClick?.(e)
          onCheckedChange?.(!checked)
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            onCheckedChange?.(!checked)
          }
        }}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-primary' : 'bg-input',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-sm ring-0 transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch }