import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { Pagination } from '@/components/ui/datatable/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
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
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters = { search, category: categoryFilter, status: statusFilter, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useProducts(filters)
  const { data: kpis, isLoading: kpisLoading } = useProductKpis()
  const deleteProduct = useDeleteProduct()

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

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

  const columns: Column<Product>[] = [
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
        <span className="text-[13px] text-foreground tabular-nums font-medium">{formatCurrency(row.unitPrice)}</span>
      ),
    },
    {
      id: 'stock',
      header: 'Stock',
      accessorFn: (row) => (
        <span className={`text-[13px] tabular-nums ${row.stock <= row.lowStockThreshold ? 'text-warning font-medium' : 'text-muted-foreground'}`}>
          {row.stock}
        </span>
      ),
    },
    {
      id: 'sales',
      header: 'Sales',
      accessorFn: (row) => (
        <span className="text-[13px] text-muted-foreground tabular-nums">{row.salesCount}</span>
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
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog and inventory."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Products' },
        ]}
        actions={
          <Button onClick={() => navigate('/business-admin/products/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Product
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard label="Total Products" value={kpis?.totalProducts ?? 0} icon={<Package className="h-5 w-5" />} />
            <KpiCard label="Active Products" value={kpis?.activeProducts ?? 0} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
            <KpiCard label="Low Stock" value={kpis?.lowStock ?? 0} variant="warning" icon={<AlertTriangle className="h-5 w-5" />} />
            <KpiCard label="Total Value" value={formatCurrency(kpis?.totalValue ?? 0)} icon={<DollarSign className="h-5 w-5" />} />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Software">Software</SelectItem>
            <SelectItem value="Services">Services</SelectItem>
            <SelectItem value="Hardware">Hardware</SelectItem>
            <SelectItem value="Subscriptions">Subscriptions</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="discontinued">Discontinued</SelectItem>
          </SelectContent>
        </Select>
        {(categoryFilter || statusFilter || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter(''); setStatusFilter(''); setSearch(''); setSearchInput(''); setPage(1) }}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : error ? (
        <ErrorState title="Failed to load products" onRetry={refetch} />
      ) : !data?.products || data.products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="No products found"
          description="Add your first product to get started."
          action={<Button onClick={() => navigate('/business-admin/products/new')}><Plus className="h-4 w-4 mr-1.5" />Add Product</Button>}
        />
      ) : (
        <>
          <DataTable
            columns={columns as unknown as Column<Record<string, unknown>>[]}
            data={data.products as unknown as Record<string, unknown>[]}
            onRowClick={(row) => navigate(`/business-admin/products/${(row as unknown as Product).id}`)}
          />
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

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete product?"
        description="This action cannot be undone. All product data will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteProduct.isPending}
      />
    </div>
  )
}
