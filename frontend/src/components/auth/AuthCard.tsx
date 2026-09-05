import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthCardProps {
  children: ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div className={cn('rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-elevation-2 transition-all duration-200', className)}>
      {children}
    </div>
  )
}
