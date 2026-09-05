import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RiskBadge } from '@/components/ui/risk-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { intelligenceService } from '../services/intelligence.service'
import { type HighRiskDealItem } from '../types/intelligence'

export const HighRiskDealsPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [deals, setDeals] = useState<HighRiskDealItem[]>([])
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'critical'>('all')

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await intelligenceService.getHighRiskDeals()
      setDeals(res)
    } catch (err) {
      console.error('Failed to load high risk deals', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.deal_name.toLowerCase().includes(search.toLowerCase()) ||
      deal.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      deal.rep_name.toLowerCase().includes(search.toLowerCase())
    const matchesRisk = riskFilter === 'all' || deal.risk_level === riskFilter
    return matchesSearch && matchesRisk
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">High & Critical Risk Deals</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Quotations flagged with composite risk scores exceeding tolerance thresholds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/intelligence/risks')}
            className="text-xs"
          >
            Risk Overview
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deals, customers, reps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={riskFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRiskFilter('all')}
            className="text-xs h-9"
          >
            All ({deals.length})
          </Button>
          <Button
            variant={riskFilter === 'high' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRiskFilter('high')}
            className="text-xs h-9"
          >
            High Risk
          </Button>
          <Button
            variant={riskFilter === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRiskFilter('critical')}
            className="text-xs h-9"
          >
            Critical
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-muted border-b border-border text-muted-foreground uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Deal / Customer</th>
                    <th className="py-3 px-3">Owner Rep</th>
                    <th className="py-3 px-3">Value (₹)</th>
                    <th className="py-3 px-3">Blended Score</th>
                    <th className="py-3 px-3">Margin %</th>
                    <th className="py-3 px-3">Primary Driver</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDeals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No deals matching criteria
                      </td>
                    </tr>
                  ) : (
                    filteredDeals.map((deal) => (
                      <tr key={deal.deal_id} className="hover:bg-surface-muted/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-foreground block">{deal.deal_name}</span>
                          <span className="text-[11px] text-muted-foreground">{deal.customer_name}</span>
                        </td>
                        <td className="py-3.5 px-3 font-medium text-foreground">{deal.rep_name}</td>
                        <td className="py-3.5 px-3 font-semibold text-foreground">
                          ₹{deal.deal_value.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-3">
                          <RiskBadge risk={deal.risk_level}>{deal.blended_score} / 100</RiskBadge>
                        </td>
                        <td className="py-3.5 px-3 font-medium text-foreground">{deal.margin_percent}%</td>
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-foreground block">{deal.primary_risk_driver}</span>
                          <span className="text-[11px] text-muted-foreground">Erosion risk</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link to={`/intelligence/risks/${deal.quotation_id}`}>
                            <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                              Inspect Risk <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
