import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { DataTable, type Column } from '@/components/ui/datatable'
import { Pagination } from '@/components/ui/datatable/pagination'
import {
  useBusinessRevenueKpis,
  useBusinessRevenueTrendData,
  useBusinessRevenueBreakdown,
  useBusinessRevenueByProduct,
  useBusinessRevenueByCustomer,
  useBusinessRevenueTransactions,
} from '../hooks/use-businesses'
import type { RevenuePeriod } from '../types'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Repeat,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PIE_COLORS = [
  'var(--color-primary)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-info)',
]

const PERIOD_LABELS: Record<RevenuePeriod, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCompactCurrency(amount: number, currency: string): string {
  if (Math.abs(amount) >= 1_000_000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  }
  return formatCurrency(amount, currency)
}

function RevenueSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-7 w-[220px]" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="h-3 w-[60px] mb-2" />
            <Skeleton className="h-7 w-[80px]" />
          </div>
        ))}
      </div>
      <Card>
        <CardHeader><Skeleton className="h-5 w-[160px]" /></CardHeader>
        <CardContent><Skeleton className="h-[280px] w-full rounded-lg" /></CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-5 w-[160px]" /></CardHeader>
            <CardContent><Skeleton className="h-[220px] w-full rounded-lg" /></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-5 w-[160px]" /></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><Skeleton className="h-5 w-[160px]" /></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
  currency: string
}) {
  if (!active || !payload?.length || !label) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-elevation-2">
      <p className="text-caption font-medium text-muted-foreground mb-1.5">
        {format(parseISO(label), 'MMM d, yyyy')}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-small tabular-nums">
          <span className="text-muted-foreground">{entry.name}: </span>
          <span className="font-medium text-foreground">
            {formatCurrency(entry.value, currency)}
          </span>
        </p>
      ))}
    </div>
  )
}

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  completed: 'success',
  paid: 'success',
  pending: 'warning',
  processing: 'info',
  failed: 'danger',
  refunded: 'danger',
  cancelled: 'danger',
  draft: 'default',
}

