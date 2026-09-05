import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useCurrencyTax, useUpdateCurrencyTax, useAddTaxRate } from '../hooks/use-business-admin'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { CurrencyTaxConfig, TaxRate } from '../types'
import { toast } from 'sonner'
import { Save, Plus, DollarSign } from 'lucide-react'

export function CurrencyTaxPage() {
  const { data: config, isLoading, error, refetch } = useCurrencyTax()
  const updateCurrencyTax = useUpdateCurrencyTax()
  const addTaxRate = useAddTaxRate()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<Partial<CurrencyTaxConfig>>({})
  const [showAddTax, setShowAddTax] = useState(false)
  const [newTaxRate, setNewTaxRate] = useState({ name: '', rate: 0, category: 'Standard', effectiveDate: new Date().toISOString().split('T')[0] })

  useEffect(() => {
    if (config) setForm(config)
  }, [config])

  const updateField = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await updateCurrencyTax.mutateAsync(form)
      toast.success('Currency & tax settings saved')
      setIsEditing(false)
    } catch {
      toast.error('Failed to save settings')
    }
  }

  const handleAddTaxRate = async () => {
    if (!newTaxRate.name.trim()) {
      toast.error('Tax rate name is required')
      return
    }
    try {
      await addTaxRate.mutateAsync({ ...newTaxRate, status: 'active' })
      toast.success('Tax rate added')
      setShowAddTax(false)
      setNewTaxRate({ name: '', rate: 0, category: 'Standard', effectiveDate: new Date().toISOString().split('T')[0] })
    } catch {
      toast.error('Failed to add tax rate')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return <ErrorState title="Failed to load currency & tax settings" onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Currency & Tax"
        description="Configure currency and tax settings for your business."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Organization' },
          { label: 'Currency & Tax' },
        ]}
        actions={
          isEditing ? (
            <>
              <Button variant="outline" onClick={() => { if (config) setForm(config); setIsEditing(false) }} disabled={updateCurrencyTax.isPending}>Cancel</Button>
              <Button onClick={handleSave} loading={updateCurrencyTax.isPending}>
                <Save className="h-4 w-4 mr-1.5" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <DollarSign className="h-4 w-4 mr-1.5" />
              Edit Settings
            </Button>
          )
        }
      />

      {/* Currency */}
      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Default Currency</Label>
              <Select value={form.defaultCurrency || 'INR'} onValueChange={(v) => updateField('defaultCurrency', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR — Indian Rupee (₹)</SelectItem>
                  <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                  <SelectItem value="GBP">GBP — British Pound (£)</SelectItem>
                  <SelectItem value="AED">AED — UAE Dirham (د.إ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Decimal Precision</Label>
              <Select value={String(form.decimalPrecision ?? 2)} onValueChange={(v) => updateField('decimalPrecision', parseInt(v))} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3].map((n) => <SelectItem key={n} value={String(n)}>{n} digits</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tax Configuration</CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={() => setShowAddTax(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Tax Rate
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label>Tax Enabled</Label>
              <Select value={form.taxEnabled ? 'true' : 'false'} onValueChange={(v) => updateField('taxEnabled', v === 'true')} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Default Tax</Label>
              <Select value={form.defaultTax || 'GST 18%'} onValueChange={(v) => updateField('defaultTax', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {config?.taxRates.map((tr) => (
                    <SelectItem key={tr.id} value={tr.name}>{tr.name} ({tr.rate}%)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tax Inclusive / Exclusive</Label>
              <Select value={form.taxInclusive ? 'inclusive' : 'exclusive'} onValueChange={(v) => updateField('taxInclusive', v === 'inclusive')} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exclusive">Tax Exclusive (added on top)</SelectItem>
                  <SelectItem value="inclusive">Tax Inclusive (included in price)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Invoice Tax Display</Label>
              <Select value={form.invoiceTaxDisplay || 'separate'} onValueChange={(v) => updateField('invoiceTaxDisplay', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="included">Included in line item</SelectItem>
                  <SelectItem value="excluded">Excluded from line item</SelectItem>
                  <SelectItem value="separate">Separate line</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tax Rates Table */}
          <div className="mt-4">
            <h4 className="text-[13px] font-semibold text-foreground mb-3">Tax Rates</h4>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-muted">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Rate</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Effective Date</th>
                  </tr>
                </thead>
                <tbody>
                  {config?.taxRates.map((rate: TaxRate) => (
                    <tr key={rate.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-3 text-[13px] font-medium text-foreground">{rate.name}</td>
                      <td className="px-4 py-3 text-[13px] text-foreground tabular-nums">{rate.rate}%</td>
                      <td className="px-4 py-3 text-[13px] text-muted-foreground">{rate.category}</td>
                      <td className="px-4 py-3">
                        <Badge variant={rate.status === 'active' ? 'success' : 'secondary'}>{rate.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground tabular-nums">{rate.effectiveDate}</td>
                    </tr>
                  ))}
                  {(!config?.taxRates || config.taxRates.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-muted-foreground">No tax rates configured</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Tax Rate Dialog */}
      <Dialog open={showAddTax} onOpenChange={setShowAddTax}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Tax Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={newTaxRate.name} onChange={(e) => setNewTaxRate((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. GST 18%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Rate (%)</Label>
                <Input type="number" value={newTaxRate.rate} onChange={(e) => setNewTaxRate((p) => ({ ...p, rate: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={newTaxRate.category} onValueChange={(v) => setNewTaxRate((p) => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {config?.taxCategories.map((tc) => (
                      <SelectItem key={tc.id} value={tc.name}>{tc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Effective Date</Label>
              <Input type="date" value={newTaxRate.effectiveDate} onChange={(e) => setNewTaxRate((p) => ({ ...p, effectiveDate: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddTax(false)}>Cancel</Button>
              <Button onClick={handleAddTaxRate} loading={addTaxRate.isPending}>Add Rate</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
