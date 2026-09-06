import React, { useEffect, useState } from 'react'
import {
  Sparkles,
  RefreshCw,
  Filter,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { intelligenceService } from '../services/intelligence.service'
import { type DecisionInsightItem } from '../types/intelligence'
import { InsightCard } from '../components/InsightCard'

export const DecisionInsightsPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<DecisionInsightItem[]>([])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [actionDone, setActionDone] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await intelligenceService.getInsights()
      setInsights(res)
    } catch (err) {
      console.error('Failed to load insights', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAction = async (id: string, action: string) => {
    await intelligenceService.actionInsight(id, action)
    if (action === 'dismiss') {
      setInsights((prev) => prev.filter((i) => i.id !== id))
      setActionDone('Insight dismissed from active feed.')
    } else {
      setActionDone(`Executed action '${action}' on insight.`)
    }
  }

  const filtered = insights.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || (item.category || '').toLowerCase() === categoryFilter.toLowerCase()
    const matchesSearch =
      (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.explanation?.what || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.explanation?.why || '').toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Zap className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Decision Insights Feed</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Actionable intelligence synthesis across revenue, margin, delivery, and governance with strict WHAT, WHY, IMPACT, WHO, and NEXT ACTION transparency.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Feed
          </Button>
        </div>
      </div>

      {actionDone && (
        <div className="p-3 bg-success-subtle text-success text-xs font-semibold rounded-lg">
          ✓ {actionDone}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search insights by title, situation, or cause..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'pricing', 'margin', 'fulfillment', 'pipeline'].map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
              className="text-xs capitalize h-9"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-xl text-muted-foreground">
          No insights matching criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <InsightCard key={item.id} insight={item} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  )
}
