import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import {
  useReportKpis,
  useSalesReport,
  useRevenueReport,
  useDiscountReport,
  useMarginReport,
  useApprovalReport,
  useFulfillmentReport,
} from '../hooks/use-business-admin'
import type { ReportFilters } from '../types'
import { toast } from 'sonner'
import {
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Tag,
  BarChart3,
  ShieldCheck,
  Truck,
  RefreshCw,
  Target,
} from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

type DateRangePreset = '7d' | '30d' | '90d' | 'mtd'

const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'mtd', label: 'Month to Date' },
]

function getDateRange(preset: DateRangePreset): { dateFrom: string; dateTo: string } {
  const now = new Date()
  switch (preset) {
    case '7d':
      return { dateFrom: format(subDays(now, 7), 'yyyy-MM-dd'), dateTo: format(now, 'yyyy-MM-dd') }
    case '30d':
      return { dateFrom: format(subDays(now, 30), 'yyyy-MM-dd'), dateTo: format(now, 'yyyy-MM-dd') }
    case '90d':
      return { dateFrom: format(subDays(now, 90), 'yyyy-MM-dd'), dateTo: format(now, 'yyyy-MM-dd') }
    case 'mtd':
      return { dateFrom: format(startOfMonth(now), 'yyyy-MM-dd'), dateTo: format(endOfMonth(now), 'yyyy-MM-dd') }
    default:
      return { dateFrom: format(subDays(now, 30), 'yyyy-MM-dd'), dateTo: format(now, 'yyyy-MM-dd') }
  }
}

