import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { Pagination } from '@/components/ui/datatable/pagination'
import { ErrorState } from '@/components/shared'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePricingHistory } from '../hooks/use-business-admin'
import type { PricingHistoryEntry } from '../types'
import { Search, History, Filter } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

const ENTITY_TYPE_BADGES: Record<string, { label: string; variant: 'info' | 'default' | 'intelligence' | 'success' | 'warning' | 'secondary' }> = {
  price_list: { label: 'Price List', variant: 'info' },
  product: { label: 'Product', variant: 'default' },
  customer_pricing: { label: 'Customer Pricing', variant: 'intelligence' },
  volume_pricing: { label: 'Volume Pricing', variant: 'success' },
  discount_rule: { label: 'Discount Rule', variant: 'warning' },
  customer_tier: { label: 'Customer Tier', variant: 'secondary' },
}

const INPUT_CLASS = 'flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function PricingHistoryPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [entityType, setEntityType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const filters = {
    search,
    entityType: entityType || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    perPage: 15,
  }

  const { data, isLoading, error, refetch } = usePricingHistory(filters)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setSearchInput('')
    setEntityType('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const hasFilters = search || entityType || dateFrom || dateTo

  const columns: Column<Record<string, unknown>>[] = [
    {
      id: 'entity',
      header: 'Entity',
      accessorFn: (row) => {
        const entityTypeKey = String(row.entityType)
        const badgeConfig = ENTITY_TYPE_BADGES[entityTypeKey] || { label: entityTypeKey, variant: 'secondary' as const }
        return (
          <div>
            <p className="text-[13px] font-semibold text-foreground">{String(row.entityName)}</p>
            <Badge variant={badgeConfig.variant} className="mt-1">{badgeConfig.label}</Badge>
          </div>
        )
      },
    },
    {
      id: 'field',
      header: 'Field Changed',
      accessorFn: (row) => (
        <span className="text-[13px] font-medium text-foreground">{String(row.field)}</span>
      ),
    },
    {
      id: 'previous',
      header: 'Previous Value',
      accessorFn: (row) => {
        const val = String(row.previousValue || '')
        return (
          <span className={cn(
            'text-[12px] tabular-nums',
            val ? 'text-muted-foreground line-through' : 'text-muted-foreground/50'
          )}>
            {val || '—'}
          </span>
        )
      },
    },
    {
      id: 'new',
      header: 'New Value',
      accessorFn: (row) => {
        const val = String(row.newValue || '')
        return (
          <span className={cn(
            'text-[12px] tabular-nums font-medium',
            val ? 'text-foreground' : 'text-muted-foreground/50'
          )}>
            {val || '—'}
          </span>
        )
      },
    },
    {
      id: 'actor',
      header: 'Changed By',
      accessorFn: (row) => (
        <div>
          <p className="text-[13px] text-foreground">{String(row.actor)}</p>
          <p className="text-[11px] text-muted-foreground capitalize">{String(row.actorRole)}</p>
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      accessorFn: (row) => (
        <span className="text-[12px] text-muted-foreground tabular-nums whitespace-nowrap">
          {format(parseISO(String(row.timestamp)), 'MMM d, yyyy · h:mm a')}
        </span>
      ),
    },
    {
      id: 'reason',
      header: 'Reason',
      accessorFn: (row) => (
        <span className="text-[12px] text-muted-foreground">{String(row.reason || '—')}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing History"
        description="Complete audit trail of all pricing changes."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Pricing' },
          { label: 'Pricing History' },
        ]}
      />

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px]">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search changes..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className={cn(INPUT_CLASS, 'pl-9 w-[240px]')}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Entity Type</Label>
              <Select value={entityType} onValueChange={(v) => { setEntityType(v); setPage(1) }}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="price_list">Price List</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="customer_pricing">Customer Pricing</SelectItem>
                  <SelectItem value="volume_pricing">Volume Pricing</SelectItem>
                  <SelectItem value="discount_rule">Discount Rule</SelectItem>
                  <SelectItem value="customer_tier">Customer Tier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Date From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                className={cn(INPUT_CLASS, 'w-[160px]')}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Date To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                className={cn(INPUT_CLASS, 'w-[160px]')}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleSearch} className="shrink-0">
              <Search className="h-4 w-4" />
            </Button>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : error ? (
        <ErrorState title="Failed to load pricing history" onRetry={refetch} />
      ) : !data?.entries || data.entries.length === 0 ? (
        <EmptyState
          icon={<History className="h-8 w-8" />}
          title="No pricing changes match the selected filters"
          description="Try adjusting your filters or check back later."
          action={
            hasFilters ? (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={columns}
                data={data.entries as unknown as Record<string, unknown>[]}
              />
            </CardContent>
          </Card>

          {data.totalPages > 1 && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              perPage={data.perPage}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  )
}
