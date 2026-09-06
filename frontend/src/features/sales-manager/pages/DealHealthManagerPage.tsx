import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Download,
  Search,
  MessageSquarePlus,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { getDealHealthData, addDealCoachingNote } from '@/services/salesManager'
import { downloadCsv } from '@/lib/export-csv'
import type { DealHealthOverview } from '@/types/salesManager'
import { toast } from 'sonner'

export function DealHealthManagerPage() {
  const [data, setData] = useState<DealHealthOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'warning'>('all')
  const [search, setSearch] = useState('')
  const [interveneDeal, setInterveneDeal] = useState<any | null>(null)
  const [coachingNote, setCoachingNote] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)

  useEffect(() => {
    getDealHealthData()
      .then((res) => setData(res))
      .catch((err) => toast.error('Failed to load health: ' + err.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredDeals = useMemo(() => {
    if (!data?.flagged_deals) return []
    return data.flagged_deals.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        d.name.toLowerCase().includes(q) ||
        d.customer_name.toLowerCase().includes(q) ||
        d.rep_name.toLowerCase().includes(q)
      )
    })
  }, [data, statusFilter, search])

  const handleExportCsv = () => {
    if (!filteredDeals.length) {
      toast.error('No flagged deals to export.')
      return
    }
    const rows = filteredDeals.map((d) => ({
      Deal_ID: d.id,
      Deal_Name: d.name,
      Customer_Name: d.customer_name,
      Representative: d.rep_name,
      Value_INR: d.value,
      Health_Status: d.status.toUpperCase(),
      Risk_Drivers: d.reasons.join('; '),
    }))
    downloadCsv(`Deal_Health_Audit_${new Date().toISOString().split('T')[0]}`, rows)
    toast.success('Deal health audit report exported as CSV!')
  }

  const handleSaveIntervention = async () => {
    if (!interveneDeal || !coachingNote.trim()) return
    setSubmittingNote(true)
    try {
      await addDealCoachingNote(interveneDeal.id, coachingNote.trim())
      toast.success(`Manager coaching note dispatched to ${interveneDeal.rep_name}!`)
      setCoachingNote('')
      setInterveneDeal(null)
    } catch {
      toast.error('Failed to record coaching note.')
    } finally {
      setSubmittingNote(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Deal Health Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Identify stalled stages, discount leakage, and deals requiring immediate management intervention.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={handleExportCsv} className="text-xs self-start sm:self-auto">
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export Health CSV
        </Button>
      </div>

      {data && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="border-success/30 bg-success-subtle/20">
            <CardContent className="p-5 space-y-1">
              <span className="text-xs uppercase font-semibold text-success">Healthy Deals</span>
              <p className="text-2xl font-bold tabular-nums text-success">{data.healthy_count}</p>
            </CardContent>
          </Card>

          <Card className="border-warning/30 bg-warning-subtle/20">
            <CardContent className="p-5 space-y-1">
              <span className="text-xs uppercase font-semibold text-warning">At-Risk Deals</span>
              <p className="text-2xl font-bold tabular-nums text-warning">{data.at_risk_count}</p>
            </CardContent>
          </Card>

          <Card className="border-danger/30 bg-danger-subtle/20">
            <CardContent className="p-5 space-y-1">
              <span className="text-xs uppercase font-semibold text-danger">Stalled Deals</span>
              <p className="text-2xl font-bold tabular-nums text-danger">{data.stalled_count}</p>
            </CardContent>
          </Card>

          <Card className="border-danger/50 bg-danger-subtle/30">
            <CardContent className="p-5 space-y-1">
              <span className="text-xs uppercase font-semibold text-danger">Critical Attention</span>
              <p className="text-2xl font-bold tabular-nums text-danger">{data.critical_count}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Flagged Deals List */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Flagged Deals Requiring Action ({filteredDeals.length})</CardTitle>
            <CardDescription className="text-xs">
              Deals exhibiting margin erosion, stage dormancy, or policy exceptions.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search deal or rep..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 bg-card">
              {(['all', 'critical', 'warning'] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={statusFilter === s ? 'default' : 'ghost'}
                  onClick={() => setStatusFilter(s)}
                  className="capitalize text-xs h-7 px-2.5"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="pb-3 font-semibold">Deal</th>
                  <th className="pb-3 font-semibold">Rep</th>
                  <th className="pb-3 text-right font-semibold">Value</th>
                  <th className="pb-3 font-semibold">Health Status</th>
                  <th className="pb-3 font-semibold">Detected Risk Drivers</th>
                  <th className="pb-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading deal health...
                    </td>
                  </tr>
                ) : filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No deals match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="py-3 font-medium">
                        <Link to={`/sales-manager/deals/${item.id}`} className="hover:text-primary transition-colors text-foreground font-semibold">
                          {item.name}
                        </Link>
                        <span className="text-[11px] text-muted-foreground block">{item.customer_name}</span>
                      </td>
                      <td className="py-3 text-muted-foreground">{item.rep_name}</td>
                      <td className="py-3 text-right tabular-nums font-semibold text-foreground">
                        ₹{Number(item.value).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={item.status === 'critical' ? 'danger' : 'warning'}
                          className="capitalize text-[11px]"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3 max-w-xs">
                        <div className="space-y-0.5">
                          {item.reasons.map((r, i) => (
                            <span key={i} className="text-[11px] text-danger block">
                              • {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setInterveneDeal(item)
                              setCoachingNote(`Attention ${item.rep_name}: Review terms on ${item.name}. ${item.reasons[0] || 'Please remediate deal margin.'}`)
                            }}
                          >
                            <MessageSquarePlus className="mr-1 h-3.5 w-3.5" />
                            Guide Rep
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                            <Link to={`/sales-manager/deals/${item.id}`}>
                              Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Intervention Guidance Modal */}
      <Dialog open={Boolean(interveneDeal)} onOpenChange={(open) => { if (!open) setInterveneDeal(null) }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Manager Intervention Guidance</span>
            </DialogTitle>
            <DialogDescription>
              Dispatch direct coaching instructions for <strong className="text-foreground">{interveneDeal?.name}</strong> to <strong className="text-foreground">{interveneDeal?.rep_name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
              <span className="text-muted-foreground font-semibold uppercase block">Detected Risk Factors:</span>
              {interveneDeal?.reasons.map((r: string, idx: number) => (
                <p key={idx} className="text-danger font-medium">• {r}</p>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Guidance / Corrective Instructions</label>
              <Textarea
                rows={4}
                value={coachingNote}
                onChange={(e) => setCoachingNote(e.target.value)}
                placeholder="Specify requirements to bring deal back into health (e.g., revise discount floor, schedule executive check-in)..."
                className="text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setInterveneDeal(null)} disabled={submittingNote}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveIntervention} disabled={submittingNote || !coachingNote.trim()}>
              {submittingNote ? 'Dispatching...' : 'Dispatch Coaching Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

