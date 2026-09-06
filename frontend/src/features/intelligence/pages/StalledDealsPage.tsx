import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  HeartPulse,
  Search,
  Clock,
  ArrowRight,
  RefreshCw,
  Send,
  AlertCircle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { intelligenceService } from '../services/intelligence.service'
import { type StalledDealItem } from '../types/intelligence'

export const StalledDealsPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [deals, setDeals] = useState<StalledDealItem[]>([])
  const [search, setSearch] = useState('')
  const [unstickMsg, setUnstickMsg] = useState<{ id: string; msg: string } | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await intelligenceService.getStalledDeals()
      setDeals(res)
    } catch (err) {
      console.error('Failed to load stalled deals', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const filtered = deals.filter(
    (d) =>
      d.deal_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.customer_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.rep_name.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const handleUnstick = (deal: StalledDealItem) => {
    setUnstickMsg({
      id: deal.deal_id,
      msg: `Dispatched AI action: "${deal.recommended_action}" to ${deal.rep_name}.`,
    })
  }

  const handleNudgeRep = (deal: StalledDealItem) => {
    setUnstickMsg({
      id: deal.deal_id,
      msg: `Nudge reminder sent to sales representative ${deal.rep_name} for ${deal.deal_name}.`,
    })
  }

  const handleEscalate = (deal: StalledDealItem) => {
    setUnstickMsg({
      id: deal.deal_id,
      msg: `Escalated ${deal.deal_name} to Sales Operations Manager for immediate review.`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Stalled Deals Queue</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Pipeline opportunities inactive beyond velocity SLA limits with AI-recommended recovery actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/intelligence/health')}
            className="text-xs"
          >
            Health Overview
          </Button>
        </div>
      </div>

      {unstickMsg && (
        <div className="p-3 bg-success-subtle text-success text-xs font-semibold rounded-lg flex items-center justify-between">
          <span>✓ {unstickMsg.msg}</span>
          <Button variant="ghost" size="sm" className="h-5 text-[11px] p-0" onClick={() => setUnstickMsg(null)}>Dismiss</Button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter stalled deals by name, customer, rep..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-xs h-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-muted border-b border-border text-muted-foreground uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Deal / Customer</th>
                    <th className="py-3 px-3">Rep</th>
                    <th className="py-3 px-3">Value</th>
                    <th className="py-3 px-3">Stage</th>
                    <th className="py-3 px-3">Stalled Days</th>
                    <th className="py-3 px-3">Reason</th>
                    <th className="py-3 px-3">Suggested Recovery</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((deal) => (
                    <tr key={deal.deal_id || deal.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/sales/deals/${deal.deal_id || deal.id}`}
                          className="font-semibold text-primary hover:underline block"
                        >
                          {deal.deal_name}
                        </Link>
                        <span className="text-[11px] text-muted-foreground">{deal.customer_name}</span>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-foreground">{deal.rep_name}</td>
                      <td className="py-3.5 px-3 font-semibold text-foreground font-numeric">
                        ₹{Number(deal.deal_value ?? deal.total_value ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge variant="outline" className="text-[10px]">{deal.stage}</Badge>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-warning font-numeric">{deal.stalled_days} days</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-foreground font-medium block">{deal.reason || deal.reason_explanation}</span>
                      </td>
                      <td className="py-3.5 px-3 max-w-xs text-muted-foreground">
                        {deal.recommended_action}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNudgeRep(deal)}
                            className="text-[11px] h-7 px-2"
                            title="Nudge representative"
                          >
                            Nudge
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEscalate(deal)}
                            className="text-[11px] h-7 px-2 text-warning hover:text-warning"
                            title="Escalate to manager"
                          >
                            Escalate
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUnstick(deal)}
                            className="bg-primary hover:bg-primary-hover text-white text-xs h-7 gap-1 px-2.5"
                          >
                            <Send className="h-3 w-3" /> Unstick
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
