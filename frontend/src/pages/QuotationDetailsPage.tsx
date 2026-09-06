import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  FileText,
  Package,
  DollarSign,
  Scale,
  TrendingUp,
  Shield,
  Sparkles,
  UserCheck,
  MessageSquare,
  Truck,
  CreditCard,
  History,
  Home,
} from 'lucide-react'
import { toast } from 'sonner'
import { SalesWorkspaceTopMenu } from '@/components/ui/SalesWorkspaceTopMenu'
import {
  getQuotationDetails,
  submitForApprovalAction,
  validateQuotationAction,
  sendToCustomerAction,
  recordApprovalDecision,
} from '@/services/quotationDetails'
import { QuoteHeader } from '@/features/quotations/details/QuoteHeader'
import { CriticalStatusAlert } from '@/features/quotations/details/CriticalStatusAlert'
import { OverviewSection } from '@/features/quotations/details/OverviewSection'
import { LineItemsSection } from '@/features/quotations/details/LineItemsSection'
import { PricingSection } from '@/features/quotations/details/PricingSection'
import { DiscountAnalysisSection } from '@/features/quotations/details/DiscountAnalysisSection'
import { MarginSection } from '@/features/quotations/details/MarginSection'
import { RiskSection } from '@/features/quotations/details/RiskSection'
import { RecommendationsSection } from '@/features/quotations/details/RecommendationsSection'
import { ApprovalSection } from '@/features/quotations/details/ApprovalSection'
import { NegotiationSection } from '@/features/quotations/details/NegotiationSection'
import { FulfillmentSection } from '@/features/quotations/details/FulfillmentSection'
import { BillingSection } from '@/features/quotations/details/BillingSection'
import { AuditSection } from '@/features/quotations/details/AuditSection'
import { ApprovalActionModal } from '@/features/quotations/details/ApprovalActionModal'
import type { QuotationCompleteDetails } from '@/types/quotation'

