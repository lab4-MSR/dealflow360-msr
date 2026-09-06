import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  MessageSquarePlus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { Input } from '@/components/ui/input'
import { getTeamDeal, addDealCoachingNote } from '@/services/salesManager'
import type { TeamDeal } from '@/types/salesManager'
import { toast } from 'sonner'

export function TeamDealDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [deal, setDeal] = useState<TeamDeal | null>(null)
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)

  useEffect(() => {
    if (!id) return
    getTeamDeal(id)
      .then((res) => setDeal(res))
      .catch((err) => toast.error('Failed to load deal: ' + err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !noteText.trim()) return
    setSubmittingNote(true)
    try {
      const created = await addDealCoachingNote(id, noteText.trim())
      setDeal((prev) => (prev ? { ...prev, coaching_notes: [created, ...(prev.coaching_notes || [])] } : null))
      setNoteText('')
      toast.success('Coaching note added')
    } catch {
      toast.error('Failed to add coaching note')
    } finally {
      setSubmittingNote(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading deal details...</div>
  }

  if (!deal) {
    return (
      <div className="p-8 text-center">
        <p className="text-body text-danger">Deal not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/sales-manager/deals">Back to Deals</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/sales-manager/deals" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Team Pipeline</span>
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <span className="font-mono text-small text-muted-foreground">{deal.id}</span>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link to={`/sales-manager/deals/${deal.id}/timeline`}>
            <Clock className="mr-1.5 h-4 w-4" />
            View Stage Timeline
          </Link>
        </Button>
      </div>

      {/* Header Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h1 className="text-h2 font-bold text-foreground">{deal.name || deal.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-small text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {deal.customer_name || (typeof deal.customer === 'object' ? (deal.customer as any)?.name : deal.customer)}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Assigned Rep: <b className="text-foreground">{deal.rep_name || (typeof deal.rep === 'object' ? (deal.rep as any)?.name : deal.rep)}</b>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-caption uppercase text-muted-foreground block">Deal Value</span>
                <span className="text-h3 font-bold tabular-nums text-foreground">
                  ₹{Number(deal.total_value).toLocaleString()}
                </span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="space-y-1 text-right">
                <RiskBadge risk={deal.risk_level}>{deal.risk_level} Risk</RiskBadge>
                <span className="block text-caption font-semibold capitalize text-muted-foreground">
                  Stage: {deal.stage.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manager Coaching & Deal Context */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Coaching Notes */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-body font-semibold flex items-center gap-2">
                <MessageSquarePlus className="h-4 w-4 text-primary" />
                Manager Coaching Notes & Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddNote} className="flex gap-2">
                <Input
                  placeholder="Provide tactical deal guidance to sales rep..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <Button type="submit" disabled={submittingNote || !noteText.trim()}>
                  {submittingNote ? 'Saving...' : 'Add Note'}
                </Button>
              </form>

              <div className="space-y-3 pt-2">
                {(deal.coaching_notes || []).length === 0 ? (
                  <p className="text-caption text-muted-foreground italic">No coaching notes logged yet.</p>
                ) : (
                  deal.coaching_notes?.map((n) => (
                    <div key={n.id} className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
                      <div className="flex items-center justify-between text-caption text-muted-foreground">
                        <span className="font-semibold text-foreground">{n.author_name}</span>
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-body-small text-foreground">{n.text}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Stage & Health Details & Manager Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-small font-semibold">Deal Health Diagnostic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-small">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Health Status</span>
                <span className="font-semibold capitalize text-foreground">{deal.health_status}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Win Probability</span>
                <span className="font-semibold text-foreground">{deal.win_probability ?? 75}%</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Expected Close</span>
                <span className="tabular-nums text-foreground">{deal.expected_close || deal.expected_close_date || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Quotation</span>
                <Link
                  to={deal.active_quotation_id || deal.active_quote_number ? `/sales/quotations/${deal.active_quotation_id || deal.active_quote_number}` : '#'}
                  className="text-primary hover:underline font-mono"
                >
                  {deal.active_quotation_id || deal.active_quote_number || 'None'}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Manager Action & Stage Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-small font-semibold">Manager Governance Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Pipeline Stage</label>
                <select
                  value={deal.stage}
                  onChange={(e) => {
                    const newStage = e.target.value
                    setDeal((prev) => prev ? { ...prev, stage: newStage } : null)
                    toast.success(`Deal stage transitioned to ${newStage.replace(/_/g, ' ').toUpperCase()}`)
                  }}
                  className="w-full h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary capitalize"
                >
                  <option value="discovery">Discovery</option>
                  <option value="solution_proposal">Solution Proposal</option>
                  <option value="negotiation">Price Negotiation</option>
                  <option value="approval">Manager Approval</option>
                  <option value="closed_won">Closed Won</option>
                  <option value="closed_lost">Closed Lost</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Assign Representative</label>
                <select
                  value={deal.rep_name || (typeof deal.rep === 'object' ? (deal.rep as any)?.name : deal.rep) || 'Marcus Vance'}
                  onChange={(e) => {
                    const newRep = e.target.value
                    setDeal((prev) => prev ? { ...prev, rep_name: newRep } : null)
                    toast.success(`Deal reassigned to ${newRep}`)
                  }}
                  className="w-full h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Marcus Vance">Marcus Vance (North America)</option>
                  <option value="Aisha Patel">Aisha Patel (APAC Growth)</option>
                  <option value="Carlos Gomez">Carlos Gomez (EMEA)</option>
                  <option value="Elena Rostova">Elena Rostova (Mid-Market)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
