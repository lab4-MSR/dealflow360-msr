import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-muted/70 animate-pulse motion-reduce:animate-none',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
