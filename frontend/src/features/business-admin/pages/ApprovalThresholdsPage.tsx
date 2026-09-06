import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useApprovalThresholds, useUpdateApprovalThresholds } from '../hooks/use-business-admin'
import { useApprovalChains } from '../hooks/use-business-admin'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/errors'
import { Save, ArrowRight, IndianRupee, Percent, AlertTriangle, BarChart, Shield, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const THRESHOLD_ICONS = {
  dealValue: IndianRupee,
  discount: Percent,
  risk: AlertTriangle,
  margin: BarChart,
}

const ROLE_OPTIONS = [
  { value: 'none', label: 'No Approval' },
  { value: 'sales_manager', label: 'Sales Manager' },
  { value: 'finance', label: 'Finance' },
  { value: 'multi_level', label: 'Multi-Level' },
]

function ThresholdRangeCard({ label, min, max, currency, unit, onMinChange, onMaxChange, index, category }: any) {
  const Icon = THRESHOLD_ICONS[category as keyof typeof THRESHOLD_ICONS] || IndianRupee
  const formatValue = (v: number | string, isMax = false) => {
    if (v === null || v === '' || v === undefined) return isMax ? '∞' : '0'
    if (category === 'dealValue') return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR' }).format(Number(v))
    return `${Number(v)}${unit || ''}`
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Min</label>
          <Input type="number" step={category === 'dealValue' ? '0.01' : '0.1'} value={min} onChange={e => onMinChange(e.target.value)} placeholder="0" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Max (empty = ∞)</label>
          <Input type="number" step={category === 'dealValue' ? '0.01' : '0.1'} value={max} onChange={e => onMaxChange(e.target.value)} placeholder="∞" />
        </div>
      </div>
      <div className="text-xs text-muted-foreground">Range: {formatValue(min)} – {formatValue(max, true)}</div>
    </div>
  )
}

function ApprovalThresholdsPage() {
  const { data: thresholds, isLoading, refetch } = useApprovalThresholds()
  const updateApprovalThresholds = useUpdateApprovalThresholds()
  const { data: chainsData } = useApprovalChains({ status: 'active' })

  const [dealValue, setDealValue] = useState<{ label: string; min: string; max: string }[]>([])
  const [discount, setDiscount] = useState<{ label: string; min: string; max: string }[]>([])
  const [risk, setRisk] = useState<{ label: string; min: string; max: string }[]>([])
  const [margin, setMargin] = useState<{ label: string; min: string; max: string }[]>([])
  const [mappings, setMappings] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  const initFromData = () => {
    if (thresholds) {
      setDealValue(thresholds.dealValue.map(d => ({ label: d.label, min: String(d.min), max: d.max === null ? '' : String(d.max) })))
      setDiscount(thresholds.discount.map(d => ({ label: d.label, min: String(d.min), max: d.max === null ? '' : String(d.max) })))
      setRisk(thresholds.risk.map(d => ({ label: d.label, min: String(d.min), max: d.max === null ? '' : String(d.max) })))
      setMargin(thresholds.margin.map(d => ({ label: d.label, min: String(d.min), max: d.max === null ? '' : String(d.max) })))
      setMappings(thresholds.mappings.map(m => ({ ...m })))
    }
  }

  useEffect(() => {
    initFromData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thresholds])

  const handleSave = async () => {
    const toNum = (v: string, fallback: number) => {
      const n = parseFloat(v)
      return Number.isFinite(n) ? n : fallback
    }
    // Basic gap/overlap validation
    const hasOverlap = (arr: { min: string; max: string }[]) => {
      const ranges = arr.map(d => ({ min: toNum(d.min, 0), max: d.max === '' ? Infinity : toNum(d.max, Infinity) }))
      for (let i = 0; i < ranges.length; i++) {
        if (ranges[i].max !== Infinity && ranges[i].min > ranges[i].max) return true
        for (let j = i + 1; j < ranges.length; j++) {
          if (ranges[i].min < ranges[j].max && ranges[j].min < ranges[i].max && !(ranges[i].max === ranges[j].min || ranges[j].max === ranges[i].min)) {
            // allow touching edges, flag real overlaps
            if (ranges[i].min < ranges[j].max && ranges[j].min < ranges[i].max && ranges[i].min !== ranges[j].max && ranges[j].min !== ranges[i].max) {
              // check strict overlap beyond touching
              const overlapStart = Math.max(ranges[i].min, ranges[j].min)
              const overlapEnd = Math.min(ranges[i].max, ranges[j].max)
              if (overlapEnd > overlapStart) return true
            }
          }
        }
      }
      return false
    }
    if (hasOverlap(dealValue) || hasOverlap(discount) || hasOverlap(risk) || hasOverlap(margin)) {
      toast.error('Overlapping or invalid ranges detected. Min must be <= Max.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        dealValue: dealValue.map((d, i) => ({ ...thresholds?.dealValue[i], min: toNum(d.min, 0), max: d.max === '' ? null : toNum(d.max, 0) })),
        discount: discount.map((d, i) => ({ ...thresholds?.discount[i], min: toNum(d.min, 0), max: d.max === '' ? null : toNum(d.max, 0) })),
        risk: risk.map((d, i) => ({ ...thresholds?.risk[i], min: toNum(d.min, 0), max: d.max === '' ? null : toNum(d.max, 0) })),
        margin: margin.map((d, i) => ({ ...thresholds?.margin[i], min: toNum(d.min, 0), max: d.max === '' ? null : toNum(d.max, 0) })),
        mappings: mappings.map((m, i) => ({ ...thresholds?.mappings[i], approverRole: m.approverRole, chainId: m.chainId === '_none' ? undefined : m.chainId })),
      }
      await updateApprovalThresholds.mutateAsync(payload)
      toast.success('Thresholds saved')
      refetch()
    } catch (err) { toast.error('Failed to save thresholds', { description: getErrorMessage(err) }) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Approval Thresholds"
        description="Configure threshold boundaries for deal value, discount, risk, and margin that drive approval routing decisions"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Approval Configuration' },
          { label: 'Approval Thresholds' },
        ]}
        actions={<Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-1.5" />{saving ? 'Saving...' : 'Save Thresholds'}</Button>}
      />

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse bg-muted" />)}</div>
      ) : (
        <>
          <Tabs defaultValue="dealValue" className="space-y-4">
            <TabsList className="flex w-full overflow-x-auto scrollbar-none sm:grid sm:grid-cols-5">
              <TabsTrigger value="dealValue">Deal Value</TabsTrigger>
              <TabsTrigger value="discount">Discount</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
              <TabsTrigger value="margin">Margin</TabsTrigger>
              <TabsTrigger value="mapping">Approval Mapping</TabsTrigger>
            </TabsList>

            <TabsContent value="dealValue" className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><IndianRupee className="h-5 w-5" />Deal Value Thresholds</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {dealValue.map((d, i) => (
                    <ThresholdRangeCard
                      key={i} label={d.label} min={d.min} max={d.max}
                      onMinChange={v => setDealValue(prev => prev.map((x, j) => j === i ? { ...x, min: v } : x))}
                      onMaxChange={v => setDealValue(prev => prev.map((x, j) => j === i ? { ...x, max: v } : x))}
                      currency="INR" category="dealValue" index={i}
                    />
                  ))}
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                    <p className="font-medium mb-1">Validation</p>
                    <p className="text-muted-foreground">Ensure no gaps between ranges. Max of one range should equal Min of the next.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discount" className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5" />Discount Thresholds</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {discount.map((d, i) => (
                    <ThresholdRangeCard
                      key={i} label={d.label} min={d.min} max={d.max}
                      onMinChange={v => setDiscount(prev => prev.map((x, j) => j === i ? { ...x, min: v } : x))}
                      onMaxChange={v => setDiscount(prev => prev.map((x, j) => j === i ? { ...x, max: v } : x))}
                      unit="%" category="discount" index={i}
                    />
                  ))}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center text-sm">
                    <div className="p-3 rounded-lg bg-success/10 border border-success/20"><p className="font-medium text-success">Safe</p><p className="text-muted-foreground">No approval needed</p></div>
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20"><p className="font-medium text-warning">Review</p><p className="text-muted-foreground">Manager review required</p></div>
                    <div className="p-3 rounded-lg bg-danger/10 border border-danger/20"><p className="font-medium text-danger">Escalation</p><p className="text-muted-foreground">Finance/multi-level</p></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risk" className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Risk Thresholds</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {risk.map((d, i) => (
                    <ThresholdRangeCard
                      key={i} label={d.label} min={d.min} max={d.max}
                      onMinChange={v => setRisk(prev => prev.map((x, j) => j === i ? { ...x, min: v } : x))}
                      onMaxChange={v => setRisk(prev => prev.map((x, j) => j === i ? { ...x, max: v } : x))}
                      category="risk" index={i}
                    />
                  ))}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center text-sm">
                    <div className="p-3 rounded-lg bg-success/10 border border-success/20"><p className="font-medium text-success">Low</p></div>
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20"><p className="font-medium text-warning">Medium</p></div>
                    <div className="p-3 rounded-lg bg-danger/10 border border-danger/20"><p className="font-medium text-danger">High</p></div>
                    <div className="p-3 rounded-lg bg-danger/10 border border-danger/20"><p className="font-medium text-danger">Critical</p></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="margin" className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5" />Margin Thresholds</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {margin.map((d, i) => (
                    <ThresholdRangeCard
                      key={i} label={d.label} min={d.min} max={d.max}
                      onMinChange={v => setMargin(prev => prev.map((x, j) => j === i ? { ...x, min: v } : x))}
                      onMaxChange={v => setMargin(prev => prev.map((x, j) => j === i ? { ...x, max: v } : x))}
                      unit="%" category="margin" index={i}
                    />
                  ))}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center text-sm">
                    <div className="p-3 rounded-lg bg-success/10 border border-success/20"><p className="font-medium text-success">Healthy</p></div>
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20"><p className="font-medium text-warning">Warning</p></div>
                    <div className="p-3 rounded-lg bg-danger/10 border border-danger/20"><p className="font-medium text-danger">Critical</p></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mapping" className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Approval Mapping</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Map each threshold level to an approver role and approval chain.</p>
                  <div className="rounded-lg border border-border overflow-x-auto">
                    <table className="w-full min-w-[550px] sm:min-w-full">
                      <thead className="bg-muted/50"><tr className="text-left text-sm text-muted-foreground"><th className="p-3">Threshold Category</th><th className="p-3">Threshold Level</th><th className="p-3">Approver Role</th><th className="p-3">Approval Chain</th></tr></thead>
                      <tbody className="divide-y divide-border">
                        {mappings.map((m, i) => (
                          <tr key={i}>
                            <td className="p-3 text-sm capitalize">{m.thresholdCategory.replace('_', ' ')}</td>
                            <td className="p-3 text-sm font-medium">{m.thresholdLabel}</td>
                            <td className="p-3">
                              <Select value={m.approverRole} onValueChange={v => setMappings(prev => prev.map((x, j) => j === i ? { ...x, approverRole: v } : x))}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
                                <SelectContent>{ROLE_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                              </Select>
                            </td>
                            <td className="p-3">
                              <Select value={m.chainId || '_none'} onValueChange={v => setMappings(prev => prev.map((x, j) => j === i ? { ...x, chainId: v === '_none' ? undefined : v } : x))}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select chain" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="_none">None (Auto)</SelectItem>
                                  {chainsData?.chains.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">THRESHOLD → APPROVER → CHAIN</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

export { ApprovalThresholdsPage }