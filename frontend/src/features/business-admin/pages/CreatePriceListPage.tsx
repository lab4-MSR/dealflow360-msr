import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useCreatePriceList, useProducts, useCustomers } from '../hooks/use-business-admin'
import type { Product } from '../types'
import { toast } from 'sonner'
import { ArrowLeft, Save, Plus, Trash2, Search } from 'lucide-react'
import { parseISO, isValid } from 'date-fns'
import { cn } from '@/lib/utils'
import { MoneyDisplay } from '@/components/shared'
import { EmptyState } from '@/components/ui/empty-state'

interface PricingRuleItem {
  productId: string
  productName: string
  productSku: string
  basePrice: number
  sellingPrice: string
  percentageAdjustment: number
}

interface FormState {
  name: string
  description: string
  currency: string
  customerSegment: string
  effectiveFrom: string
  effectiveUntil: string
  pricingRules: PricingRuleItem[]
  customerTier: string
  selectedCustomerIds: string[]
}

const INPUT_CLASS = 'flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function CreatePriceListPage() {
  const navigate = useNavigate()
  const createPriceList = useCreatePriceList()
  const [productSearch, setProductSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')

  const { data: productData } = useProducts({ search: productSearch, status: 'active', page: 1, perPage: 50 })
  const { data: customerData } = useCustomers({ page: 1, perPage: 100 })

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    currency: 'INR',
    customerSegment: 'all',
    effectiveFrom: '',
    effectiveUntil: '',
    pricingRules: [],
    customerTier: '',
    selectedCustomerIds: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const dateError = useMemo(() => {
    if (form.effectiveFrom && form.effectiveUntil) {
      try {
        const from = parseISO(form.effectiveFrom)
        const until = parseISO(form.effectiveUntil)
        if (!isValid(from) || !isValid(until)) return null
        if (until <= from) {
          return 'End date must be after start date'
        }
      } catch {
        return null
      }
    }
    return null
  }, [form.effectiveFrom, form.effectiveUntil])

  const products = useMemo(() => {
    return (productData?.products || []) as unknown as Product[]
  }, [productData])

  const filteredCustomers = useMemo(() => {
    const apiCustomers = ((customerData as unknown as { customers?: Array<{ id: string; name: string; tier?: string }> })?.customers || []).map((c) => ({
      id: c.id,
      name: c.name,
      tier: c.tier || '—',
    }))
    const customers = apiCustomers.length > 0 ? apiCustomers : [
      { id: 'cust-1', name: 'Acme Corp', tier: 'Gold' },
      { id: 'cust-2', name: 'TechStart Inc', tier: 'Silver' },
      { id: 'cust-3', name: 'Global Enterprises', tier: 'Platinum' },
      { id: 'cust-4', name: 'Small Business Co', tier: 'Bronze' },
    ]
    if (!customerSearch) return customers
    return customers.filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
  }, [customerSearch, customerData])

  const updateField = (field: keyof FormState, value: string | string[] | PricingRuleItem[]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const addProductToRules = (product: Product) => {
    if (form.pricingRules.some((r) => r.productId === product.id)) {
      toast.error('Product already added')
      return
    }
    const newItem: PricingRuleItem = {
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      basePrice: product.unitPrice,
      sellingPrice: product.unitPrice.toString(),
      percentageAdjustment: 0,
    }
    updateField('pricingRules', [...form.pricingRules, newItem])
    setProductSearch('')
  }

  const updatePricingRule = (productId: string, field: 'sellingPrice', value: string) => {
    const rules = form.pricingRules.map((r) => {
      if (r.productId !== productId) return r
      const updated = { ...r, [field]: value }
      const base = r.basePrice
      const selling = parseFloat(value)
      if (!isNaN(selling) && base > 0) {
        updated.percentageAdjustment = Number((((selling - base) / base) * 100).toFixed(2))
      }
      return updated
    })
    updateField('pricingRules', rules)
  }

  const removePricingRule = (productId: string) => {
    updateField('pricingRules', form.pricingRules.filter((r) => r.productId !== productId))
  }

  const toggleCustomer = (customerId: string) => {
    const current = form.selectedCustomerIds
    const updated = current.includes(customerId)
      ? current.filter((id) => id !== customerId)
      : [...current, customerId]
    updateField('selectedCustomerIds', updated)
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.effectiveFrom) errs.effectiveFrom = 'Effective from date is required'
    if (dateError) errs.effectiveUntil = dateError
    if (form.customerSegment === 'tier' && !form.customerTier) errs.customerTier = 'Select a tier'
    if (form.customerSegment === 'customer' && form.selectedCustomerIds.length === 0) {
      errs.selectedCustomerIds = 'Select at least one customer'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      await createPriceList.mutateAsync({
        name: form.name,
        description: form.description || undefined,
        currency: form.currency,
        status: 'draft',
        scope: form.customerSegment as 'all' | 'tier' | 'customer',
        tierScope: form.customerSegment === 'tier' ? form.customerTier : undefined,
        effectiveFrom: form.effectiveFrom || undefined,
        effectiveUntil: form.effectiveUntil || undefined,
        pricingRules: form.pricingRules.map((r) => ({
          productId: r.productId,
          productName: r.productName,
          productSku: r.productSku,
          basePrice: r.basePrice,
          sellingPrice: parseFloat(r.sellingPrice) || 0,
          percentageAdjustment: r.percentageAdjustment,
        })),
        selectedCustomerIds: form.selectedCustomerIds,
        customerIds: form.selectedCustomerIds,
      })
      toast.success('Price list created')
      navigate('/business-admin/pricing/price-lists')
    } catch {
      toast.error('Failed to create price list')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Price List"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Pricing' },
          { label: 'Create Price List' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/business-admin/pricing/price-lists')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
        }
      />

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Standard Pricing Q4 2026"
                className={cn(INPUT_CLASS, errors.name && 'border-danger')}
              />
              {errors.name && <p className="text-[11px] text-danger">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Optional description for this price list"
                className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => updateField('currency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Customer Segment</Label>
                <Select value={form.customerSegment} onValueChange={(v) => updateField('customerSegment', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="tier">Tier-Based</SelectItem>
                    <SelectItem value="customer">Customer-Specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validity */}
        <Card>
          <CardHeader>
            <CardTitle>Validity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Effective From *</Label>
                <Input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => updateField('effectiveFrom', e.target.value)}
                  className={cn(INPUT_CLASS, (errors.effectiveFrom || errors.effectiveUntil) && 'border-danger')}
                />
                {errors.effectiveFrom && (
                  <p className="text-[11px] text-danger">{errors.effectiveFrom}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Effective Until</Label>
                <Input
                  type="date"
                  value={form.effectiveUntil}
                  onChange={(e) => updateField('effectiveUntil', e.target.value)}
                  className={cn(INPUT_CLASS, errors.effectiveUntil && 'border-danger')}
                />
                {(errors.effectiveUntil || dateError) && (
                  <p className="text-[11px] text-danger">{errors.effectiveUntil || dateError}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product selector */}
            <div className="space-y-1.5">
              <Label>Add Product</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name or SKU..."
                  className={cn(INPUT_CLASS, 'pl-9')}
                />
              </div>
              {productSearch && (
                <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
                  {products.length === 0 ? (
                    <p className="p-3 text-[12px] text-muted-foreground">No products found</p>
                  ) : (
                    products.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addProductToRules(p)}
                        className="w-full flex items-center justify-between p-3 hover:bg-surface-muted text-left transition-colors border-b border-border last:border-0"
                      >
                        <div>
                          <p className="text-[13px] font-medium text-foreground">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.sku}</p>
                        </div>
                        <MoneyDisplay amount={p.unitPrice} currency={form.currency} size="sm" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Pricing rules table */}
            {form.pricingRules.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  icon={<Plus className="h-8 w-8" />}
                  title="No products added"
                  description="Search and add products above to configure pricing rules."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-[11px] font-medium text-muted-foreground pb-3 pr-4">Product</th>
                      <th className="text-right text-[11px] font-medium text-muted-foreground pb-3 pr-4">Base Price</th>
                      <th className="text-right text-[11px] font-medium text-muted-foreground pb-3 pr-4">Selling Price *</th>
                      <th className="text-right text-[11px] font-medium text-muted-foreground pb-3 pr-4">Adj %</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {form.pricingRules.map((rule) => (
                      <tr key={rule.productId} className="border-b border-border last:border-0">
                        <td className="py-3 pr-4">
                          <p className="text-[13px] font-medium text-foreground">{rule.productName}</p>
                          <p className="text-[11px] text-muted-foreground">{rule.productSku}</p>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <MoneyDisplay amount={rule.basePrice} currency={form.currency} size="sm" />
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={rule.sellingPrice}
                            onChange={(e) => updatePricingRule(rule.productId, 'sellingPrice', e.target.value)}
                            className="h-8 w-28 text-[13px] text-right ml-auto"
                          />
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span className={cn(
                            'text-[12px] tabular-nums font-medium',
                            rule.percentageAdjustment < 0 ? 'text-danger' : rule.percentageAdjustment > 0 ? 'text-success' : 'text-muted-foreground'
                          )}>
                            {rule.percentageAdjustment > 0 ? '+' : ''}{rule.percentageAdjustment}%
                          </span>
                        </td>
                        <td className="py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-danger"
                            onClick={() => removePricingRule(rule.productId)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.customerSegment === 'tier' && (
              <div className="space-y-1.5">
                <Label>Customer Tier *</Label>
                <Select value={form.customerTier} onValueChange={(v) => updateField('customerTier', v)}>
                  <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
                {errors.customerTier && <p className="text-[11px] text-danger">{errors.customerTier}</p>}
              </div>
            )}

            {form.customerSegment === 'customer' && (
              <div className="space-y-1.5">
                <Label>Select Customers *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customers..."
                    className={cn(INPUT_CLASS, 'pl-9')}
                  />
                </div>
                {errors.selectedCustomerIds && (
                  <p className="text-[11px] text-danger">{errors.selectedCustomerIds}</p>
                )}
                <div className="border border-border rounded-lg max-h-64 overflow-y-auto">
                  {filteredCustomers.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-3 p-3 hover:bg-surface-muted cursor-pointer transition-colors border-b border-border last:border-0"
                    >
                      <input
                        type="checkbox"
                        checked={form.selectedCustomerIds.includes(c.id)}
                        onChange={() => toggleCustomer(c.id)}
                        className="h-4 w-4 rounded border-border"
                      />
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-foreground">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.tier}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {form.selectedCustomerIds.length > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    {form.selectedCustomerIds.length} customer{form.selectedCustomerIds.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}

            {form.customerSegment === 'all' && (
              <p className="text-[13px] text-muted-foreground">
                This price list will apply to all customers.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/business-admin/pricing/price-lists')}>
            Cancel
          </Button>
          <Button type="submit" disabled={createPriceList.isPending}>
            <Save className="h-4 w-4 mr-1.5" />
            {createPriceList.isPending ? 'Creating...' : 'Create Price List'}
          </Button>
        </div>
      </form>
    </div>
  )
}
