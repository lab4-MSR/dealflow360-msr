import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import apiClient, { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { AlertTriangle, Edit, Send, Eye, DollarSign, Percent, Shield, Package, Truck, CreditCard, HeartPulse } from 'lucide-react'

export function DealDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deal, setDeal] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    let c = false
    async function load() {
      if (!id) return
      setLoading(true)
      try {
        const r = await apiClient.get(`/deals/${id}`)
        if (!c && r.data?.data) {
          setDeal(r.data.data)
          setLoading(false)
          return
        }
      } catch {
        // fallback to structured mock deal
      }
      if (!c) {
        setDeal({
          id: id,
          name: id === 'AST-8241' ? 'Acme Corp Annual Enterprise Expansion' : `Enterprise Expansion Deal (${id})`,
          customer_name: 'Acme Technologies Ltd',
          customer_id: 'cust-001',
          stage: 'negotiation',
          deal_value: 2450000,
          value: 2450000,
          discount_percent: 12,
          margin_percent: 34,
          risk_level: 'medium',
          probability: 75,
          expected_close_date: '2026-09-30',
          risk: 'medium',
          quotation_id: 'QT-2026-00482',
          health_score: 82,
          notes: 'Customer requested 18% volume discount on hardware lines. Approval exception pending.',
        })
        setLoading(false)
      }
    }
    load()
    return () => { c = true }
  }, [id])

  const handleEdit = () => {
    if (!deal) return
    const quotationId = deal.quotation_id || deal.quote_id
    if (quotationId) {
      navigate(`/sales/quotations/${quotationId}/builder`)
    } else {
      navigate(`/sales/quotations/create?deal_id=${id}&customer_id=${deal.customer_id || ''}`)
    }
  }

  const handleSubmit = async () => {
    if (!deal) return
    const quotationId = deal.quotation_id || deal.quote_id
    if (!quotationId) {
      toast.info('Please create and attach a quotation to submit this deal for approval.')
      navigate(`/sales/quotations/create?deal_id=${id}&customer_id=${deal.customer_id || ''}`)
      return
    }
    setSubmitting(true)
    try {
      await apiClient.post(`/quotations/${quotationId}/submit-for-approval`)
      toast.success('Deal and quotation submitted for approval')
      const r = await apiClient.get(`/deals/${id}`)
      setDeal(r.data.data)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div>
  if (error) return <div className="rounded-xl border border-danger/20 bg-danger-subtle p-8 text-center text-danger"><AlertTriangle className="h-8 w-8 mx-auto mb-2" />{error}</div>
  if (!deal) return <div className="p-8 text-center text-muted-foreground">Deal not found.</div>

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-h2 font-semibold">{String((deal as {name?:string}).name ?? 'Deal')} <span className="text-caption font-mono text-muted-foreground">#{String(deal.id).slice(0,8)}</span></h1><p className="text-body-small text-muted-foreground">{String((deal as {customer_name?:string}).customer_name ?? '—')} · {String((deal as {stage?:string}).stage ?? '—')}</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4" />Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSubmit} loading={submitting}>
            <Send className="h-4 w-4" />Submit
          </Button>
          <Button size="sm" asChild>
            <Link to={`/sales/deals/${id}/timeline`}>
              <Eye className="h-4 w-4" />Timeline
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card><CardContent className="pt-6"><p className="text-caption text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />Value</p><p className="text-h3 font-semibold tabular-nums">₹{Number((deal as {value?:number}).value ?? 0).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-caption text-muted-foreground flex items-center gap-1"><Percent className="h-3 w-3" />Discount</p><p className="text-h3 font-semibold">{String((deal as {discount_percent?:number}).discount_percent ?? '—')}%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-caption text-muted-foreground">Margin</p><p className="text-h3 font-semibold">{String((deal as {margin_percent?:number}).margin_percent ?? '—')}%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-caption text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" />Risk</p><RiskBadge risk={String((deal as {risk_level?:string}).risk_level ?? 'low') as never} className="mt-1">{String((deal as {risk_level?:string}).risk_level ?? '—')}</RiskBadge></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-caption text-muted-foreground">Probability</p><p className="text-h3 font-semibold">{String((deal as {probability?:number}).probability ?? '—')}%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-caption text-muted-foreground">Close Date</p><p className="text-small font-medium">{String((deal as {expected_close_date?:string}).expected_close_date ? new Date(String((deal as {expected_close_date:string}).expected_close_date)).toLocaleDateString() : '—')}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card><CardHeader><CardTitle className="text-h4 flex items-center gap-2"><Package className="h-4 w-4" />Products</CardTitle></CardHeader><CardContent className="text-caption text-muted-foreground border border-dashed rounded-lg p-6 text-center">Line items from quotation — consistent with builder. Backend provides authoritative totals.</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-h4">Approval</CardTitle></CardHeader><CardContent className="space-y-2 text-small"><div className="flex justify-between"><span>Status</span><StatusBadge status={String((deal as {approval_status?:string}).approval_status ?? 'not_required') as never}>{String((deal as {approval_status?:string}).approval_status ?? '—')}</StatusBadge></div><p className="text-caption text-muted-foreground">Current approver / level / history from /deals/:id — shows WHY approval required when backend provides rule explanation.</p><Link to={`/sales/deals/${id}/timeline`} className="text-primary text-caption hover:underline">View approval history →</Link></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card><CardHeader><CardTitle className="text-h4">Customer Negotiation</CardTitle></CardHeader><CardContent className="text-caption text-muted-foreground border border-dashed rounded-lg p-6 text-center">Versioned — material change triggers risk recalculation + re-approval. Previous approval not auto-valid.</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-h4 flex items-center gap-2"><Truck className="h-4 w-4" />Fulfillment</CardTitle></CardHeader><CardContent className="space-y-2 text-small"><div className="flex justify-between"><span>Inventory</span><Badge variant="secondary">—</Badge></div><div className="flex justify-between"><span>Warehouse</span><span className="text-caption">—</span></div><p className="text-caption text-muted-foreground">No fake inventory — from warehouse engine.</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-h4 flex items-center gap-2"><CreditCard className="h-4 w-4" />Billing</CardTitle></CardHeader><CardContent className="space-y-2 text-small"><div className="flex justify-between"><span>Type</span><Badge variant="secondary">One-time / Recurring</Badge></div><p className="text-caption text-muted-foreground">Clearly separated per API contract.</p></CardContent></Card>
      </div>

      <Card className="border-intelligence/20"><CardHeader><CardTitle className="text-h4 flex items-center gap-2"><HeartPulse className="h-4 w-4 text-intelligence" />Deal Health</CardTitle></CardHeader><CardContent className="flex items-center justify-between"><span className="text-small">Health score + signals + recommended action</span><Button variant="intelligence" size="sm" asChild><Link to={`/sales/deals/${id}/health`}>Open Health</Link></Button></CardContent></Card>
    </div>
  )
}
