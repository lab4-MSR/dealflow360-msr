import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Search, Filter, ArrowRight, TrendingUp, AlertCircle, Shield, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { getTeamDeals } from '@/services/salesManager'
import { downloadCsv } from '@/lib/export-csv'
import type { TeamDeal } from '@/types/salesManager'
import { toast } from 'sonner'

export function TeamDealListPage() {
  const [deals, setDeals] = useState<TeamDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('all')

  useEffect(() => {
    getTeamDeals()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : (res?.deals || [])
        setDeals(list)
      })
      .catch((err) => toast.error('Failed to load team deals: ' + err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = deals.filter((d) => {
    if (stageFilter !== 'all' && d.stage !== stageFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    const dealName = (d.title || d.name || '').toLowerCase()
    const custName = (d.customer_name || (typeof d.customer === 'object' ? (d.customer as any)?.name : d.customer) || '').toLowerCase()
    const repName = (d.rep_name || (typeof d.rep === 'object' ? (d.rep as any)?.name : d.rep) || '').toLowerCase()
    return dealName.includes(q) || custName.includes(q) || repName.includes(q)
  })

  const handleExportCsv = () => {
    if (!filtered.length) {
      toast.error('No deals to export.')
      return
    }
    const rows = filtered.map((d) => ({
      Deal_ID: d.id,
      Deal_Name: d.name || d.title,
      Customer_Name: d.customer_name || (typeof d.customer === 'object' ? (d.customer as any)?.name : d.customer),
      Representative: d.rep_name || (typeof d.rep === 'object' ? (d.rep as any)?.name : d.rep),
      Stage: d.stage,
      Total_Value_INR: Number(d.total_value ?? d.deal_value ?? 0),
      Risk_Level: d.risk_level,
      Health_Status: d.health_status,
      Expected_Close: d.expected_close || d.expected_close_date || '',
    }))
    downloadCsv(`Team_Pipeline_${stageFilter}_${new Date().toISOString().split('T')[0]}`, rows)
    toast.success('Team deals exported as CSV!')
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Team Pipeline & Deals"
        description="Complete managerial oversight over active team opportunities, risks, and stage velocity."
        breadcrumbs={[
          { label: 'Sales Manager', href: '/sales-manager' },
          { label: 'Deals' },
        ]}
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            Manager Oversight
          </span>
        }
        actions={
          <Button size="sm" variant="outline" onClick={handleExportCsv} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            <span>Export Pipeline CSV</span>
          </Button>
        }
      />

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deal name, customer, rep..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['all', 'discovery', 'proposal', 'negotiation', 'approval', 'closed_won'].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={stageFilter === s ? 'default' : 'outline'}
                onClick={() => setStageFilter(s)}
                className="capitalize"
              >
                {s.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-body font-semibold">Active Deals ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border text-caption text-muted-foreground">
                <tr>
                  <th className="pb-3 font-medium">Deal Name</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Rep</th>
                  <th className="pb-3 font-medium">Stage</th>
                  <th className="pb-3 text-right font-medium">Value</th>
                  <th className="pb-3 text-center font-medium">Risk</th>
                  <th className="pb-3 text-center font-medium">Health</th>
                  <th className="pb-3 text-right font-medium">Close Date</th>
                  <th className="pb-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      Loading team deals...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      No deals found matching filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((deal) => (
                    <tr key={deal.id} className="hover:bg-muted/30">
                      <td className="py-3 font-medium">
                        <Link
                          to={`/sales-manager/deals/${deal.id}`}
                          className="text-foreground hover:text-primary transition-colors block"
                        >
                          {deal.name || deal.title}
                        </Link>
                        <span className="text-caption text-muted-foreground font-mono">{deal.id}</span>
                      </td>
                      <td className="py-3">
                        {deal.customer_name || (typeof deal.customer === 'object' ? (deal.customer as any)?.name : deal.customer)}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {deal.rep_name || (typeof deal.rep === 'object' ? (deal.rep as any)?.name : deal.rep)}
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className="capitalize">
                          {deal.stage.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 text-right tabular-nums font-semibold">
                        ₹{Number(deal.total_value ?? deal.deal_value ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        <RiskBadge risk={deal.risk_level}>{deal.risk_level}</RiskBadge>
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-caption font-semibold capitalize ${
                            deal.health_status === 'healthy'
                              ? 'bg-success-subtle text-success'
                              : deal.health_status === 'critical'
                              ? 'bg-danger-subtle text-danger'
                              : 'bg-warning-subtle text-warning'
                          }`}
                        >
                          {deal.health_status}
                        </span>
                      </td>
                      <td className="py-3 text-right tabular-nums text-caption text-muted-foreground">
                        {deal.expected_close || deal.expected_close_date || '—'}
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/sales-manager/deals/${deal.id}`}>
                            Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
