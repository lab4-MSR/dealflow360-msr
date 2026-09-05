import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProductDetail, useDeleteProduct } from '../hooks/use-business-admin'
import { toast } from 'sonner'
import { ArrowLeft, Edit, Trash2, Package, DollarSign, Warehouse, ShoppingCart, Calendar, Tag, Hash } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  inactive: 'secondary',
  discontinued: 'warning',
}

const MOVEMENT_VARIANT: Record<string, 'success' | 'danger' | 'info'> = {
  in: 'success',
  out: 'danger',
  adjustment: 'info',
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, error, refetch } = useProductDetail(id || '')
  const deleteProduct = useDeleteProduct()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    if (!product) return
    try {
      await deleteProduct.mutateAsync(product.id)
      toast.success('Product deleted')
      navigate('/business-admin/products')
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const inventoryColumns: Column<{ id: string; type: string; quantity: number; date: string; reference?: string }>[] = [
    {
      id: 'type',
      header: 'Type',
      accessorFn: (row) => (
        <Badge variant={MOVEMENT_VARIANT[row.type] || 'secondary'}>{row.type}</Badge>
      ),
    },
    {
      id: 'quantity',
      header: 'Quantity',
      accessorFn: (row) => (
        <span className="text-[13px] text-foreground tabular-nums font-medium">
          {row.type === 'out' ? '-' : '+'}{row.quantity}
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      accessorFn: (row) => (
        <span className="text-[13px] text-muted-foreground">{format(parseISO(row.date), 'MMM d, yyyy')}</span>
      ),
    },
    {
      id: 'reference',
      header: 'Reference',
      accessorFn: (row) => (
        <span className="text-[13px] text-muted-foreground">{row.reference || '—'}</span>
      ),
    },
  ]

  const salesColumns: Column<{ id: string; dealName: string; customerName: string; quantity: number; unitPrice: number; total: number; date: string }>[] = [
    {
      id: 'deal',
      header: 'Deal',
      accessorFn: (row) => (
        <span className="text-[13px] font-semibold text-foreground">{row.dealName}</span>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorFn: (row) => (
        <span className="text-[13px] text-muted-foreground">{row.customerName}</span>
      ),
    },
    {
      id: 'quantity',
      header: 'Qty',
      accessorFn: (row) => (
        <span className="text-[13px] text-muted-foreground tabular-nums">{row.quantity}</span>
      ),
    },
    {
      id: 'unitPrice',
      header: 'Unit Price',
      accessorFn: (row) => (
        <span className="text-[13px] text-foreground tabular-nums">{formatCurrency(row.unitPrice)}</span>
      ),
    },
    {
      id: 'total',
      header: 'Total',
      accessorFn: (row) => (
        <span className="text-[13px] text-foreground tabular-nums font-medium">{formatCurrency(row.total)}</span>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      accessorFn: (row) => (
        <span className="text-[13px] text-muted-foreground">{format(parseISO(row.date), 'MMM d, yyyy')}</span>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error || !product) {
    return <ErrorState title="Failed to load product" onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={product.sku}
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Products', path: '/business-admin/products' },
          { label: product.name },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/business-admin/products')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button variant="outline" onClick={() => toast.info('Edit coming soon')}>
              <Edit className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </>
        }
      />

      {/* Product Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-foreground">{product.name}</h2>
              <p className="text-[13px] text-muted-foreground">{product.sku}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={STATUS_VARIANT[product.status] || 'secondary'}>{product.status}</Badge>
                <Badge variant="outline">{product.category}</Badge>
                <span className="text-[12px] text-muted-foreground">
                  Created {format(parseISO(product.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales">Sales History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Name</p>
                      <p className="text-[13px] text-foreground">{product.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">SKU</p>
                      <p className="text-[13px] text-foreground">{product.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Category</p>
                      <p className="text-[13px] text-foreground">{product.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Unit Price</p>
                      <p className="text-[13px] text-foreground">{formatCurrency(product.unitPrice)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Currency</p>
                      <p className="text-[13px] text-foreground">{product.currency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Unit</p>
                      <p className="text-[13px] text-foreground">{product.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Status</p>
                      <Badge variant={STATUS_VARIANT[product.status] || 'secondary'}>{product.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Created</p>
                      <p className="text-[13px] text-foreground">{format(parseISO(product.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Price Lists</CardTitle>
            </CardHeader>
            <CardContent>
              {product.priceLists.length === 0 ? (
                <div className="py-8 text-center">
                  <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">No price lists include this product.</p>
                </div>
              ) : (
                <DataTable
                  columns={[
                    { id: 'name', header: 'Price List', accessorFn: (row: { priceListName: string }) => (
                      <span className="text-[13px] font-medium text-foreground">{row.priceListName}</span>
                    )},
                    { id: 'price', header: 'Price', accessorFn: (row: { price: number; currency: string }) => (
                      <span className="text-[13px] text-foreground tabular-nums">{formatCurrency(row.price)}</span>
                    )},
                    { id: 'currency', header: 'Currency', accessorFn: (row: { currency: string }) => (
                      <span className="text-[13px] text-muted-foreground">{row.currency}</span>
                    )},
                  ] as unknown as Column<Record<string, unknown>>[]}
                  data={product.priceLists as unknown as Record<string, unknown>[]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory History</CardTitle>
            </CardHeader>
            <CardContent>
              {product.inventoryHistory.length === 0 ? (
                <div className="py-8 text-center">
                  <Warehouse className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">No inventory movements recorded.</p>
                </div>
              ) : (
                <DataTable
                  columns={inventoryColumns as unknown as Column<Record<string, unknown>>[]}
                  data={product.inventoryHistory as unknown as Record<string, unknown>[]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {product.recentSales.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">No sales recorded for this product.</p>
                </div>
              ) : (
                <DataTable
                  columns={salesColumns as unknown as Column<Record<string, unknown>>[]}
                  data={product.recentSales as unknown as Record<string, unknown>[]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
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
