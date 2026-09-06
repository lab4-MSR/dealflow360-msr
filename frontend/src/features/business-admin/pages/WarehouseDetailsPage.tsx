import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { KpiCard } from '@/components/ui/kpi-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useWarehouseDetail, useDeleteWarehouse, useUpdateWarehouse } from '../hooks/use-business-admin'
import type { Warehouse, WarehouseDetail } from '../types'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { MoreHorizontal, Edit, Power, Trash2, MapPin, Package, AlertTriangle, CheckCircle, RefreshCw, Users, Mail, Phone, Truck } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const safeFormatDateTime = (raw: unknown, fallback = '—') => {
  if (typeof raw !== 'string' || !raw) return fallback
  try {
    const d = parseISO(raw)
    if (Number.isNaN(d.getTime())) return fallback
    return format(d, 'PPp')
  } catch { return fallback }
}

const safeFormatDate = (raw: unknown, fallback = '—') => {
  if (typeof raw !== 'string' || !raw) return fallback
  try {
    const d = parseISO(raw)
    if (Number.isNaN(d.getTime())) return fallback
    return format(d, 'PP')
  } catch { return fallback }
}

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  inactive: 'secondary',
  maintenance: 'warning',
}

const STOCK_STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'danger',
}

const MOVEMENT_TYPE_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger' | 'secondary'> = {
  incoming: 'success',
  outgoing: 'danger',
  transfer: 'info',
  adjustment: 'default',
}

const SHIPMENT_STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger' | 'secondary'> = {
  pending: 'secondary',
  processing: 'info',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'danger',
}

const TYPE_OPTIONS = [
  { value: 'distribution', label: 'Distribution Center' },
  { value: 'fulfillment', label: 'Fulfillment Center' },
  { value: 'returns', label: 'Returns Processing' },
  { value: 'cross_dock', label: 'Cross-Dock' },
]

function WarehouseDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'movements' | 'shipments'>('overview')

  const { data, isLoading, error, refetch } = useWarehouseDetail(id || '')
  const deleteWarehouse = useDeleteWarehouse()
  const updateWarehouse = useUpdateWarehouse()

  const warehouse = data as WarehouseDetail | undefined

  const handleDelete = async () => {
    if (!deleteId) return
    try { await deleteWarehouse.mutateAsync(deleteId); toast.success('Warehouse deleted'); navigate('/business-admin/warehouses') }
    catch { toast.error('Failed to delete warehouse') }
  }

  const handleToggleStatus = async (w: Warehouse) => {
    const nextStatus = w.status === 'active' ? 'inactive' : 'active'
    try {
      await updateWarehouse.mutateAsync({ id: w.id, data: { status: nextStatus } })
      toast.success(`Warehouse ${nextStatus === 'active' ? 'activated' : 'deactivated'}`)
      refetch()
    } catch {
      toast.error('Failed to update warehouse status')
    }
  }

  const handleEditSubmit = async (formData: Partial<Warehouse>) => {
    try {
      await updateWarehouse.mutateAsync({ id: warehouse!.id, data: formData })
      toast.success('Warehouse updated')
      setIsEditOpen(false)
      refetch()
    } catch { toast.error('Failed to update warehouse') }
  }

  const [editForm, setEditForm] = useState<Partial<Warehouse>>({})

  const getEditDefaults = () => ({
    name: warehouse?.name || '',
    code: (warehouse as unknown as { code?: string })?.code || '',
    type: (warehouse as unknown as { type?: string })?.type || 'distribution',
    status: warehouse?.status || 'active',
    addressLine1: warehouse?.address?.line1 || '',
    addressLine2: warehouse?.address?.line2 || '',
    country: warehouse?.address?.country || '',
    city: warehouse?.address?.city || '',
    state: warehouse?.address?.state || '',
    postalCode: warehouse?.address?.postalCode || '',
    managerName: (warehouse as unknown as { managerName?: string })?.managerName || '',
    managerEmail: (warehouse as unknown as { managerEmail?: string })?.managerEmail || '',
    managerPhone: (warehouse as unknown as { managerPhone?: string })?.managerPhone || '',
    shippingCost: (warehouse as unknown as { shippingCost?: number })?.shippingCost ?? 0,
    shipmentPriority: (warehouse as unknown as { shipmentPriority?: string })?.shipmentPriority || 'normal',
    storageCapacity: (warehouse as unknown as { storageCapacity?: number })?.storageCapacity ?? 0,
    capacityThreshold: (warehouse as unknown as { capacityThreshold?: number })?.capacityThreshold ?? 0,
    isDefault: (warehouse as unknown as { isDefault?: boolean })?.isDefault || false,
    allocationPriority: (warehouse as unknown as { allocationPriority?: number })?.allocationPriority || 1,
  })

  const handleOpenEdit = () => { setEditForm(getEditDefaults()); setIsEditOpen(true) }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading..." description="Loading warehouse details" breadcrumbs={[]} />
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      </div>
    )
  }

  if (error || !warehouse) {
    return (
      <div className="space-y-6">
        <PageHeader title="Warehouse Not Found" description="The warehouse you're looking for doesn't exist" breadcrumbs={[{ label: 'Warehouses', path: '/business-admin/warehouses' }]} />
        <ErrorState title="Failed to load warehouse" onRetry={refetch} />
      </div>
    )
  }

  const inventory = warehouse.inventory ?? []
  const stockMovements = (warehouse as unknown as { stockMovements?: unknown[] }).stockMovements ?? []
  const shipments = (warehouse as unknown as { shipments?: unknown[] }).shipments ?? []
  const sumField = (arr: { available?: number; reserved?: number }[], field: 'available' | 'reserved') =>
    arr.reduce((s, i) => s + (typeof i[field] === 'number' ? i[field] : 0), 0)
  const storageCapacity = (warehouse as unknown as { storageCapacity?: number }).storageCapacity ?? 0
  const currentCapacity = (warehouse as unknown as { currentCapacity?: number }).currentCapacity ?? 0
  const capacityThreshold = (warehouse as unknown as { capacityThreshold?: number }).capacityThreshold ?? 0
  const capacityPct = storageCapacity > 0 ? Math.round((currentCapacity / storageCapacity) * 100) : 0
  const isOverThreshold = currentCapacity >= capacityThreshold

  return (
    <div className="space-y-6">
      <PageHeader
        title={warehouse.name}
        description={`${warehouse.code} • ${warehouse.address.city}, ${warehouse.address.country}`}
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Warehouses', path: '/business-admin/warehouses' },
          { label: warehouse.name },
        ]}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><MoreHorizontal className="h-4 w-4 mr-1.5" />Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenEdit}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(warehouse)}><Power className="h-4 w-4 mr-2" />{warehouse.status === 'active' ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteId(warehouse.id)} className="text-danger"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KpiCard label="Total Products" value={(warehouse as unknown as { totalProducts?: number }).totalProducts ?? inventory.length} icon={<Package className="h-5 w-5" />} />
        <KpiCard label="Available Stock" value={sumField(inventory, 'available')} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
        <KpiCard label="Reserved Stock" value={sumField(inventory, 'reserved')} variant="warning" icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Capacity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{currentCapacity.toLocaleString('en-IN')} / {storageCapacity.toLocaleString('en-IN')}</span>
              <span className={`text-sm font-medium tabular-nums ${isOverThreshold ? 'text-warning' : 'text-muted-foreground'}`}>{capacityPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full transition-all ${isOverThreshold ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${Math.min(capacityPct, 100)}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">Threshold: {capacityThreshold.toLocaleString('en-IN')} ({isOverThreshold ? 'EXCEEDED' : 'OK'})</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Low Stock Items</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning">{warehouse.lowStockItems}</p>
            <p className="text-xs text-muted-foreground">Items below reorder level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending Shipments</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-info">{warehouse.pendingShipments}</p>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Warehouse Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2"><span className="text-muted-foreground">Code</span><span className="font-medium">{warehouse.code}</span><span className="text-muted-foreground">Type</span><span className="font-medium capitalize">{warehouse.type.replace('_', ' ')}</span><span className="text-muted-foreground">Status</span><span className="font-medium"><Badge variant={STATUS_VARIANT[warehouse.status ?? ''] || 'secondary'}>{warehouse.status}</Badge></span><span className="text-muted-foreground">Default</span><span className="font-medium">{warehouse.isDefault ? 'Yes' : 'No'}</span><span className="text-muted-foreground">Allocation Priority</span><span className="font-medium">{warehouse.allocationPriority}</span><span className="text-muted-foreground">Shipment Priority</span><span className="font-medium capitalize">{warehouse.shipmentPriority}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Location & Contact</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{warehouse.address.line1}, {warehouse.address.city}, {warehouse.address.state} {warehouse.address.postalCode}, {warehouse.address.country}</span></div>
                {warehouse.managerName && <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span>{warehouse.managerName}</span></div>}
                {warehouse.managerEmail && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{warehouse.managerEmail}</span></div>}
                {warehouse.managerPhone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{warehouse.managerPhone}</span></div>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          {inventory.length === 0 ? (
            <EmptyState icon={<Package className="h-8 w-8" />} title="No inventory" description="This warehouse has no inventory items assigned." />
          ) : (
            <DataTable
              columns={[
                { id: 'product', header: 'Product', accessorFn: (row: any) => <div><p className="font-medium">{row.productName}</p><p className="text-xs text-muted-foreground">{row.productSku}</p></div> },
                { id: 'available', header: 'Available', accessorFn: (row: any) => <span className="font-medium tabular-nums">{row.available}</span> },
                { id: 'reserved', header: 'Reserved', accessorFn: (row: any) => <span className="text-muted-foreground tabular-nums">{row.reserved}</span> },
                { id: 'reorderLevel', header: 'Reorder Level', accessorFn: (row: any) => <span className="tabular-nums">{row.reorderLevel}</span> },
                { id: 'stockStatus', header: 'Status', accessorFn: (row: any) => <Badge variant={STOCK_STATUS_VARIANT[row.stockStatus] || 'secondary'}>{row.stockStatus.replace('_', ' ')}</Badge> },
              ] as Column<any>[]}
              data={inventory}
            />
          )}
        </TabsContent>

        <TabsContent value="movements">
          {stockMovements.length === 0 ? (
            <EmptyState icon={<RefreshCw className="h-8 w-8" />} title="No stock movements" description="No stock movement history available for this warehouse." />
          ) : (
            <DataTable
              columns={[
                { id: 'product', header: 'Product', accessorFn: (row: any) => <div><p className="font-medium">{row.productName}</p></div> },
                { id: 'type', header: 'Type', accessorFn: (row: any) => <Badge variant={MOVEMENT_TYPE_VARIANT[row.type] || 'default'} className="capitalize">{row.type}</Badge> },
                { id: 'quantity', header: 'Qty', accessorFn: (row: any) => <span className={`font-medium tabular-nums ${row.type === 'incoming' ? 'text-success' : row.type === 'outgoing' ? 'text-danger' : ''}`}>{row.type === 'incoming' ? '+' : row.type === 'outgoing' ? '-' : ''}{row.quantity}</span> },
                { id: 'reference', header: 'Reference', accessorFn: (row: any) => <span className="text-sm text-muted-foreground">{row.reference || '—'}</span> },
                { id: 'reason', header: 'Reason', accessorFn: (row: any) => <span className="text-sm text-muted-foreground">{row.reason || '—'}</span> },
                { id: 'actor', header: 'Actor', accessorFn: (row: any) => <span className="text-sm text-muted-foreground">{row.actor || 'System'}</span> },
                { id: 'timestamp', header: 'Timestamp', accessorFn: (row: any) => <span className="text-sm text-muted-foreground">{safeFormatDateTime(row.timestamp)}</span> },
              ] as Column<any>[]}
              data={stockMovements}
            />
          )}
        </TabsContent>

        <TabsContent value="shipments">
          {shipments.length === 0 ? (
            <EmptyState icon={<Truck className="h-8 w-8" />} title="No shipments" description="No shipments from this warehouse." />
          ) : (
            <DataTable
              columns={[
                { id: 'orderNumber', header: 'Order', accessorFn: (row: any) => <span className="font-medium">{row.orderNumber}</span> },
                { id: 'customer', header: 'Customer', accessorFn: (row: any) => <span>{row.customerName}</span> },
                { id: 'items', header: 'Items', accessorFn: (row: any) => <span className="tabular-nums">{row.itemCount}</span> },
                { id: 'status', header: 'Status', accessorFn: (row: any) => <Badge variant={SHIPMENT_STATUS_VARIANT[row.status] || 'secondary'}>{row.status}</Badge> },
                { id: 'tracking', header: 'Tracking', accessorFn: (row: any) => <span className="text-sm text-muted-foreground">{row.trackingNumber || '—'}</span> },
                { id: 'delivery', header: 'Est. Delivery', accessorFn: (row: any) => <span className="text-sm text-muted-foreground">{safeFormatDate(row.estimatedDelivery)}</span> },
              ] as Column<any>[]}
              data={shipments}
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isEditOpen} onOpenChange={() => setIsEditOpen(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Warehouse</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleEditSubmit(editForm) }} className="space-y-4 p-4 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Code</Label><Input value={editForm.code} onChange={e => setEditForm(p => ({ ...p, code: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Type</Label><Select value={editForm.type} onValueChange={v => setEditForm(p => ({ ...p, type: v as any }))}><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{TYPE_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Status</Label><Select value={editForm.status} onValueChange={v => setEditForm(p => ({ ...p, status: v as any }))}><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Address Line 1</Label><Input value={editForm.addressLine1} onChange={e => setEditForm(p => ({ ...p, addressLine1: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Address Line 2</Label><Input value={(editForm as { addressLine2?: string }).addressLine2 ?? ''} onChange={e => setEditForm(p => ({ ...p, addressLine2: e.target.value }))} /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>City</Label><Input value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} /></div>
              <div className="space-y-2"><Label>State</Label><Input value={editForm.state} onChange={e => setEditForm(p => ({ ...p, state: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Country</Label><Input value={(editForm as { country?: string }).country ?? ''} onChange={e => setEditForm(p => ({ ...p, country: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Postal Code</Label><Input value={editForm.postalCode} onChange={e => setEditForm(p => ({ ...p, postalCode: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Manager Name</Label><Input value={(editForm as { managerName?: string }).managerName ?? ''} onChange={e => setEditForm(p => ({ ...p, managerName: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Manager Email</Label><Input type="email" value={(editForm as { managerEmail?: string }).managerEmail ?? ''} onChange={e => setEditForm(p => ({ ...p, managerEmail: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Manager Phone</Label><Input value={(editForm as { managerPhone?: string }).managerPhone ?? ''} onChange={e => setEditForm(p => ({ ...p, managerPhone: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Shipping Cost</Label><Input type="number" min="0" step="0.01" value={(editForm as { shippingCost?: number }).shippingCost ?? 0} onChange={e => setEditForm(p => ({ ...p, shippingCost: parseFloat(e.target.value) || 0 }))} /></div>
              <div className="space-y-2"><Label>Shipment Priority</Label><Select value={(editForm as { shipmentPriority?: string }).shipmentPriority ?? 'normal'} onValueChange={v => setEditForm(p => ({ ...p, shipmentPriority: v }))}><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2">
              <Label>Default Warehouse</Label>
              <Select value={((editForm as { isDefault?: boolean }).isDefault ? 'true' : 'false')} onValueChange={v => {
                if (v === 'true' && !window.confirm('Set this warehouse as the default? This will unset the current default.')) return
                setEditForm(p => ({ ...p, isDefault: v === 'true' }))
              }}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="false">No</SelectItem><SelectItem value="true">Yes</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Storage Capacity</Label><Input type="number" value={editForm.storageCapacity} onChange={e => setEditForm(p => ({ ...p, storageCapacity: parseInt(e.target.value) || 0 }))} /></div>
              <div className="space-y-2"><Label>Capacity Threshold</Label><Input type="number" value={editForm.capacityThreshold} onChange={e => setEditForm(p => ({ ...p, capacityThreshold: parseInt(e.target.value) || 0 }))} /></div>
              <div className="space-y-2"><Label>Allocation Priority</Label><Input type="number" value={editForm.allocationPriority} onChange={e => setEditForm(p => ({ ...p, allocationPriority: parseInt(e.target.value) || 1 }))} /></div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateWarehouse.isPending}>{updateWarehouse.isPending ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete warehouse?" description="This action cannot be undone. All warehouse data, inventory records, and shipment history will be permanently removed." confirmLabel="Delete" variant="danger" onConfirm={handleDelete} loading={deleteWarehouse.isPending} />
    </div>
  )
}

export { WarehouseDetailsPage }