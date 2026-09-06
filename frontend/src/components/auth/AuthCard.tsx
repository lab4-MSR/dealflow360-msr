import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthCardProps {
  children: ReactNode
  className?: string
  withAccentLine?: boolean
}

export function AuthCard({ children, className, withAccentLine = true }: AuthCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md p-6 sm:p-8',
        'shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)]',
        'dark:border-border/60 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_40px_-15px_rgba(0,0,0,0.7)]',
        'transition-all duration-200 overflow-hidden',
        withAccentLine && 'before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-sky-500 before:via-indigo-500 before:to-cyan-400',
        className
      )}
    >
      {children}
    </div>
  )
}
