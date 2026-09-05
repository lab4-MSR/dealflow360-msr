import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Undo2,
  AlertTriangle,
  Building2,
  User,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { SlaCountdown } from '../components/SlaCountdown'
import { CustomerTierBadge } from '../components/CustomerTierBadge'
import { ApproveModal, RejectModal, ReturnModal } from '../components/ApprovalActionModals'
import {
  getApprovalDetails,
  approveApproval,
  rejectApproval,
  returnApproval,
} from '@/services/salesManager'
import type { ApprovalDetailData } from '@/types/salesManager'
import { toast } from 'sonner'

export function ApprovalDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<ApprovalDetailData | null>(null)
  const [loading, setLoading] = useState(true)

  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getApprovalDetails(id)
      .then((res) => setData(res))
      .catch((err) => toast.error('Failed to load approval details: ' + err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleApprove = async (comment: string) => {
    if (!id) return
    setIsSubmitting(true)
    try {
      await approveApproval(id, comment)
      toast.success('Approval request approved successfully')
      setApproveOpen(false)
      navigate('/sales-manager/approvals')
    } catch {
      toast.error('Failed to approve')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async (reason: string, comment: string) => {
    if (!id) return
    setIsSubmitting(true)
    try {
      await rejectApproval(id, reason, comment)
      toast.success('Approval request rejected')
      setRejectOpen(false)
      navigate('/sales-manager/approvals')
    } catch {
      toast.error('Failed to reject')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReturn = async (comments: string) => {
    if (!id) return
    setIsSubmitting(true)
    try {
      await returnApproval(id, comments)
      toast.success('Quotation returned to sales rep for modification')
      setReturnOpen(false)
      navigate('/sales-manager/approvals')
    } catch {
      toast.error('Failed to return')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-body text-muted-foreground animate-pulse">Loading approval record...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-body text-danger">Approval record not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/sales-manager/approvals">Return to Inbox</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/sales-manager/approvals" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Inbox</span>
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <span className="font-mono text-small font-semibold text-foreground">{data.quote_number}</span>
          <Badge variant="outline" className="text-caption">Version {data.version}</Badge>
        </div>

        {/* Manager Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="border-warning text-warning hover:bg-warning/10"
            onClick={() => setReturnOpen(true)}
          >
            <Undo2 className="mr-1.5 h-4 w-4" />
            Return to Rep
          </Button>
          <Button
            variant="outline"
            className="border-danger text-danger hover:bg-danger/10"
            onClick={() => setRejectOpen(true)}
          >
            <XCircle className="mr-1.5 h-4 w-4" />
            Reject
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setApproveOpen(true)}
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Approve Quotation
          </Button>
        </div>
      </div>

      {/* Header Banner Card */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="space-y-1 lg:col-span-2">
              <div className="flex items-center gap-2">
                <h1 className="text-h3 font-semibold text-foreground">{data.deal_name}</h1>
                <Link
                  to={`/sales/quotations/${data.quotation_id}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="Open customer quote view"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-small text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {data.customer.name}
                </span>
                <CustomerTierBadge tier={data.customer.tier} />
                <span>·</span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  Rep: <b className="text-foreground">{data.rep.name}</b>
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-1 border-t pt-4 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
              <span className="text-caption font-medium uppercase tracking-wider text-muted-foreground">Quote Total</span>
              <span className="text-h2 font-bold tabular-nums text-foreground">
                ₹{Number(data.total_value ?? data.deal_value ?? data.subtotal ?? 0).toLocaleString()}
              </span>
              <span className="text-caption text-muted-foreground">
                Margin: <b className={data.margin_percent < 22 ? 'text-danger' : 'text-foreground'}>{data.margin_percent}%</b>
              </span>
            </div>

            <div className="flex flex-col justify-center space-y-2 border-t pt-4 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
              <div className="flex items-center justify-between">
                <span className="text-caption font-medium uppercase tracking-wider text-muted-foreground">Risk Level</span>
                <RiskBadge risk={data.risk_level}>{data.risk_level}</RiskBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-caption font-medium uppercase tracking-wider text-muted-foreground">SLA Window</span>
                <SlaCountdown expiresAt={data.sla_expires_at} deadline={data.sla_deadline} isBreached={data.sla_breached} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Items & Violations */}
        <div className="space-y-6 lg:col-span-2">
          {/* Violations / Reasons */}
          <Card className="border-warning/40 bg-warning-subtle/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-small font-semibold text-warning flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Approval Triggers & Governance Breaches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(data.reasons || [data.rep_notes || 'Discount threshold exceeded commercial governance rule']).map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-body-small text-foreground">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-warning flex-shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-body font-semibold">Quotation Line Items</CardTitle>
              <Badge variant="outline">{data.lines?.length || 0} Products</Badge>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-small">
                  <thead className="border-b border-border text-caption text-muted-foreground">
                    <tr>
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 text-right font-medium">Qty</th>
                      <th className="pb-2 text-right font-medium">Unit Price</th>
                      <th className="pb-2 text-right font-medium">Discount</th>
                      <th className="pb-2 text-right font-medium">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(data.lines || []).map((line) => (
                      <tr key={line.id} className="hover:bg-muted/30">
                        <td className="py-2.5">
                          <span className="font-medium text-foreground block">{line.product_name}</span>
                          <span className="text-caption text-muted-foreground">{line.category}</span>
                        </td>
                        <td className="py-2.5 text-right tabular-nums">{line.quantity}</td>
                        <td className="py-2.5 text-right tabular-nums">₹{line.unit_price.toLocaleString()}</td>
                        <td className="py-2.5 text-right tabular-nums">
                          <span className={(line.discount_percent ?? line.requested_discount_percent ?? 0) > (line.max_allowed_discount ?? line.allowed_discount_percent ?? 0) ? 'font-semibold text-danger' : ''}>
                            {line.discount_percent ?? line.requested_discount_percent ?? 0}%
                          </span>
                          {(line.discount_percent ?? line.requested_discount_percent ?? 0) > (line.max_allowed_discount ?? line.allowed_discount_percent ?? 0) && (
                            <span className="text-caption text-danger block">
                              Max: {line.max_allowed_discount ?? line.allowed_discount_percent ?? 0}%
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-right tabular-nums font-medium">
                          ₹{(line.net_total ?? line.line_total ?? line.net_price ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: AI Guidance & Approval Chain */}
        <div className="space-y-6">
          {/* AI Decision Recommendations */}
          <Card className="border-primary/30 bg-primary-subtle/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-small font-semibold text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Manager Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data.recommendations || []).map((rec, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-semibold uppercase text-foreground">{rec.type}</span>
                    <Badge variant="outline" className="text-caption">{rec.confidence ?? 92}% confidence</Badge>
                  </div>
                  <p className="text-body-small text-foreground">{rec.recommendation ?? rec.text ?? rec.suggested_action}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Multi-step Approval Chain */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-small font-semibold">Approval Chain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data.approval_chain || []).map((step, i) => (
                <div key={i} className="flex items-center justify-between text-body-small border-b border-border pb-2 last:border-b-0 transition-colors duration-150 hover:bg-muted/20 px-2 -mx-2 rounded">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-semibold text-foreground flex items-center justify-center h-6 w-6 rounded-full text-xs transition-transform duration-200", (step.status === 'approved' || step.status === 'completed') ? "bg-success/15 text-success" : step.status === 'pending' ? "bg-primary/15 text-primary scale-105" : "bg-muted text-muted-foreground")}>
                      L{step.level ?? step.step_number}
                    </span>
                    <span className="text-muted-foreground">{step.role_name ?? step.role_display ?? step.role}</span>
                  </div>
                  <Badge
                    variant={step.status === 'approved' || step.status === 'completed' ? 'default' : step.status === 'pending' ? 'secondary' : 'outline'}
                    className="capitalize transition-all duration-200"
                  >
                    {step.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ApproveModal
        isOpen={approveOpen}
        onClose={() => setApproveOpen(false)}
        quoteNumber={data.quote_number}
        dealName={data.deal_name}
        onConfirm={handleApprove}
        isSubmitting={isSubmitting}
      />
      <RejectModal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        quoteNumber={data.quote_number}
        onConfirm={handleReject}
        isSubmitting={isSubmitting}
      />
      <ReturnModal
        isOpen={returnOpen}
        onClose={() => setReturnOpen(false)}
        quoteNumber={data.quote_number}
        onConfirm={handleReturn}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
