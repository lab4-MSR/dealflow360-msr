import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { MoneyDisplay, ErrorState } from '@/components/shared'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  useCustomers,
  useCustomerPricing,
  useCreateCustomerPricingOverride,
  useDeleteCustomerPricingOverride,
  useProducts,
} from '../hooks/use-business-admin'
import type { CustomerPricingProduct } from '../types'
import { toast } from 'sonner'
import { Search, IndianRupee, Tag, Shield, Plus, Trash2, Eye, Package } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'
import { cn } from '@/lib/utils'

const safeFormatDate = (value: string | undefined | null, fmt = 'MMM d, yyyy'): string => {
  if (!value) return '—'
  try {
    const d = parseISO(String(value))
    if (!isValid(d)) return '—'
    return format(d, fmt)
  } catch {
    return '—'
  }
}

const PRICE_SOURCE_CONFIG: Record<string, { label: string; variant: 'secondary' | 'info' | 'success' | 'default' }> = {
  standard: { label: 'Standard', variant: 'secondary' },
  price_list: { label: 'Price List', variant: 'info' },
  volume: { label: 'Volume', variant: 'success' },
  override: { label: 'Override', variant: 'default' },
}

const TIER_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  bronze: 'warning',
  silver: 'info',
  gold: 'success',
  platinum: 'default',
}

