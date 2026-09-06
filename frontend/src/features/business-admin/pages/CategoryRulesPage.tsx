import { useState } from 'react'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { KpiCard } from '@/components/ui/kpi-card'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useCategoryDiscountRules, useCategoryDiscountRuleKpis, useCreateCategoryDiscountRule, useUpdateCategoryDiscountRule, useDeleteCategoryDiscountRule } from '../hooks/use-business-admin'
import type { CategoryDiscountRule } from '../types'
import { toast } from 'sonner'
import { Plus, Tag, CheckCircle, BarChart3, AlertTriangle, Edit, Trash2, Shield, Settings } from 'lucide-react'

const APPROVAL_LABEL: Record<string, string> = {
  none: 'None',
  sales_manager: 'Sales Manager',
  finance: 'Finance',
  sales_manager_then_finance: 'Sales Manager + Finance',
}

const CONFLICT_LABEL: Record<string, string> = {
  strict: 'Strict',
  permissive: 'Permissive',
  highest_priority: 'Highest Priority',
}

const emptyRule: Omit<CategoryDiscountRule, 'id' | 'createdAt' | 'updatedAt'> = {
  categoryId: '',
  categoryName: '',
  categoryPath: '',
  maxDiscountPercent: 0,
  lineDiscountPercent: undefined,
  orderDiscountPercent: undefined,
  minMarginPercent: 0,
  marginThreshold: undefined,
  approvalRequired: false,
  approvalLevel: 'none',
  escalationBehavior: '',
  priority: 100,
  conflictHandling: 'strict',
  status: 'active',
}

