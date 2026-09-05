import { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SlaCountdownProps {
  expiresAt?: string
  deadline?: string
  isBreached?: boolean
  className?: string
  showIcon?: boolean
}

export function SlaCountdown({ expiresAt, deadline, className, showIcon = true }: SlaCountdownProps) {
  const targetDate = expiresAt || deadline || new Date(Date.now() + 4 * 3600 * 1000).toISOString()
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
    isBreached: boolean
    isUrgent: boolean
  }>({ hours: 0, minutes: 0, seconds: 0, isBreached: false, isUrgent: false })

  useEffect(() => {
    function calculate() {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isBreached: true,
          isUrgent: true,
        })
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      const isUrgent = hours < 4

      setTimeLeft({ hours, minutes, seconds, isBreached: false, isUrgent })
    }

    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  if (timeLeft.isBreached) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-danger-subtle text-danger border border-danger/20',
          className
        )}
      >
        {showIcon && <AlertTriangle className="h-3 w-3" />}
        <span>SLA BREACHED</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium tabular-nums',
        timeLeft.isUrgent
          ? 'bg-warning-subtle text-warning border border-warning/30 font-semibold'
          : 'bg-muted text-muted-foreground border border-border',
        className
      )}
    >
      {showIcon && <Clock className="h-3 w-3" />}
      <span>
        {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </span>
  )
}
