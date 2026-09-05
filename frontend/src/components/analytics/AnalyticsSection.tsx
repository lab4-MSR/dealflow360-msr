import type { ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { EmptyState } from '../ui/empty-state'
import { Button } from '../ui/button'
import { extractApiError } from '../../lib/errors'

interface AnalyticsSectionProps {
  title: string
  description?: string
  /** Optional header action (select, button, tab strip). */
  action?: ReactNode
  isLoading?: boolean
  /** True when the section's dataset is empty (distinct from unavailable). */
  isEmpty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  /** When set, renders an isolated error state — the rest of the page stays intact. */
  error?: unknown
  onRetry?: () => void
  /** Skeleton used while loading; defaults to a chart-shaped placeholder. */
  loadingSkeleton?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}

/**
 * Shared Analytics section card. Owns the loading / empty / error contract so
 * every analytics page renders partial failures as isolated section states
 * instead of breaking the whole page.
 */
export function AnalyticsSection({
  title,
  description,
  action,
  isLoading = false,
  isEmpty = false,
  emptyTitle = 'No data available',
  emptyDescription,
  error,
  onRetry,
  loadingSkeleton,
  className,
  contentClassName,
  children,
}: AnalyticsSectionProps) {
  let message: string | null = null
  if (error) {
    try {
      message = extractApiError(error)
    } catch {
      message = null
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className={contentClassName}>
        {isLoading ? (
          loadingSkeleton ?? (
            <div className="space-y-3" aria-busy="true" aria-label={`Loading ${title}`}>
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          )
        ) : error ? (
          <div
            role="alert"
            className="flex h-[200px] flex-col items-center justify-center gap-2 text-center"
          >
            <AlertTriangle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Couldn&apos;t load this section</p>
              <p className="text-xs text-muted-foreground">
                {message ?? 'Please try again in a moment.'}
              </p>
            </div>
            {onRetry ? (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Retry
              </Button>
            ) : null}
          </div>
        ) : isEmpty ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

interface KpiSkeletonGridProps {
  count?: number
  className?: string
}

/** Skeleton placeholder for a KPI card row, matching KpiCard proportions. */
export function KpiSkeletonGrid({ count = 4, className }: KpiSkeletonGridProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 ${className ?? ''}`}
      aria-busy="true"
      aria-label="Loading key metrics"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-[124px] rounded-lg" />
      ))}
    </div>
  )
}
