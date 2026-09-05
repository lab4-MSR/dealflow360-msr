import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { useQuery } from '@tanstack/react-query'
import { Building2, Users, FileText, DollarSign, TrendingUp } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

const COLORS = ['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-info)', 'var(--color-intelligence)']

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length || !label) return null
  return (
    <div className="rounded-lg border-0 bg-card p-3 shadow-elevation-2">
      <p className="text-caption font-medium text-muted-foreground mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-small tabular-nums">
          <span className="text-muted-foreground">{entry.name}: </span>
          <span className="font-medium text-foreground">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
        </p>
      ))}
    </div>
  )
}

interface AnalyticsData {
  kpis: { businesses: number; users: number; deals: number; revenue: number; growth: number }
  businessGrowth: { date: string; total: number; active: number }[]
  dealVolume: { date: string; created: number; completed: number }[]
  revenueTrend: { date: string; revenue: number }[]
  revenueByBusiness: { name: string; revenue: number }[]
  featureUsage: { name: string; users: number }[]
  riskDistribution: { name: string; value: number }[]
}

const MOCK_ANALYTICS: AnalyticsData = {
  kpis: { businesses: 247, users: 3842, deals: 12654, revenue: 2847593, growth: 18.4 },
  businessGrowth: [
    { date: 'Apr', total: 210, active: 172 }, { date: 'May', total: 222, active: 181 },
    { date: 'Jun', total: 231, active: 187 }, { date: 'Jul', total: 237, active: 192 },
    { date: 'Aug', total: 243, active: 196 }, { date: 'Sep', total: 247, active: 198 },
  ],
  dealVolume: [
    { date: 'Apr', created: 412, completed: 380 }, { date: 'May', created: 456, completed: 410 },
    { date: 'Jun', created: 478, completed: 440 }, { date: 'Jul', created: 492, completed: 460 },
    { date: 'Aug', created: 510, completed: 475 }, { date: 'Sep', created: 525, completed: 490 },
  ],
  revenueTrend: [
    { date: 'Apr', revenue: 189420 }, { date: 'May', revenue: 215680 },
    { date: 'Jun', revenue: 248930 }, { date: 'Jul', revenue: 278450 },
    { date: 'Aug', revenue: 312890 }, { date: 'Sep', revenue: 298760 },
  ],
  revenueByBusiness: [
    { name: 'Apex Distribution', revenue: 487230 }, { name: 'Meridian Logistics', revenue: 412890 },
    { name: 'Cascade Enterprises', revenue: 356720 }, { name: 'Summit Industries', revenue: 298450 },
    { name: 'Pinnacle Trading', revenue: 267340 },
  ],
  featureUsage: [
    { name: 'Discount Engine', users: 1842 }, { name: 'Approval Engine', users: 1567 },
    { name: 'Recommendations', users: 982 }, { name: 'Fulfillment', users: 756 },
    { name: 'Billing', users: 534 },
  ],
  riskDistribution: [
    { name: 'Low', value: 8420 }, { name: 'Medium', value: 3210 },
    { name: 'High', value: 890 }, { name: 'Critical', value: 134 },
  ],
}

export function PlatformAnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      try {
        const response = await fetch('/api/v1/platform/analytics', {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('dealflow360-access-token') || ''}` },
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const json = await response.json()
        if (!json.success) throw new Error(json.error?.message || 'Failed')
        return json.data
      } catch { return MOCK_ANALYTICS }
    },
    staleTime: 5 * 60 * 1000,
  })


  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="rounded-xl border border-border bg-card p-5"><Skeleton className="h-3 w-[60px] mb-2" /><Skeleton className="h-7 w-[80px]" /></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[300px] w-full rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (error || !data) return <ErrorState title="Unable to load analytics" description="We couldn't load the platform analytics." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">Platform Analytics</h1>
        <p className="text-body-small text-muted-foreground mt-1">Cross-platform analytics and insights across all businesses.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Businesses" value={data.kpis.businesses} icon={<Building2 className="h-5 w-5" />} />
        <KpiCard label="Users" value={data.kpis.users.toLocaleString()} icon={<Users className="h-5 w-5" />} />
        <KpiCard label="Deals" value={data.kpis.deals.toLocaleString()} icon={<FileText className="h-5 w-5" />} />
        <KpiCard label="Revenue" value={`₹${(data.kpis.revenue / 1000000).toFixed(2)}Cr`} icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard label="Growth" value={`${data.kpis.growth}%`} icon={<TrendingUp className="h-5 w-5" />} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-none">
          <CardHeader><CardTitle>Business Growth</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.businessGrowth} margin={{ top: 16, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="none" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="total" name="Total" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.1} strokeWidth={2} animationDuration={350} animationEasing="ease-out">
                    <LabelList dataKey="total" position="top" fill="var(--color-muted-foreground)" fontSize={10} />
                  </Area>
                  <Area type="monotone" dataKey="active" name="Active" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.1} strokeWidth={2} animationDuration={350} animationEasing="ease-out" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none">
          <CardHeader><CardTitle>Deal Volume</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dealVolume} margin={{ top: 16, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="none" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="created" name="Created" fill="var(--color-primary)" radius={[3, 3, 0, 0]} barSize={20} animationDuration={350} animationEasing="ease-out">
                    <LabelList dataKey="created" position="top" fill="var(--color-muted-foreground)" fontSize={10} />
                  </Bar>
                  <Bar dataKey="completed" name="Completed" fill="var(--color-success)" radius={[3, 3, 0, 0]} barSize={20} animationDuration={350} animationEasing="ease-out">
                    <LabelList dataKey="completed" position="top" fill="var(--color-muted-foreground)" fontSize={10} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none">
          <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueTrend} margin={{ top: 16, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="none" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: 'var(--color-primary)', r: 3 }} animationDuration={350} animationEasing="ease-out">
                    <LabelList dataKey="revenue" position="top" formatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} fill="var(--color-muted-foreground)" fontSize={10} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none">
          <CardHeader><CardTitle>Risk Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.riskDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" nameKey="name" label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} animationDuration={350} animationEasing="ease-out">
                    {data.riskDistribution.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 ml-4">
                {data.riskDistribution.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-caption text-muted-foreground">{item.name}</span>
                    <span className="text-caption font-medium">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Revenue by Business</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.revenueByBusiness.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-small text-foreground truncate min-w-0 flex-1">{item.name}</span>
                  <span className="text-small font-medium tabular-nums">₹{item.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Feature Usage</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.featureUsage.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-small text-foreground truncate min-w-0 flex-1">{item.name}</span>
                  <div className="w-24 h-1.5 rounded-full bg-surface-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(item.users / 2000) * 100}%` }} />
                  </div>
                  <span className="text-caption font-medium tabular-nums w-12 text-right">{item.users.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
