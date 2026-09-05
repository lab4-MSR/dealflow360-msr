import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import apiClient, { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { AlertTriangle, Save, CheckCircle, Send, Shield, TrendingUp, Package, Truck, CreditCard, Lightbulb, DollarSign, Search, Plus, Trash2, Info } from 'lucide-react'

export function QuotationBuilderPage() {
  const { id } = useParams()
  const [q, setQ] = useState<Record<string, unknown> | null>(null)
  const [evalData, setEvalData] = useState<Record<string, unknown> | null>(null)
  const [recommendations, setRecommendations] = useState<Array<Record<string, unknown>>>([])
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([])
  const [searchQ, setSearchQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved'|'unsaved'|'saving'|'failed'>('saved')
  const [internalNotes, setInternalNotes] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')

  const load = async () => {
    if (!id) return
    setLoading(true); setError(null)
    try {
      const [qRes, evalRes, recRes] = await Promise.allSettled([
        apiClient.get(`/quotations/${id}`),
        apiClient.get(`/quotations/${id}/evaluate`),
        apiClient.get(`/quotations/${id}/recommendations`),
      ])
      if (qRes.status==='fulfilled') {
        setQ(qRes.value.data.data)
        setInternalNotes(String((qRes.value.data.data as {internal_notes?:string}).internal_notes ?? ''))
        setCustomerNotes(String((qRes.value.data.data as {customer_notes?:string}).customer_notes ?? ''))
      } else throw new Error(getApiErrorMessage(qRes.reason))
      if (evalRes.status==='fulfilled') setEvalData(evalRes.value.data.data)
      if (recRes.status==='fulfilled') setRecommendations(recRes.value.data.data ?? [])
    } catch (e) { setError(getApiErrorMessage(e)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])
  useEffect(() => { apiClient.get('/products?per_page=100').then(r=>setProducts(r.data.data ?? [])).catch(()=>{}) }, [])

  const lines = (q as {lines?: Array<Record<string,unknown>>})?.lines ?? []
  const status = String(q?.status ?? 'draft')
  const version = Number((q as {version?:number})?.version ?? 1)
  const quoteNumber = String((q as {quote_number?:string})?.quote_number ?? '—')

  const filteredProducts = products.filter(p => !searchQ || String((p as {name?:string}).name).toLowerCase().includes(searchQ.toLowerCase()))

  const addLine = async (productId: string) => {
    if (!id) return
    setSaving(true); setSaveStatus('saving')
    try {
      const res = await apiClient.post(`/quotations/${id}/lines`, { product_id: productId, quantity: 1, discount_percent: 0 })
      setQ(res.data.data ?? res.data)
      const evalR = await apiClient.get(`/quotations/${id}/evaluate`).then(r=>r.data.data).catch(()=>null)
      if (evalR) setEvalData(evalR)
      setSaveStatus('saved'); toast.success('Line added — recomputed')
    } catch (e) { setSaveStatus('failed'); toast.error(getApiErrorMessage(e)) }
    finally { setSaving(false) }
  }

  const updateLine = async (lineId: string, patch: {quantity?:number; discount_percent?:number}) => {
    if (!id) return
    setSaveStatus('saving')
    try {
      const res = await apiClient.patch(`/quotations/${id}/lines/${lineId}`, patch)
      setQ(res.data.data ?? res.data)
      const evalR = await apiClient.get(`/quotations/${id}/evaluate`).then(r=>r.data.data).catch(()=>null)
      if (evalR) setEvalData(evalR)
      setSaveStatus('saved')
    } catch (e) { setSaveStatus('failed'); toast.error(getApiErrorMessage(e)) }
  }

  const removeLine = async (lineId: string) => {
    if (!id) return
    setSaving(true)
    try {
      const res = await apiClient.delete(`/quotations/${id}/lines/${lineId}`)
      setQ(res.data.data ?? res.data)
      const evalR = await apiClient.get(`/quotations/${id}/evaluate`).then(r=>r.data.data).catch(()=>null)
      if (evalR) setEvalData(evalR)
      toast.success('Line removed')
    } catch (e) { toast.error(getApiErrorMessage(e)) }
    finally { setSaving(false) }
  }

  const handleAction = async (action: 'validate'|'submit'|'send'|'save') => {
    if (!id) return
    setSaving(true)
    try {
      if (action==='save') { await apiClient.patch(`/quotations/${id}`, { internal_notes: internalNotes, customer_notes: customerNotes }); toast.success('Saved'); setSaveStatus('saved') }
      if (action==='validate') { const r=await apiClient.post(`/quotations/${id}/validate`); toast.success('Validated'); if(r.data.data) setEvalData(r.data.data) }
      if (action==='submit') { await apiClient.post(`/quotations/${id}/submit-for-approval`); toast.success('Submitted for approval'); load() }
      if (action==='send') { await apiClient.post(`/quotations/${id}/send`); toast.success('Sent to customer'); load() }
    } catch (e) { toast.error(getApiErrorMessage(e)) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-96 w-full" /></div>
  if (error) return <div className="rounded-xl border border-danger/20 bg-danger-subtle p-8 text-center text-danger"><AlertTriangle className="h-8 w-8 mx-auto mb-2" />{error} <Button variant="outline" size="sm" className="ml-2" onClick={load}>Retry</Button></div>
  if (!q) return <div className="p-8 text-center text-muted-foreground">Quotation not found.</div>

  const canEdit = status==='draft' || status==='under_negotiation'
  const needsApproval = Boolean((evalData as {approval_preview?:{approval_required:boolean}})?.approval_preview?.approval_required)
  const approvalBlocked = needsApproval && status==='draft'
  const dg = (evalData as {discount_governance?: {order_level?:{excess_percent:number}}})?.discount_governance
  const margin = (evalData as {margin?:{margin_percent:number; minimum_margin_percent:number; margin_impact:string}})?.margin
  const risk = (evalData as {risk?:{blended_risk_score:number; risk_level:string}})?.risk

  return (
    <div className="space-y-6">
      {/* Builder Header */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div><h1 className="text-h2 font-semibold font-mono">{quoteNumber} <span className="text-caption font-sans text-muted-foreground">v{version}</span></h1><p className="text-body-small text-muted-foreground">{String((q as {customer?:{name?:string}}).customer?.name ?? '—')} · <StatusBadge status={status as never}>{status}</StatusBadge> · <span className={saveStatus==='saved'?'text-success':saveStatus==='failed'?'text-danger':'text-warning'}>{saveStatus==='saving'?'Saving…':saveStatus==='saved'?'Saved':saveStatus==='failed'?'Save failed':'Unsaved changes'}</span></p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild><Link to={`/sales/quotations/${id}`}>Quotation Details</Link></Button>
          <Button variant="outline" size="sm" onClick={()=>handleAction('save')} disabled={saving}><Save className="h-4 w-4" />Save Draft</Button>
          <Button variant="secondary" size="sm" onClick={()=>handleAction('validate')} disabled={saving}>Validate Quote</Button>
          <Button size="sm" onClick={()=>handleAction('submit')} disabled={saving || !canEdit} title={!canEdit? 'Only draft / under_negotiation can be submitted' : undefined}>Submit for Approval</Button>
          <Button variant="intelligence" size="sm" onClick={()=>handleAction('send')} disabled={saving || approvalBlocked} title={approvalBlocked? 'Approval required before send' : status==='pending_approval' ? 'Pending approval' : undefined}><Send className="h-4 w-4" />Send to Customer</Button>
        </div>
      </div>

      {needsApproval && <div className="rounded-lg bg-warning-subtle border border-warning/20 p-3 flex items-start gap-2"><Shield className="h-4 w-4 text-warning mt-0.5" /><div><p className="text-small font-medium text-warning">Approval required — {String((evalData as {approval_preview?:{approval_level?:string}})?.approval_preview?.approval_level ?? '—')}</p><p className="text-caption text-muted-foreground">Send to Customer is blocked until approved. Previous approval invalidated if terms changed (new version).</p></div></div>}
      {margin && Number(margin.margin_percent) < Number(margin.minimum_margin_percent) && <div className="rounded-lg bg-danger-subtle border border-danger/20 p-3 flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-danger mt-0.5" /><div><p className="text-small font-medium text-danger">Margin below minimum — {margin.margin_percent}% &lt; {margin.minimum_margin_percent}%</p><p className="text-caption text-muted-foreground">Impact: {margin.margin_impact} — Review discount</p></div></div>}
      {(q as {negotiation?:{negotiation_status?:string}})?.negotiation?.negotiation_status && String((q as {negotiation?:{negotiation_status?:string}}).negotiation?.negotiation_status)!=='none' && <div className="rounded-lg bg-info-subtle border border-info/20 p-3"><p className="text-small font-medium">Negotiation active — version {version}</p><p className="text-caption text-muted-foreground">Risk recalculated · Re-approval may be required before acceptance.</p></div>}

      {/* Customer Section */}
      <Card><CardHeader><CardTitle className="text-h4">Customer</CardTitle></CardHeader><CardContent className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-small">
        <div><p className="text-caption text-muted-foreground">Customer</p><p className="font-medium">{String((q as {customer?:{name?:string}}).customer?.name ?? '—')}</p></div>
        <div><p className="text-caption text-muted-foreground">Tier</p><Badge variant="secondary" className="capitalize">{String((q as {customer?:{tier?:string}}).customer?.tier ?? '—')}</Badge></div>
        <div><p className="text-caption text-muted-foreground">Price List</p><p className="font-mono text-caption">{String((q as {customer?:{price_list?:string}}).customer?.price_list ?? '—')}</p></div>
        <div><p className="text-caption text-muted-foreground">Payment Terms</p><p>{String((q as {payment_terms?:string}).payment_terms ?? '—')}</p></div>
        <div><p className="text-caption text-muted-foreground">Shipping Address</p><p className="text-caption">{String((q as {shipping_address?:string}).shipping_address ?? '—')}</p></div>
        <p className="col-span-2 lg:col-span-5 text-caption text-muted-foreground">Changing customer revalidates pricing/discount/tax/shipping/terms/risk — no stale pricing.</p>
      </CardContent></Card>

      {/* Product Line Editor — responsive: table desktop, cards mobile */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-h4 flex items-center gap-2"><Package className="h-4 w-4" />Product Lines</CardTitle><span className="text-caption text-muted-foreground">{lines.length} lines</span></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search products to add..." className="pl-9" /></div>
          </div>
          {searchQ && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-auto border rounded-lg p-2">
              {filteredProducts.slice(0,10).map(p=>(
                <div key={String(p.id)} className="flex items-center justify-between rounded border p-2">
                  <div><p className="text-small font-medium">{String((p as {name?:string}).name)}</p><p className="text-caption text-muted-foreground font-mono">{String((p as {sku?:string}).sku ?? '')}</p></div>
                  <Button size="sm" variant="outline" onClick={()=>addLine(String(p.id))} disabled={!canEdit}><Plus className="h-3 w-3" />Add</Button>
                </div>
              ))}
            </div>
          )}

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Qty</TableHead><TableHead>Unit Price</TableHead><TableHead>Discount</TableHead><TableHead>Net Price</TableHead><TableHead>Margin</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {lines.length===0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No lines — add products above. Authoritative pricing from backend.</TableCell></TableRow>
                : lines.map((l:Record<string,unknown>)=>(
                  <TableRow key={String(l.id)}>
                    <TableCell className="font-medium">{String((l as {product_name?:string}).product_name ?? String(l.product_id).slice(0,8))}</TableCell>
                    <TableCell className="font-mono text-caption">{String((l as {sku?:string}).sku ?? '—')}</TableCell>
                    <TableCell><Input type="number" min={1} defaultValue={String((l as {quantity?:number}).quantity ?? 1)} onBlur={e=>updateLine(String(l.id), {quantity: Number(e.target.value)})} disabled={!canEdit} className="w-20 h-8" /></TableCell>
                    <TableCell className="tabular-nums">${Number((l as {unit_price?:number}).unit_price ?? 0).toLocaleString()}</TableCell>
                    <TableCell><div className="flex items-center gap-1"><Input type="number" min={0} max={100} defaultValue={String((l as {discount_percent?:number}).discount_percent ?? 0)} onBlur={e=>updateLine(String(l.id), {discount_percent: Number(e.target.value)})} disabled={!canEdit} className="w-16 h-8" /><span className="text-caption">%</span></div></TableCell>
                    <TableCell className="tabular-nums">${Number((l as {net_price?:number}).net_price ?? 0).toLocaleString()}</TableCell>
                    <TableCell className="tabular-nums">{String((l as {margin_percent?:number}).margin_percent ?? '—')}%</TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={()=>removeLine(String(l.id))} disabled={!canEdit}><Trash2 className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {lines.length===0 ? <p className="text-center text-caption text-muted-foreground py-6 border border-dashed rounded-lg">No lines</p>
            : lines.map((l:Record<string,unknown>)=>(
              <div key={String(l.id)} className="rounded-lg border p-3 space-y-2">
                <div className="flex justify-between"><span className="font-medium text-small">{String((l as {product_name?:string}).product_name ?? String(l.product_id).slice(0,8))}</span><Button variant="ghost" size="sm" onClick={()=>removeLine(String(l.id))} disabled={!canEdit}><Trash2 className="h-4 w-4" /></Button></div>
                <div className="grid grid-cols-2 gap-2 text-caption"><span>Qty <Input type="number" defaultValue={String((l as {quantity?:number}).quantity ?? 1)} onBlur={e=>updateLine(String(l.id), {quantity: Number(e.target.value)})} disabled={!canEdit} className="h-8" /></span><span>Discount % <Input type="number" defaultValue={String((l as {discount_percent?:number}).discount_percent ?? 0)} onBlur={e=>updateLine(String(l.id), {discount_percent: Number(e.target.value)})} disabled={!canEdit} className="h-8" /></span></div>
                <div className="flex justify-between text-caption"><span>Net: ${Number((l as {net_price?:number}).net_price ?? 0).toLocaleString()}</span><span>Margin: {String((l as {margin_percent?:number}).margin_percent ?? '—')}%</span></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card><CardHeader><CardTitle className="text-small flex items-center gap-2"><DollarSign className="h-4 w-4" />Order Pricing</CardTitle></CardHeader><CardContent className="space-y-1 text-small tabular-nums">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${Number((q as {pricing?:{subtotal?:number}}).pricing?.subtotal ?? 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Line Discount</span><span>-${Number((q as {pricing?:{line_discounts_total?:number}}).pricing?.line_discounts_total ?? 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Order Discount</span><span>-${Number((q as {pricing?:{order_discount?:number}}).pricing?.order_discount ?? 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${Number((q as {pricing?:{tax?:number}}).pricing?.tax ?? 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>${Number((q as {pricing?:{shipping?:number}}).pricing?.shipping ?? 0).toLocaleString()}</span></div>
          <div className="flex justify-between font-semibold border-t pt-2"><span>Grand Total</span><span>${Number((q as {pricing?:{grand_total?:number}}).pricing?.grand_total ?? 0).toLocaleString()} {String((q as {pricing?:{currency?:string}}).pricing?.currency ?? '')}</span></div>
          <p className="text-caption text-muted-foreground">Backend authoritative — no frontend float math.</p>
        </CardContent></Card>

        <Card className={dg?.order_level?.excess_percent && dg.order_level.excess_percent > 0 ? 'border-warning/30' : ''}>
          <CardHeader><CardTitle className="text-small flex items-center gap-2"><Shield className="h-4 w-4" />Discount Governance</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-small">
            {evalData ? (
              <>
                <div className="space-y-1 text-caption">
                  <div className="flex justify-between"><span className="text-muted-foreground">Customer ceiling</span><span>{String((evalData as {discount_governance?:{lines?:Array<{customer_tier_ceiling:number}>}}).discount_governance?.lines?.[0]?.customer_tier_ceiling ?? '—')}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Category ceiling</span><span>{String((evalData as {discount_governance?:{lines?:Array<{category_ceiling:number}>}}).discount_governance?.lines?.[0]?.category_ceiling ?? '—')}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Requested</span><span>{String((evalData as {discount_governance?:{order_level?:{requested_discount_percent:number}}}).discount_governance?.order_level?.requested_discount_percent ?? '—')}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Allowed</span><span>{String((evalData as {discount_governance?:{order_level?:{allowed_discount_percent:number}}}).discount_governance?.order_level?.allowed_discount_percent ?? '—')}%</span></div>
                  <div className="flex justify-between font-medium"><span>Excess</span><Badge variant={dg?.order_level?.excess_percent && dg.order_level.excess_percent > 0 ? 'warning' : 'secondary'}>{String(dg?.order_level?.excess_percent ?? 0)}pp</Badge></div>
                </div>
                <div className="rounded bg-muted p-2 text-caption"><p className="font-medium flex items-center gap-1"><Info className="h-3 w-3" />Rule Explanation</p><p className="text-muted-foreground">Which rule caused restriction + approval required — from backend evaluation.</p></div>
              </>
            ) : <p className="text-caption text-muted-foreground">Evaluation pending — add lines.</p>}
          </CardContent>
        </Card>

        <Card className={margin && Number(margin.margin_percent) < Number(margin.minimum_margin_percent) ? 'border-danger/30' : ''}>
          <CardHeader><CardTitle className="text-small flex items-center gap-2"><TrendingUp className="h-4 w-4" />Margin Intelligence</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-small">
            {margin ? (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">Gross Margin</span><span className="tabular-nums">${Number((evalData as {margin?:{gross_margin:number}}).margin?.gross_margin ?? 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Margin %</span><span className={Number(margin.margin_percent) < Number(margin.minimum_margin_percent) ? 'text-danger font-semibold' : ''}>{margin.margin_percent}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Target</span><span>{margin.target_margin_percent ?? margin.minimum_margin_percent}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Minimum</span><span>{margin.minimum_margin_percent}%</span></div>
                <Badge variant={margin.margin_impact==='critical'?'danger':margin.margin_impact==='warning'?'warning':'secondary'} className="mt-2">{String(margin.margin_impact)}</Badge>
              </>
            ) : <p className="text-caption text-muted-foreground">Margin from backend — hidden if unauthorized.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="border-intelligence/20">
          <CardHeader><CardTitle className="text-small flex items-center gap-2"><Shield className="h-4 w-4 text-intelligence" />Risk Intelligence</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-small">
            {risk ? (
              <>
                <div className="flex items-center gap-2"><RiskBadge risk={risk.risk_level as never}>{risk.risk_level}</RiskBadge><span className="tabular-nums font-semibold">{risk.blended_risk_score}</span></div>
                <p className="text-caption text-muted-foreground">{String((evalData as {risk?:{aggregate_risk_note?:string}}).risk?.aggregate_risk_note ?? '')}</p>
                <p className="text-caption"><span className="text-muted-foreground">Margin risk:</span> {String((evalData as {risk?:{margin_risk?:string}}).risk?.margin_risk ?? '—')} · <span className="text-muted-foreground">Customer:</span> {String((evalData as {risk?:{customer_risk?:string}}).risk?.customer_risk ?? '—')}</p>
              </>
            ) : <p className="text-caption text-muted-foreground">Risk from blended engine — same as simulator.</p>}
          </CardContent>
        </Card>
        <Card className="border-intelligence/20">
          <CardHeader><CardTitle className="text-small flex items-center gap-2"><Lightbulb className="h-4 w-4 text-intelligence" />Recommendations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recommendations.length===0 ? <p className="text-caption text-muted-foreground py-4 text-center border border-dashed rounded-lg">No recommendations — engine needs co-purchase + promotion + margin data.</p>
            : recommendations.slice(0,3).map((r:Record<string,unknown>)=>(
              <div key={String(r.recommendation_id ?? r.product_id)} className="rounded-lg border p-2">
                <p className="text-small font-medium">{String((r as {product_name?:string}).product_name)}</p><p className="text-caption text-muted-foreground">{String((r as {reason?:string}).reason)}</p>
                <div className="flex gap-2 mt-1"><Badge variant="intelligence" className="text-caption">{String((r as {promotion_tag?:string}).promotion_tag ?? '')}</Badge><span className="text-caption tabular-nums">Δ ${String((r as {margin_delta?:number}).margin_delta ?? '')}</span><Button size="sm" variant="outline" className="ml-auto h-6 text-caption" onClick={async()=>{ if(!id) return; await apiClient.post(`/quotations/${id}/recommendations/${String(r.recommendation_id)}/add`); load(); toast.success('Added') }}>Add</Button></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-small">Approval Preview</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-small">
            <div className="flex justify-between"><span className="text-muted-foreground">Required</span><Badge variant={needsApproval?'warning':'success'}>{needsApproval?'Yes':'No'}</Badge></div>
            {needsApproval && <><div className="flex justify-between"><span className="text-muted-foreground">Level</span><span>{String((evalData as {approval_preview?:{approval_level?:string}})?.approval_preview?.approval_level ?? '—')}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Next approver</span><span>{String((evalData as {approval_preview?:{next_approver_role?:string}})?.approval_preview?.next_approver_role ?? '—')}</span></div><p className="text-caption text-muted-foreground">Chain from approval engine — not hardcoded.</p></>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card><CardHeader><CardTitle className="text-small flex items-center gap-2"><Truck className="h-4 w-4" />Fulfillment Preview</CardTitle></CardHeader><CardContent className="space-y-1 text-small">
          <div className="flex justify-between"><span className="text-muted-foreground">Stock</span><Badge variant="secondary">{String((evalData as {fulfillment_preview?:{stock_availability?:string}})?.fulfillment_preview?.stock_availability ?? '—')}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Split</span><span>{String((evalData as {fulfillment_preview?:{potential_split?:boolean}})?.fulfillment_preview?.potential_split ? '2 shipments' : 'No')}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Backorder risk</span><Badge variant="secondary">{String((evalData as {fulfillment_preview?:{backorder_risk?:string}})?.fulfillment_preview?.backorder_risk ?? '—')}</Badge></div>
          <p className="text-caption text-muted-foreground">Final allocation backend-authoritative.</p>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-small flex items-center gap-2"><CreditCard className="h-4 w-4" />Billing</CardTitle></CardHeader><CardContent className="space-y-1 text-small">
          <div className="flex justify-between"><span>One-time</span><span>—</span></div><div className="flex justify-between"><span>Recurring</span><span>—</span></div><p className="text-caption text-muted-foreground">Mixed one-time + recurring + proration preview when backend provides.</p>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-small">Customer Notes</CardTitle><p className="text-caption text-destructive">Internal notes never exposed to Customer Portal</p></CardHeader><CardContent className="space-y-3">
          <div className="space-y-1"><Label className="text-caption">Internal Notes (private)</Label><Textarea value={internalNotes} onChange={e=>{setInternalNotes(e.target.value); setSaveStatus('unsaved')}} rows={2} placeholder="Internal only..." /></div>
          <div className="space-y-1"><Label className="text-caption">Customer Notes (visible to customer)</Label><Textarea value={customerNotes} onChange={e=>{setCustomerNotes(e.target.value); setSaveStatus('unsaved')}} rows={2} placeholder="Visible to customer..." /></div>
        </CardContent></Card>
      </div>
    </div>
  )
}