function downloadCsv(filename: string, rows: string[][]) {
  const csvContent = rows.map((row) => row.map((cell) => `"${(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRangePreset>('30d')
  const [salesRep, setSalesRep] = useState('all')
  const [category, setCategory] = useState('all')
  const [activeTab, setActiveTab] = useState<'sales' | 'revenue' | 'discount' | 'margin' | 'approval' | 'fulfillment'>('sales')

  const { dateFrom, dateTo } = useMemo(() => getDateRange(dateRange), [dateRange])
  const filters: ReportFilters = useMemo(() => ({ dateFrom, dateTo, dateRange }), [dateFrom, dateTo, dateRange])

  const { data: kpis, refetch: refetchKpis } = useReportKpis(filters)
  const { data: sales, isLoading: salesLoading, refetch: refetchSales } = useSalesReport(filters)
  const { data: revenue, isLoading: revenueLoading, refetch: refetchRevenue } = useRevenueReport(filters)
  const { data: discount, isLoading: discountLoading, refetch: refetchDiscount } = useDiscountReport(filters)
  const { data: margin, isLoading: marginLoading, refetch: refetchMargin } = useMarginReport(filters)
  const { data: approval, isLoading: approvalLoading, refetch: refetchApproval } = useApprovalReport(filters)
  const { data: fulfillment, isLoading: fulfillmentLoading, refetch: refetchFulfillment } = useFulfillmentReport(filters)

  const handleRefreshAll = () => {
    refetchKpis()
    refetchSales()
    refetchRevenue()
    refetchDiscount()
    refetchMargin()
    refetchApproval()
    refetchFulfillment()
    toast.success('Report datasets refreshed')
  }

  const handleExportCsv = () => {
    switch (activeTab) {
      case 'sales': {
        const rows = [
          ['Date', 'Deals Created', 'Deals Won', 'Deals Lost', 'Revenue (INR)', 'Conversion Rate (%)'],
          ...(sales ?? []).map((s) => [s.date, String(s.dealsCreated), String(s.dealsWon), String(s.dealsLost), String(s.revenue), `${s.conversionRate}%`]),
        ]
        downloadCsv(`sales-report-${dateRange}.csv`, rows)
        break
      }
      case 'revenue': {
        const rows = [
          ['Date', 'Total Revenue (INR)', 'One-Time Revenue (INR)', 'Recurring Revenue (INR)'],
          ...(revenue ?? []).map((r) => [r.date, String(r.totalRevenue), String(r.oneTimeRevenue), String(r.recurringRevenue)]),
        ]
        downloadCsv(`revenue-report-${dateRange}.csv`, rows)
        break
      }
      case 'discount': {
        const rows = [
          ['Date', 'Discount Usage (%)', 'Discount Exceptions', 'Average Discount (%)'],
          ...(discount ?? []).map((d) => [d.date, `${d.discountUsage}%`, String(d.discountExceptions), `${d.averageDiscount}%`]),
        ]
        downloadCsv(`discount-report-${dateRange}.csv`, rows)
        break
      }
      case 'margin': {
        const rows = [
          ['Date', 'Average Margin (%)', 'Low Margin Deals (<20%)', 'High Margin Deals (>30%)'],
          ...(margin ?? []).map((m) => [m.date, `${m.averageMargin}%`, String(m.lowMarginDeals), String(m.highMarginDeals)]),
        ]
        downloadCsv(`margin-report-${dateRange}.csv`, rows)
        break
      }
      case 'approval': {
        const rows = [
          ['Date', 'Approval Volume', 'Avg Turnaround (hrs)', 'Rejections', 'Escalations'],
          ...(approval ?? []).map((a) => [a.date, String(a.approvalVolume), `${a.averageApprovalTime}h`, String(a.rejections), String(a.escalations)]),
        ]
        downloadCsv(`approval-report-${dateRange}.csv`, rows)
        break
      }
      case 'fulfillment': {
        const rows = [
          ['Date', 'Fulfillment Rate (%)', 'Backorders', 'Avg Delivery Time (days)', 'Warehouse Performance (%)'],
          ...(fulfillment ?? []).map((f) => [f.date, `${f.fulfillmentRate}%`, String(f.backorders), `${f.averageDeliveryTime}d`, `${f.warehousePerformance}%`]),
        ]
        downloadCsv(`fulfillment-report-${dateRange}.csv`, rows)
        break
      }
    }
    toast.success(`Exported ${activeTab} report to CSV`)
  }

  const handlePrintPdf = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational & Sales Reports"
        description="Comprehensive audit intelligence across deal velocity, revenue realization, margin thresholds, and multi-hub logistics."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Reports' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefreshAll} className="gap-1.5 text-xs">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrintPdf} className="gap-1.5 text-xs">
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </Button>
            <Button size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs shadow-xs">
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        }
      />

      {/* Global Filter Bar */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 items-center">
            <div>
              <label className="text-[11px] font-semibold uppercase text-muted-foreground block mb-1">
                Period Range
              </label>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangePreset)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-muted-foreground block mb-1">
                Sales Rep / Team
              </label>
              <Select value={salesRep} onValueChange={setSalesRep}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Teams & Reps</SelectItem>
                  <SelectItem value="rahul" className="text-xs">Rahul Verma (Enterprise)</SelectItem>
                  <SelectItem value="neha" className="text-xs">Neha Sharma (Strategic)</SelectItem>
                  <SelectItem value="karan" className="text-xs">Karan Patel (SMB)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-muted-foreground block mb-1">
                Product Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                  <SelectItem value="hardware" className="text-xs">Hardware & Servers</SelectItem>
                  <SelectItem value="saas" className="text-xs">SaaS & Cloud Licenses</SelectItem>
                  <SelectItem value="services" className="text-xs">Professional Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3 md:col-span-1 flex flex-col justify-end">
              <span className="text-[11px] text-muted-foreground font-mono">
                Active: {dateFrom} to {dateTo}
              </span>
              <span className="text-[11px] text-primary font-medium mt-0.5">
                Target Compliance: 94.2%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="shadow-xs">
          <CardContent className="p-3.5">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
              Total Revenue
            </span>
            <div className="text-lg sm:text-xl font-bold font-numeric text-foreground mt-1">
              ₹{Number(kpis?.totalRevenue ?? 0).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-success font-medium flex items-center gap-1 mt-0.5">
              <TrendingUp className="h-3 w-3" /> +{kpis?.revenueGrowth ?? 12}% YoY
            </span>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-3.5">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
              Conversion Rate
            </span>
            <div className="text-lg sm:text-xl font-bold font-numeric text-foreground mt-1">
              {kpis?.conversionRate ?? 0}%
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              {kpis?.wonDeals ?? 0} won of {kpis?.totalDeals ?? 0} deals
            </span>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-3.5">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
              Average Margin
            </span>
            <div className="text-lg sm:text-xl font-bold font-numeric text-foreground mt-1">
              {kpis?.averageMargin ?? 0}%
            </div>
            <span className="text-[11px] text-success font-medium block mt-0.5">
              Target: &gt; 30% margin
            </span>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-3.5">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
              Approval Turnaround
            </span>
            <div className="text-lg sm:text-xl font-bold font-numeric text-foreground mt-1">
              {kpis?.averageApprovalTime ?? 0} hrs
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              {kpis?.discountExceptions ?? 0} tier-3 escalations
            </span>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-3.5">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
              Fulfillment Rate
            </span>
            <div className="text-lg sm:text-xl font-bold font-numeric text-foreground mt-1">
              {kpis?.fulfillmentRate ?? 0}%
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Backorders: {kpis?.backorderRate ?? 0}%
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as never)}>
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 h-auto p-1 gap-1">
          <TabsTrigger value="sales" className="text-xs py-1.5 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" />
            <span>Sales Performance</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs py-1.5 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Revenue Breakdown</span>
          </TabsTrigger>
          <TabsTrigger value="discount" className="text-xs py-1.5 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            <span>Discount Variance</span>
          </TabsTrigger>
          <TabsTrigger value="margin" className="text-xs py-1.5 flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Margin Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="approval" className="text-xs py-1.5 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Approval SLAs</span>
          </TabsTrigger>
          <TabsTrigger value="fulfillment" className="text-xs py-1.5 flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            <span>Fulfillment & Split</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. Sales Performance */}
        <TabsContent value="sales" className="mt-4">
          <Card className="shadow-xs">
            <CardHeader className="py-3.5 px-4 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">Sales Pipeline & Win-Loss Velocity</CardTitle>
                <CardDescription className="text-xs">Deals initiated, closed, won, and conversion trajectory.</CardDescription>
              </div>
              <Badge variant="outline" className="text-caption font-mono">
                {sales?.length ?? 0} Reporting Cycles
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {salesLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reporting Period</TableHead>
                      <TableHead className="text-right">Created</TableHead>
                      <TableHead className="text-right">Won</TableHead>
                      <TableHead className="text-right">Lost</TableHead>
                      <TableHead className="text-right">Net Revenue</TableHead>
                      <TableHead className="text-right">Conversion Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(sales ?? []).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs font-semibold">{row.date}</TableCell>
                        <TableCell className="text-right font-numeric font-medium">{row.dealsCreated}</TableCell>
                        <TableCell className="text-right font-numeric text-success font-semibold">{row.dealsWon}</TableCell>
                        <TableCell className="text-right font-numeric text-danger font-medium">{row.dealsLost}</TableCell>
                        <TableCell className="text-right font-numeric font-bold text-foreground">
                          ₹{Number(row.revenue).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right font-numeric">
                          <Badge variant={row.conversionRate >= 65 ? 'success' : 'secondary'} className="text-xs">
                            {row.conversionRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Revenue Breakdown */}
        <TabsContent value="revenue" className="mt-4">
          <Card className="shadow-xs">
            <CardHeader className="py-3.5 px-4 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">Revenue Mix (One-Time vs Recurring)</CardTitle>
                <CardDescription className="text-xs">Realization breakdown between perpetual hardware/licenses and SaaS ARR.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {revenueLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Total Revenue</TableHead>
                      <TableHead className="text-right">One-Time / Hardware</TableHead>
                      <TableHead className="text-right">Recurring SaaS ARR</TableHead>
                      <TableHead className="text-right">Recurring %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(revenue ?? []).map((row, idx) => {
                      const recPercent = Math.round((row.recurringRevenue / (row.totalRevenue || 1)) * 100)
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs font-semibold">{row.date}</TableCell>
                          <TableCell className="text-right font-numeric font-bold text-foreground">
                            ₹{Number(row.totalRevenue).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-right font-numeric text-muted-foreground">
                            ₹{Number(row.oneTimeRevenue).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-right font-numeric text-primary font-semibold">
                            ₹{Number(row.recurringRevenue).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-right font-numeric">
                            <Badge variant="outline" className="text-xs font-mono">
                              {recPercent}% ARR
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Discount Variance */}
        <TabsContent value="discount" className="mt-4">
          <Card className="shadow-xs">
            <CardHeader className="py-3.5 px-4 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">Discount Compliance & Discretionary Drift</CardTitle>
                <CardDescription className="text-xs">Tracking standard pricing deviation and rep discretionary discounts.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {discountLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Discount Adoption Rate</TableHead>
                      <TableHead className="text-right">Approval Exceptions</TableHead>
                      <TableHead className="text-right">Average Discount %</TableHead>
                      <TableHead className="text-right">Compliance Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(discount ?? []).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs font-semibold">{row.date}</TableCell>
                        <TableCell className="text-right font-numeric">{row.discountUsage}% of deals</TableCell>
                        <TableCell className="text-right font-numeric">
                          <span className={row.discountExceptions > 0 ? 'text-warning font-bold' : 'text-muted-foreground'}>
                            {row.discountExceptions} escalated
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-numeric font-bold text-foreground">{row.averageDiscount}%</TableCell>
                        <TableCell className="text-right font-numeric">
                          <Badge variant={row.averageDiscount > 10 ? 'warning' : 'success'} className="text-xs">
                            {row.averageDiscount > 10 ? 'High Variance' : 'Within Bounds'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Margin Compliance */}
        <TabsContent value="margin" className="mt-4">
          <Card className="shadow-xs">
            <CardHeader className="py-3.5 px-4 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">Margin Threshold Compliance (&gt;30% Target)</CardTitle>
                <CardDescription className="text-xs">Deal profitability across blended line item cost basis.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {marginLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Average Blended Margin</TableHead>
                      <TableHead className="text-right">Healthy Margin Deals (&gt;30%)</TableHead>
                      <TableHead className="text-right">Low Margin Breaches (&lt;20%)</TableHead>
                      <TableHead className="text-right">Target Health</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(margin ?? []).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs font-semibold">{row.date}</TableCell>
                        <TableCell className="text-right font-numeric font-bold text-foreground">{row.averageMargin}%</TableCell>
                        <TableCell className="text-right font-numeric text-success font-medium">{row.highMarginDeals} deals</TableCell>
                        <TableCell className="text-right font-numeric">
                          <span className={row.lowMarginDeals > 0 ? 'text-danger font-bold' : 'text-muted-foreground'}>
                            {row.lowMarginDeals} breach
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-numeric">
                          <Badge variant={row.averageMargin >= 33 ? 'success' : 'warning'} className="text-xs">
                            {row.averageMargin >= 33 ? 'Above Target' : 'Review Required'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Approval SLAs */}
        <TabsContent value="approval" className="mt-4">
          <Card className="shadow-xs">
            <CardHeader className="py-3.5 px-4 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">Approval Bottlenecks & Turnaround SLAs</CardTitle>
                <CardDescription className="text-xs">Review queue velocity, rejections, and manager escalation times.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {approvalLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Approval Requests</TableHead>
                      <TableHead className="text-right">Average SLA Turnaround</TableHead>
                      <TableHead className="text-right">Rejections</TableHead>
                      <TableHead className="text-right">Escalations to L2/L3</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(approval ?? []).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs font-semibold">{row.date}</TableCell>
                        <TableCell className="text-right font-numeric font-medium">{row.approvalVolume}</TableCell>
                        <TableCell className="text-right font-numeric font-bold text-foreground">
                          {row.averageApprovalTime} hours
                        </TableCell>
                        <TableCell className="text-right font-numeric text-danger font-medium">{row.rejections}</TableCell>
                        <TableCell className="text-right font-numeric text-warning font-semibold">{row.escalations}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Fulfillment & Split-Shipments */}
        <TabsContent value="fulfillment" className="mt-4">
          <Card className="shadow-xs">
            <CardHeader className="py-3.5 px-4 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">Multi-Hub Logistics & Split-Shipment Cost Impact</CardTitle>
                <CardDescription className="text-xs">Dispatch velocity, backorder rates, and warehouse efficiency.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {fulfillmentLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Fulfillment Rate</TableHead>
                      <TableHead className="text-right">Backordered Items</TableHead>
                      <TableHead className="text-right">Average Dispatch Speed</TableHead>
                      <TableHead className="text-right">Warehouse Hub SLA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(fulfillment ?? []).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs font-semibold">{row.date}</TableCell>
                        <TableCell className="text-right font-numeric font-bold text-success">
                          {row.fulfillmentRate}%
                        </TableCell>
                        <TableCell className="text-right font-numeric">
                          <span className={row.backorders > 0 ? 'text-warning font-semibold' : 'text-muted-foreground'}>
                            {row.backorders} backorders
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-numeric font-mono text-foreground">
                          {row.averageDeliveryTime} days
                        </TableCell>
                        <TableCell className="text-right font-numeric">
                          <Badge variant="outline" className="text-xs font-mono">
                            {row.warehousePerformance}% SLA
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

