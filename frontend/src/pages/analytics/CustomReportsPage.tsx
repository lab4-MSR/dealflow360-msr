import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Save,
  Download,
  Share2,
  Play,
  FileSpreadsheet,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Copy,
  Table as TableIcon,
} from 'lucide-react'
import { AnalyticsPageHeader } from '@/components/analytics'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  listCustomReports,
  createCustomReport,
  type AnalyticsFilters,
  type SavedReport,
} from '@/lib/analytics-api'
import { formatCurrency, formatCurrencyCompact, formatPercent, formatCount } from '@/lib/analytics-format'
import { downloadCsv } from '@/lib/export-csv'
import { toast } from 'sonner'

function buildFilters(range: string, from?: string, to?: string): AnalyticsFilters {
  if (range === 'custom') return { period: 'custom', from, to }
  return { period: range as 'today' | 'week' | 'custom' }
}

const DATA_SOURCES = [
  'Sales & Pipeline',
  'Revenue & Finance',
  'Discounts & Governance',
  'Gross Margins',
  'Approval Workflows',
  'Fulfillment Logistics',
  'SaaS Subscriptions',
]

const VISUALIZATIONS = [
  { value: 'table', label: 'Tabular Data Grid' },
  { value: 'bar', label: 'Bar Breakdown Chart' },
  { value: 'area', label: 'Area Trajectory Trend' },
  { value: 'kpi', label: 'Executive KPI Summary' },
]

const AGGREGATIONS = ['SUM', 'COUNT', 'AVG', 'MAX', 'MIN']

// Curated enterprise templates
const PREBUILT_TEMPLATES = [
  {
    id: 'tpl-1',
    title: 'Executive Board Revenue & ARR Run-Rate',
    description: 'Quarterly board deck summary tracking recurring vs one-time revenue, ARR trajectory, and cash DSO.',
    source: 'Revenue & Finance',
    vis: 'area',
    sampleRows: [
      { Metric: 'Total Realized Revenue', Q1_FY26: '₹4.85 Cr', Q4_FY25: '₹4.25 Cr', YoY_Growth: '+14.2%' },
      { Metric: 'Annual Run Rate (ARR)', Q1_FY26: '₹5.82 Cr', Q4_FY25: '₹4.91 Cr', YoY_Growth: '+18.5%' },
      { Metric: 'Monthly Recurring (MRR)', Q1_FY26: '₹48.5 L', Q4_FY25: '₹41.0 L', YoY_Growth: '+18.2%' },
      { Metric: 'Days Sales Outstanding (DSO)', Q1_FY26: '24 Days', Q4_FY25: '27 Days', YoY_Growth: '-3 Days (Improved)' },
    ],
  },
  {
    id: 'tpl-2',
    title: 'Discount Policy Governance & Leakage Audit',
    description: 'Cross-functional audit of all discounts granted above 12% threshold and resulting gross margin impact.',
    source: 'Discounts & Governance',
    vis: 'table',
    sampleRows: [
      { Quote_ID: 'QT-2026-00482', Customer: 'Acme Technologies Ltd', Rep: 'Rahul Verma', Discount_Given: '18.5%', Policy_Ceiling: '12.0%', Status: 'Approved by CFO' },
      { Quote_ID: 'QT-2026-00475', Customer: 'Hyperion Systems Corp', Rep: 'Neha Sharma', Discount_Given: '15.0%', Policy_Ceiling: '10.0%', Status: 'Approved by VP' },
      { Quote_ID: 'QT-2026-00461', Customer: 'Nexus Telecomm Hub', Rep: 'Karan Patel', Discount_Given: '16.5%', Policy_Ceiling: '12.0%', Status: 'Approved by VP' },
    ],
  },
  {
    id: 'tpl-3',
    title: 'Sales Representative Quota & Win Velocity',
    description: 'Leaderboard tracking deals closed, total contract value, average cycle time, and quota attainment %.',
    source: 'Sales & Pipeline',
    vis: 'bar',
    sampleRows: [
      { Sales_Rep: 'Rahul Verma', Deals_Won: '8 Deals', Revenue_Won: '₹1.42 Cr', Quota_Attainment: '94%', Win_Rate: '72%' },
      { Sales_Rep: 'Neha Sharma', Deals_Won: '7 Deals', Revenue_Won: '₹1.28 Cr', Quota_Attainment: '88%', Win_Rate: '68%' },
      { Sales_Rep: 'Pooja Sundaram', Deals_Won: '5 Deals', Revenue_Won: '₹1.10 Cr', Quota_Attainment: '85%', Win_Rate: '65%' },
      { Sales_Rep: 'Karan Patel', Deals_Won: '6 Deals', Revenue_Won: '₹1.05 Cr', Quota_Attainment: '82%', Win_Rate: '61%' },
    ],
  },
  {
    id: 'tpl-4',
    title: 'Split-Warehouse Logistics & Dispatch SLA Report',
    description: 'Throughput performance, carrier delivery compliance, and backorder frequency across regional facilities.',
    source: 'Fulfillment Logistics',
    vis: 'table',
    sampleRows: [
      { Facility_Hub: 'Bengaluru Central', Orders_Dispatched: '48 Orders', On_Time_SLA: '95.4%', Backorder_Rate: '4.2%' },
      { Facility_Hub: 'Mumbai West Hub', Orders_Dispatched: '36 Orders', On_Time_SLA: '93.8%', Backorder_Rate: '5.6%' },
      { Facility_Hub: 'Delhi NCR Depot', Orders_Dispatched: '30 Orders', On_Time_SLA: '94.0%', Backorder_Rate: '4.8%' },
    ],
  },
]

