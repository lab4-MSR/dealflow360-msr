import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useDiscountRuleDetail, useDeleteDiscountRule, useUpdateDiscountRule } from '../hooks/use-business-admin'
import { toast } from 'sonner'
import { ArrowLeft, Edit, Trash2, Shield, DollarSign, AlertTriangle, CheckCircle, Clock, Power, PowerOff, History } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const TYPE_VARIANT: Record<string, 'info' | 'intelligence' | 'success' | 'warning' | 'secondary'> = {
  customer_tier: 'info',
  category: 'intelligence',
  product: 'success',
  margin: 'warning',
  global: 'secondary',
}

const TYPE_LABEL: Record<string, string> = {
  customer_tier: 'Customer Tier',
  category: 'Category',
  product: 'Product',
  margin: 'Margin',
  global: 'Global',
}

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  inactive: 'secondary',
  draft: 'warning',
}

const APPROVAL_LABEL: Record<string, string> = {
  none: 'None',
  sales_manager: 'Sales Manager',
  finance: 'Finance',
  sales_manager_then_finance: 'Sales Manager + Finance',
}

const RISK_LABEL: Record<string, string> = {
  block: 'Block',
  require_approval: 'Require Approval',
  flag: 'Flag',
}

export function DiscountRuleDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: rule, isLoading, error, refetch } = useDiscountRuleDetail(id || '')
  const deleteRule = useDeleteDiscountRule()
  const updateRule = useUpdateDiscountRule()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    if (!rule) return
    try {
      await deleteRule.mutateAsync(rule.id)
      toast.success('Discount rule deleted')
      navigate('/business-admin/discount-governance/rules')
    } catch {
      toast.error('Failed to delete discount rule')
    }
  }

  const handleToggleStatus = async () => {
    if (!rule) return
    try {
      await updateRule.mutateAsync({
        id: rule.id,
        data: { status: rule.status === 'active' ? 'inactive' : 'active' },
      })
      toast.success(`Rule ${rule.status === 'active' ? 'deactivated' : 'activated'}`)
    } catch {
      toast.error('Failed to update rule status')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error || !rule) {
    return <ErrorState title="Failed to load discount rule" onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={rule.name}
        description={rule.description}
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Discount Governance', path: '/business-admin/discount-governance' },
          { label: 'Discount Rules', path: '/business-admin/discount-governance/rules' },
          { label: rule.name },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/business-admin/discount-governance/rules')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Badge variant={STATUS_VARIANT[rule.status] || 'secondary'} className="text-[12px] px-2.5 py-1">
              {rule.status}
            </Badge>
            <Badge variant="outline" className="text-[12px] px-2.5 py-1">
              Priority: {rule.priority}
            </Badge>
            <Button variant="outline" onClick={() => navigate(`/business-admin/discount-governance/rules/${rule.id}/edit`)}>
              <Edit className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleToggleStatus}>
              {rule.status === 'active' ? (
                <><PowerOff className="h-4 w-4 mr-1.5" />Deactivate</>
              ) : (
                <><Power className="h-4 w-4 mr-1.5" />Activate</>
              )}
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </>
        }
      />

      {/* Rule Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-foreground">{rule.name}</h2>
              <p className="text-[13px] text-muted-foreground">{rule.description || 'No description'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={TYPE_VARIANT[rule.type] || 'secondary'}>{TYPE_LABEL[rule.type]}</Badge>
                <Badge variant={STATUS_VARIANT[rule.status] || 'secondary'}>{rule.status}</Badge>
                <span className="text-[12px] text-muted-foreground">
                  Created {format(parseISO(rule.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="definition">
        <TabsList>
          <TabsTrigger value="definition">Rule Definition</TabsTrigger>
          <TabsTrigger value="limits">Discount Limits</TabsTrigger>
          <TabsTrigger value="margin">Margin Protection</TabsTrigger>
          <TabsTrigger value="approval">Approval Behavior</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="definition" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rule Definition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Type</p>
                      <Badge variant={TYPE_VARIANT[rule.type] || 'secondary'}>{TYPE_LABEL[rule.type]}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Status</p>
                      <Badge variant={STATUS_VARIANT[rule.status] || 'secondary'}>{rule.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Priority</p>
                      <p className="text-[13px] text-foreground font-medium">{rule.priority}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1">Scope</p>
                    <div className="flex flex-wrap gap-2">
                      {rule.scope.customerTier && <Badge variant="info">Tier: {rule.scope.customerTier}</Badge>}
                      {rule.scope.categoryId && <Badge variant="intelligence">Category: {rule.scope.categoryId}</Badge>}
                      {rule.scope.productId && <Badge variant="success">Product: {rule.scope.productId}</Badge>}
                      {rule.scope.isGlobal && <Badge variant="secondary">Global</Badge>}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1">Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {rule.conditions.minDealValue != null && (
                        <Badge variant="outline">Min Deal: ₹{rule.conditions.minDealValue.toLocaleString()}</Badge>
                      )}
                      {rule.conditions.maxDealValue != null && (
                        <Badge variant="outline">Max Deal: ₹{rule.conditions.maxDealValue.toLocaleString()}</Badge>
                      )}
                      {rule.conditions.minQuantity != null && (
                        <Badge variant="outline">Min Qty: {rule.conditions.minQuantity}</Badge>
                      )}
                      {rule.conditions.maxQuantity != null && (
                        <Badge variant="outline">Max Qty: {rule.conditions.maxQuantity}</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1">Effective Period</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[13px] text-foreground">
                        {rule.conditions.validFrom
                          ? format(parseISO(rule.conditions.validFrom), 'MMM d, yyyy')
                          : 'No start'}
                        {' — '}
                        {rule.conditions.validTo
                          ? format(parseISO(rule.conditions.validTo), 'MMM d, yyyy')
                          : 'No end'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Discount Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-[11px] text-muted-foreground mb-1">Maximum Discount</p>
                  <p className="text-[28px] font-bold text-foreground tabular-nums">{rule.maxDiscountPercent}%</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Hard cap on any discount</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-[11px] text-muted-foreground mb-1">Line Discount</p>
                  <p className="text-[28px] font-bold text-foreground tabular-nums">
                    {rule.lineDiscountPercent != null ? `${rule.lineDiscountPercent}%` : '—'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">Per-line item limit</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-[11px] text-muted-foreground mb-1">Order Discount</p>
                  <p className="text-[28px] font-bold text-foreground tabular-nums">
                    {rule.orderDiscountPercent != null ? `${rule.orderDiscountPercent}%` : '—'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">Order-level limit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="margin" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Margin Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-[11px] text-muted-foreground mb-1">Minimum Margin</p>
                  <p className="text-[28px] font-bold text-foreground tabular-nums">
                    {rule.minMarginPercent != null ? `${rule.minMarginPercent}%` : '—'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">Absolute margin floor</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-[11px] text-muted-foreground mb-1">Margin Threshold</p>
                  <p className="text-[28px] font-bold text-foreground tabular-nums">
                    {rule.marginThreshold != null ? `${rule.marginThreshold}%` : '—'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">Warning trigger point</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-[11px] text-muted-foreground mb-1">Risk Behavior</p>
                  <p className="text-[20px] font-bold text-foreground capitalize">
                    {RISK_LABEL[rule.riskBehavior || 'require_approval']}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">When margin is breached</p>
                </div>
              </div>
              {rule.minMarginPercent != null && (
                <div className="mt-6 rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="text-[13px] font-medium text-foreground">Margin Protection Active</p>
                      <p className="text-[12px] text-muted-foreground mt-1">
                        This rule enforces a minimum margin of {rule.minMarginPercent}%. Any quotation
                        that would result in a margin below this threshold will be{' '}
                        {rule.riskBehavior === 'block' ? 'blocked' : rule.riskBehavior === 'require_approval' ? 'sent for approval' : 'flagged for review'}.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Behavior</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-[11px] text-muted-foreground mb-1">Approval Required</p>
                  <Badge variant={rule.approvalRequired ? 'warning' : 'secondary'} className="text-[13px]">
                    {rule.approvalRequired ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-[11px] text-muted-foreground mb-1">Approval Level</p>
                  <p className="text-[13px] font-medium text-foreground">
                    {APPROVAL_LABEL[rule.approvalLevel] || 'None'}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-[11px] text-muted-foreground mb-1">Escalation</p>
                  <p className="text-[13px] text-foreground">
                    {rule.escalationBehavior || 'Default escalation'}
                  </p>
                </div>
              </div>
              {rule.approvalRequired && (
                <div className="mt-6 rounded-lg border border-border p-4">
                  <p className="text-[12px] font-medium text-foreground mb-3">Approval Flow</p>
                  <div className="flex items-center gap-3 text-[12px]">
                    <div className="rounded-lg bg-primary/10 px-3 py-2 text-primary font-medium">Request Created</div>
                    <span className="text-muted-foreground">→</span>
                    <div className="rounded-lg bg-warning/10 px-3 py-2 text-warning font-medium">
                      {rule.approvalLevel === 'sales_manager_then_finance' ? 'Sales Manager Review' : 'Approver Review'}
                    </div>
                    {rule.approvalLevel === 'sales_manager_then_finance' && (
                      <>
                        <span className="text-muted-foreground">→</span>
                        <div className="rounded-lg bg-warning/10 px-3 py-2 text-warning font-medium">Finance Review</div>
                      </>
                    )}
                    <span className="text-muted-foreground">→</span>
                    <div className="rounded-lg bg-success/10 px-3 py-2 text-success font-medium">Decision</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Change History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rule.changeLog && rule.changeLog.length > 0 ? (
                <div className="space-y-4">
                  {rule.changeLog.map((change) => (
                    <div key={change.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <History className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-medium text-foreground">{change.actor}</p>
                          <span className="text-[11px] text-muted-foreground">{change.action}</span>
                        </div>
                        {change.field && (
                          <p className="text-[12px] text-muted-foreground mt-0.5">
                            <span className="text-foreground">{change.field}</span>: {change.oldValue} → {change.newValue}
                          </p>
                        )}
                        {change.reason && (
                          <p className="text-[12px] text-muted-foreground mt-0.5 italic">Reason: {change.reason}</p>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {format(parseISO(change.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">No changes recorded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete discount rule?"
        description="This action cannot be undone. The rule will be permanently removed and no longer applied to quotations."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteRule.isPending}
      />
    </div>
  )
}
