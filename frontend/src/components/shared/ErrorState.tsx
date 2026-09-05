import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center animate-page-enter', className)}>
      <div className="mb-4 rounded-full bg-danger-subtle p-3">
        <svg className="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h3 className="text-h4 font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-body-small text-muted-foreground max-w-md mb-6">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-label font-medium text-primary-foreground hover:bg-primary-hover active:scale-[0.98] transition-all duration-150 ease-out cursor-pointer motion-reduce:active:scale-100"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
