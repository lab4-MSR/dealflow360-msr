import { useState } from 'react'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ErrorState } from '@/components/shared'
import { useCustomerTiers, useUpdateCustomerTier, useCustomers } from '../hooks/use-business-admin'
import type { CustomerTierConfig } from '../types'
import { toast } from 'sonner'
import { Users, CheckCircle, Edit, AlertTriangle, Crown, Shield, Gem, Star } from 'lucide-react'

const TIER_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  bronze: { color: '#CD7F32', bg: 'bg-[#CD7F32]/10', icon: <Shield className="h-6 w-6" style={{ color: '#CD7F32' }} /> },
  silver: { color: '#94A3B8', bg: 'bg-[#94A3B8]/10', icon: <Star className="h-6 w-6" style={{ color: '#94A3B8' }} /> },
  gold: { color: '#F59E0B', bg: 'bg-[#F59E0B]/10', icon: <Crown className="h-6 w-6" style={{ color: '#F59E0B' }} /> },
  platinum: { color: '#8B5CF6', bg: 'bg-[#8B5CF6]/10', icon: <Gem className="h-6 w-6" style={{ color: '#8B5CF6' }} /> },
}

const APPROVAL_LABEL: Record<string, string> = {
  none: 'None',
  sales_manager: 'Sales Manager',
  finance: 'Finance',
  sales_manager_then_finance: 'Sales Manager + Finance',
}

