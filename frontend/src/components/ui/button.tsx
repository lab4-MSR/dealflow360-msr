import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium tracking-tight select-none transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] active:translate-y-px motion-reduce:active:scale-100 motion-reduce:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground border border-primary/20 hover:bg-primary-hover hover:border-primary/40 active:bg-primary-hover shadow-xs font-semibold',
        secondary:
          'bg-secondary text-secondary-foreground border border-border/80 hover:bg-secondary/80 hover:border-border active:bg-secondary shadow-2xs',
        ghost:
          'text-muted-foreground hover:bg-muted/70 hover:text-foreground active:bg-muted',
        destructive:
          'bg-destructive text-destructive-foreground border border-destructive/30 hover:bg-destructive/90 active:bg-destructive/95 shadow-xs font-semibold',
        'destructive-outline':
          'border border-destructive/30 text-destructive bg-transparent hover:bg-destructive-subtle active:bg-destructive/15',
        outline:
          'border border-border/90 bg-background text-foreground hover:bg-muted/60 hover:text-foreground hover:border-border-strong active:bg-muted shadow-2xs',
        subtle:
          'bg-primary-subtle text-primary border border-primary/20 hover:bg-primary-subtle/80 active:bg-primary/20',
        intelligence:
          'bg-intelligence text-intelligence-foreground border border-intelligence/30 hover:bg-intelligence/90 active:bg-intelligence/95 shadow-xs font-semibold',
        link:
          'text-primary underline-offset-4 hover:underline p-0 h-auto font-medium',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-md gap-1.5 [&_svg]:size-3.5',
        sm: 'h-8 px-3 text-xs rounded-lg gap-1.5 [&_svg]:size-3.5',
        default: 'h-9 px-3.5 py-2 text-sm rounded-lg gap-2 [&_svg]:size-4',
        lg: 'h-10.5 px-5 text-sm sm:text-base rounded-xl gap-2.5 [&_svg]:size-4.5',
        icon: 'h-9 w-9 rounded-lg [&_svg]:size-4',
        'icon-sm': 'h-8 w-8 rounded-lg [&_svg]:size-3.5',
        'icon-xs': 'h-7 w-7 rounded-md [&_svg]:size-3',
        'icon-lg': 'h-10.5 w-10.5 rounded-xl [&_svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }
    return (
      <button
        type={props.type || 'button'}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading ? 'true' : undefined}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-3.5 w-3.5 text-current shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

