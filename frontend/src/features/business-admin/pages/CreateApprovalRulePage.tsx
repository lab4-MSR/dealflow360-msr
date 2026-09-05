import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useCreateApprovalRule, useApprovalChains } from '../hooks/use-business-admin'
import { useProducts } from '../hooks/use-business-admin'
import { useCategories } from '../hooks/use-business-admin'
import { useCustomerTiers } from '../hooks/use-business-admin'
import { toast } from 'sonner'
import { Plus, ArrowLeft, Save, FileText, Zap, DollarSign, BarChart, Users, Layers, GitBranch, Clock, AlertTriangle, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const TRIGGER_TYPES = [
  { value: 'discount_threshold', label: 'Discount Threshold', icon: <Zap className="h-4 w-4" /> },
  { value: 'deal_value', label: 'Deal Value', icon: <DollarSign className="h-4 w-4" /> },
  { value: 'margin', label: 'Margin', icon: <BarChart className="h-4 w-4" /> },
  { value: 'risk_score', label: 'Risk Score', icon: <AlertTriangle className="h-4 w-4" /> },
  { value: 'customer_tier', label: 'Customer Tier', icon: <Users className="h-4 w-4" /> },
  { value: 'product_category', label: 'Product Category', icon: <Layers className="h-4 w-4" /> },
  { value: 'compound', label: 'Compound (Multiple)', icon: <GitBranch className="h-4 w-4" /> },
]

function CreateApprovalRulePage() {
  const navigate = useNavigate()
  const [triggerType, setTriggerType] = useState('discount_threshold')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 10,
    discountThreshold: '',
    dealValueMin: '',
    dealValueMax: '',
    marginMin: '',
    marginMax: '',
    riskScoreMin: '',
    riskScoreMax: '',
    customerTier: '',
    productCategoryId: '',
    approvalLevel: 'sales_manager',
    chainId: '',
    approvalTimeMinutes: 1440,
    escalationTimeMinutes: 2880,
  })
  const createApprovalRule = useCreateApprovalRule()
  const { data: chainsData } = useApprovalChains({ status: 'active' })

  const { data: categoriesData } = useCategories({ status: 'active' })
  const { data: tiersData } = useCustomerTiers()

  const handleChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }))
  const handleTriggerChange = (value: string) => { setTriggerType(value); setFormData(prev => ({ ...prev, triggerType: value })) }

  const showDiscount = ['discount_threshold', 'compound'].includes(triggerType)
  const showDealValue = ['deal_value', 'compound'].includes(triggerType)
  const showMargin = ['margin', 'compound'].includes(triggerType)
  const showRisk = ['risk_score', 'compound'].includes(triggerType)
  const showTier = ['customer_tier', 'compound'].includes(triggerType)
  const showCategory = ['product_category', 'compound'].includes(triggerType)
  const showChain = formData.approvalLevel !== 'none'

  const handleSubmit = async (e: React.FormEvent, saveDraft = false) => {
    e.preventDefault()
    const triggerConfig: any = {}
    if (showDiscount) triggerConfig.discountThreshold = parseFloat(formData.discountThreshold)
    if (showDealValue) { if (formData.dealValueMin) triggerConfig.dealValueMin = parseFloat(formData.dealValueMin); if (formData.dealValueMax) triggerConfig.dealValueMax = parseFloat(formData.dealValueMax) }
    if (showMargin) { if (formData.marginMin) triggerConfig.marginMin = parseFloat(formData.marginMin); if (formData.marginMax) triggerConfig.marginMax = parseFloat(formData.marginMax) }
    if (showRisk) { if (formData.riskScoreMin) triggerConfig.riskScoreMin = parseFloat(formData.riskScoreMin); if (formData.riskScoreMax) triggerConfig.riskScoreMax = parseFloat(formData.riskScoreMax) }
    if (showTier) triggerConfig.customerTier = formData.customerTier
    if (showCategory) triggerConfig.productCategoryId = formData.productCategoryId

    const payload = {
      name: formData.name,
      description: formData.description,
      priority: formData.priority,
      triggerType: triggerType as any,
      triggerConfig,
      approvalLevel: formData.approvalLevel as any,
      chainId: showChain ? formData.chainId : undefined,
      sla: { approvalTimeMinutes: formData.approvalTimeMinutes, escalationTimeMinutes: formData.escalationTimeMinutes },
      status: saveDraft ? 'draft' : 'active',
    }

    try {
      await createApprovalRule.mutateAsync(payload)
      toast.success(saveDraft ? 'Draft saved' : 'Approval rule created')
      navigate('/business-admin/approval-configuration/rules')
    } catch { toast.error('Failed to create approval rule') }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Approval Rule"
        description="Configure a new approval routing rule with triggers, conditions, and escalation paths"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Approval Configuration', path: '/business-admin/approval-configuration/rules' },
          { label: 'Create Rule' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-1.5" />Cancel</Button>
            <Button onClick={e => handleSubmit(e, true)} disabled={createApprovalRule.isPending}><FileText className="h-4 w-4 mr-1.5" />Save Draft</Button>
            <Button onClick={handleSubmit} disabled={createApprovalRule.isPending}><Plus className="h-4 w-4 mr-1.5" />Create Rule</Button>
          </div>
        }
      />

      <form onSubmit={e => handleSubmit(e)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Rule Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Rule Name *</Label><Input value={formData.name} onChange={e => handleChange('name', e.target.value)} required placeholder="e.g., High Discount Approval" /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="Optional description" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Priority *</Label><Input type="number" min="1" value={formData.priority} onChange={e => handleChange('priority', parseInt(e.target.value) || 10)} required placeholder="10" /><p className="text-xs text-muted-foreground">Lower number = higher priority (evaluated first)</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Trigger Conditions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Trigger Type *</Label>
              <Select value={triggerType} onValueChange={handleTriggerChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select trigger type" /></SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {showDiscount && (
              <div className="space-y-2"><Label>Discount Threshold % *</Label><Input type="number" min="0" max="100" step="0.1" value={formData.discountThreshold} onChange={e => handleChange('discountThreshold', e.target.value)} required placeholder="15" /></div>
            )}

            {showDealValue && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Min Deal Value</Label><Input type="number" min="0" step="0.01" value={formData.dealValueMin} onChange={e => handleChange('dealValueMin', e.target.value)} placeholder="100000" /></div>
                <div className="space-y-2"><Label>Max Deal Value</Label><Input type="number" min="0" step="0.01" value={formData.dealValueMax} onChange={e => handleChange('dealValueMax', e.target.value)} placeholder="500000" /></div>
              </div>
            )}

            {showMargin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Min Margin %</Label><Input type="number" min="0" max="100" step="0.1" value={formData.marginMin} onChange={e => handleChange('marginMin', e.target.value)} placeholder="10" /></div>
                <div className="space-y-2"><Label>Max Margin %</Label><Input type="number" min="0" max="100" step="0.1" value={formData.marginMax} onChange={e => handleChange('marginMax', e.target.value)} placeholder="25" /></div>
              </div>
            )}

            {showRisk && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Min Risk Score</Label><Input type="number" min="0" max="100" value={formData.riskScoreMin} onChange={e => handleChange('riskScoreMin', e.target.value)} placeholder="70" /></div>
                <div className="space-y-2"><Label>Max Risk Score</Label><Input type="number" min="0" max="100" value={formData.riskScoreMax} onChange={e => handleChange('riskScoreMax', e.target.value)} placeholder="100" /></div>
              </div>
            )}

            {showTier && (
              <div className="space-y-2">
                <Label>Customer Tier</Label>
                <Select value={formData.customerTier} onValueChange={v => handleChange('customerTier', v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select tier" /></SelectTrigger>
                  <SelectContent>
                    {tiersData?.map(t => <SelectItem key={t.id} value={t.tier}>{t.displayName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showCategory && (
              <div className="space-y-2">
                <Label>Product Category</Label>
                <Select value={formData.productCategoryId} onValueChange={v => handleChange('productCategoryId', v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categoriesData?.categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Approval Level</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Approval Level *</Label>
              <Select value={formData.approvalLevel} onValueChange={v => handleChange('approvalLevel', v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Approval</SelectItem>
                  <SelectItem value="sales_manager">Sales Manager</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="multi_level">Multi-Level (Approval Chain)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showChain && chainsData?.chains.length && (
              <div className="space-y-2">
                <Label>Approval Chain *</Label>
                <Select value={formData.chainId} onValueChange={v => handleChange('chainId', v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select approval chain" /></SelectTrigger>
                  <SelectContent>
                    {chainsData.chains.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.steps.length} steps)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />SLA Configuration</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Approval Time (minutes) *</Label><Input type="number" min="1" value={formData.approvalTimeMinutes} onChange={e => handleChange('approvalTimeMinutes', parseInt(e.target.value) || 1440)} required placeholder="1440" /><p className="text-xs text-muted-foreground">Time before escalation triggers</p></div>
            <div className="space-y-2"><Label>Escalation Time (minutes) *</Label><Input type="number" min="1" value={formData.escalationTimeMinutes} onChange={e => handleChange('escalationTimeMinutes', parseInt(e.target.value) || 2880)} required placeholder="2880" /><p className="text-xs text-muted-foreground">Time before escalation to next level</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Name:</strong> {formData.name || '—'}</p>
            <p><strong>Trigger:</strong> {TRIGGER_TYPES.find(t => t.value === triggerType)?.label}</p>
            <p><strong>Approval Level:</strong> {formData.approvalLevel.replace('_', ' ')}</p>
            <p><strong>Priority:</strong> {formData.priority}</p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={createApprovalRule.isPending}>
            {createApprovalRule.isPending ? 'Creating...' : 'Create Rule'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export { CreateApprovalRulePage }