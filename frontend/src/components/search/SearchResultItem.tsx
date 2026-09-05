import * as React from 'react'
import { type SearchResult } from '@/lib/api'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  deal: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  quotation: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  customer: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  product: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  order: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  invoice: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  shipment: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1zm10 0V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v10a1 1 0 001 1h2a1 1 0 001-1z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 16a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v10z" />
    </svg>
  ),
}

const TYPE_LABELS: Record<string, string> = {
  deal: 'Deal',
  quotation: 'Quotation',
  customer: 'Customer',
  product: 'Product',
  order: 'Order',
  invoice: 'Invoice',
  shipment: 'Shipment',
}

interface SearchResultItemProps {
  result: SearchResult
  onNavigate: (url: string) => void
  isLoading?: boolean
}

export function SearchResultItem({ result, onNavigate, isLoading }: SearchResultItemProps) {
  const type = result.type.toLowerCase()
  const typeLabel = TYPE_LABELS[type] || result.type
  const typeIcon = TYPE_ICONS[type] || (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  const handleClick = React.useCallback(() => {
    if (result.url) {
      onNavigate(result.url)
    }
  }, [result.url, onNavigate])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick]
  )

  return (
    <article
      className={cn(
        'group relative flex items-start gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer',
        'transition-all duration-150 ease-out',
        'hover:border-border-strong hover:bg-accent/40 hover:-translate-y-0.5 hover:shadow-elevation-1',
        'active:scale-[0.99] motion-reduce:active:scale-100 motion-reduce:hover:translate-y-0',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        isLoading && 'opacity-50 pointer-events-none'
      )}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={`Open ${typeLabel}: ${result.title}`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        {typeIcon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3 className="text-body font-medium text-foreground truncate flex-1">{result.title}</h3>
          <Badge variant="outline" className="shrink-0 ml-auto">
            {typeLabel}
          </Badge>
        </div>

        {result.subtitle && (
          <p className="mt-1 text-body-small text-muted-foreground truncate">{result.subtitle}</p>
        )}

        {result.status && (
          <div className="mt-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full mr-1.5 align-middle bg-primary-subtle text-primary">
              {result.status}
            </span>
            <span className="text-caption text-muted-foreground font-medium">
              {result.status}
            </span>
            {result.id && (
              <span className="text-caption text-muted-foreground font-mono ml-2">
                {result.id.slice(0, 8)}
              </span>
            )}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation()
          handleClick()
        }}
        aria-label={`Open ${result.title}`}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </article>
  )
}