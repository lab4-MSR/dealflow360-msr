import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { ErrorState, MoneyDisplay } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  usePriceListDetail,
  useUpdatePriceList,
  useDeletePriceList,
  usePricingHistory,
} from '../hooks/use-business-admin'
import { toast } from 'sonner'
import { ArrowLeft, MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight, Calendar, Package, Users, History, List } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'

const safeFormatDate = (value: string | undefined | null, fmt = 'MMM d, yyyy'): string => {
  if (!value) return '—'
  try {
    const d = parseISO(value)
    if (!isValid(d)) return '—'
    return format(d, fmt)
  } catch {
    return '—'
  }
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  draft: 'warning',
  inactive: 'secondary',
}

const TIER_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  bronze: 'warning',
  silver: 'info',
  gold: 'success',
  platinum: 'default',
}

export function PriceListDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: priceList, isLoading, error, refetch } = usePriceListDetail(id || '')
  const updatePriceList = useUpdatePriceList()
  const deletePriceList = useDeletePriceList()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const { data: historyData } = usePricingHistory({
    entityId: id,
    entityType: 'price_list',
    page: 1,
    perPage: 100,
  }, { enabled: !!id })

  const handleToggleStatus = async () => {
    if (!priceList) return
    const newStatus = priceList.status === 'active' ? 'inactive' : 'active'
    try {
      await updatePriceList.mutateAsync({ id: priceList.id, data: { status: newStatus } })
      toast.success(`Price list ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update price list status')
    }
  }

  const handleDelete = async () => {
    if (!priceList) return
    try {
      await deletePriceList.mutateAsync(priceList.id)
      toast.success('Price list deleted')
      navigate('/business-admin/pricing/price-lists')
    } catch {
      toast.error('Failed to delete price list')
    }
  }

  const itemColumns: Column<Record<string, unknown>>[] = [
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
      id: 'basePrice',
      header: 'Base Price',
      accessorFn: (row) => (
        <MoneyDisplay amount={Number(row.unitPrice)} currency={String(row.currency)} size="sm" />
      ),
    },
    {
      id: 'sellingPrice',
      header: 'Selling Price',
      accessorFn: (row) => {
        const selling = Number(row.sellingPrice ?? (row as Record<string, unknown>).price ?? row.unitPrice)
        return (
          <MoneyDisplay amount={selling} currency={String(row.currency)} size="sm" />
        )
      },
    },
    {
      id: 'discount',
      header: 'Discount %',
      accessorFn: (row) => {
        const disc = row.discountPercent as number | undefined
        return disc != null ? (
          <span className="text-[13px] tabular-nums text-foreground">{disc}%</span>
        ) : (
          <span className="text-[12px] text-muted-foreground">—</span>
        )
      },
    },
    {
      id: 'margin',
      header: 'Margin',
      accessorFn: (row) => {
        const margin = (row as Record<string, unknown>).margin as number | undefined
        return margin != null ? (
          <Badge variant="success">{margin}%</Badge>
        ) : (
          <span className="text-[12px] text-muted-foreground">—</span>
        )
      },
    },
  ]

  const historyColumns: Column<Record<string, unknown>>[] = [
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
      accessorFn: (row) => (
        <span className="text-[13px] text-muted-foreground">{String(row.previousValue || '—')}</span>
      ),
    },
    {
      id: 'new',
      header: 'New Value',
      accessorFn: (row) => (
        <span className="text-[13px] text-foreground">{String(row.newValue || '—')}</span>
      ),
    },
    {
      id: 'actor',
      header: 'Changed By',
      accessorFn: (row) => (
        <span className="text-[13px] text-muted-foreground">{String(row.actor)}</span>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      accessorFn: (row) => (
        <span className="text-[12px] text-muted-foreground tabular-nums">
          {safeFormatDate(String(row.timestamp), 'MMM d, yyyy · h:mm a')}
        </span>
      ),
    },
    {
      id: 'reason',
      header: 'Reason',
      accessorFn: (row) => (
        <span className="text-[13px] text-muted-foreground">{String(row.reason || '—')}</span>
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

  if (error || !priceList) {
    return <ErrorState title="Failed to load price list" onRetry={refetch} />
  }

  const pl = priceList

  return (
    <div className="space-y-6">
      <PageHeader
        title={pl.name}
        description={pl.description || ''}
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Pricing' },
          { label: 'Price Lists', path: '/business-admin/pricing/price-lists' },
          { label: pl.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/business-admin/pricing/price-lists')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Badge variant={STATUS_VARIANT[pl.status] || 'secondary'}>{pl.status}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/business-admin/pricing/lists/${pl.id}?edit=1`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleStatus}>
                  {pl.status === 'active' ? (
                    <ToggleLeft className="h-4 w-4 mr-2" />
                  ) : (
                    <ToggleRight className="h-4 w-4 mr-2" />
                  )}
                  {pl.status === 'active' ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-danger">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Pricing Items</TabsTrigger>
          <TabsTrigger value="assignments">Customer Assignment</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Price List Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <List className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Name</p>
                      <p className="text-[13px] text-foreground font-medium">{pl.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Description</p>
                      <p className="text-[13px] text-foreground">{pl.description || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Customer Segment</p>
                      <p className="text-[13px] text-foreground capitalize">{pl.scope}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Items Count</p>
                      <p className="text-[13px] text-foreground">{pl.itemCount}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <List className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Currency</p>
                      <p className="text-[13px] text-foreground">{pl.currency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Effective From</p>
                      <p className="text-[13px] text-foreground">
                        {pl.effectiveFrom ? safeFormatDate(pl.effectiveFrom) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Effective Until</p>
                      <p className="text-[13px] text-foreground">
                        {pl.effectiveUntil ? safeFormatDate(pl.effectiveUntil) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Created</p>
                      <p className="text-[13px] text-foreground">{safeFormatDate(pl.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Updated</p>
                      <p className="text-[13px] text-foreground">{safeFormatDate(pl.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Items ({pl.items?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {!pl.items || pl.items.length === 0 ? (
                <div className="py-8 text-center">
                  <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">No pricing items in this price list.</p>
                </div>
              ) : (
                <DataTable columns={itemColumns} data={pl.items as unknown as Record<string, unknown>[]} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-[13px] font-semibold text-foreground mb-3">Tier Assignments</h4>
                {pl.scope === 'tier' && pl.tierScope ? (
                  <div className="flex items-center gap-3">
                    <Badge variant={TIER_VARIANT[pl.tierScope] || 'secondary'} className="capitalize">
                      {pl.tierScope}
                    </Badge>
                    <span className="text-[13px] text-muted-foreground">Tier-based price list</span>
                  </div>
                ) : pl.scope === 'all' ? (
                  <p className="text-[13px] text-muted-foreground">Applies to all customers.</p>
                ) : (
                  <p className="text-[13px] text-muted-foreground">No tier assignments for customer-specific price list.</p>
                )}
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-foreground mb-3">Specific Customers</h4>
                {pl.scope === 'customer' ? (
                  <p className="text-[13px] text-muted-foreground">Customer-specific price list.</p>
                ) : (
                  <p className="text-[13px] text-muted-foreground">Not applicable for this scope.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Change History</CardTitle>
            </CardHeader>
            <CardContent>
              {!historyData?.entries || historyData.entries.length === 0 ? (
                <div className="py-8 text-center">
                  <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">No pricing changes recorded for this price list.</p>
                </div>
              ) : (
                <DataTable
                  columns={historyColumns}
                  data={historyData.entries as unknown as Record<string, unknown>[]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete price list?"
        description="This will permanently remove the price list and all its items. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deletePriceList.isPending}
      />
    </div>
  )
}