const INPUT_CLASS = 'flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function CustomerPricingPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)
  const [overrideForm, setOverrideForm] = useState({
    productId: '',
    overridePrice: '',
    discountPercent: '',
    validFrom: '',
    validUntil: '',
  })

  const { data: customerData, isLoading: customersLoading } = useCustomers({
    search: customerSearch,
    page: 1,
    perPage: 50,
  })

  const { data: pricingData, isLoading: pricingLoading, error: pricingError, refetch } = useCustomerPricing(selectedCustomerId)
  const { data: productData } = useProducts({ page: 1, perPage: 100 })
  const createOverride = useCreateCustomerPricingOverride()
  const deleteOverride = useDeleteCustomerPricingOverride()

  const customers = useMemo(() => {
    return (customerData?.customers || []) as Array<{ id: string; name: string; tier: string; defaultPriceListName?: string }>
  }, [customerData])

  const products = useMemo(() => {
    return (productData?.products || []) as Array<{ id: string; name: string; sku: string; unitPrice: number }>
  }, [productData])

  const inspection = pricingData as unknown as {
    customer?: { id: string; name: string; tier: string; tierDisplayName: string }
    priceList?: { id: string; name: string; currency: string } | null
    products?: CustomerPricingProduct[]
  } | undefined

  const summary = useMemo(() => {
    if (!inspection?.products) return null
    const prods = inspection.products
    const totalStandard = prods.reduce((sum, p) => sum + p.standardPrice, 0)
    const totalEffective = prods.reduce((sum, p) => sum + p.effectivePrice, 0)
    const avgDiscount = totalStandard > 0 ? ((totalStandard - totalEffective) / totalStandard) * 100 : 0
    return { totalStandard, totalEffective, avgDiscount, productCount: prods.length }
  }, [inspection])

  const productColumns: Column<Record<string, unknown>>[] = [
    {
      id: 'product',
      header: 'Product',
      accessorFn: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-foreground">{String(row.productName)}</p>
          <p className="text-[11px] text-muted-foreground">{String(row.productSku)}</p>
        </div>
      ),
    },
    {
      id: 'standard',
      header: 'Standard Price',
      accessorFn: (row) => (
        <MoneyDisplay amount={Number(row.standardPrice)} currency={String(row.currency)} size="sm" />
      ),
    },
    {
      id: 'priceList',
      header: 'Price List Price',
      accessorFn: (row) => {
        const val = row.priceListPrice as number | null
        return val != null ? (
          <MoneyDisplay amount={val} currency={String(row.currency)} size="sm" />
        ) : (
          <span className="text-[12px] text-muted-foreground">—</span>
        )
      },
    },
    {
      id: 'volume',
      header: 'Volume Price',
      accessorFn: (row) => {
        const val = row.volumePrice as number | null
        return val != null ? (
          <MoneyDisplay amount={val} currency={String(row.currency)} size="sm" />
        ) : (
          <span className="text-[12px] text-muted-foreground">—</span>
        )
      },
    },
    {
      id: 'override',
      header: 'Customer Override',
      accessorFn: (row) => {
        const val = row.customerOverride as number | null
        return val != null ? (
          <MoneyDisplay amount={val} currency={String(row.currency)} size="sm" />
        ) : (
          <span className="text-[12px] text-muted-foreground">—</span>
        )
      },
    },
    {
      id: 'effective',
      header: 'Effective Price',
      accessorFn: (row) => (
        <MoneyDisplay amount={Number(row.effectivePrice)} currency={String(row.currency)} size="sm" className="font-semibold" />
      ),
    },
    {
      id: 'source',
      header: 'Price Source',
      accessorFn: (row) => {
        const source = String(row.priceSource)
        const config = PRICE_SOURCE_CONFIG[source] || PRICE_SOURCE_CONFIG.standard
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
  ]

  const overrideColumns: Column<Record<string, unknown>>[] = [
    {
      id: 'product',
      header: 'Product',
      accessorFn: (row) => (
        <span className="text-[13px] font-medium text-foreground">{String(row.productName)}</span>
      ),
    },
    {
      id: 'price',
      header: 'Override Price',
      accessorFn: (row) => (
        <MoneyDisplay amount={Number(row.overridePrice)} currency={String(row.currency)} size="sm" />
      ),
    },
    {
      id: 'validity',
      header: 'Validity',
      accessorFn: (row) => {
        const from = safeFormatDate(row.validFrom as string | undefined)
        const until = safeFormatDate(row.validUntil as string | undefined)
        return <span className="text-[12px] text-muted-foreground tabular-nums">{from} — {until}</span>
      },
    },
    {
      id: 'actions',
      header: '',
      accessorFn: (row: Record<string, unknown>) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive"
          onClick={async () => {
            const productId = String(row.productId || '')
            const productName = String((row as { productName?: string }).productName || 'product')
            if (!selectedCustomerId || !productId) {
              toast.warning('Cannot delete override: missing customer or product')
              return
            }
            try {
              await deleteOverride.mutateAsync({ customerId: selectedCustomerId, productId })
              toast.success(`Override for ${productName} removed`)
              refetch()
            } catch {
              toast.error('Failed to delete override')
            }
          }}
          disabled={deleteOverride.isPending}
          aria-label="Remove override"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ]

  const handleAddOverride = async () => {
    if (!selectedCustomerId || !overrideForm.productId || !overrideForm.overridePrice) {
      toast.error('Please fill in all required fields')
      return
    }
    const product = products.find((p) => p.id === overrideForm.productId)
    if (!product) return
    try {
      await createOverride.mutateAsync({
        customerId: selectedCustomerId,
        customerName: inspection?.customer?.name || '',
        productId: overrideForm.productId,
        productName: product.name,
        overridePrice: parseFloat(overrideForm.overridePrice),
        currency: inspection?.priceList?.currency || 'INR',
        validFrom: overrideForm.validFrom || undefined,
        validUntil: overrideForm.validUntil || undefined,
      })
      toast.success('Override added')
      setShowOverrideDialog(false)
      setOverrideForm({ productId: '', overridePrice: '', discountPercent: '', validFrom: '', validUntil: '' })
      refetch()
    } catch {
      toast.error('Failed to add override')
    }
  }

  const handleDiscountChange = (value: string) => {
    const discount = parseFloat(value)
    const product = products.find((p) => p.id === overrideForm.productId)
    if (!product) {
      setOverrideForm((prev) => ({ ...prev, discountPercent: value }))
      return
    }
    if (!isNaN(discount) && discount >= 0 && discount <= 100) {
      const computed = Number((product.unitPrice * (1 - discount / 100)).toFixed(2))
      setOverrideForm((prev) => ({ ...prev, discountPercent: value, overridePrice: String(computed) }))
    } else {
      setOverrideForm((prev) => ({ ...prev, discountPercent: value }))
    }
  }

  const handleOverridePriceChange = (value: string) => {
    const product = products.find((p) => p.id === overrideForm.productId)
    const selling = parseFloat(value)
    if (product && !isNaN(selling) && product.unitPrice > 0) {
      const discount = Number((((product.unitPrice - selling) / product.unitPrice) * 100).toFixed(1))
      setOverrideForm((prev) => ({ ...prev, overridePrice: value, discountPercent: String(discount) }))
    } else {
      setOverrideForm((prev) => ({ ...prev, overridePrice: value }))
    }
  }

  const overrides = useMemo(() => {
    if (!inspection?.products) return []
    const currency = inspection?.priceList?.currency || 'INR'
    return inspection.products.filter((p) => p.hasOverride).map((p) => ({
      productId: p.productId,
      productName: p.productName,
      overridePrice: p.customerOverride || 0,
      currency,
      validFrom: (p as unknown as { validFrom?: string }).validFrom,
      validUntil: (p as unknown as { validUntil?: string }).validUntil,
    }))
  }, [inspection])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Pricing"
        description="Inspect effective pricing for any customer, including overrides and price sources."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Customer Pricing' },
        ]}
      />

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search customers..."
              className={cn(INPUT_CLASS, 'pl-9')}
            />
          </div>
          {customersLoading ? (
            <Skeleton className="h-10 w-full max-w-md" />
          ) : (
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select a customer to inspect pricing" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} — {c.tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {inspection?.customer && (
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground uppercase">Tier:</span>
                <Badge variant={TIER_VARIANT[inspection.customer.tier] || 'secondary'} className="capitalize">
                  {inspection.customer.tierDisplayName || inspection.customer.tier}
                </Badge>
              </div>
              {inspection.priceList && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground uppercase">Price List:</span>
                  <Badge variant="info">{inspection.priceList.name}</Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {!selectedCustomerId ? (
        <EmptyState
          icon={<Eye className="h-8 w-8" />}
          title="Select a customer"
          description="Choose a customer above to view their effective pricing."
        />
      ) : pricingLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : pricingError ? (
        <ErrorState title="Failed to load pricing" onRetry={refetch} />
      ) : (
        <>
          {/* Pricing Overview */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Standard Price</p>
                      <MoneyDisplay amount={summary.totalStandard} currency={inspection?.priceList?.currency || 'INR'} size="lg" />
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted">
                      {(inspection?.priceList?.currency || 'INR') === 'INR' ? (
                        <IndianRupee className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Tag className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Customer Price</p>
                      <MoneyDisplay amount={summary.totalEffective} currency={inspection?.priceList?.currency || 'INR'} size="lg" />
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted">
                      <Tag className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Discount %</p>
                      <p className="text-[26px] font-bold tracking-tight text-foreground tabular-nums">
                        {summary.avgDiscount.toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Savings</p>
                      {summary.productCount > 0 ? (
                        <MoneyDisplay amount={summary.totalStandard - summary.totalEffective} currency={inspection?.priceList?.currency || 'INR'} size="lg" />
                      ) : (
                        <p className="text-[13px] text-muted-foreground">No products to evaluate</p>
                      )}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Product Pricing Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {inspection?.products && inspection.products.length > 0 ? (
                <DataTable
                  columns={productColumns}
                  data={inspection.products as unknown as Record<string, unknown>[]}
                />
              ) : (
                <EmptyState
                  icon={<Package className="h-8 w-8" />}
                  title="No products"
                  description="No pricing data available for this customer."
                />
              )}
            </CardContent>
          </Card>

          {/* Customer Overrides */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Customer Overrides</CardTitle>
              <Button size="sm" onClick={() => setShowOverrideDialog(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Override
              </Button>
            </CardHeader>
            <CardContent>
              {overrides.length === 0 ? (
                <div className="py-8 text-center">
                  <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">No customer-specific overrides configured.</p>
                </div>
              ) : (
                <DataTable
                  columns={overrideColumns}
                  data={overrides as unknown as Record<string, unknown>[]}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Override Dialog */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Customer Override</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Product *</Label>
              <Select value={overrideForm.productId} onValueChange={(v) => setOverrideForm((p) => ({ ...p, productId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Override Price *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={overrideForm.overridePrice}
                  onChange={(e) => handleOverridePriceChange(e.target.value)}
                  placeholder="0.00"
                  className={INPUT_CLASS}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={overrideForm.discountPercent}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  placeholder="0"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valid From</Label>
                <Input
                  type="date"
                  value={overrideForm.validFrom}
                  onChange={(e) => setOverrideForm((p) => ({ ...p, validFrom: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={overrideForm.validUntil}
                  onChange={(e) => setOverrideForm((p) => ({ ...p, validUntil: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowOverrideDialog(false)}>Cancel</Button>
            <Button onClick={handleAddOverride} disabled={createOverride.isPending}>
              {createOverride.isPending ? 'Adding...' : 'Add Override'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
