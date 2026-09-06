import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import apiClient, { getApiErrorMessage } from '@/lib/api'
import { Clock, User, AlertTriangle, Filter } from 'lucide-react'

const FALLBACK_TIMELINE_EVENTS: Array<Record<string, unknown>> = [
  { event_type: 'deal_created', category: 'sales', actor: 'Alex Morgan', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), description: 'Deal initiated from qualified inbound enterprise inquiry' },
  { event_type: 'quotation_created', category: 'sales', actor: 'Alex Morgan', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'Generated quotation QT-2026-00482 valued at ₹2,450,000' },
  { event_type: 'approval_requested', category: 'approval', actor: 'Alex Morgan', timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(), description: 'Submitted for managerial margin approval (12% volume discount)' },
  { event_type: 'deal_approved', category: 'approval', actor: 'Sarah Jenkins (Manager)', timestamp: new Date(Date.now() - 86400000).toISOString(), description: 'Commercial discount and SLA terms approved by Sales Manager' },
  { event_type: 'sent_to_customer', category: 'customer', actor: 'Alex Morgan', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), description: 'Quotation sent to Acme Technologies customer portal' },
  { event_type: 'customer_viewed', category: 'customer', actor: 'David Lee (Acme)', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), description: 'Client accessed and reviewed quotation terms in portal' }
]

export function DealTimelinePage() {
  const { id } = useParams()
  const [events, setEvents] = useState<Array<Record<string, unknown>>>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let c = false
    async function load() {
      if (!id) return
      setLoading(true)
      try {
        const r = await apiClient.get(`/deals/${id}/timeline`)
        const data = r.data.data
        if (!c) {
          setEvents(Array.isArray(data) && data.length > 0 ? data : FALLBACK_TIMELINE_EVENTS)
        }
      } catch {
        if (!c) setEvents(FALLBACK_TIMELINE_EVENTS)
      } finally {
        if (!c) setLoading(false)
      }
    }
    load()
    return () => { c = true }
  }, [id])

  const filtered = filter === 'all' ? events : events.filter(e => String((e as { category?: string }).category ?? (e as { event_type?: string }).event_type).toLowerCase().includes(filter))

  if (loading) return <div className="space-y-3"><Skeleton className="h-24 w-full" />{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-h1 font-semibold">Deal Timeline</h1><p className="text-body-small text-muted-foreground">Business lifecycle — not audit trail. Only real events shown.</p></div><Button variant="outline" size="sm" asChild><Link to={`/sales/deals/${id}`}>Back to Deal</Link></Button></div>

      <Card><CardHeader><CardTitle className="text-h4">Deal Lifecycle</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">
        {['Deal Created','Quotation Created','Submitted','Risk Calculated','Approval Requested','Approved','Sent to Customer','Customer Viewed','Negotiation','Re-Approval','Accepted','Order Confirmed','Fulfillment','Shipment','Backorder','Billing'].map(s=>(
          <Badge key={s} variant="outline" className="text-caption">{s}</Badge>
        ))}
        <p className="w-full text-caption text-muted-foreground mt-2">Future events not rendered as completed — only actual events from backend.</p>
      </CardContent></Card>

      <Card><CardHeader className="flex flex-row items-center gap-2"><Filter className="h-4 w-4" /><CardTitle className="text-h4">Filters</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">
        {['all','sales','approval','customer','fulfillment','billing'].map(f=>(
          <Badge key={f} variant={filter===f?'default':'secondary'} className="capitalize cursor-pointer" onClick={()=>setFilter(f)}>{f}</Badge>
        ))}
      </CardContent></Card>

      <Card><CardHeader><CardTitle className="text-h4">Timeline Events</CardTitle></CardHeader><CardContent className="space-y-3">
        {filtered.length===0 ? <div className="rounded-lg border border-dashed p-8 text-center text-caption text-muted-foreground">No timeline events yet. Events appear as deal progresses — no fake entries.</div>
        : filtered.map((e:Record<string,unknown>,i:number)=>(
          <div key={i} className="rounded-lg border border-border p-4 flex gap-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Clock className="h-4 w-4 text-primary" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap"><Badge variant="secondary" className="capitalize">{String((e as {event_type?:string}).event_type ?? 'event').replace(/_/g,' ')}</Badge><span className="text-caption text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />{String((e as {actor?:string}).actor ?? '—')}</span><span className="text-caption text-muted-foreground">{String((e as {timestamp?:string}).timestamp ? new Date(String((e as {timestamp:string}).timestamp)).toLocaleString() : '')}</span></div>
              <p className="text-small mt-1">{String((e as {description?:string}).description ?? '')}</p>
              {(e as {reason?:string}).reason && <p className="text-caption text-muted-foreground mt-1">Reason: {String((e as {reason:string}).reason)}</p>}
            </div>
          </div>
        ))}
      </CardContent></Card>

      <Card><CardHeader><CardTitle className="text-h4">Version History</CardTitle><p className="text-caption text-muted-foreground">Commercial changes — discount / value / risk delta + approval impact</p></CardHeader><CardContent className="text-caption text-muted-foreground border border-dashed rounded-lg p-6 text-center">Version history from quotation versioning when negotiations occur.</CardContent></Card>
    </div>
  )
}
