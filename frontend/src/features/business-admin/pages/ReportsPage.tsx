import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { ErrorState, LoadingState, MoneyDisplay, PercentageDisplay } from '@/components/shared'
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
import type {
  ReportFilters,
  SalesReportData,
  RevenueReportData,
  DiscountReportData,
  MarginReportData,
  ApprovalReportData,
  FulfillmentReportData,
} from '../types'
import { toast } from 'sonner'
import {
  Download,
  TrendingUp,
  DollarSign,
  Tag,
  BarChart3,
  ShieldCheck,
  Truck,
  Calendar,
  RefreshCw,
  FileText,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Package,
} from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

type DateRangePreset = '7d' | '30d' | '90d' | 'mtd' | 'custom'

const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'mtd', label: 'Month to Date' },
  { value: 'custom', label: 'Custom Range' },
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
  const csvContent = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
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
  const { dateFrom, dateTo } = getDateRange(dateRange)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Review performance across revenue, deals, approvals, and fulfillment."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Reports' },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>Reporting period</CardTitle>
          <CardDescription>Choose the time period used by the report dashboards.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRangePreset)}>
            <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{dateFrom} to {dateTo}</p>
        </CardContent>
      </Card>
    </div>
  )
}
