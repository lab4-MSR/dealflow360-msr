import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type SearchScope = 'all' | 'deals' | 'quotations' | 'customers' | 'products' | 'orders' | 'invoices' | 'shipments'

const SCOPE_LABELS: Record<SearchScope, string> = {
  all: 'All',
  deals: 'Deals',
  quotations: 'Quotations',
  customers: 'Customers',
  products: 'Products',
  orders: 'Orders',
  invoices: 'Invoices',
  shipments: 'Shipments',
}

const SCOPE_ICONS: Record<SearchScope, React.ReactNode> = {
  all: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  deals: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  quotations: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  customers: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  products: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  orders: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  invoices: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  shipments: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1zm10 0V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v10a1 1 0 001 1h2a1 1 0 001-1z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 16a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v10z" />
    </svg>
  ),
}

interface SearchScopeProps {
  value: SearchScope
  onChange: (scope: SearchScope) => void
  className?: string
}

export function SearchScope({ value, onChange, className }: SearchScopeProps) {
  const scopes: SearchScope[] = ['all', 'deals', 'quotations', 'customers', 'products', 'orders', 'invoices', 'shipments']

  return (
    <div
      className={cn('flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide', className)}
      role="tablist"
      aria-label="Search scope"
    >
      {scopes.map((scope) => (
        <Button
          key={scope}
          role="tab"
          aria-selected={value === scope}
          variant={value === scope ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            'whitespace-nowrap gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150',
            value === scope
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
          onClick={() => onChange(scope)}
        >
          {SCOPE_ICONS[scope]}
          <span className="text-label">{SCOPE_LABELS[scope]}</span>
        </Button>
      ))}
    </div>
  )
}