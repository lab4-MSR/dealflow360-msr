import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { Pagination } from '@/components/ui/datatable/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  useCustomers,
  useCustomerKpis,
  useDeleteCustomer,
  useCreateCustomer,
} from '../hooks/use-business-admin'
import type { Customer, CustomerCreateInput } from '../types'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  MoreHorizontal,
  Eye,
  Trash2,
  Download,
  Award,
  Crown,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  FileCheck2,
  CreditCard,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { format } from 'date-fns'

const formatCurrency = (value: number = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

export function CustomersPage() {
  const navigate = useNavigate()

  // Filters State
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  // Dialog & Slide-over States
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [previewCustomer, setPreviewCustomer] = useState<Customer | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    company: '',
    tier: 'bronze' as 'bronze' | 'silver' | 'gold' | 'platinum',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    creditLimit: '2500000',
    ownerId: undefined,
    defaultPriceListId: undefined,
  })
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})

  // Queries & Mutations
  const filters = {
    search,
    tier: tierFilter === 'all' ? undefined : tierFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    perPage: 10,
  }
  const { data, isLoading, error, refetch } = useCustomers(filters)
  const { data: kpis, isLoading: kpisLoading } = useCustomerKpis()
  const deleteCustomer = useDeleteCustomer()
  const createCustomer = useCreateCustomer()

  const handleSearch = () => {
    setSearch(searchInput.trim())
    setPage(1)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleResetFilters = () => {
    setSearchInput('')
    setSearch('')
    setTierFilter('all')
    setStatusFilter('all')
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteCustomer.mutateAsync(deleteId)
      toast.success('Customer account archived successfully')
      setDeleteId(null)
      if (previewCustomer?.id === deleteId) setPreviewCustomer(null)
    } catch {
      toast.error('Failed to archive customer account')
    }
  }

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!createForm.name.trim()) errs.name = 'Company / Account name is required'
    if (!createForm.contactEmail.trim()) {
      errs.contactEmail = 'Contact email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.contactEmail)) {
      errs.contactEmail = 'Enter a valid corporate email'
    }

    setCreateErrors(errs)
    if (Object.keys(errs).length > 0) return

    try {
      const payload: CustomerCreateInput = {
        name: createForm.name.trim(),
        company: createForm.company.trim() || createForm.name.trim(),
        tier: createForm.tier,
        status: createForm.status,
        email: createForm.contactEmail.trim().toLowerCase(),
        phone: createForm.contactPhone.trim(),
        creditLimit: Number(createForm.creditLimit) || 0,
        ownerId: createForm.ownerId.trim() || undefined,
        defaultPriceListId: createForm.defaultPriceListId.trim() || undefined,
        contacts: [
          {
            name: createForm.contactName.trim() || createForm.name.trim(),
            email: createForm.contactEmail.trim().toLowerCase(),
            phone: createForm.contactPhone.trim(),
            isPrimary: true,
          },
        ],
      }
      await createCustomer.mutateAsync(payload)
      toast.success(`Customer account "${createForm.name}" created successfully`)
      setShowCreateModal(false)
      setCreateForm({
        name: '',
        company: '',
        tier: 'bronze',
        status: 'active',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        creditLimit: '2500000',
        ownerId: '',
        defaultPriceListId: '',
      })
      setCreateErrors({})
    } catch {
      toast.error('Failed to create customer account')
    }
  }

  const escapeCsvCell = (value: unknown) =>
    `"${String(value ?? '').replace(/"/g, '""')}"`

  const exportCustomersCsv = () => {
    if (!data?.customers || data.customers.length === 0) {
      toast.error('No customer accounts to export')
      return
    }
    const headers = ['Account Name', 'Tier', 'Primary Email', 'Owner', 'Revenue (INR)', 'Deals Count', 'Status']
    const rows = data.customers.map((c: Customer) => [
      escapeCsvCell(c.name),
      escapeCsvCell(c.tier || 'bronze'),
      escapeCsvCell(c.contacts?.[0]?.email || c.email || ''),
      escapeCsvCell(c.ownerName || 'Unassigned'),
      escapeCsvCell(c.totalRevenue ?? c.lifetimeValue ?? 0),
      escapeCsvCell(c.totalDeals ?? c.totalOrders ?? 0),
      escapeCsvCell(c.status || 'active'),
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dealflow360-customers-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success('Customer directory exported as CSV')
  }

  const getTierBadge = (tier: string = 'bronze') => {
    const t = tier.toLowerCase()
    if (t === 'platinum') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900 border border-slate-700 shadow-2xs">
          <Crown className="h-3 w-3 text-sky-400 dark:text-sky-600" />
          Platinum
        </span>
      )
    }
    if (t === 'gold') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
          <Award className="h-3 w-3 text-amber-500" />
          Gold
        </span>
      )
    }
    if (t === 'silver') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
          <Sparkles className="h-3 w-3 text-slate-400" />
          Silver
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20">
        Bronze
      </span>
    )
  }

  const columns: Column<Customer>[] = [
    {
      id: 'customer',
      header: 'Commercial Account',
      accessorFn: (row) => {
        const initials = (row.name || 'Account')
          .split(' ')
          .filter(Boolean)
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'AC'
        const contactEmail = row.contacts?.[0]?.email || row.email || 'No email registered'
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs font-display">
              {initials}
            </div>
            <div>
              <p
                className="text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                onClick={() => navigate(`/business-admin/customers/${row.id}`)}
              >
                {row.name}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]">
                {contactEmail}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      id: 'tier',
      header: 'Commercial Tier',
      accessorFn: (row) => getTierBadge(row.tier),
    },
    {
      id: 'owner',
      header: 'Account Owner',
      accessorFn: (row) => (
        <span className="text-xs text-foreground font-medium flex items-center gap-1.5">
          <BriefcaseBusiness className="h-3.5 w-3.5 text-muted-foreground/80" />
          {row.ownerName || <span className="text-muted-foreground italic">Enterprise Pool</span>}
        </span>
      ),
    },
    {
      id: 'revenue',
      header: 'Pipeline Revenue',
      accessorFn: (row) => {
        const val = row.totalRevenue ?? row.lifetimeValue ?? 0
        return (
          <span className="text-xs text-foreground font-bold font-mono tabular-nums">
            {formatCurrency(val)}
          </span>
        )
      },
    },
    {
      id: 'deals',
      header: 'Governed Deals',
      accessorFn: (row) => (
        <span className="text-xs font-semibold text-foreground font-mono bg-muted/60 px-2 py-0.5 rounded border border-border/60 tabular-nums">
          {row.totalDeals ?? row.totalOrders ?? 0} Deals
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Account Status',
      accessorFn: (row) => (
        <Badge
          variant={
            row.status === 'active'
              ? 'success'
              : row.status === 'suspended'
              ? 'danger'
              : 'secondary'
          }
          className="text-[10px] capitalize font-medium"
        >
          {row.status || 'Active'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      accessorFn: (row) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewCustomer(row)}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Quick Preview"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate(`/business-admin/customers/${row.id}`)}>
                <Building2 className="h-3.5 w-3.5 mr-2" />
                Account Record
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/sales/deals?customer=${row.id}`)}>
                <FileCheck2 className="h-3.5 w-3.5 mr-2" />
                View Deals
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteId(row.id)}
                className="text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-500/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Archive Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── ENTERPRISE PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
              Customers & Accounts
            </h1>
            <Badge variant="outline" className="gap-1 text-xs py-0.5 px-2.5 font-mono">
              <Building2 className="h-3 w-3 text-primary" />
              Enterprise Master
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Governed account directory, tier classifications, discount floor boundaries, and pipeline metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCustomersCsv}
            className="h-9 px-3 text-xs gap-1.5 font-medium border-border/80"
          >
            <Download className="h-3.5 w-3.5" />
            Export Directory
          </Button>

          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm bg-primary text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            New Customer
          </Button>
        </div>
      </div>

      {/* ─── KEY TELEMETRY CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/80 bg-card shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {kpisLoading ? <Skeleton className="h-8 w-16" /> : kpis?.totalCustomers ?? 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Governed enterprise accounts</p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active Accounts
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {kpisLoading ? <Skeleton className="h-8 w-16" /> : kpis?.activeCustomers ?? 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Active trading accounts</p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pipeline Realized
            </CardTitle>
            <DollarSign className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono tabular-nums">
              {kpisLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(kpis?.totalRevenue ?? 0)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Total closed deal value</p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Top Tier Accounts
            </CardTitle>
            <Crown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {kpisLoading ? <Skeleton className="h-8 w-16" /> : data?.customers?.filter((c) => ['platinum', 'gold'].includes((c.tier || 'bronze').toLowerCase())).length ?? 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Platinum & Gold tier accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── FILTERS & SEARCH TOOLBAR ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-card p-3 rounded-xl border border-border/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search accounts by company name, contact, or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <Select value={tierFilter} onValueChange={(val) => { setTierFilter(val); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40 h-9 text-xs">
            <SelectValue placeholder="All Tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="platinum">Platinum Tier</SelectItem>
            <SelectItem value="gold">Gold Tier</SelectItem>
            <SelectItem value="silver">Silver Tier</SelectItem>
            <SelectItem value="bronze">Bronze Tier</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-36 h-9 text-xs">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Button size="sm" onClick={handleSearch} className="h-9 px-4 text-xs font-semibold shrink-0">
          Filter
        </Button>

        {(search || tierFilter !== 'all' || statusFilter !== 'all') && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground">
            Reset
          </Button>
        )}
      </div>

      {/* ─── DATA TABLE AREA ─── */}
      {isLoading ? (
        <Card className="border border-border/80 p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          ))}
        </Card>
      ) : error ? (
        <ErrorState title="Failed to load customer directory" onRetry={refetch} />
      ) : !data?.customers || data.customers.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No customer accounts found"
          description="Try broadening your search keywords, clearing tier filters, or create a new corporate customer."
          action={<Button onClick={() => setShowCreateModal(true)}>Add Customer Account</Button>}
        />
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <DataTable
            columns={columns}
            data={data.customers}
            onRowClick={(row) => navigate(`/business-admin/customers/${row.id}`)}
          />
          {data.totalPages > 1 && (
            <div className="border-t border-border/60 p-3 bg-surface-muted/30">
              <Pagination
                page={page}
                totalPages={data.totalPages || 1}
                total={data.total}
                perPage={data.perPage}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* ─── QUICK ADD CUSTOMER DIALOG ─── */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-display flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Create Customer Account
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new commercial trading partner with pre-configured tier ceilings and billing details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCustomer} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold text-foreground">
                  Company / Account Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Reliance Cloud Infotech Ltd"
                  value={createForm.name}
                  onChange={(e) => {
                    setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                    if (createErrors.name) setCreateErrors((prev) => ({ ...prev, name: '' }))
                  }}
                  className="h-9 text-xs"
                  error={!!createErrors.name}
                />
                {createErrors.name && <p className="text-[11px] text-rose-500">{createErrors.name}</p>}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">Commercial Tier</Label>
                <Select
                  value={createForm.tier}
                  onValueChange={(val: any) => setCreateForm((prev) => ({ ...prev, tier: val }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platinum">Platinum (Custom Pricing)</SelectItem>
                    <SelectItem value="gold">Gold Tier (Max 10% Floor)</SelectItem>
                    <SelectItem value="silver">Silver Tier (Standard)</SelectItem>
                    <SelectItem value="bronze">Bronze (Catalog Baseline)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">Account Status</Label>
                <Select
                  value={createForm.status}
                  onValueChange={(val: any) => setCreateForm((prev) => ({ ...prev, status: val }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active & Verified</SelectItem>
                    <SelectItem value="inactive">Inactive / Draft</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 sm:col-span-2 border-t border-border/60 pt-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Primary Contact Person
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">Contact Name</Label>
                <Input
                  placeholder="e.g. Vikram Singhania"
                  value={createForm.contactName}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, contactName: e.target.value }))}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">
                  Corporate Email <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="v.singhania@reliance.in"
                  value={createForm.contactEmail}
                  onChange={(e) => {
                    setCreateForm((prev) => ({ ...prev, contactEmail: e.target.value }))
                    if (createErrors.contactEmail) setCreateErrors((prev) => ({ ...prev, contactEmail: '' }))
                  }}
                  className="h-9 text-xs"
                  error={!!createErrors.contactEmail}
                />
                {createErrors.contactEmail && (
                  <p className="text-[11px] text-rose-500">{createErrors.contactEmail}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">Phone Number</Label>
                <Input
                  placeholder="+91 98200 55555"
                  value={createForm.contactPhone}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">Credit Limit (INR ₹)</Label>
                <Input
                  type="number"
                  placeholder="2500000"
                  value={createForm.creditLimit}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, creditLimit: e.target.value }))}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createCustomer.isPending}
                className="text-xs font-semibold bg-primary text-primary-foreground gap-1.5"
              >
                <Plus className="h-3 w-3" />
                {createCustomer.isPending ? 'Registering...' : 'Register Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── QUICK PREVIEW SLIDE-OVER / MODAL ─── */}
      {previewCustomer && (
        <Dialog open={!!previewCustomer} onOpenChange={(open) => !open && setPreviewCustomer(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-bold font-display">
                    {previewCustomer.name}
                  </DialogTitle>
                  {getTierBadge(previewCustomer.tier)}
                </div>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Account ID: <span className="font-mono text-foreground font-semibold">{previewCustomer.id}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-surface-muted/50 p-3 rounded-xl border border-border/70">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Pipeline Revenue</span>
                  <span className="text-base font-bold font-mono text-foreground tabular-nums">
                    {formatCurrency(previewCustomer.totalRevenue ?? previewCustomer.lifetimeValue ?? 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Active Governed Deals</span>
                  <span className="text-base font-bold font-mono text-foreground tabular-nums">
                    {previewCustomer.totalDeals ?? previewCustomer.totalOrders ?? 0} Deals
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                  Primary Contact Information
                </p>
                <div className="space-y-1.5 border border-border/70 rounded-xl p-3 bg-card">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {previewCustomer.contacts?.[0]?.name || previewCustomer.name}
                    </span>
                    <Badge variant="outline" className="text-[10px]">Primary Signatory</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground pt-1">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <span className="font-mono">{previewCustomer.contacts?.[0]?.email || previewCustomer.email || 'No email registered'}</span>
                  </div>
                  {previewCustomer.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{previewCustomer.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-muted-foreground">Account Representative:</span>
                <span className="font-semibold text-foreground">{previewCustomer.ownerName || 'Unassigned'}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewCustomer(null)}
                className="text-xs"
              >
                Close Preview
              </Button>
              <Button
                size="sm"
                onClick={() => navigate(`/business-admin/customers/${previewCustomer.id}`)}
                className="text-xs font-semibold gap-1.5"
              >
                <span>Full Account Record</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── CONFIRM ARCHIVE DIALOG ─── */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Archive Customer Account"
        description="Are you sure you want to archive this commercial account? Historical invoices, quotes, and audit transactions will remain permanently preserved."
        confirmLabel="Archive Account"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  )
}
