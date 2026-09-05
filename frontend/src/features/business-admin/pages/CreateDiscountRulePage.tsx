import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useCreateDiscountRule } from '../hooks/use-business-admin'
import type { DiscountRuleCreateInput, DiscountRuleType } from '../types'
import { toast } from 'sonner'
import { ArrowLeft, Save, Shield, Info } from 'lucide-react'

const TYPE_LABEL: Record<string, string> = {
  customer_tier: 'Customer Tier',
  category: 'Category',
  product: 'Product',
  margin: 'Margin',
  global: 'Global',
}

export function CreateDiscountRulePage() {
  const navigate = useNavigate()
  const createRule = useCreateDiscountRule()
  const [form, setForm] = useState<DiscountRuleCreateInput>({
    name: '',
    description: '',
    type: 'customer_tier',
    priority: 100,
    scope: { isGlobal: false },
    maxDiscountPercent: 0,
    lineDiscountPercent: undefined,
    orderDiscountPercent: undefined,
    minMarginPercent: undefined,
    marginThreshold: undefined,
    riskBehavior: 'require_approval',
    conditions: {},
    approvalRequired: false,
    approvalLevel: 'none',
    escalationBehavior: '',
    status: 'draft',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const updateScope = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, scope: { ...prev.scope, [field]: value } }))
  }

  const updateConditions = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, conditions: { ...prev.conditions, [field]: value } }))
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Rule name is required'
    if (form.maxDiscountPercent < 0 || form.maxDiscountPercent > 100) errs.maxDiscountPercent = 'Must be between 0 and 100'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await createRule.mutateAsync(form)
      toast.success('Discount rule created')
      navigate('/business-admin/discount-governance/rules')
    } catch {
      toast.error('Failed to create discount rule')
    }
  }

  const inputClass = 'flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Discount Rule"
        description="Define a new discount governance rule to protect margins and control pricing"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Discount Governance', path: '/business-admin/discount-governance' },
          { label: 'Discount Rules', path: '/business-admin/discount-governance/rules' },
          { label: 'Create Rule' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/business-admin/discount-governance/rules')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        {/* Rule Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Rule Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Rule Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Gold Tier Discount Cap"
                  className={inputClass}
                />
                {errors.name && <p className="text-[11px] text-danger">{errors.name}</p>}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Description</Label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe what this rule does and when it applies..."
                  className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Rule Type *</Label>
                <Select value={form.type} onValueChange={(v) => updateField('type', v as DiscountRuleType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_tier">Customer Tier</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="margin">Margin</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority *</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.priority}
                  onChange={(e) => updateField('priority', parseInt(e.target.value) || 100)}
                  placeholder="100"
                  className={inputClass}
                />
                <p className="text-[11px] text-muted-foreground">Lower number = higher priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scope */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Scope</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground mb-4">
              Define what this rule applies to based on its type: <Badge variant="info" className="mx-1">{TYPE_LABEL[form.type]}</Badge>
            </p>
            {form.type === 'customer_tier' && (
              <div className="space-y-1.5">
                <Label>Customer Tier</Label>
                <Select value={form.scope.customerTier || ''} onValueChange={(v) => updateScope('customerTier', v)}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select tier" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {form.type === 'category' && (
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.scope.categoryId || ''} onValueChange={(v) => updateScope('categoryId', v)}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="subscriptions">Subscriptions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {form.type === 'product' && (
              <div className="space-y-1.5">
                <Label>Product</Label>
                <Select value={form.scope.productId || ''} onValueChange={(v) => updateScope('productId', v)}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {(form.type === 'global' || form.type === 'margin') && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isGlobal"
                  checked={form.scope.isGlobal || false}
                  onChange={(e) => updateScope('isGlobal', e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="isGlobal" className="text-[13px]">Apply globally to all transactions</Label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discount Limits */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Discount Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Maximum Discount % *</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.maxDiscountPercent}
                  onChange={(e) => updateField('maxDiscountPercent', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className={inputClass}
                />
                {errors.maxDiscountPercent && <p className="text-[11px] text-danger">{errors.maxDiscountPercent}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Line Discount %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.lineDiscountPercent ?? ''}
                  onChange={(e) => updateField('lineDiscountPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="No limit"
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
                  onChange={(e) => updateField('orderDiscountPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="No limit"
                  className={inputClass}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Margin Protection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Margin Protection
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Minimum Margin %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.minMarginPercent ?? ''}
                  onChange={(e) => updateField('minMarginPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="No floor"
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
                  onChange={(e) => updateField('marginThreshold', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="No threshold"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Risk Behavior</Label>
                <Select value={form.riskBehavior || 'require_approval'} onValueChange={(v) => updateField('riskBehavior', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="require_approval">Require Approval</SelectItem>
                    <SelectItem value="flag">Flag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Min Deal Value</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.conditions.minDealValue ?? ''}
                  onChange={(e) => updateConditions('minDealValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="No minimum"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Max Deal Value</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.conditions.maxDealValue ?? ''}
                  onChange={(e) => updateConditions('maxDealValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="No maximum"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Min Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.conditions.minQuantity ?? ''}
                  onChange={(e) => updateConditions('minQuantity', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="No minimum"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Max Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.conditions.maxQuantity ?? ''}
                  onChange={(e) => updateConditions('maxQuantity', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="No maximum"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Valid From</Label>
                <Input
                  type="date"
                  value={form.conditions.validFrom || ''}
                  onChange={(e) => updateConditions('validFrom', e.target.value || undefined)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Valid To</Label>
                <Input
                  type="date"
                  value={form.conditions.validTo || ''}
                  onChange={(e) => updateConditions('validTo', e.target.value || undefined)}
                  className={inputClass}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval Behavior */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Approval Behavior</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="approvalRequired"
                  checked={form.approvalRequired}
                  onChange={(e) => updateField('approvalRequired', e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="approvalRequired" className="text-[13px]">Approval Required</Label>
              </div>
              <div className="space-y-1.5">
                <Label>Approval Level</Label>
                <Select
                  value={form.approvalLevel}
                  onValueChange={(v) => updateField('approvalLevel', v)}
                  disabled={!form.approvalRequired}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
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
                  onChange={(e) => updateField('escalationBehavior', e.target.value)}
                  placeholder="e.g. Auto-escalate after 24h"
                  className={inputClass}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rule Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
              <div>
                <p className="text-muted-foreground text-[11px]">Type</p>
                <Badge variant={form.type === 'customer_tier' ? 'info' : form.type === 'category' ? 'intelligence' : form.type === 'product' ? 'success' : form.type === 'margin' ? 'warning' : 'secondary'}>
                  {TYPE_LABEL[form.type]}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Max Discount</p>
                <p className="font-medium text-foreground">{form.maxDiscountPercent}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Priority</p>
                <p className="font-medium text-foreground">{form.priority}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Approval</p>
                <Badge variant={form.approvalRequired ? 'warning' : 'secondary'}>
                  {form.approvalRequired ? 'Required' : 'Not Required'}
                </Badge>
              </div>
              {form.minMarginPercent != null && (
                <div>
                  <p className="text-muted-foreground text-[11px]">Min Margin</p>
                  <p className="font-medium text-foreground">{form.minMarginPercent}%</p>
                </div>
              )}
              {form.riskBehavior && (
                <div>
                  <p className="text-muted-foreground text-[11px]">Risk Behavior</p>
                  <p className="font-medium text-foreground capitalize">{form.riskBehavior.replace('_', ' ')}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-[11px]">Status</p>
                <Badge variant={form.status === 'active' ? 'success' : form.status === 'draft' ? 'warning' : 'secondary'}>
                  {form.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/business-admin/discount-governance/rules')}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              setForm((prev) => ({ ...prev, status: 'draft' }))
              if (form.name.trim()) {
                try {
                  await createRule.mutateAsync({ ...form, status: 'draft' })
                  toast.success('Draft saved')
                } catch {
                  toast.error('Failed to save draft')
                }
              }
            }}
          >
            Save Draft
          </Button>
          <Button type="submit" loading={createRule.isPending}>
            <Save className="h-4 w-4 mr-1.5" />
            {createRule.isPending ? 'Creating...' : 'Create Rule'}
          </Button>
        </div>
      </form>
    </div>
  )
}
