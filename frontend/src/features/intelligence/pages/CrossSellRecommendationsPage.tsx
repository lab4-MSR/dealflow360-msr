import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, Sparkles, Search, RefreshCw, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { intelligenceService } from '../services/intelligence.service'
import { type RecommendationItem } from '../types/intelligence'
import { RecommendationCard } from '../components/RecommendationCard'

export const CrossSellRecommendationsPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [search, setSearch] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await intelligenceService.getCrossSellRecommendations()
      setRecommendations(res)
    } catch (err) {
      console.error('Failed to load cross-sell recommendations', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = recommendations.filter((r) =>
    r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    r.recommended_product.toLowerCase().includes(search.toLowerCase())
  )

  const totalUplift = recommendations.reduce((sum, r) => sum + r.potential_revenue_uplift, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600">
              <Layers className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Cross-Sell Bundles</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Complementary add-on modules, premium service tier attachments, and hardware-software affinities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/intelligence/recommendations/upsell')}
            className="text-xs"
          >
            Upsell Engine
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Cross-Sell Pipeline Uplift</span>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-400 mt-1">
            ₹{totalUplift.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-muted-foreground">High-margin add-ons</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Avg Affinity Score</span>
          <p className="text-2xl font-bold text-foreground mt-1">88%</p>
          <span className="text-[11px] text-success">Pattern affinity match</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Margin Expansion</span>
          <p className="text-2xl font-bold text-success mt-1">+3.8%</p>
          <span className="text-[11px] text-muted-foreground">Service margin uplift</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by customer or add-on product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-xs h-9"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onViewDetails={(id) => navigate(`/intelligence/recommendations/${id}`)}
              onApply={(id) => navigate(`/sales/quotations/${rec.quotation_id}`)}
              onDismiss={(id) => setRecommendations((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
