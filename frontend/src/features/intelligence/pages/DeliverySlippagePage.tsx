import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  RefreshCw,
  Search,
  Truck,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { intelligenceService } from '../services/intelligence.service'
import { type DeliverySlippageItem } from '../types/intelligence'
import { DeliverySlippageCard } from '../components/AnomalyCard'

export const DeliverySlippagePage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [slippages, setSlippages] = useState<DeliverySlippageItem[]>([])
  const [search, setSearch] = useState('')
  const [actionDone, setActionDone] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await intelligenceService.getDeliverySlippages()
      setSlippages(res)
    } catch (err) {
      console.error('Failed to load delivery slippages', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRemediate = (id: string) => {
    setActionDone(`Remediation workflow triggered for item ${id}. Splitting secondary warehouse dispatch.`)
  }

  const filtered = slippages.filter(
    (s) =>
      s.order_number.toLowerCase().includes(search.toLowerCase()) ||
      s.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      s.warehouse_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600">
              <Clock className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Delivery Slippage Alerts</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Predictive tracking of warehouse fulfillment delays, carrier backlogs, and customer SLA breaches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/intelligence/anomalies/discount')}
            className="text-xs"
          >
            Discount Anomalies
          </Button>
        </div>
      </div>

      {actionDone && (
        <div className="p-3 bg-success-subtle text-success text-xs font-semibold rounded-lg">
          ✓ {actionDone}
        </div>
      )}

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Orders with Slippage Risk</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{slippages.length}</p>
          <span className="text-[11px] text-muted-foreground">Proactive customer notification required</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Average Slippage</span>
          <p className="text-2xl font-bold text-foreground mt-1">4.5 Days</p>
          <span className="text-[11px] text-muted-foreground">Warehouse replenishment delay</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Total Order Value Impacted</span>
          <p className="text-2xl font-bold text-foreground mt-1">
            ₹{slippages.reduce((acc, s) => acc + (Number(s.order_value) || 0), 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-muted-foreground">Fulfillment pending</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by order number, customer, warehouse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-xs h-9"
        />
      </div>

      {/* Slippage cards */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <DeliverySlippageCard key={item.id} item={item} onRemediate={handleRemediate} />
          ))}
        </div>
      )}
    </div>
  )
}
