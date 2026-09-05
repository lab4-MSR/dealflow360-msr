import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthCardProps {
  children: ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 sm:p-8 shadow-elevation-1', className)}>
      {children}
    </div>
  )
}
