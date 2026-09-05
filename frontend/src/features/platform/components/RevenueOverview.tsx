import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { RevenueOverview as RevenueOverviewType } from '../types'

interface RevenueOverviewProps {
  data: RevenueOverviewType
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length || !label) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-elevation-2">
      <p className="text-caption font-medium text-muted-foreground mb-1.5">
        {format(parseISO(label), 'MMM yyyy')}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-small tabular-nums">
          <span className="text-muted-foreground">{entry.name}: </span>
          <span className="font-medium text-foreground">
            {formatCurrency(entry.value, 'USD')}
          </span>
        </p>
      ))}
    </div>
  )
}

export function RevenueOverview({ data }: RevenueOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenue Overview</CardTitle>
            <p className="text-caption text-muted-foreground mt-1">Platform-wide revenue across all tenants</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-caption text-muted-foreground">Total Revenue</p>
          <p className="text-h2 tabular-nums mt-0.5">
            {formatCurrency(data.total, data.currency)}
          </p>
        </div>

        <div className="h-[220px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(val: string) => format(parseISO(val), 'MMM')}
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(val: number) => `₹${(val / 1000).toFixed(0)}K`}
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)', r: 3 }}
                activeDot={{ r: 5 }}
                animationDuration={350}
                animationEasing="ease-out"
              >
                <LabelList dataKey="revenue" position="top" formatter={(val: number) => `₹${(val / 1000).toFixed(0)}k`} fill="var(--color-muted-foreground)" fontSize={10} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-caption font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Revenue by Business
          </p>
          <div className="space-y-2.5">
            {data.byBusiness.map((biz) => {
              const percentage = (biz.revenue / data.total) * 100
              return (
                <div key={biz.businessId} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-small text-foreground truncate max-w-[200px]">
                      {biz.businessName}
                    </span>
                    <span className="text-small tabular-nums font-medium text-foreground">
                      {formatCurrency(biz.revenue, data.currency)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
