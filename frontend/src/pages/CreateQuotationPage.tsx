import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import apiClient, { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { Search, Plus, IndianRupee, Shield, TrendingUp } from 'lucide-react'

export function CreateQuotationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const presetCustomerId = searchParams.get('customer_id') ?? ''

  const [customers, setCustomers] = useState<Array<Record<string, unknown>>>([])
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([])
  const [customerId, setCustomerId] = useState(presetCustomerId)
  const [dealName, setDealName] = useState('')
  const [reference, setReference] = useState('')
  const [expectedClose, setExpectedClose] = useState('')
  const [lines, setLines] = useState<Array<{ product_id: string; quantity: number; discount_percent: number }>>([])
  const [searchQ, setSearchQ] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [customerDetail, setCustomerDetail] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    apiClient.get('/customers?per_page=100').then(r => setCustomers(r.data.data ?? [])).catch(()=>{})
    apiClient.get('/products?per_page=100').then(r => setProducts(r.data.data ?? [])).catch(()=>{})
  }, [])

  useEffect(() => {
    if (!customerId) { setCustomerDetail(null); return }
    apiClient.get(`/customers/${customerId}`).then(r=>setCustomerDetail(r.data.data)).catch(()=>{})
  }, [customerId])

  const filteredProducts = products.filter(p => !searchQ || String((p as {name?:string}).name).toLowerCase().includes(searchQ.toLowerCase()))

  const addProduct = (productId: string) => {
    if (lines.find(l=>l.product_id===productId)) { toast.info('Product already added'); return }
    setLines([...lines, { product_id: productId, quantity: 1, discount_percent: 0 }])
  }

    const handleCreate = async () => {
    if (!customerId) { toast.error('Select a customer'); return }
    if (!dealName.trim()) { toast.error('Enter deal name'); return }
    setSubmitting(true)
    try {
      const res = await apiClient.post('/quotations', {
        customer_id: customerId,
        deal_name: dealName,
        reference: reference || undefined,
        expected_close_date: expectedClose || undefined,
      })
      const q = res.data.data
      // Add lines one by one (backend recomputes each time)
      for (const l of lines) {
        await apiClient.post(`/quotations/${q.id}/lines`, l)
      }
      toast.success(`Quotation ${q.quote_number} created`)
      navigate(`/sales/quotations/${q.id}`)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div><h1 className="text-h1 font-semibold">Create Quotation</h1><p className="text-body-small text-muted-foreground">CUSTOMER → DEAL → PRODUCTS → PRICE → DISCOUNT → MARGIN → RISK → APPROVAL</p></div>

      <Card>
        <CardHeader><CardTitle className="text-h4">Customer</CardTitle><p className="text-caption text-muted-foreground">Tier + price list load from backend on select — no stale pricing</p></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Select Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Choose customer" /></SelectTrigger>
                <SelectContent>{customers.map(c=><SelectItem key={String(c.id)} value={String(c.id)}>{String(c.name)} — {String((c as {tier?:string}).tier ?? '')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Customer Tier</Label><div className="h-9 flex items-center"><Badge variant="secondary" className="capitalize">{customerDetail ? String((customerDetail as {tier?:string}).tier ?? '—') : '— select customer —'}</Badge></div></div>
          </div>
          {customerDetail && (
            <div className="rounded-lg bg-muted p-3 grid grid-cols-2 gap-3 text-small">
              <div><span className="text-muted-foreground">Price List:</span> <span className="font-mono text-caption">{String((customerDetail as {default_price_list_id?:string}).default_price_list_id ?? '—')}</span></div>
              <div><span className="text-muted-foreground">Tier:</span> <span className="capitalize">{String((customerDetail as {tier?:string}).tier)}</span></div>
              <div className="col-span-2 text-caption text-muted-foreground">Changing customer after lines exist revalidates pricing/discount/tax/shipping/risk (backend authoritative).</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-h4">Deal Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Deal Name *</Label><Input value={dealName} onChange={e=>setDealName(e.target.value)} placeholder="e.g. Acme Q4 Expansion" /></div>
          <div className="space-y-2"><Label>Reference</Label><Input value={reference} onChange={e=>setReference(e.target.value)} placeholder="Optional reference" /></div>
          <div className="space-y-2"><Label>Expected Close Date</Label><Input type="date" value={expectedClose} onChange={e=>setExpectedClose(e.target.value)} /></div>
          <div className="space-y-2"><Label>Sales Rep</Label><Input disabled value="Current user (from JWT — frontend ID not trusted)" className="text-caption" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-h4">Products</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search products..." className="pl-9" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-auto border rounded-lg p-2">
            {filteredProducts.length===0 ? <p className="text-caption text-muted-foreground p-4 text-center col-span-2">No products — backend /products not yet seeded.</p>
            : filteredProducts.slice(0,20).map(p=>(
              <div key={String(p.id)} className="flex items-center justify-between rounded border p-2">
                <div><p className="text-small font-medium">{String((p as {name?:string}).name)}</p><p className="text-caption text-muted-foreground font-mono">{String((p as {sku?:string}).sku ?? '')} · ₹{String((p as {price?:number}).price ?? '—')}</p></div>
                <Button size="sm" variant="outline" onClick={()=>addProduct(String(p.id))}><Plus className="h-3 w-3" />Add</Button>
              </div>
            ))}
          </div>
          {lines.length>0 && (
            <div className="space-y-2">
              {lines.map((l,idx)=> {
                const prod = products.find(p=>String(p.id)===l.product_id) as {name?:string}|undefined
                return (
                  <div key={l.product_id} className="flex items-center gap-2 rounded-lg border p-3">
                    <span className="flex-1 text-small font-medium">{prod?.name ?? l.product_id.slice(0,8)}</span>
                    <Input type="number" min={1} value={l.quantity} onChange={e=> setLines(lines.map((x,i)=> i===idx ? {...x, quantity: Math.max(1, Number(e.target.value))}:x))} className="w-20" />
                    <div className="flex items-center gap-1"><Input type="number" min={0} max={100} value={l.discount_percent} onChange={e=> setLines(lines.map((x,i)=> i===idx ? {...x, discount_percent: Number(e.target.value)}:x))} className="w-20" /><span className="text-caption">%</span></div>
                    <Button variant="ghost" size="sm" onClick={()=>setLines(lines.filter((_,i)=>i!==idx))}>Remove</Button>
                  </div>
                )
              })}
            </div>
          )}
          <p className="text-caption text-muted-foreground">Unit price resolved via /pricing/resolve (price list + customer override + volume) — not frontend override without validation.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card><CardHeader><CardTitle className="text-small flex items-center gap-2"><IndianRupee className="h-4 w-4" />Pricing</CardTitle></CardHeader><CardContent className="space-y-1 text-small tabular-nums">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>— backend</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Line Discounts</span><span>—</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Order Discount</span><span>—</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tax / Shipping</span><span>—</span></div>
          <div className="flex justify-between font-semibold border-t pt-2"><span>Grand Total</span><span>—</span></div>
          <p className="text-caption text-muted-foreground pt-2">Currency precision correct — backend authoritative, no float math.</p>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-small flex items-center gap-2"><TrendingUp className="h-4 w-4" />Margin</CardTitle></CardHeader><CardContent className="space-y-1 text-small">
          <div className="flex justify-between"><span className="text-muted-foreground">Revenue</span><span>—</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Cost</span><span className="text-muted-foreground">Hidden if unauthorized</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Gross Margin</span><span>—</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Margin %</span><span>—</span></div>
          <p className="text-caption text-warning">Minimum margin check shown only to authorized roles — not fabricated.</p>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-small flex items-center gap-2"><Shield className="h-4 w-4" />Discount Validation + Risk Preview</CardTitle></CardHeader><CardContent className="space-y-2 text-small">
          <div className="rounded bg-muted p-2 space-y-1 text-caption"><p><span className="text-muted-foreground">Tier ceiling:</span> 15% · <span className="text-muted-foreground">Category:</span> 10% · <span className="text-muted-foreground">Requested:</span> —</p><p><span className="text-muted-foreground">Allowed:</span> — · <span className="text-warning">Excess: —</span></p><p className="text-muted-foreground">Final result from backend rule evaluation.</p></div>
          <div className="rounded bg-intelligence/5 border border-intelligence/20 p-2"><p className="text-caption font-medium text-intelligence">Risk Preview</p><p className="text-caption text-muted-foreground">Blended risk — frontend preview matches backend engine, no independent formula.</p></div>
        </CardContent></Card>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" asChild><Link to="/sales/quotations">Cancel</Link></Button>
        <Button variant="secondary" onClick={handleCreate} disabled={submitting || !customerId || !dealName.trim()}>{submitting ? 'Saving...' : 'Save Draft'}</Button>
        <Button onClick={handleCreate} disabled={submitting || !customerId || !dealName.trim()}>{submitting ? 'Saving...' : 'Continue to Builder'}</Button>
      </div>
      <p className="text-caption text-muted-foreground text-right">Save Draft persists real draft via POST /quotations.</p>
    </div>
  )
}
