import { Search, Loader2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchResultItem } from './SearchResultItem'

interface SearchResultsProps {
  results: any[]
  isLoading: boolean
  error: string | null
  query: string
  totalCount: number
  onRetry: () => void
  onNavigate: (url: string) => void
  activeFiltersCount: number
  onClearFilters: () => void
  hasSearched: boolean
}

export function SearchResults({
  results,
  isLoading,
  error,
  query,
  totalCount,
  onRetry,
  onNavigate,
  activeFiltersCount,
  onClearFilters,
  hasSearched,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4" role="status" aria-live="polite" aria-label="Loading search results">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-muted-foreground/50">
          <Search className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-h3 font-semibold text-foreground mb-2">Unable to complete search</h3>
        <p className="text-body-small text-muted-foreground max-w-md mb-6">
          Something went wrong while searching. Please try again.
        </p>
        <Button variant="default" onClick={onRetry} disabled={isLoading}>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Retry
        </Button>
      </div>
    )
  }

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-muted-foreground/50">
          <Search className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-h3 font-semibold text-foreground mb-2">Start your search</h3>
        <p className="text-body-small text-muted-foreground max-w-md">
          Enter a query above to search across deals, customers, invoices, and more.
        </p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-12 w-12" />}
        title="No results found"
        description="No records matched"
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-body text-foreground">
          <span className="font-medium">{totalCount}</span> result{totalCount !== 1 ? 's' : ''}
          {query && <span className="text-muted-foreground ml-2">for <span className="font-medium">"{query}"</span></span>}
        </p>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            <span className="text-label">Clear filters</span>
          </Button>
        )}
      </div>

      <div className="space-y-3" role="list" aria-label="Search results">
        {results.map((result) => (
          <SearchResultItem result={result} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  )
}