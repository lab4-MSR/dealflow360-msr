import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  Command,
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
  DollarSign,
  Users,
  Activity,
  Building2,
  Settings,
  HelpCircle,
  Bell,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchItem {
  id: string
  title: string
  subtitle?: string
  category: 'pages' | 'deals' | 'quotes' | 'customers' | 'businesses'
  url: string
  status?: string
}

const SEARCH_DATABASE: SearchItem[] = [
  // Pages & Core Platform Features
  { id: 'p-1', title: 'Sales Dashboard', subtitle: 'Pipeline metrics, deal velocity, and renewals', category: 'pages', url: '/dashboard' },
  { id: 'p-2', title: 'Platform Dashboard', subtitle: 'Multi-tenant overview, MRR, and platform metrics', category: 'pages', url: '/platform/dashboard' },
  { id: 'p-3', title: 'All Businesses', subtitle: 'Tenant directory, workspace switcher, and company cards', category: 'pages', url: '/platform/businesses' },
  { id: 'p-4', title: 'Create Business', subtitle: 'Onboard a new enterprise tenant organization', category: 'pages', url: '/platform/businesses/create' },
  { id: 'p-5', title: 'System Health & Diagnostics', subtitle: 'Live ping tests, microservice telemetry, and report export', category: 'pages', url: '/platform/health' },
  { id: 'p-6', title: 'Platform Analytics', subtitle: 'Cross-tenant growth, deal volume, and risk distribution', category: 'pages', url: '/platform/analytics' },
  { id: 'p-7', title: 'Platform Users', subtitle: 'Tenant administrator and operator accounts', category: 'pages', url: '/platform/users' },
  { id: 'p-8', title: 'Deal Pipeline', subtitle: 'Commercial opportunities and pipeline management', category: 'pages', url: '/sales/deals' },
  { id: 'p-9', title: 'Quotations Hub', subtitle: 'CPQ quotation drafts, approval flows, and pricing', category: 'pages', url: '/sales/quotations' },
  { id: 'p-10', title: 'Customer Directory', subtitle: 'Enterprise accounts, contracts, and commercial profiles', category: 'pages', url: '/customers' },
  { id: 'p-11', title: 'Products & Price Books', subtitle: 'Catalog, pricing tiers, and SKU matrix', category: 'pages', url: '/products' },
  { id: 'p-12', title: 'Notification Center', subtitle: 'Alerts, operational notices, and channel preferences', category: 'pages', url: '/notifications' },
  { id: 'p-13', title: 'Revenue Analytics', subtitle: 'Revenue trajectories, recurring vs one-time cash flows', category: 'pages', url: '/analytics/revenue' },
  { id: 'p-14', title: 'Margin Analytics', subtitle: 'COGS, gross profit margins, and risk heatmaps', category: 'pages', url: '/analytics/margin' },
  { id: 'p-15', title: 'Approval Analytics', subtitle: 'Turnaround SLAs and governance hierarchy trends', category: 'pages', url: '/analytics/approvals' },
  { id: 'p-16', title: 'Discount Governance', subtitle: 'Realized discounts vs customer tier thresholds', category: 'pages', url: '/analytics/discounts' },
  { id: 'p-17', title: 'Settings & Workspace', subtitle: 'Tenant branding, billing profiles, and localization', category: 'pages', url: '/settings' },
  { id: 'p-18', title: 'User Preferences', subtitle: 'Theme, density, timezones, and notifications', category: 'pages', url: '/preferences' },

  // Deals
  { id: 'd-1', title: 'Acme Corp Annual Enterprise Expansion', subtitle: '₹24,50,000 · Stage: Negotiation · Acme Corp', category: 'deals', url: '/sales/deals/deal-001', status: 'Negotiation' },
  { id: 'd-2', title: 'FinTech Global Security Infrastructure', subtitle: '₹18,20,000 · Stage: Proposal · FinTech Innovations', category: 'deals', url: '/sales/deals/deal-002', status: 'Proposal' },
  { id: 'd-3', title: 'Cloud Migration Multi-Region Cluster', subtitle: '₹12,40,000 · Stage: Discovery · TechFlow Systems', category: 'deals', url: '/sales/deals/deal-003', status: 'Discovery' },
  { id: 'd-4', title: 'Apex Health Systems Annual Retainer', subtitle: '₹31,00,000 · Stage: Won · Apex Healthcare', category: 'deals', url: '/sales/deals/deal-004', status: 'Won' },
  { id: 'd-5', title: 'Hyperion Cloud Backup Suite', subtitle: '₹8,50,000 · Stage: Qualification · Hyperion Labs', category: 'deals', url: '/sales/deals/deal-005', status: 'Qualification' },

  // Quotations
  { id: 'q-1', title: 'QT-2026-00482 Acme Systems Expansion', subtitle: 'Approved quotation · Gold Tier · Net: ₹1,34,640', category: 'quotes', url: '/sales/quotations/qt-001', status: 'Approved' },
  { id: 'q-2', title: 'QT-2026-00391 Nimbus AI Server Rack', subtitle: 'Draft quote · Custom margin review · Net: ₹4,85,000', category: 'quotes', url: '/sales/quotations/qt-002', status: 'Draft' },
  { id: 'q-3', title: 'QT-2026-00219 TechFlow Annual ERP Licensing', subtitle: 'Under Review · High Risk Tier · Net: ₹8,12,000', category: 'quotes', url: '/sales/quotations/qt-003', status: 'Under Review' },
  { id: 'q-4', title: 'QT-2026-00104 Global Logistics Fleet Modernization', subtitle: 'Sent to customer · Net: ₹14,20,000', category: 'quotes', url: '/sales/quotations/qt-004', status: 'Sent' },

  // Customers
  { id: 'c-1', title: 'Acme Corporation', subtitle: 'Enterprise Tier · 4 active deals · ₹48.5L pipeline', category: 'customers', url: '/customers/cust-001', status: 'Enterprise' },
  { id: 'c-2', title: 'FinTech Innovations Global', subtitle: 'Strategic Tier · Mumbai, IN · 2 quotes pending', category: 'customers', url: '/customers/cust-002', status: 'Strategic' },
  { id: 'c-3', title: 'TechFlow Solutions Ltd', subtitle: 'Corporate Tier · Bengaluru, IN · 3 closed-won deals', category: 'customers', url: '/customers/cust-003', status: 'Corporate' },
  { id: 'c-4', title: 'Apex Healthcare Systems', subtitle: 'Healthcare Enterprise · New Delhi, IN', category: 'customers', url: '/customers/cust-004', status: 'Enterprise' },

  // Platform Businesses
  { id: 'b-1', title: 'Acme Enterprise Solutions', subtitle: 'acme.dealflow360.io · Enterprise Plan · Active', category: 'businesses', url: '/platform/businesses/biz-001', status: 'Active' },
  { id: 'b-2', title: 'NovaTech Digital Works', subtitle: 'novatech.dealflow360.io · Growth Plan · Active', category: 'businesses', url: '/platform/businesses/biz-002', status: 'Active' },
  { id: 'b-3', title: 'HealthHub Telemedicine', subtitle: 'healthhub.dealflow360.io · Pro Plan · Suspended', category: 'businesses', url: '/platform/businesses/biz-003', status: 'Suspended' },
]

