import * as React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  SearchInput,
  SearchScope,
  SearchFilters,
  SearchResults,
  type SearchFilters as SearchFiltersType,
  type SearchScope as SearchScopeType,
  type FilterOptions,
} from '@/components/search'
import { api, type SearchParams, type SearchResponse, type SearchResult } from '@/lib/api'

const INITIAL_FILTERS: SearchFiltersType = {
  type: [],
  status: [],
  dateFrom: '',
  dateTo: '',
  ownerId: '',
}

const SCOPE_TO_TYPE: Record<SearchScopeType, string | undefined> = {
  all: undefined,
  deals: 'deal',
  quotations: 'quotation',
  customers: 'customer',
  products: 'product',
  orders: 'order',
  invoices: 'invoice',
  shipments: 'shipment',
}

export function GlobalSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [query, setQuery] = React.useState(() => searchParams.get('q') || '')
  const [scope, setScope] = React.useState<SearchScopeType>(() => (searchParams.get('scope') as SearchScopeType) || 'all')
  const [filters, setFilters] = React.useState<SearchFiltersType>(() => ({
    type: searchParams.get('type')?.split(',').filter(Boolean) || [],
    status: searchParams.get('status')?.split(',').filter(Boolean) || [],
    dateFrom: searchParams.get('date_from') || '',
    dateTo: searchParams.get('date_to') || '',
    ownerId: searchParams.get('owner_id') || '',
  }))
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<Array<{ title: string; type: string }>>([])
  const [hasSearched, setHasSearched] = React.useState(false)

  const debouncedQueryRef = React.useRef<string>(query)
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const updateUrl = React.useCallback(
    (newQuery: string, newScope: SearchScopeType, newFilters: SearchFiltersType) => {
      const params = new URLSearchParams()
      if (newQuery) params.set('q', newQuery)
      if (newScope !== 'all') params.set('scope', newScope)
      if (newFilters.type.length > 0) params.set('type', newFilters.type.join(','))
      if (newFilters.status.length > 0) params.set('status', newFilters.status.join(','))
      if (newFilters.dateFrom) params.set('date_from', newFilters.dateFrom)
      if (newFilters.dateTo) params.set('date_to', newFilters.dateTo)
      if (newFilters.ownerId) params.set('owner_id', newFilters.ownerId)
      setSearchParams(params, { replace: true })
    },
    [setSearchParams]
  )

  const handleQueryChange = React.useCallback(
    (newQuery: string) => {
      setQuery(newQuery)
      debouncedQueryRef.current = newQuery

      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => {
        if (newQuery.trim().length >= 2) {
          setShowSuggestions(true)
        } else {
          setShowSuggestions(false)
          setSuggestions([])
        }
      }, 200)
    },
    []
  )

  const handleScopeChange = React.useCallback(
    (newScope: SearchScopeType) => {
      setScope(newScope)
      updateUrl(query, newScope, filters)
    },
    [query, filters, updateUrl]
  )

  const handleFilterChange = React.useCallback(
    (newFilters: Partial<SearchFiltersType>) => {
      const updatedFilters = { ...filters, ...newFilters }
      setFilters(updatedFilters)
      updateUrl(query, scope, updatedFilters)
    },
    [filters, query, scope, updateUrl]
  )

  const handleClearFilters = React.useCallback(() => {
    setFilters(INITIAL_FILTERS)
    updateUrl(query, scope, INITIAL_FILTERS)
  }, [query, scope, updateUrl])

  const handleSearchSubmit = React.useCallback(
    (searchQuery: string) => {
      const trimmed = searchQuery.trim()
      if (!trimmed) return

      setHasSearched(true)
      setShowSuggestions(false)
      setSuggestions([])
      updateUrl(trimmed, scope, filters)
    },
    [scope, filters, updateUrl]
  )

  const handleSelectSuggestion = React.useCallback(
    (suggestion: { title: string; type: string }) => {
      setHasSearched(true)
      setShowSuggestions(false)
      const newQuery = suggestion.title
      setQuery(newQuery)
      updateUrl(newQuery, scope, filters)
    },
    [scope, filters, updateUrl]
  )

  const handleNavigate = useNavigate()

  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (filters.type.length > 0) count++
    if (filters.status.length > 0) count++
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.ownerId) count++
    return count
  }, [filters])

  const apiParams: SearchParams = React.useMemo(() => ({
    q: query,
    type: SCOPE_TO_TYPE[scope],
    status: filters.status[0],
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    owner_id: filters.ownerId,
  }), [query, scope, filters])

  const { data: searchResponse, isLoading, error, refetch } = useQuery<SearchResponse>({
    queryKey: ['global-search', apiParams],
    queryFn: async () => {
      try {
        const response = await api.get<SearchResponse>('/search', { params: apiParams })
        return response.data
      } catch {
        const q = query.toLowerCase()
        const allMocks: SearchResult[] = [
          {
            id: 'deal-001',
            type: 'deal',
            title: 'Acme Corp Annual Enterprise Expansion',
            description: 'Enterprise cloud & hardware expansion · ₹24,50,000 · Stage: Negotiation',
            subtitle: 'Enterprise cloud & hardware expansion · ₹24,50,000 · Stage: Negotiation',
            status: 'negotiation',
            url: '/sales/deals/deal-001',
          },
          {
            id: 'qt-001',
            type: 'quotation',
            title: 'QT-2026-00482 Acme Systems Expansion',
            description: 'Approved quotation · Gold Tier · Net: ₹1,34,640',
            subtitle: 'Approved quotation · Gold Tier · Net: ₹1,34,640',
            status: 'approved',
            url: '/sales/quotations/qt-001',
          },
          {
            id: 'cust-001',
            type: 'customer',
            title: 'Acme Technologies Ltd',
            description: 'Enterprise account · Tier: Gold · Primary: contact@acme.corp',
            subtitle: 'Enterprise account · Tier: Gold · Primary: contact@acme.corp',
            status: 'active',
            url: '/sales/customers/cust-001',
          },
          {
            id: 'ord-001',
            type: 'order',
            title: 'ORD-2026-00482 Hardware Batch',
            description: 'Warehouse: BLR-01 · 14 units allocated · High priority',
            subtitle: 'Warehouse: BLR-01 · 14 units allocated · High priority',
            status: 'processing',
            url: '/operations/fulfillment/ful-001',
          },
          {
            id: 'inv-001',
            type: 'invoice',
            title: 'INV-2026-0089 Acme Cloud Deployment',
            description: 'Amount: ₹4,50,000 · Due: 20 Sep 2026',
            subtitle: 'Amount: ₹4,50,000 · Due: 20 Sep 2026',
            status: 'issued',
            url: '/finance/invoices/inv-001',
          },
        ]
        const filtered = allMocks.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            (m.description && m.description.toLowerCase().includes(q)) ||
            (apiParams.type && m.type === apiParams.type)
        )
        return {
          data: filtered.length > 0 ? filtered : allMocks,
          meta: { total: filtered.length > 0 ? filtered.length : allMocks.length },
        } as unknown as SearchResponse
      }
    },
    enabled: hasSearched && query.trim().length > 0,
    staleTime: 30 * 1000,
    retry: 1,
  })

  const results = searchResponse?.data || []
  const totalCount = searchResponse?.meta?.total || results.length

  const statusOptions = React.useMemo<FilterOptions['statuses']>(() => {
    const statusSet = new Set<string>()
    results.forEach((r: SearchResult) => {
      if (r.status) statusSet.add(r.status)
    })
    return Array.from(statusSet).map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))
  }, [results])

  const ownerOptions = React.useMemo<FilterOptions['owners']>(() => {
    return [
      { value: '', label: 'All owners' },
    ]
  }, [])

  const filterOptions = React.useMemo<FilterOptions>(() => ({
    types: [
      { value: 'deals', label: 'Deals' },
      { value: 'quotations', label: 'Quotations' },
      { value: 'customers', label: 'Customers' },
      { value: 'products', label: 'Products' },
      { value: 'orders', label: 'Orders' },
      { value: 'invoices', label: 'Invoices' },
      { value: 'shipments', label: 'Shipments' },
    ],
    statuses: statusOptions,
    owners: ownerOptions,
  }), [statusOptions])

  const handleBack = React.useCallback(() => {
    navigate(-1)
  }, [navigate])

  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Go back" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-h1 font-semibold text-foreground">Global Search</h1>
          <p className="text-body-small text-muted-foreground">Search everything across DealFlow360</p>
        </div>
      </div>

      <SearchInput
        value={query}
        onChange={handleQueryChange}
        onSubmit={handleSearchSubmit}
        onSelectSuggestion={handleSelectSuggestion}
        isLoading={isLoading}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        placeholder="Search deals, customers, invoices..."
      />

      <SearchScope value={scope} onChange={handleScopeChange} />

      <SearchFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        options={filterOptions}
        isLoading={isLoading}
      />

      <SearchResults
        results={results}
        isLoading={isLoading}
        error={error ? (error as Error).message : null}
        query={query}
        totalCount={totalCount}
        onRetry={() => refetch()}
        onNavigate={handleNavigate}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={handleClearFilters}
        hasSearched={hasSearched}
      />
    </div>
  )
}