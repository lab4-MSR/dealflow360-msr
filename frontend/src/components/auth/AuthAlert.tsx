import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthAlertProps {
  type: 'error' | 'success' | 'info'
  message: string
  className?: string
}

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
}

const styles = {
  error: 'border-danger/30 bg-danger-subtle text-danger',
  success: 'border-success/30 bg-success-subtle text-success',
  info: 'border-info/30 bg-info-subtle text-info',
}

export function AuthAlert({ type, message, className }: AuthAlertProps) {
  const Icon = icons[type]

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3',
        styles[type],
        className
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <p className="text-small text-foreground">{message}</p>
    </div>
  )
}