const QUICK_LINKS = [
  { label: 'Sales Dashboard', url: '/dashboard', icon: Layers },
  { label: 'Platform Dashboard', url: '/platform/dashboard', icon: Activity },
  { label: 'All Businesses', url: '/platform/businesses', icon: Building2 },
  { label: 'System Health', url: '/platform/health', icon: Sparkles },
  { label: 'Quotations Hub', url: '/sales/quotations', icon: FileText },
  { label: 'Notification Center', url: '/notifications', icon: Bell },
]

type ScopeTab = 'all' | 'pages' | 'deals' | 'quotes' | 'customers'

export function NavbarSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeScope, setActiveScope] = React.useState<ScopeTab>('all')
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0)
  const [mobileExpanded, setMobileExpanded] = React.useState(false)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const mobileInputRef = React.useRef<HTMLInputElement>(null)

  // Listen for Ctrl+K or Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => {
          inputRef.current?.focus()
          mobileInputRef.current?.focus()
        }, 50)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setMobileExpanded(false)
      }
    }
    if (isOpen || mobileExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, mobileExpanded])

  // Filtered results
  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    let pool = SEARCH_DATABASE

    if (activeScope !== 'all') {
      pool = pool.filter((item) => item.category === activeScope)
    }

    if (!q) {
      return pool.slice(0, 8)
    }

    return pool.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(q)
      const subMatch = item.subtitle?.toLowerCase().includes(q) ?? false
      const statusMatch = item.status?.toLowerCase().includes(q) ?? false
      return titleMatch || subMatch || statusMatch
    })
  }, [query, activeScope])

  // Reset selected index when results change
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  const handleSelect = (item: SearchItem) => {
    setIsOpen(false)
    setMobileExpanded(false)
    setQuery('')
    navigate(item.url)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setMobileExpanded(false)
    }
  }

  const getCategoryBadge = (cat: SearchItem['category']) => {
    switch (cat) {
      case 'pages':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">Page</span>
      case 'deals':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-500">Deal</span>
      case 'quotes':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-500">Quote</span>
      case 'customers':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-500">Customer</span>
      case 'businesses':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-500">Tenant</span>
    }
  }

  const getCategoryIcon = (cat: SearchItem['category']) => {
    switch (cat) {
      case 'pages':
        return <Layers className="h-4 w-4 text-muted-foreground" />
      case 'deals':
        return <DollarSign className="h-4 w-4 text-blue-500" />
      case 'quotes':
        return <FileText className="h-4 w-4 text-amber-500" />
      case 'customers':
        return <Users className="h-4 w-4 text-emerald-500" />
      case 'businesses':
        return <Building2 className="h-4 w-4 text-purple-500" />
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Desktop Search Bar */}
      <div
        onClick={() => {
          setIsOpen(true)
          inputRef.current?.focus()
        }}
        className={cn(
          'hidden md:flex items-center gap-2 h-9 w-64 lg:w-80 rounded-lg border border-border bg-card/60 px-3 text-xs text-muted-foreground transition-all duration-150 cursor-text',
          'hover:bg-accent/40 hover:border-border-strong',
          isOpen && 'border-primary/50 ring-2 ring-primary/20 bg-card'
        )}
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search deals, quotes, pages..."
          className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setQuery('')
              inputRef.current?.focus()
            }}
            className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground lg:flex shrink-0">
            <span>Ctrl</span>
            <span>K</span>
          </kbd>
        )}
      </div>

      {/* Mobile Search Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setMobileExpanded(true)
          setIsOpen(true)
          setTimeout(() => mobileInputRef.current?.focus(), 50)
        }}
        aria-label="Search"
        className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Mobile Full-width Expanded Overlay */}
      {mobileExpanded && (
        <div className="fixed inset-x-0 top-0 h-16 bg-background border-b border-border z-50 flex items-center px-4 gap-2 md:hidden">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={mobileInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search deals, quotes, pages..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setMobileExpanded(false)
              setIsOpen(false)
            }}
            className="text-xs font-semibold text-primary px-2 py-1"
          >
            Done
          </button>
        </div>
      )}

      {/* Dropdown Results Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Search results"
          className="absolute left-0 sm:left-auto sm:right-0 md:left-0 mt-2 w-[calc(100vw-2rem)] sm:w-[480px] md:w-[520px] rounded-2xl border border-border bg-card shadow-elevation-3 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 ease-out origin-top-left motion-reduce:animate-none"
        >
          {/* Scope Filter Tabs */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/60 bg-muted/40 overflow-x-auto scrollbar-none">
            {(
              [
                { id: 'all', label: 'All Results' },
                { id: 'pages', label: 'Pages' },
                { id: 'deals', label: 'Deals' },
                { id: 'quotes', label: 'Quotes' },
                { id: 'customers', label: 'Customers' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveScope(tab.id)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0',
                  activeScope === tab.id
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Jump Shortcuts when query is empty */}
          {!query && (
            <div className="p-3 border-b border-border/50 bg-muted/10">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Quick Navigation
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {QUICK_LINKS.map((link) => {
                  const Icon = link.icon
                  return (
                    <button
                      key={link.url}
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        navigate(link.url)
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left cursor-pointer group"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="truncate">{link.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="max-h-[360px] overflow-y-auto p-1.5 divide-y divide-border/20">
            {results.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium text-foreground">No matches found for "{query}"</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching with a broader keyword or switch category filters.
                </p>
              </div>
            ) : (
              results.map((item, index) => {
                const isSelected = index === selectedIndex
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all text-left group',
                      isSelected ? 'bg-primary/10 text-foreground' : 'hover:bg-accent/60 text-muted-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted border border-border/60 transition-colors',
                        isSelected && 'border-primary/40 bg-card'
                      )}
                    >
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-xs font-semibold truncate',
                            isSelected ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {item.title}
                        </span>
                        {getCategoryBadge(item.category)}
                        {item.status && (
                          <span className="text-[10px] font-mono text-muted-foreground/80 ml-auto shrink-0">
                            {item.status}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    <ArrowRight
                      className={cn(
                        'h-3.5 w-3.5 shrink-0 transition-transform opacity-0 group-hover:opacity-100',
                        isSelected && 'opacity-100 translate-x-0.5 text-primary'
                      )}
                    />
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Shortcuts hint */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/60 bg-muted/20 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-border bg-card text-[10px]">↑</kbd>
                <kbd className="px-1 py-0.5 rounded border border-border bg-card text-[10px]">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-card text-[10px]">Enter</kbd>
                to select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-card text-[10px]">Esc</kbd>
              to close
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