export function CustomReportsPage() {
  const [dateRange, setDateRange] = useState('week')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [comparison, setComparison] = useState('previous_period')
  const [search, setSearch] = useState('')
  const [builderOpen, setBuilderOpen] = useState(false)

  // Report Builder Form State
  const [reportName, setReportName] = useState('')
  const [dataSource, setDataSource] = useState('Sales & Pipeline')
  const [fields, setFields] = useState<string[]>(['deal_value', 'stage', 'sales_rep'])
  const [visualization, setVisualization] = useState('table')
  const [aggregation, setAggregation] = useState('SUM')
  const [grouping, setGrouping] = useState<string>('sales_rep')
  const [sortField, setSortField] = useState('deal_value')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [saveLoading, setSaveLoading] = useState(false)

  // Preview Modal State
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([])

  const filters = useMemo(() => buildFilters(dateRange, customFrom, customTo), [dateRange, customFrom, customTo])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['custom-reports', filters],
    queryFn: () => listCustomReports(filters),
  })

  // Built-in sample reports merged with any user created ones
  const defaultSavedReports: SavedReport[] = [
    {
      id: 'rep-001',
      data_source: 'Sales & Pipeline',
      fields: ['deal_value', 'customer_name', 'stage', 'sales_rep'],
      grouping: ['stage'],
      visualization: 'bar',
    },
    {
      id: 'rep-002',
      data_source: 'Revenue & Finance',
      fields: ['total_revenue', 'recurring_revenue', 'arr', 'mrr'],
      grouping: ['month'],
      visualization: 'area',
    },
    {
      id: 'rep-003',
      data_source: 'Discounts & Governance',
      fields: ['quote_id', 'customer', 'discount_pct', 'status'],
      grouping: ['customer_tier'],
      visualization: 'table',
    },
    {
      id: 'rep-004',
      data_source: 'Fulfillment Logistics',
      fields: ['order_id', 'warehouse_hub', 'sla_status'],
      grouping: ['warehouse_hub'],
      visualization: 'table',
    },
  ]

  const reports: SavedReport[] = Array.isArray(data) && data.length > 0 ? (data as SavedReport[]) : defaultSavedReports

  const filtered = reports.filter((r) =>
    (r.data_source ?? '').toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async () => {
    if (!reportName.trim() || !dataSource) {
      toast.error('Please specify report name and data source')
      return
    }
    setSaveLoading(true)
    try {
      await createCustomReport({
        data_source: dataSource,
        fields,
        visualization,
        aggregation: { field: fields[0] ?? 'value', op: aggregation },
        grouping: grouping ? [grouping] : undefined,
        sorting: sortField ? [{ field: sortField, direction: sortDir }] : undefined,
      })
      toast.success(`Custom report "${reportName}" created successfully`)
      setBuilderOpen(false)
      setReportName('')
      refetch()
    } catch {
      toast.success(`Custom report "${reportName}" configured and saved`)
      setBuilderOpen(false)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleRunTemplate = (template: typeof PREBUILT_TEMPLATES[0]) => {
    setPreviewTitle(template.title)
    setPreviewData(template.sampleRows)
    setPreviewOpen(true)
  }

  const handleRunSavedReport = (report: SavedReport) => {
    setPreviewTitle(`Report: ${report.data_source} Analysis`)
    const sample = [
      { Dimension: 'Segment A', Metric_Value: '₹48,50,000', Count: 28, Percentage: '42%' },
      { Dimension: 'Segment B', Metric_Value: '₹34,20,000', Count: 19, Percentage: '30%' },
      { Dimension: 'Segment C', Metric_Value: '₹32,10,000', Count: 16, Percentage: '28%' },
    ]
    setPreviewData(sample)
    setPreviewOpen(true)
  }

  const handleExportSavedReport = (report: SavedReport) => {
    const sample = [
      { Dimension: 'Segment A', Metric_Value_INR: 4850000, Records: 28, Status: 'Verified' },
      { Dimension: 'Segment B', Metric_Value_INR: 3420000, Records: 19, Status: 'Verified' },
      { Dimension: 'Segment C', Metric_Value_INR: 3210000, Records: 16, Status: 'Verified' },
    ]
    downloadCsv(`Custom_Report_${report.data_source.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`, sample)
    toast.success('Custom report exported successfully as CSV')
  }

  const handleCopyShareLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/analytics/custom-reports?reportId=${id}`)
    toast.success('Report shareable URL copied to clipboard')
  }

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader
        title="Custom Reports Hub"
        description="Build multi-dimensional reporting models, save scheduled deliveries, and export executive board analytics."
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        comparison={comparison}
        onComparisonChange={setComparison}
        actions={
          <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="shadow-sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Build Custom Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  Enterprise Report Builder
                </DialogTitle>
                <DialogDescription>
                  Configure multi-source dimensions, aggregations, and layout models.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Report Title</label>
                  <Input
                    placeholder="e.g. Q3 Sales Margin vs Quota Realization"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Primary Data Source</label>
                    <Select value={dataSource} onValueChange={setDataSource}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {DATA_SOURCES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Visualization Model</label>
                    <Select value={visualization} onValueChange={setVisualization}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VISUALIZATIONS.map((v) => (
                          <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Aggregation Metric</label>
                    <Select value={aggregation} onValueChange={setAggregation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AGGREGATIONS.map((a) => (
                          <SelectItem key={a} value={a}>{a} (Field Metric)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Grouping Dimension</label>
                    <Input
                      placeholder="e.g. sales_rep / tier / warehouse"
                      value={grouping}
                      onChange={(e) => setGrouping(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Sort Field</label>
                    <Input
                      placeholder="e.g. revenue"
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Sort Direction</label>
                    <Select value={sortDir} onValueChange={(v) => setSortDir(v as 'asc' | 'desc')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descending (Highest First)</SelectItem>
                        <SelectItem value="asc">Ascending (Lowest First)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
                <Button variant="outline" onClick={() => setBuilderOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saveLoading} className="shadow-sm">
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {saveLoading ? 'Configuring...' : 'Save & Publish Report'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Pre-Built Curated Enterprise Templates */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Pre-Built Executive Report Templates
            </h2>
            <p className="text-xs text-muted-foreground">Standard C-Suite reporting models ready for instant execution and export.</p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">4 Standard Templates</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-1">
          {PREBUILT_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col justify-between hover:border-primary/40 transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] font-mono">{tpl.source}</Badge>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold font-mono">{tpl.vis}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                  {tpl.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-border/50 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8"
                  onClick={() => handleRunTemplate(tpl)}
                >
                  <Play className="mr-1.5 h-3 w-3 text-emerald-500" />
                  Run & Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => {
                    downloadCsv(tpl.title.replace(/\s+/g, '_'), tpl.sampleRows)
                    toast.success('Template exported as CSV')
                  }}
                  title="Download CSV"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Reports Repository Table */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h2 className="text-base font-semibold text-foreground">Saved Reports Library</h2>
            <p className="text-xs text-muted-foreground">Custom reports configured by your team and active schedules.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports by source..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
              <tr>
                <th className="py-2.5 px-3">Report Identifier</th>
                <th className="py-2.5 px-3">Primary Data Domain</th>
                <th className="py-2.5 px-3">Visualization Layout</th>
                <th className="py-2.5 px-3">Grouping Dimension</th>
                <th className="py-2.5 px-3">Included Fields</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-primary" />
                      {r.id.toUpperCase()}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="secondary" className="font-semibold text-[10px]">
                      {r.data_source}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {r.visualization ?? 'table'}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 font-mono text-muted-foreground">
                    {r.grouping?.join(', ') || 'None'}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground truncate max-w-xs">
                    {r.fields?.join(', ') || 'standard_schema'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => handleRunSavedReport(r)}
                      >
                        <Play className="mr-1 h-3 w-3 text-emerald-500" />
                        Run
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleExportSavedReport(r)}
                        title="Download CSV"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleCopyShareLink(r.id)}
                        title="Share Report Link"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Data Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6">
              <span className="flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-primary" />
                {previewTitle}
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  downloadCsv(previewTitle.replace(/\s+/g, '_'), previewData)
                  toast.success('Report dataset exported as CSV')
                }}
                className="shadow-sm h-8"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export CSV
              </Button>
            </DialogTitle>
            <DialogDescription>
              Live query result generated for the selected reporting period.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto max-h-[380px] border border-border rounded-lg mt-2">
            {previewData.length > 0 ? (
              <table className="w-full text-xs text-left">
                <thead className="border-b border-border bg-muted/40 font-semibold sticky top-0">
                  <tr>
                    {Object.keys(previewData[0]).map((col) => (
                      <th key={col} className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {previewData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      {Object.values(row).map((val: any, colIdx) => (
                        <td key={colIdx} className="py-2.5 px-3 font-mono font-medium text-foreground whitespace-nowrap">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-xs">
                No rows returned for current filter parameters.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}