export function CustomerTierRulesPage() {
  const { data: tiers, isLoading, error, refetch } = useCustomerTiers()
  const updateTier = useUpdateCustomerTier()
  const { data: customerData } = useCustomers({ page: 1, perPage: 50 })
  const [editingTier, setEditingTier] = useState<CustomerTierConfig | null>(null)
  const [editForm, setEditForm] = useState<{
    maxDiscountPercent: number
    defaultPriceListId: string
    minMarginPercent: number
    approvalRequired: boolean
    approvalLevel: string
  }>({
    maxDiscountPercent: 0,
    defaultPriceListId: '',
    minMarginPercent: 0,
    approvalRequired: false,
    approvalLevel: 'none',
  })
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingTierUpdate, setPendingTierUpdate] = useState<{ id: string; data: Partial<CustomerTierConfig> } | null>(null)

  const handleEdit = (tier: CustomerTierConfig) => {
    setEditingTier(tier)
    setEditForm({
      maxDiscountPercent: tier.maxDiscountPercent,
      defaultPriceListId: tier.defaultPriceListId || '',
      minMarginPercent: tier.minMarginPercent,
      approvalRequired: tier.approvalRequired,
      approvalLevel: tier.approvalLevel || 'none',
    })
  }

  const handleSave = async () => {
    if (!editingTier) return
    try {
      await updateTier.mutateAsync({
        id: editingTier.id,
        data: editForm,
      })
      toast.success(`${editingTier.displayName} tier updated`)
      setEditingTier(null)
    } catch {
      toast.error('Failed to update tier')
    }
  }

  const handleTierChange = (field: string, value: unknown) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const getCustomersByTier = (tier: string) => {
    return customerData?.customers?.filter((c) => c.tier === tier) || []
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState title="Failed to load customer tiers" onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Tier Rules"
        description="Configure tier-based pricing, discount limits, and approval requirements"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Discount Governance', path: '/business-admin/discount-governance' },
          { label: 'Customer Tier Rules' },
        ]}
      />

      {/* Tier Cards - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(tiers || []).map((tier) => {
          const config = TIER_CONFIG[tier.tier] || TIER_CONFIG.bronze
          const tierCustomers = getCustomersByTier(tier.tier)
          return (
            <Card key={tier.id} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: config.color }} />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.bg}`}>
                      {config.icon}
                    </div>
                    <div>
                      <CardTitle className="text-[16px]">{tier.displayName}</CardTitle>
                      <p className="text-[12px] text-muted-foreground">{tierCustomers.length} customers</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(tier)}>
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Max Discount</p>
                    <p className="text-[20px] font-bold text-foreground tabular-nums">{tier.maxDiscountPercent}%</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Min Margin</p>
                    <p className="text-[20px] font-bold text-foreground tabular-nums">{tier.minMarginPercent}%</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Default Price List</p>
                    <p className="text-[13px] text-foreground">{tier.defaultPriceListName || 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Approval Required</p>
                    <Badge variant={tier.approvalRequired ? 'warning' : 'secondary'} className="mt-0.5">
                      {tier.approvalRequired ? APPROVAL_LABEL[tier.approvalLevel || 'none'] : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tier Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Qualification Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[13px] text-muted-foreground mb-4">
            These conditions are evaluated by the backend engine when assigning customers to tiers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(tiers || []).map((tier) => {
              const config = TIER_CONFIG[tier.tier] || TIER_CONFIG.bronze
              return (
                <div key={tier.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                    <p className="text-[12px] font-medium text-foreground">{tier.displayName}</p>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="text-foreground font-medium">
                        {tier.revenueThreshold ? `₹${tier.revenueThreshold.toLocaleString()}` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchase Volume</span>
                      <span className="text-foreground font-medium">
                        {tier.purchaseVolumeThreshold ? `₹${tier.purchaseVolumeThreshold.toLocaleString()}` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lifetime</span>
                      <span className="text-foreground font-medium">
                        {tier.customerLifetimeMonths ? `${tier.customerLifetimeMonths}mo` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Customer Assignment Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Customer Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customerData?.customers && customerData.customers.length > 0 ? (
            <DataTable
              columns={[
                {
                  id: 'customer',
                  header: 'Customer',
                  accessorFn: (row: { name: string; tier: string }) => (
                    <span className="text-[13px] font-semibold text-foreground">{row.name}</span>
                  ),
                },
                {
                  id: 'tier',
                  header: 'Tier',
                  accessorFn: (row: { tier: string }) => {
                    const config = TIER_CONFIG[row.tier] || TIER_CONFIG.bronze
                    return (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                        <span className="text-[13px] capitalize text-foreground">{row.tier}</span>
                      </div>
                    )
                  },
                },
                {
                  id: 'revenue',
                  header: 'Revenue',
                  accessorFn: (row: { totalRevenue: number }) => (
                    <span className="text-[13px] text-foreground tabular-nums">
                      ${row.totalRevenue.toLocaleString()}
                    </span>
                  ),
                },
                {
                  id: 'lastActivity',
                  header: 'Last Activity',
                  accessorFn: (row: { lastActivity: string }) => (
                    <span className="text-[13px] text-muted-foreground">{row.lastActivity || '—'}</span>
                  ),
                },
              ] as unknown as Column<Record<string, unknown>>[]}
              data={customerData.customers as unknown as Record<string, unknown>[]}
            />
          ) : (
            <div className="py-8 text-center">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground">No customers found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTier} onOpenChange={() => setEditingTier(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {editingTier?.displayName} Tier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label>Max Discount %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={editForm.maxDiscountPercent}
                onChange={(e) => handleTierChange('maxDiscountPercent', parseFloat(e.target.value) || 0)}
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Default Price List</Label>
              <Select value={editForm.defaultPriceListId} onValueChange={(v) => handleTierChange('defaultPriceListId', v)}>
                <SelectTrigger><SelectValue placeholder="Standard pricing" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Standard pricing</SelectItem>
                  <SelectItem value="enterprise">Enterprise Price List</SelectItem>
                  <SelectItem value="partner">Partner Price List</SelectItem>
                  <SelectItem value="wholesale">Wholesale Price List</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Minimum Margin %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={editForm.minMarginPercent}
                onChange={(e) => handleTierChange('minMarginPercent', parseFloat(e.target.value) || 0)}
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editApprovalRequired"
                checked={editForm.approvalRequired}
                onChange={(e) => handleTierChange('approvalRequired', e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="editApprovalRequired" className="text-[13px]">Approval Required</Label>
            </div>
            {editForm.approvalRequired && (
              <div className="space-y-1.5">
                <Label>Approval Level</Label>
                <Select value={editForm.approvalLevel} onValueChange={(v) => handleTierChange('approvalLevel', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales_manager">Sales Manager</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="sales_manager_then_finance">Sales Manager + Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {editingTier && editForm.maxDiscountPercent !== editingTier.maxDiscountPercent && (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  <p className="text-[12px] text-muted-foreground">
                    Changing the max discount will affect all future quotations for {editingTier.displayName} tier customers.
                    Existing quotations will not be impacted.
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditingTier(null)}>Cancel</Button>
              <Button onClick={handleSave} loading={updateTier.isPending}>
                {updateTier.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
