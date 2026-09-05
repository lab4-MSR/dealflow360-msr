import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthAlertProps {
  type: 'error' | 'success' | 'info' | 'warning'
  message: string
  className?: string
  onDismiss?: () => void
}

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
}

const styles = {
  error: 'border-danger/30 bg-danger-subtle text-danger dark:border-danger/40',
  success: 'border-success/30 bg-success-subtle text-success dark:border-success/40',
  info: 'border-info/30 bg-info-subtle text-info dark:border-info/40',
  warning: 'border-warning/30 bg-warning-subtle text-warning dark:border-warning/40',
}

export function AuthAlert({ type, message, className, onDismiss }: AuthAlertProps) {
  const Icon = icons[type]

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border p-3.5 shadow-sm text-small transition-all animate-in fade-in duration-200',
        styles[type],
        className
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div className="flex-1 font-medium text-foreground text-xs sm:text-small leading-relaxed">
        {message}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
          aria-label="Dismiss alert"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
