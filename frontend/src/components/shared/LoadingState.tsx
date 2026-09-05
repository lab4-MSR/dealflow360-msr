import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingStateProps {
  rows?: number
  className?: string
  type?: 'table' | 'cards' | 'page'
}

function TableLoadingSkeleton({ rows = 5 }: { rows: number }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="h-12 bg-surface-muted" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 h-14 px-4 border-b border-border last:border-0">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[60px] ml-auto" />
        </div>
      ))}
    </div>
  )
}

function CardLoadingSkeleton({ rows = 3 }: { rows: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-4 w-[100px] mb-3" />
          <Skeleton className="h-7 w-[160px] mb-2" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      ))}
    </div>
  )
}

export function LoadingState({ rows = 5, className, type = 'table' }: LoadingStateProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {type === 'table' && <TableLoadingSkeleton rows={rows} />}
      {type === 'cards' && <CardLoadingSkeleton rows={rows} />}
      {type === 'page' && (
        <div className="space-y-6">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-[120px] rounded-xl" />
            <Skeleton className="h-[120px] rounded-xl" />
            <Skeleton className="h-[120px] rounded-xl" />
          </div>
          <TableLoadingSkeleton rows={5} />
        </div>
      )}
    </div>
  )
}