export function QuotationDetailsPage() {
  const { id = 'QT-2026-00482' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialVersion = Number(searchParams.get('version')) || 3

  const [quote, setQuote] = useState<QuotationCompleteDetails | null>(null)
  const [activeVersion, setActiveVersion] = useState<number>(initialVersion)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('all')

  const loadQuote = async (versionToLoad: number = activeVersion) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getQuotationDetails(id, versionToLoad)
      setQuote(data)
    } catch (err) {
      setError('Unable to load quotation details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuote(activeVersion)
  }, [id, activeVersion])

  useEffect(() => {
    const v = Number(searchParams.get('version'))
    if (v && v !== activeVersion) {
      setActiveVersion(v)
    }
  }, [searchParams])

  const handleVersionChange = (newVersion: number) => {
    setActiveVersion(newVersion)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('version', String(newVersion))
    setSearchParams(newParams)
  }

  const handleHeaderAction = async (action: 'validate' | 'submit' | 'send' | 'duplicate' | 'archive' | 'approve_modal') => {
    if (!quote) return

    if (action === 'approve_modal') {
      setApprovalModalOpen(true)
      return
    }

    if (action === 'validate') {
      setActionLoading(true)
      const res = await validateQuotationAction(quote.id)
      setActionLoading(false)
      toast.success('Quotation Validation Passed', {
        description: res.messages.join(' • '),
      })
    } else if (action === 'submit') {
      setActionLoading(true)
      const res = await submitForApprovalAction(quote.id)
      setActionLoading(false)
      toast.success(res.message)
      // Optimistically update approval state
      setQuote((prev) =>
        prev
          ? {
              ...prev,
              status: 'pending_approval',
              approval: { ...prev.approval, approval_status: 'pending' },
            }
          : null
      )
    } else if (action === 'send') {
      setActionLoading(true)
      const res = await sendToCustomerAction(quote.id)
      setActionLoading(false)
      toast.success(res.message)
      setQuote((prev) => (prev ? { ...prev, status: 'sent' } : null))
    } else if (action === 'duplicate') {
      toast.info(`Quotation ${quote.quote_number} cloned as new draft.`)
    } else if (action === 'archive') {
      toast.warning(`Quotation ${quote.quote_number} archived.`)
      setQuote((prev) => (prev ? { ...prev, status: 'archived' } : null))
    }
  }

  const handleApprovalDecision = async (decision: 'approve' | 'reject' | 'return', reason: string) => {
    if (!quote) return
    const res = await recordApprovalDecision(quote.id, decision, reason)
    toast.success(res.message)

    setQuote((prev) => {
      if (!prev) return null
      const newStatus = decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'returned'
      return {
        ...prev,
        status: newStatus,
        approval: {
          ...prev.approval,
          approval_status: newStatus,
          rejection_reason: decision === 'reject' ? reason : null,
          return_reason: decision === 'return' ? reason : null,
          approval_chain: prev.approval.approval_chain.map((step) =>
            step.is_current ? { ...step, status: newStatus, comments: reason } : step
          ),
          approval_history: [
            {
              id: `hist-${Date.now()}`,
              actor: 'Current User (Approver)',
              actor_role: 'Authorized Manager / Finance',
              action: decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'returned',
              timestamp: new Date().toISOString(),
              level: prev.approval.current_level || 'Decision Level',
              reason,
            },
            ...prev.approval.approval_history,
          ],
        },
      }
    })
  }

  const handleAddRecommendation = (recId: string) => {
    if (!quote) return
    const targetRec = quote.recommendations.find((r) => r.id === recId)
    if (!targetRec) return

    toast.success(`Added "${targetRec.product_name}" to quotation lines`)

    // Mutate state with new line item and recalculate totals
    setQuote((prev) => {
      if (!prev) return null
      const newLine = {
        id: `line-rec-${Date.now()}`,
        product_id: targetRec.product_id,
        product_name: targetRec.product_name,
        sku: targetRec.sku,
        category: 'Accessories & Services',
        quantity: 1,
        unit_price: targetRec.unit_price,
        price_type: 'standard' as const,
        discount_percent: 0,
        discount_amount: 0,
        net_price: targetRec.unit_price,
        tax_rate: 18,
        tax_amount: Math.round(targetRec.unit_price * 0.18),
        line_total: Math.round(targetRec.unit_price * 1.18),
        cost: targetRec.unit_price - targetRec.margin_delta,
        margin_percent: Math.round((targetRec.margin_delta / targetRec.unit_price) * 100),
        inventory_status: 'in_stock' as const,
        available_stock: targetRec.available_stock,
      }

      const updatedLines = [...prev.line_items, newLine]
      const addedTotal = newLine.line_total
      const updatedGrandTotal = prev.total_value + addedTotal

      return {
        ...prev,
        total_value: updatedGrandTotal,
        line_items: updatedLines,
        recommendations: prev.recommendations.map((r) =>
          r.id === recId ? { ...r, added: true } : r
        ),
        pricing: {
          ...prev.pricing,
          subtotal: prev.pricing.subtotal + targetRec.unit_price,
          tax: prev.pricing.tax + newLine.tax_amount,
          grand_total: updatedGrandTotal,
        },
        margin: {
          ...prev.margin,
          revenue: updatedGrandTotal,
          margin_percent: Math.min(30, prev.margin.margin_percent + targetRec.margin_delta_pp),
        },
        audit: [
          {
            id: `audit-${Date.now()}`,
            category: 'edited',
            event_type: 'recommendation_added',
            title: `Added ${targetRec.product_name}`,
            description: `Recommendation applied to quote. Margin increased by +${targetRec.margin_delta_pp} pp.`,
            actor: { id: 'usr-current', name: 'Rahul Verma', role: 'Sales Representative' },
            timestamp: new Date().toISOString(),
            reason: targetRec.reason,
          },
          ...prev.audit,
        ],
      }
    })
  }

  const navSections = [
    { id: 'all', label: 'All Sections' },
    { id: 'overview', label: 'Overview', icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'line-items', label: 'Line Items', icon: <Package className="h-3.5 w-3.5" /> },
    { id: 'pricing', label: 'Pricing', icon: <DollarSign className="h-3.5 w-3.5" /> },
    { id: 'discount', label: 'Discount Analysis', icon: <Scale className="h-3.5 w-3.5" /> },
    { id: 'margin', label: 'Margin', icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { id: 'risk', label: 'Risk', icon: <Shield className="h-3.5 w-3.5" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: 'approval', label: 'Approval', icon: <UserCheck className="h-3.5 w-3.5" /> },
    { id: 'negotiation', label: 'Negotiation', icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { id: 'fulfillment', label: 'Fulfillment', icon: <Truck className="h-3.5 w-3.5" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="h-3.5 w-3.5" /> },
    { id: 'audit', label: 'Audit', icon: <History className="h-3.5 w-3.5" /> },
  ]

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId)
    if (sectionId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const elem = document.getElementById(sectionId)
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-16">
        <Skeleton className="h-6 w-72" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="space-y-6 py-8">
        <Card className="max-w-xl mx-auto border-danger/30 bg-danger-subtle/10 text-center p-8">
          <AlertTriangle className="h-12 w-12 text-danger mx-auto mb-3" />
          <h2 className="text-h2 font-semibold text-foreground">Quotation Unavailable</h2>
          <p className="text-small text-muted-foreground mt-2">{error || 'Quotation not found.'}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => loadQuote(activeVersion)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </Button>
            <Button asChild>
              <Link to="/sales/quotations">All Quotations</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      <SalesWorkspaceTopMenu onReload={() => loadQuote(activeVersion)} />
      {/* 1. Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-caption text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="hover:text-foreground">Sales</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <Link to="/sales/quotations" className="hover:text-foreground">
          Quotations
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="font-mono font-medium text-foreground">{quote.quote_number}</span>
      </nav>

      {/* 2. Quote Header */}
      <QuoteHeader
        quote={quote}
        onVersionChange={handleVersionChange}
        onAction={handleHeaderAction}
        actionLoading={actionLoading}
      />

      {/* 3. Critical Status / Alert Strip */}
      <CriticalStatusAlert quote={quote} onRefresh={() => loadQuote(activeVersion)} />

      {/* Sticky Section Navigator Pills */}
      <div className="sticky top-2 z-20 bg-background/95 backdrop-blur border border-border rounded-xl p-1.5 shadow-sm overflow-x-auto flex items-center gap-1">
        {navSections.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            className={`px-3 py-1.5 rounded-lg text-caption font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === s.id
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            {s.icon}
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* 4. Primary Content: 12 Core Sections */}
      <div className="space-y-8">
        {/* Section 02: Overview */}
        {(activeTab === 'all' || activeTab === 'overview') && (
          <OverviewSection
            overview={quote.overview}
            currency={quote.currency}
            onJumpToVersions={() => scrollToSection('negotiation')}
          />
        )}

        {/* Section 03: Line Items */}
        {(activeTab === 'all' || activeTab === 'line-items') && (
          <LineItemsSection
            lines={quote.line_items}
            currency={quote.currency}
            canViewCost={quote.permissions.can_view_cost}
            canViewMargin={quote.permissions.can_view_margin}
          />
        )}

        {/* Section 04: Pricing */}
        {(activeTab === 'all' || activeTab === 'pricing') && (
          <PricingSection pricing={quote.pricing} />
        )}

        {/* Section 05: Discount Analysis */}
        {(activeTab === 'all' || activeTab === 'discount') && (
          <DiscountAnalysisSection analysis={quote.discount_analysis} currency={quote.currency} />
        )}

        {/* Section 06: Margin */}
        {(activeTab === 'all' || activeTab === 'margin') && (
          <MarginSection
            margin={quote.margin}
            currency={quote.currency}
            canViewCost={quote.permissions.can_view_cost}
          />
        )}

        {/* Section 07: Risk */}
        {(activeTab === 'all' || activeTab === 'risk') && (
          <RiskSection risk={quote.risk} />
        )}

        {/* Section 08: Recommendations */}
        {(activeTab === 'all' || activeTab === 'recommendations') && (
          <RecommendationsSection
            recommendations={quote.recommendations}
            currency={quote.currency}
            onAddRecommendation={handleAddRecommendation}
            canAdd={quote.permissions.can_edit}
          />
        )}

        {/* Section 09: Approval */}
        {(activeTab === 'all' || activeTab === 'approval') && (
          <ApprovalSection
            approval={quote.approval}
            quoteNumber={quote.quote_number}
            canApprove={quote.permissions.can_approve}
            onDecision={handleApprovalDecision}
          />
        )}

        {/* Section 10: Negotiation */}
        {(activeTab === 'all' || activeTab === 'negotiation') && (
          <NegotiationSection negotiation={quote.negotiation} currency={quote.currency} />
        )}

        {/* Section 11: Fulfillment */}
        {(activeTab === 'all' || activeTab === 'fulfillment') && (
          <FulfillmentSection fulfillment={quote.fulfillment} currency={quote.currency} />
        )}

        {/* Section 12: Billing */}
        {(activeTab === 'all' || activeTab === 'billing') && (
          <BillingSection billing={quote.billing} currency={quote.currency} />
        )}

        {/* Section 13: Audit */}
        {(activeTab === 'all' || activeTab === 'audit') && (
          <AuditSection auditEvents={quote.audit} />
        )}
      </div>

      {/* Decision Modal */}
      <ApprovalActionModal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onConfirm={handleApprovalDecision}
        quoteNumber={quote.quote_number}
      />
    </div>
  )
}
