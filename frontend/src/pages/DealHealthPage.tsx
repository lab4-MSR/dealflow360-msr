import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import apiClient, { getApiErrorMessage } from '@/lib/api'
import { HeartPulse, AlertTriangle, TrendingDown, Shield, Lightbulb, Activity } from 'lucide-react'

export function DealHealthPage() {
  const { id } = useParams()
  const [health, setHealth] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    let c=false
    async function load(){ if(!id) return; setLoading(true); try{ const r=await apiClient.get(`/deals/${id}/health`); if(!c) setHealth(r.data.data)} catch(e){ if(!c) setError(getApiErrorMessage(e))} finally{ if(!c) setLoading(false)}}
    load(); return()=>{c=true}
  },[id])

  if (loading) return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>
  if (error) return <div className="rounded-xl border border-danger/20 bg-danger-subtle p-8 text-center text-danger"><AlertTriangle className="h-8 w-8 mx-auto mb-2" />{error}</div>

  const overall = Number((health as {overall_health?:number})?.overall_health ?? (health as {overall_score?:number})?.overall_score ?? 0)
  const status = String((health as {status?:string})?.status ?? (overall>=70?'healthy':overall>=40?'at_risk':'critical'))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-h1 font-semibold flex items-center gap-2"><HeartPulse className="h-6 w-6 text-intelligence" />Deal Health</h1><p className="text-body-small text-muted-foreground">Why is this deal healthy or unhealthy? — explainable, not opaque</p></div><Button variant="outline" size="sm" asChild><Link to={`/sales/deals/${id}`}>Back to Deal</Link></Button></div>

      <Card className="border-intelligence/20">
        <CardHeader><CardTitle className="text-h4">Health Score</CardTitle></CardHeader>
        <CardContent>
          {health ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4"><div className="h-20 w-20 rounded-full border-4 flex items-center justify-center text-h1 font-bold" style={{borderColor: overall>=70?'#10B981':overall>=40?'#F59E0B':'#EF4444'}}>{overall}</div><div><StatusBadge status={status as never} className="capitalize">{status.replace('_',' ')}</StatusBadge><p className="text-caption text-muted-foreground mt-1">Overall — contributors below</p></div></div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-small">
                {[
                  ['Sales Activity', (health as {sales_activity?:number}).sales_activity],
                  ['Customer Engagement', (health as {customer_engagement?:number}).customer_engagement],
                  ['Approval Progress', (health as {approval_progress?:number}).approval_progress],
                  ['Discount Risk', (health as {discount_risk?:number}).discount_risk],
                  ['Margin Health', (health as {margin_health?:number}).margin_health],
                  ['Fulfillment Health', (health as {fulfillment_health?:number}).fulfillment_health],
                ].map(([label, val])=>(
                  <div key={String(label)} className="rounded-lg border p-3"><p className="text-caption text-muted-foreground">{String(label)}</p><p className="text-h4 font-semibold tabular-nums">{val != null ? String(val) : '—'}</p><div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden"><div className="h-full bg-primary" style={{width: `${Math.min(100, Number(val ?? 0))}%`}} /></div></div>
                ))}
              </div>
              <p className="text-caption text-muted-foreground">Example: “No activity for 6 days” / “Pending for 28 hours” / “Backorder detected” — shown when backend provides breakdown.</p>
            </div>
          ) : <p className="text-body-small text-muted-foreground py-8 text-center border border-dashed rounded-lg">No health data — backend pending.</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card><CardHeader><CardTitle className="text-h4 flex items-center gap-2"><Shield className="h-4 w-4" />Risk Signals</CardTitle></CardHeader><CardContent className="space-y-3 text-small">
          {[
            ['Excess Discount','WHAT 18% requested (ceiling 10%)','WHY customer negotiation','IMPACT +3pp excess','NEXT Submit for approval'],
            ['Margin Compression','Below minimum 10% → 8.4%','WHY discount','IMPACT margin risk','NEXT Review discount'],
            ['Approval Delay','Pending 28h','WHY approver queue','IMPACT stalled','NEXT Escalate'],
          ].map(([t, ...lines])=>(
            <div key={t} className="rounded-lg border border-warning/20 bg-warning-subtle p-3"><p className="font-medium flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-warning" />{t}</p>{lines.map(l=><p key={l} className="text-caption text-muted-foreground">{l}</p>)}</div>
          ))}
          <p className="text-caption text-muted-foreground">Each signal: WHAT / WHY / IMPACT / NEXT ACTION — when backend provides.</p>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-h4 flex items-center gap-2"><TrendingDown className="h-4 w-4" />Deal Anomalies</CardTitle></CardHeader><CardContent className="space-y-2 text-small">
          {['Discount Anomaly','Pricing Anomaly','Approval Anomaly','Fulfillment Anomaly'].map(a=>(
            <div key={a} className="rounded-lg border p-3 flex items-center justify-between"><span>{a}</span><Badge variant="secondary">—</Badge></div>
          ))}
          <p className="text-caption text-muted-foreground">Not flagged as anomaly without backend logic.</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card><CardHeader><CardTitle className="text-h4 flex items-center gap-2"><Activity className="h-4 w-4" />Health Timeline</CardTitle></CardHeader><CardContent className="text-caption text-muted-foreground border border-dashed rounded-lg p-6 text-center">Score changes + triggered events + risk changes — from real history.</CardContent></Card>
        <Card className="border-intelligence/20"><CardHeader><CardTitle className="text-h4 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-intelligence" />Recommended Actions</CardTitle></CardHeader><CardContent className="space-y-2">
          {[
            ['Contact Customer','No activity for 6 days'],
            ['Review Discount','3pp above ceiling'],
            ['Escalate Approval','Pending 28h'],
            ['Adjust Fulfillment','Backorder risk'],
            ['Review Deal','Comprehensive check'],
          ].map(([title, desc])=>(
            <div key={title} className="rounded-lg border p-3 flex items-center justify-between"><div><p className="text-small font-medium">{title}</p><p className="text-caption text-muted-foreground">{desc}</p></div><Badge variant="secondary">Action</Badge></div>
          ))}
        </CardContent></Card>
      </div>
    </div>
  )
}
