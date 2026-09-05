import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/ui/kpi-card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBusinessActivity } from '../hooks/use-businesses'
import { useState, useEffect, useRef, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import {
  Search,
  X,
  Users,
  FileText,
  Settings,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityFilters {
  search: string
  type: string
  user: string
}

function timeAgo(timestamp: string): string {
  const now = new Date()
  const then = parseISO(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return format(then, 'MMM d')
}

const activityTypeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  user: { icon: Users, color: 'text-info' },
  deal: { icon: FileText, color: 'text-success' },
  configuration: { icon: Settings, color: 'text-warning' },
}

export function BusinessActivityPage() {
  const { id } = useParams<{ id: string }>()
  const { data: activities, isLoading, error, refetch } = useBusinessActivity(id || '')
  const [filters, setFilters] = useState<ActivityFilters>({ search: '', type: '', user: '' })
  const [searchInput, setSearchInput] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedSearch = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }))
    }, 300)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const filteredActivities = (activities || []).filter((a) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!a.actor.toLowerCase().includes(q) && !a.action.toLowerCase().includes(q) && !a.target.toLowerCase().includes(q)) return false
    }
    if (filters.type && a.type !== filters.type) return false
    if (filters.user && !a.actor.toLowerCase().includes(filters.user.toLowerCase())) return false
    return true
  })

  const totalActivities = activities?.length || 0
  const userActions = activities?.filter((a) => a.type === 'user').length || 0
  const dealActions = activities?.filter((a) => a.type === 'deal').length || 0
  const systemActions = activities?.filter((a) => a.type === 'configuration').length || 0

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-3 w-[60px] mb-2" />
              <Skeleton className="h-7 w-[40px]" />
            </div>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (error) {
    return <ErrorState title="Unable to load activity" description="We couldn't load the activity feed for this business." onRetry={() => refetch()} />
  }

  return (
    <div className="space-y-6">
      {/* Activity Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Activities" value={totalActivities} icon={<Clock className="h-5 w-5" />} />
        <KpiCard label="User Actions" value={userActions} icon={<Users className="h-5 w-5" />} variant="info" />
        <KpiCard label="Deal Actions" value={dealActions} icon={<FileText className="h-5 w-5" />} variant="success" />
        <KpiCard label="System Actions" value={systemActions} icon={<Settings className="h-5 w-5" />} variant="warning" />
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activity..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  debouncedSearch(e.target.value)
                }}
                className="pl-9"
              />
            </div>
            <Select value={filters.type || 'all'} onValueChange={(v) => setFilters((p) => ({ ...p, type: v === 'all' ? '' : v }))}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="deal">Deal</SelectItem>
                <SelectItem value="configuration">Configuration</SelectItem>
              </SelectContent>
            </Select>
            {(filters.search || filters.type || filters.user) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilters({ search: '', type: '', user: '' }); setSearchInput('') }} className="gap-1.5">
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <EmptyState
              title="No activity found"
              description={filters.search || filters.type ? 'No activity matches your current filters.' : 'No activity has been recorded for this business yet.'}
            />
          ) : (
            <div className="space-y-0">
              {filteredActivities.map((item, index) => {
                const config = activityTypeConfig[item.type] || activityTypeConfig.user
                const Icon = config.icon
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-start gap-4 py-4 group',
                      index < filteredActivities.length - 1 && 'border-b border-border'
                    )}
                  >
                    <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted', config.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-small font-medium text-foreground">{item.actor}</span>
                        <span className="text-small text-muted-foreground">{item.action}</span>
                        <span className="text-small font-medium text-foreground">{item.target}</span>
                      </div>
                      <span className="text-caption text-muted-foreground mt-0.5 block">
                        {timeAgo(item.timestamp)}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2" />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
