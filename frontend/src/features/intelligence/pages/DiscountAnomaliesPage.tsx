import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertOctagon,
  RefreshCw,
  Search,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { intelligenceService } from '../services/intelligence.service'
import { type DiscountAnomalyItem } from '../types/intelligence'
import { DiscountAnomalyCard } from '../components/AnomalyCard'

export const DiscountAnomaliesPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [anomalies, setAnomalies] = useState<DiscountAnomalyItem[]>([])
  const [search, setSearch] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await intelligenceService.getDiscountAnomalies()
      setAnomalies(res)
    } catch (err) {
      console.error('Failed to load discount anomalies', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDismiss = async (id: string) => {
    await intelligenceService.dismissDiscountAnomaly(id, 'Dismissed by user')
    setAnomalies((prev) => prev.filter((a) => a.id !== id))
  }

  const filtered = anomalies.filter(
    (a) =>
      (a.deal_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.rep_name || a.sales_rep_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalErosion = anomalies.reduce((acc, a) => acc + (Number(a.margin_impact) || 0), 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Discount Anomalies</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Algorithmic detection of quotation discounts exceeding approved ceilings, policy violations, and unauthorized margin erosions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/intelligence/anomalies/delivery')}
            className="text-xs"
          >
            Delivery Slippages
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Active Discount Anomalies</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{anomalies.length}</p>
          <span className="text-[11px] text-muted-foreground">Flagged for governance review</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Total Margin Erosion at Risk</span>
          <p className="text-2xl font-bold text-danger mt-1">
            ₹{totalErosion.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-muted-foreground">Excess over approved policy</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Policy Compliance Rate</span>
          <p className="text-2xl font-bold text-success mt-1">94.8%</p>
          <span className="text-[11px] text-muted-foreground">Portfolio discount integrity</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by deal, customer, rep..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-xs h-9"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-xl text-muted-foreground">
          No active discount anomalies detected. All quotations strictly within policy ceilings.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <DiscountAnomalyCard
              key={item.id}
              item={item}
              onDismiss={handleDismiss}
              onReview={(dealId) => navigate(`/sales/deals/${dealId}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
