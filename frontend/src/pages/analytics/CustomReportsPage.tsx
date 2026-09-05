import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Save, Download, Share2 } from 'lucide-react'
import { AnalyticsPageHeader, AnalyticsSection } from '@/components/analytics'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { listCustomReports, createCustomReport, exportCustomReport, type AnalyticsFilters, type SavedReport } from '@/lib/analytics-api'


function buildFilters(range: string, from?: string, to?: string): AnalyticsFilters {
  if (range === 'custom') return { period: 'custom', from, to }
  return { period: range as 'today' | 'week' | 'custom' }
}

const DATA_SOURCES = ['Sales', 'Revenue', 'Discounts', 'Margin', 'Approvals', 'Fulfillment', 'Subscriptions']
const VISUALIZATIONS = ['table', 'bar', 'line', 'area', 'kpi']
const AGGREGATIONS = ['SUM', 'COUNT', 'AVG']

export function CustomReportsPage() {
  const [dateRange, setDateRange] = useState('week')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [comparison, setComparison] = useState('previous_period')
  const [search, setSearch] = useState('')
  const [builderOpen, setBuilderOpen] = useState(false)
  const [reportName, setReportName] = useState('')
  const [dataSource, setDataSource] = useState('')
  const [fields, setFields] = useState<string[]>([])
  const [visualization, setVisualization] = useState('table')
  const [aggregation, setAggregation] = useState('COUNT')
  const [grouping, setGrouping] = useState<string>('')
  const [sortField, setSortField] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [saveLoading, setSaveLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  const filters = useMemo(() => buildFilters(dateRange, customFrom, customTo), [dateRange, customFrom, customTo])
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['custom-reports', filters], queryFn: () => listCustomReports(filters) })
  const reports = (data ?? []) as SavedReport[]
  const filtered = reports.filter(r => (r.data_source ?? '').toLowerCase().includes(search.toLowerCase()))

  async function handleSave() {
    if (!dataSource || fields.length === 0) return
    setSaveLoading(true)
    try {
      await createCustomReport({ data_source: dataSource, fields, visualization, aggregation: { field: fields[0] ?? '', op: aggregation }, grouping: grouping ? [grouping] : undefined, sorting: sortField ? [{ field: sortField, direction: sortDir }] : undefined })
      setBuilderOpen(false)
      refetch()
    } finally { setSaveLoading(false) }
  }

  async function handleExport(id: string) {
    setExportLoading(true)
    try {
      const result = await exportCustomReport(id, { format: 'xlsx' })
      if (result.download_url) window.open(result.download_url, '_blank')
    } finally { setExportLoading(false) }
  }

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader title="Custom Reports" description="Build, save, and share custom analytics reports." dateRange={dateRange} onDateRangeChange={setDateRange} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} comparison={comparison} onComparisonChange={setComparison} actions={<Dialog open={builderOpen} onOpenChange={setBuilderOpen}><DialogTrigger asChild><Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Create Report</Button></DialogTrigger><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Report Builder</DialogTitle></DialogHeader><div className="space-y-4">
        <div><label className="text-xs text-muted-foreground">Data Source</label><Select value={dataSource} onValueChange={setDataSource}><SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger><SelectContent>{DATA_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
        <div><label className="text-xs text-muted-foreground">Fields</label><Input placeholder="Add fields (comma-separated)" onChange={e => setFields(e.target.value.split(',').map(f => f.trim()).filter(Boolean))} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs text-muted-foreground">Visualization</label><Select value={visualization} onValueChange={setVisualization}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{VISUALIZATIONS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="text-xs text-muted-foreground">Aggregation</label><Select value={aggregation} onValueChange={setAggregation}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AGGREGATIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs text-muted-foreground">Group By</label><Input placeholder="e.g. month" value={grouping} onChange={e => setGrouping(e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">Sort</label><div className="flex gap-2"><Input placeholder="Field" value={sortField} onChange={e => setSortField(e.target.value)} /><Select value={sortDir} onValueChange={v => setSortDir(v as 'asc' | 'desc')}><SelectTrigger className="w-24"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="asc">Asc</SelectItem><SelectItem value="desc">Desc</SelectItem></SelectContent></Select></div></div>
        </div>
        <div><label className="text-xs text-muted-foreground">Report Name</label><Input placeholder="My Report" value={reportName} onChange={e => setReportName(e.target.value)} /></div>
      </div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setBuilderOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={saveLoading || !dataSource || fields.length === 0}><Save className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />{saveLoading ? 'Saving...' : 'Save'}</Button></div></DialogContent></Dialog>} />
      <div className="flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" /><Input placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" /></div>
      <AnalyticsSection title="Saved Reports" description="Your saved custom reports." isLoading={isLoading} isEmpty={!isLoading && filtered.length === 0} emptyTitle="No saved reports yet" emptyDescription="Create your first custom report to see it here." error={error} onRetry={() => refetch()}>
        <Table>
          <TableHeader><TableRow><TableHead>Report Name</TableHead><TableHead>Data Source</TableHead><TableHead>Visualization</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>{filtered.map(r => (<TableRow key={r.id}><TableCell className="font-medium">{r.data_source ?? 'Untitled Report'}</TableCell><TableCell>{r.data_source}</TableCell><TableCell><Badge variant="outline">{r.visualization ?? 'table'}</Badge></TableCell><TableCell><div className="flex items-center gap-1"><Button variant="ghost" size="sm" onClick={() => handleExport(r.id)} disabled={exportLoading}><Download className="h-3.5 w-3.5" aria-hidden="true" /></Button><Button variant="ghost" size="sm" disabled title="Sharing not available"><Share2 className="h-3.5 w-3.5" aria-hidden="true" /></Button></div></TableCell></TableRow>))}</TableBody>
        </Table>
      </AnalyticsSection>
    </div>
  )
}





