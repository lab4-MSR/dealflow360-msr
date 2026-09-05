import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { BusinessOverview as BusinessOverviewType } from '../types'

interface BusinessOverviewProps {
  data: BusinessOverviewType
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length || !label) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-elevation-2">
      <p className="text-caption font-medium text-muted-foreground mb-1.5">
        {format(parseISO(label), 'MMM d, yyyy')}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-small tabular-nums">
          <span className="text-muted-foreground">{entry.name}: </span>
          <span className="font-medium text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

export function BusinessOverview({ data }: BusinessOverviewProps) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Business Overview</CardTitle>
            <p className="text-caption text-muted-foreground mt-1">Cross-tenant business ecosystem</p>
          </div>
          <button
            onClick={() => navigate('/platform/businesses')}
            className="text-caption text-primary hover:text-primary-hover transition-colors font-medium"
          >
            View all
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-caption text-muted-foreground">Total</span>
            <Badge variant="secondary">{data.total}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption text-muted-foreground">Active</span>
            <Badge variant="success">{data.active}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption text-muted-foreground">Suspended</span>
            <Badge variant="warning">{data.suspended}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption text-muted-foreground">Pending Setup</span>
            <Badge variant="outline">{data.pendingSetup}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption text-muted-foreground">New This Period</span>
            <Badge variant="info">{data.newThisPeriod}</Badge>
          </div>
        </div>

        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.growthTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(val: string) => format(parseISO(val), 'MMM')}
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#gradientTotal)"
              />
              <Area
                type="monotone"
                dataKey="active"
                name="Active"
                stroke="var(--color-success)"
                strokeWidth={2}
                fill="url(#gradientActive)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