export function BusinessRevenuePage() {
  const { id } = useParams<{ id: string }>()
  const [period, setPeriod] = useState<RevenuePeriod>('monthly')
  const [transactionPage, setTransactionPage] = useState(1)
  const perPage = 10

  const currency = 'USD'

  const { data: kpis, isLoading: isLoadingKpis, error: errorKpis, refetch: refetchKpis } =
    useBusinessRevenueKpis(id || '')
  const { data: trendData, isLoading: isLoadingTrend, error: errorTrend } =
    useBusinessRevenueTrendData(id || '', period)
  const { data: breakdown, isLoading: isLoadingBreakdown, error: errorBreakdown } =
    useBusinessRevenueBreakdown(id || '')
  const { data: byProduct, isLoading: isLoadingByProduct, error: errorByProduct } =
    useBusinessRevenueByProduct(id || '')
  const { data: byCustomer, isLoading: isLoadingByCustomer, error: errorByCustomer } =
    useBusinessRevenueByCustomer(id || '')
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: errorTransactions,
  } = useBusinessRevenueTransactions(id || '', transactionPage, perPage)

  if (isLoadingKpis) return <RevenueSkeleton />

  if (errorKpis || !kpis) {
    return (
      <ErrorState
        title="Could not load revenue data"
        description="An error occurred while fetching revenue information. Please try again."
        onRetry={() => refetchKpis()}
      />
    )
  }

  const transactions = transactionsData?.transactions ?? []
  const transactionTotal = transactionsData?.total ?? 0
  const transactionTotalPages = transactionsData?.totalPages ?? 0

  const productData = byProduct ?? []
  const customerData = byCustomer ?? []
  const breakdownData = breakdown ?? { oneTime: 0, subscription: 0, productCategory: [] }
  const trendChartData = trendData ?? []

  const pieChartData = [
    { name: 'One-Time', value: breakdownData.oneTime },
    { name: 'Subscription', value: breakdownData.subscription },
  ].filter((d) => d.value > 0)

  const productCategoryData = breakdownData.productCategory ?? []

  const transactionColumns: Column<Record<string, unknown>>[] = [
    {
      id: 'id',
      header: 'Transaction',
      accessorFn: (row) => (
        <span className="font-mono text-small text-muted-foreground">{String(row.id)}</span>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorKey: 'customer',
      className: 'text-small',
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorFn: (row) => (
        <span className="text-small font-medium tabular-nums text-right block">
          {formatCurrency(Number(row.amount), currency)}
        </span>
      ),
      headerClassName: 'text-right',
    },
    {
      id: 'type',
      header: 'Type',
      accessorFn: (row) => (
        <Badge variant="outline" className="text-caption">
          {String(row.type)}
        </Badge>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      accessorFn: (row) => (
        <span className="text-small text-muted-foreground">
          {format(parseISO(String(row.date)), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => {
        const status = String(row.status).toLowerCase()
        return (
          <Badge variant={statusVariantMap[status] ?? 'default'}>
            {String(row.status)}
          </Badge>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-foreground">Business Revenue</h1>
        <p className="text-body-small text-muted-foreground mt-1">
          Revenue analytics and financial performance
        </p>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(kpis.totalRevenue, currency)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          label="Monthly Revenue"
          value={formatCurrency(kpis.monthlyRevenue, currency)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KpiCard
          label="Recurring Revenue"
          value={formatCurrency(kpis.recurringRevenue, currency)}
          icon={<Repeat className="h-5 w-5" />}
        />
        <KpiCard
          label="One-Time Revenue"
          value={formatCurrency(kpis.oneTimeRevenue, currency)}
          icon={<Receipt className="h-5 w-5" />}
        />
        <KpiCard
          label="Growth"
          value={kpis.growth !== undefined && kpis.growth !== null ? `${kpis.growth > 0 ? '+' : ''}${kpis.growth}%` : 'N/A'}
          variant={kpis.growth !== undefined && kpis.growth !== null ? (kpis.growth >= 0 ? 'success' : 'danger') : 'default'}
          icon={<ArrowUpRight className="h-5 w-5" />}
        />
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Revenue Trend</CardTitle>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['monthly', 'quarterly', 'yearly'] as RevenuePeriod[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'rounded-none h-8 px-3 text-caption font-medium',
                  period === p
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setPeriod(p)}
              >
                {PERIOD_LABELS[p]}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingTrend ? (
            <Skeleton className="h-[280px] w-full rounded-lg" />
          ) : errorTrend ? (
            <p className="text-body-small text-muted-foreground text-center py-8">
              Failed to load trend data
            </p>
          ) : trendChartData.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val: string) => format(parseISO(val), 'MMM')}
                    tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(val: number) => formatCompactCurrency(val, currency)}
                    tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip currency={currency} />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-primary)', r: 3 }}
                    activeDot={{ r: 5 }}
                  >
                    <LabelList dataKey="revenue" position="top" formatter={(val: number) => formatCompactCurrency(val, currency)} fill="var(--color-muted-foreground)" fontSize={10} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No trend data"
              description="Revenue trend data will appear here once transactions are recorded."
            />
          )}
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* One-Time vs Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBreakdown ? (
              <Skeleton className="h-[220px] w-full rounded-lg" />
            ) : errorBreakdown ? (
              <p className="text-body-small text-muted-foreground text-center py-8">
                Failed to load breakdown
              </p>
            ) : pieChartData.length > 0 ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value, currency)}
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="No breakdown data"
                description="Revenue breakdown will appear here once data is available."
              />
            )}
          </CardContent>
        </Card>

        {/* By Product Category */}
        <Card>
          <CardHeader>
            <CardTitle>By Product Category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBreakdown ? (
              <Skeleton className="h-[220px] w-full rounded-lg" />
            ) : errorBreakdown ? (
              <p className="text-body-small text-muted-foreground text-center py-8">
                Failed to load category data
              </p>
            ) : productCategoryData.length > 0 ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productCategoryData}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(val: number) => formatCompactCurrency(val, currency)}
                      tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value, currency)}
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="var(--color-info)"
                      radius={[0, 3, 3, 0]}
                      barSize={20}
                    >
                      <LabelList dataKey="revenue" position="right" formatter={(val: number) => formatCompactCurrency(val, currency)} fill="var(--color-muted-foreground)" fontSize={10} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="No category data"
                description="Product category breakdown will appear here once data is available."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Product */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Product</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingByProduct ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : errorByProduct ? (
            <p className="text-body-small text-muted-foreground text-center py-8">
              Failed to load product data
            </p>
          ) : productData.length > 0 ? (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/50">
                    <th className="px-4 py-2.5 text-left text-caption font-medium text-muted-foreground">
                      Product
                    </th>
                    <th className="px-4 py-2.5 text-right text-caption font-medium text-muted-foreground">
                      Revenue
                    </th>
                    <th className="px-4 py-2.5 text-right text-caption font-medium text-muted-foreground">
                      Orders
                    </th>
                    <th className="px-4 py-2.5 text-right text-caption font-medium text-muted-foreground">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productData.map((item, index) => (
                    <tr
                      key={index}
                      className={cn(
                        'border-b border-border last:border-b-0',
                        'hover:bg-surface-muted/30 transition-colors'
                      )}
                    >
                      <td className="px-4 py-3 text-small font-medium text-foreground">
                        {item.product}
                      </td>
                      <td className="px-4 py-3 text-small tabular-nums text-right font-medium">
                        {formatCurrency(item.revenue, currency)}
                      </td>
                      <td className="px-4 py-3 text-small tabular-nums text-right text-muted-foreground">
                        {item.orders.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-small tabular-nums text-right text-muted-foreground">
                        {item.share}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No product data"
              description="Revenue by product will appear here once data is available."
            />
          )}
        </CardContent>
      </Card>

      {/* Revenue by Customer */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Customer</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingByCustomer ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : errorByCustomer ? (
            <p className="text-body-small text-muted-foreground text-center py-8">
              Failed to load customer data
            </p>
          ) : customerData.length > 0 ? (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/50">
                    <th className="px-4 py-2.5 text-left text-caption font-medium text-muted-foreground">
                      Customer
                    </th>
                    <th className="px-4 py-2.5 text-right text-caption font-medium text-muted-foreground">
                      Revenue
                    </th>
                    <th className="px-4 py-2.5 text-right text-caption font-medium text-muted-foreground">
                      Orders
                    </th>
                    <th className="px-4 py-2.5 text-right text-caption font-medium text-muted-foreground">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customerData.map((item, index) => (
                    <tr
                      key={index}
                      className={cn(
                        'border-b border-border last:border-b-0',
                        'hover:bg-surface-muted/30 transition-colors'
                      )}
                    >
                      <td className="px-4 py-3 text-small font-medium text-foreground">
                        {item.customer}
                      </td>
                      <td className="px-4 py-3 text-small tabular-nums text-right font-medium">
                        {formatCurrency(item.revenue, currency)}
                      </td>
                      <td className="px-4 py-3 text-small tabular-nums text-right text-muted-foreground">
                        {item.orders.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-small tabular-nums text-right text-muted-foreground">
                        {item.share}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No customer data"
              description="Revenue by customer will appear here once data is available."
            />
          )}
        </CardContent>
      </Card>

      {/* Revenue Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Revenue Transactions</CardTitle>
          {transactionTotal > 0 && (
            <Badge variant="secondary" className="text-caption">
              {transactionTotal.toLocaleString()} transactions
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : errorTransactions ? (
            <p className="text-body-small text-muted-foreground text-center py-8">
              Failed to load transactions
            </p>
          ) : transactions.length > 0 ? (
            <div className="space-y-4">
              <DataTable
                columns={transactionColumns}
                data={transactions as unknown as Record<string, unknown>[]}
              />
              {transactionTotalPages > 1 && (
                <Pagination
                  page={transactionPage}
                  totalPages={transactionTotalPages}
                  total={transactionTotal}
                  perPage={perPage}
                  onPageChange={setTransactionPage}
                />
              )}
            </div>
          ) : (
            <EmptyState
              title="No transactions"
              description="Revenue transactions will appear here once they are recorded."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
