import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { Pagination } from '@/components/ui/datatable/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useProducts, useProductKpis, useDeleteProduct } from '../hooks/use-business-admin'
import type { Product } from '../types'
import { toast } from 'sonner'
import { Plus, Search, Package, CheckCircle, AlertTriangle, DollarSign, MoreHorizontal, Eye, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'danger' | 'warning'> = {
  active: 'success',
  inactive: 'secondary',
  discontinued: 'warning',
}

const CATEGORY_VARIANT: Record<string, 'info' | 'success' | 'warning' | 'outline'> = {
  Software: 'info',
  Services: 'success',
  Hardware: 'warning',
  Subscriptions: 'outline',
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

export function ProductsPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters = {
    search,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    perPage: 10,
  }
  const { data, isLoading, error, refetch } = useProducts(filters)
  const { data: kpis, isLoading: kpisLoading } = useProductKpis()
  const deleteProduct = useDeleteProduct()

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

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteProduct.mutateAsync(deleteId)
      toast.success('Product deleted')
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete product')
    }
  }

type ProductRow = Product & Record<string, unknown>

  const columns: Column<ProductRow>[] = [
    {
      id: 'product',
      header: 'Product',
      accessorFn: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-foreground">{row.name}</p>
          <p className="text-[11px] text-muted-foreground">{row.sku}</p>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessorFn: (row) => (
        <Badge variant={CATEGORY_VARIANT[row.category] || 'outline'}>{row.category}</Badge>
      ),
    },
    {
      id: 'price',
      header: 'Price',
      accessorFn: (row) => (
        <span className="text-[13px] text-foreground tabular-nums font-medium">{formatCurrency(row.unitPrice ?? row.price ?? 0)}</span>
      ),
    },
    {
      id: 'stock',
      header: 'Stock',
      accessorFn: (row) => (
        <span className={`text-[13px] tabular-nums ${(row.stock ?? 0) <= (row.lowStockThreshold ?? 0) ? 'text-warning font-medium' : 'text-muted-foreground'}`}>
          {row.stock ?? 0}
        </span>
      ),
    },
    {
      id: 'sales',
      header: 'Sales',
      accessorFn: (row) => (
        <span className="text-[13px] text-muted-foreground tabular-nums">{row.salesCount ?? 0}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || 'secondary'}>{row.status}</Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      accessorFn: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/business-admin/products/${row.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteId(row.id)} className="text-danger">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6">
      {/* Enterprise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              Products & Catalog
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              SKU Governed
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Maintain product definitions, SKU hierarchy, baseline price books, and stock thresholds.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            className="h-9 px-4 text-xs font-semibold shadow-xs"
            onClick={() => navigate('/business-admin/products/new')}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <button
          type="button"
          aria-current="page"
          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary border border-primary/20 transition-all cursor-pointer"
        >
          All Products ({kpis?.totalProducts ?? 0})
        </button>
        <button
          type="button"
          onClick={() => navigate('/business-admin/products/categories')}
          className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all cursor-pointer"
        >
          Categories & Families
        </button>
        <button
          type="button"
          onClick={() => navigate('/business-admin/pricing/lists')}
          className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all cursor-pointer"
        >
          Price Lists
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total SKUs</span>
                <div className="p-1.5 rounded-lg bg-muted/60"><Package className="h-4 w-4 text-foreground/80" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-foreground">{kpis?.totalProducts ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Catalog products registered</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active For Quoting</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10"><CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-emerald-600 dark:text-emerald-400">{kpis?.activeProducts ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Available in CPQ builder</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Low Stock SKUs</span>
                <div className="p-1.5 rounded-lg bg-amber-500/10"><AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-amber-600 dark:text-amber-400">{kpis?.lowStock ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Below safety threshold</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Inventory Valuation</span>
                <div className="p-1.5 rounded-lg bg-primary/10"><DollarSign className="h-4 w-4 text-primary" /></div>
              </div>
              <p className="text-xl font-bold font-display tabular-nums text-foreground truncate">
                {formatCurrency(kpis?.totalValue ?? 0)}
              </p>
              <span className="text-[11px] text-muted-foreground">Current asset valuation</span>
            </div>
          </>
        )}
      </div>

      {/* Modern Filter Toolbar */}
      <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-9 h-9 text-xs"
              placeholder="Search product name or SKU code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="secondary" size="sm" className="h-9 px-3 text-xs font-medium" onClick={handleSearch}>
            Search
          </Button>

          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Software">Software</SelectItem>
              <SelectItem value="Services">Services</SelectItem>
              <SelectItem value="Hardware">Hardware</SelectItem>
              <SelectItem value="Subscriptions">Subscriptions</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>

          {(categoryFilter !== 'all' || statusFilter !== 'all' || search) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); setSearch(''); setSearchInput(''); setPage(1) }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : error ? (
        <ErrorState title="Failed to load products" onRetry={refetch} />
      ) : !data?.products || data.products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="No products cataloged"
          description="Add your first product definition to build quote lines and pricing rules."
          action={<Button size="sm" onClick={() => navigate('/business-admin/products/new')}><Plus className="h-4 w-4 mr-1.5" />Add Product</Button>}
        />
      ) : (
        <div className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
          <DataTable
            columns={columns}
            data={data.products as ProductRow[]}
            onRowClick={(row) => navigate(`/business-admin/products/${row.id}`)}
          />
          {data.totalPages > 1 && (
            <div className="p-3 border-t border-border/60">
              <Pagination
                page={page}
                totalPages={data.totalPages}
                total={data.total}
                perPage={data.perPage}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Product from Catalog?"
        description="This will prevent this SKU from being added to new quotations. Existing active contracts and quotations will retain their original line specifications."
        confirmLabel="Delete Product"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteProduct.isPending}
      />
    </div>
  )
}