export function CategoryRulesPage() {
  const { data: rules, isLoading, error, refetch } = useCategoryDiscountRules()
  const { data: kpis, isLoading: kpisLoading } = useCategoryDiscountRuleKpis()
  const createRule = useCreateCategoryDiscountRule()
  const updateRule = useUpdateCategoryDiscountRule()
  const deleteRule = useDeleteCategoryDiscountRule()

  const [selectedRule, setSelectedRule] = useState<CategoryDiscountRule | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(emptyRule)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleAdd = () => {
    setForm(emptyRule)
    setSelectedRule(null)
    setIsEditing(false)
    setShowDialog(true)
  }

  const handleEdit = (rule: CategoryDiscountRule) => {
    setSelectedRule(rule)
    setForm({
      categoryId: rule.categoryId,
      categoryName: rule.categoryName,
      categoryPath: rule.categoryPath,
      maxDiscountPercent: rule.maxDiscountPercent,
      lineDiscountPercent: rule.lineDiscountPercent,
      orderDiscountPercent: rule.orderDiscountPercent,
      minMarginPercent: rule.minMarginPercent,
      marginThreshold: rule.marginThreshold,
      approvalRequired: rule.approvalRequired,
      approvalLevel: rule.approvalLevel,
      escalationBehavior: rule.escalationBehavior,
      priority: rule.priority,
      conflictHandling: rule.conflictHandling,
      status: rule.status,
    })
    setIsEditing(true)
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!form.categoryId) {
      toast.error('Please select a category')
      return
    }
    if (form.maxDiscountPercent < 0 || form.maxDiscountPercent > 100) {
      toast.error('Max discount must be between 0 and 100')
      return
    }
    const CATEGORY_META: Record<string, { name: string; path: string }> = {
      software: { name: 'Software', path: 'Catalog / Software' },
      hardware: { name: 'Hardware', path: 'Catalog / Hardware' },
      services: { name: 'Services', path: 'Catalog / Services' },
      subscriptions: { name: 'Subscriptions', path: 'Catalog / Subscriptions' },
    }
    const meta = CATEGORY_META[form.categoryId]
    const payload = {
      ...form,
      categoryName: form.categoryName || meta?.name || form.categoryId,
      categoryPath: form.categoryPath || meta?.path || form.categoryId,
    }
    try {
      if (isEditing && selectedRule?.id) {
        await updateRule.mutateAsync({ id: selectedRule.id, data: payload })
        toast.success('Rule updated')
      } else {
        await createRule.mutateAsync(payload)
        toast.success('Rule created')
      }
      setShowDialog(false)
      setSelectedRule(null)
    } catch {
      toast.error(isEditing ? 'Failed to update rule' : 'Failed to create rule')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteRule.mutateAsync(deleteId)
      toast.success('Rule deleted')
      setDeleteId(null)
      if (selectedRule?.id === deleteId) setSelectedRule(null)
    } catch {
      toast.error('Failed to delete rule')
    }
  }

  const inputClass = 'flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Rules"
        description="Configure discount limits, margin protection, and approval behavior per product category"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Discount Governance', path: '/business-admin/discount-governance' },
          { label: 'Category Rules' },
        ]}
        actions={
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Rule
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard label="Total Rules" value={kpis?.totalRules ?? 0} icon={<Tag className="h-5 w-5" />} />
            <KpiCard label="Active Rules" value={kpis?.activeRules ?? 0} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
            <KpiCard label="Categories Covered" value={kpis?.categoriesCovered ?? 0} variant="info" icon={<BarChart3 className="h-5 w-5" />} />
            <KpiCard label="Avg Max Discount" value={`${kpis?.averageMaxDiscount ?? 0}%`} variant="warning" icon={<AlertTriangle className="h-5 w-5" />} />
          </>
        )}
      </div>

      {error && <ErrorState title="Failed to load category rules" onRetry={refetch} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category List Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-[14px]">Categories with Rules</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : !rules || rules.length === 0 ? (
              <div className="py-8 text-center">
                <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-[13px] text-muted-foreground">No category rules configured.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {rules.map((rule) => (
                  <button
                    key={rule.id}
                    onClick={() => setSelectedRule(rule)}
                    className={`w-full text-left rounded-lg p-3 transition-colors ${
                      selectedRule?.id === rule.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{rule.categoryName}</p>
                        <p className="text-[11px] text-muted-foreground">{rule.categoryPath}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={rule.status === 'active' ? 'success' : 'secondary'} className="text-[10px]">
                          {rule.status}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground tabular-nums">P{rule.priority}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rule Detail Panel */}
        <div className="lg:col-span-2">
          {selectedRule ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    {selectedRule.categoryName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(selectedRule)}>
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteId(selectedRule.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
                <p className="text-[12px] text-muted-foreground">{selectedRule.categoryPath}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Discount Limits */}
                <div>
                  <h4 className="text-[12px] font-medium text-foreground mb-3">Discount Limits</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-[11px] text-muted-foreground">Max Discount</p>
                      <p className="text-[20px] font-bold text-foreground tabular-nums">{selectedRule.maxDiscountPercent}%</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-[11px] text-muted-foreground">Line Discount</p>
                      <p className="text-[20px] font-bold text-foreground tabular-nums">
                        {selectedRule.lineDiscountPercent != null ? `${selectedRule.lineDiscountPercent}%` : '—'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-[11px] text-muted-foreground">Order Discount</p>
                      <p className="text-[20px] font-bold text-foreground tabular-nums">
                        {selectedRule.orderDiscountPercent != null ? `${selectedRule.orderDiscountPercent}%` : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Margin Rules */}
                <div>
                  <h4 className="text-[12px] font-medium text-foreground mb-3">Margin Rules</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-[11px] text-muted-foreground">Min Margin</p>
                      <p className="text-[20px] font-bold text-foreground tabular-nums">{selectedRule.minMarginPercent}%</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-[11px] text-muted-foreground">Margin Threshold</p>
                      <p className="text-[20px] font-bold text-foreground tabular-nums">
                        {selectedRule.marginThreshold != null ? `${selectedRule.marginThreshold}%` : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Approval & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[12px] font-medium text-foreground mb-3">Approval Behavior</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-muted-foreground">Required</span>
                        <Badge variant={selectedRule.approvalRequired ? 'warning' : 'secondary'}>
                          {selectedRule.approvalRequired ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-muted-foreground">Level</span>
                        <span className="text-foreground">{APPROVAL_LABEL[selectedRule.approvalLevel]}</span>
                      </div>
                      {selectedRule.escalationBehavior && (
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-muted-foreground">Escalation</span>
                          <span className="text-foreground">{selectedRule.escalationBehavior}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-medium text-foreground mb-3">Rule Configuration</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-muted-foreground">Priority</span>
                        <span className="text-foreground font-medium tabular-nums">{selectedRule.priority}</span>
                      </div>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-muted-foreground">Conflict Handling</span>
                        <Badge variant="outline">{CONFLICT_LABEL[selectedRule.conflictHandling]}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={selectedRule.status === 'active' ? 'success' : 'secondary'}>
                          {selectedRule.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-[14px] font-medium text-foreground mb-1">Select a Category Rule</p>
                <p className="text-[13px] text-muted-foreground">
                  Choose a category from the list to view its discount governance rule.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Category Rule' : 'Create Category Rule'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm((prev) => ({ ...prev, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="subscriptions">Subscriptions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Max Discount % *</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.maxDiscountPercent}
                  onChange={(e) => setForm((prev) => ({ ...prev, maxDiscountPercent: parseFloat(e.target.value) || 0 }))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Line Discount %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.lineDiscountPercent ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, lineDiscountPercent: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Order Discount %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.orderDiscountPercent ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, orderDiscountPercent: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Min Margin %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.minMarginPercent}
                  onChange={(e) => setForm((prev) => ({ ...prev, minMarginPercent: parseFloat(e.target.value) || 0 }))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Margin Threshold %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.marginThreshold ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, marginThreshold: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dialogApprovalRequired"
                checked={form.approvalRequired}
                onChange={(e) => setForm((prev) => ({ ...prev, approvalRequired: e.target.checked }))}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="dialogApprovalRequired" className="text-[13px]">Approval Required</Label>
            </div>
            {form.approvalRequired && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Approval Level</Label>
                  <Select value={form.approvalLevel} onValueChange={(v) => setForm((prev) => ({ ...prev, approvalLevel: v as CategoryDiscountRule['approvalLevel'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales_manager">Sales Manager</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="sales_manager_then_finance">Sales Manager + Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Escalation Behavior</Label>
                  <Input
                    value={form.escalationBehavior || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, escalationBehavior: e.target.value }))}
                    placeholder="e.g. Auto-escalate after 24h"
                    className={inputClass}
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.priority}
                  onChange={(e) => setForm((prev) => ({ ...prev, priority: parseInt(e.target.value) || 100 }))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Conflict Handling</Label>
                <Select value={form.conflictHandling} onValueChange={(v) => setForm((prev) => ({ ...prev, conflictHandling: v as CategoryDiscountRule['conflictHandling'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Strict</SelectItem>
                    <SelectItem value="permissive">Permissive</SelectItem>
                    <SelectItem value="highest_priority">Highest Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} loading={createRule.isPending || updateRule.isPending}>
                {isEditing ? 'Save Changes' : 'Create Rule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Remove category rule?"
        description="This rule will no longer apply to quotations for this category. Existing quotations in progress will not be affected."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteRule.isPending}
      />
    </div>
  )
}
