import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'
import { EmptyState } from '../ui/empty-state'
import { Button } from '../ui/button'
import { extractApiError } from '../../lib/errors'

interface ChartFrameProps {
  /** Fixed chart height in pixels — keeps layouts stable across states. */
  height?: number
  isLoading?: boolean
  /** True when the chart's dataset is empty (show EmptyState, not fake zeros). */
  isEmpty?: boolean
  /** When set, renders an isolated error state with optional retry. */
  error?: unknown
  onRetry?: () => void
  emptyTitle: string
  emptyDescription?: string
  /** Accessible name describing the chart's business question. */
  ariaLabel: string
  /** The recharts <ResponsiveContainer> for this chart. */
  children: ReactNode
}

/**
 * Shared chart state frame for Analytics. Wraps every recharts container so
 * loading, empty, and error states are consistent across all nine analytics
 * pages and charts never render fake values or break page width.
 */
export function ChartFrame({
  height = 260,
  isLoading = false,
  isEmpty = false,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  ariaLabel,
  children,
}: ChartFrameProps) {
  let message: string | null = null
  if (error) {
    try {
      message = extractApiError(error)
    } catch {
      message = null
    }
  }

  return (
    <div
      style={{ height }}
      role="img"
      aria-label={ariaLabel}
      className="w-full"
    >
      {isLoading ? (
        <Skeleton className="h-full w-full rounded-lg" aria-hidden="true" />
      ) : error ? (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">
            {message ?? 'Chart data is unavailable.'}
          </p>
          {onRetry ? (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      ) : isEmpty ? (
        <div className="flex h-full items-center justify-center">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        children
      )}
    </div>
  )
}
