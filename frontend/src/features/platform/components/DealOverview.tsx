import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { DealOverview as DealOverviewType } from '../types'

interface DealOverviewProps {
  data: DealOverviewType
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

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null
  return (
    <div className="flex justify-center gap-4 mt-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-caption text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function DealOverview({ data }: DealOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Deal Overview</CardTitle>
            <p className="text-caption text-muted-foreground mt-1">Platform-wide deal activity</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-caption text-muted-foreground">Total</span>
            <Badge variant="secondary">{data.total.toLocaleString()}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption text-muted-foreground">Pending Approvals</span>
            <Badge variant="warning">{data.pendingApprovals}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption text-muted-foreground">High Risk</span>
            <Badge variant="danger">{data.highRisk}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption text-muted-foreground">Completed</span>
            <Badge variant="success">{data.completed.toLocaleString()}</Badge>
          </div>
        </div>

        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} style={{ background: 'transparent' }}>
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend content={<CustomLegend />} />
              <Bar
                dataKey="created"
                name="Created"
                fill="var(--color-primary)"
                radius={[3, 3, 0, 0]}
                barSize={16}
                animationDuration={350}
                animationEasing="ease-out"
              />
              <Bar
                dataKey="completed"
                name="Completed"
                fill="var(--color-success)"
                radius={[3, 3, 0, 0]}
                barSize={16}
                animationDuration={350}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
