import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useCustomers } from '../hooks/use-business-admin'
import { useProducts } from '../hooks/use-business-admin'
import { useCategories } from '../hooks/use-business-admin'
import { useSimulateDiscount } from '../hooks/use-business-admin'
import type { DiscountSimulatorRequest, DiscountSimulatorResponse } from '../types'
import { toast } from 'sonner'
import { Plus, Minus, Search, RefreshCw, Target, AlertTriangle, Shield, CheckCircle, XCircle, HelpCircle, ArrowRight, Users, Package, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PercentageDisplay } from '@/components/shared'
import { MoneyDisplay } from '@/components/shared'

const RISK_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  low: 'success', medium: 'warning', high: 'danger', critical: 'danger',
}
const DECISION_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  auto_approve: 'success', approval_required: 'warning', blocked: 'danger',
}

function DiscountRuleSimulatorPage() {
  const [customerId, setCustomerId] = useState('')
  const [customerTier, setCustomerTier] = useState('')
  const [products, setProducts] = useState<{ productId: string; quantity: number; unitPrice: number; proposedDiscountPercent: number }[]>([{ productId: '', quantity: 1, unitPrice: 0, proposedDiscountPercent: 0 }])
  const [dealValue, setDealValue] = useState(0)
  const [simulationResult, setSimulationResult] = useState<DiscountSimulatorResponse | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const { data: customersData } = useCustomers({ perPage: 100 })
  const { data: productsData } = useProducts({ perPage: 100, status: 'active' })
  const { data: categoriesData } = useCategories({ status: 'active' })
  const simulateDiscount = useSimulateDiscount()

  const selectedCustomer = useMemo(() => customersData?.customers.find(c => c.id === customerId), [customersData, customerId])
  const selectedProduct = (id: string) => productsData?.products.find(p => p.id === id)

  const updateDealValue = () => {
    const total = products.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0)
    setDealValue(total)
  }

  const handleCustomerChange = (id: string) => {
    setCustomerId(id)
    if (id && selectedCustomer) setCustomerTier(selectedCustomer.tier)
    else setCustomerTier('')
  }

  const handleProductChange = (index: number, productId: string) => {
    const product = selectedProduct(productId)
    setProducts(prev => prev.map((p, i) => i === index ? { ...p, productId, unitPrice: product?.unitPrice || 0, proposedDiscountPercent: 0 } : p))
    updateDealValue()
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    setProducts(prev => prev.map((p, i) => i === index ? { ...p, quantity } : p))
    updateDealValue()
  }

  const handleDiscountChange = (index: number, discount: number) => {
    setProducts(prev => prev.map((p, i) => i === index ? { ...p, proposedDiscountPercent: discount } : p))
  }

  const addProduct = () => setProducts(prev => [...prev, { productId: '', quantity: 1, unitPrice: 0, proposedDiscountPercent: 0 }])
  const removeProduct = (index: number) => setProducts(prev => prev.filter((_, i) => i !== index))

  const runSimulation = async () => {
    if (!customerId || products.some(p => !p.productId || p.quantity <= 0)) {
      toast.error('Please select a customer and add at least one valid product with quantity')
      return
    }
    setIsSimulating(true)
    try {
      const request: DiscountSimulatorRequest = {
        customerId,
        customerTier,
        products: products.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          proposedDiscountPercent: p.proposedDiscountPercent || 0,
        })),
        orderDiscountPercent: 0,
      }
      const result = await simulateDiscount.mutateAsync(request)
      setSimulationResult(result)
      toast.success('Simulation complete')
    } catch { toast.error('Simulation failed') }
    finally { setIsSimulating(false) }
  }

  const resetSimulation = () => {
    setSimulationResult(null)
    setProducts([{ productId: '', quantity: 1, unitPrice: 0, proposedDiscountPercent: 0 }])
    setDealValue(0)
    setCustomerId('')
    setCustomerTier('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discount Rule Simulator"
        description="Simulate discount scenarios to evaluate rule compliance, margin impact, and approval requirements before submitting quotations"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Discount Governance' },
          { label: 'Rule Simulator' },
        ]}
        actions={
          <Button variant="outline" onClick={resetSimulation} disabled={!simulationResult && products.every(p => !p.productId)}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Reset
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        {/* LEFT: Scenario Input */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Scenario Input</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Customer</label>
                <Select value={customerId} onValueChange={handleCustomerChange}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customersData?.customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.tier})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Customer Tier</label>
                <Select value={customerTier} onValueChange={setCustomerTier} disabled={!customerId}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={customerId ? 'Auto-derived' : 'Select customer first'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
                {customerId && <p className="text-xs text-muted-foreground">Auto-derived from selected customer</p>}
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2"><Package className="h-4 w-4" />Products</label>
                  <Button variant="outline" size="sm" onClick={addProduct}><Plus className="h-3.5 w-3.5 mr-1" />Add Product</Button>
                </div>
                <div className="space-y-3">
                  {products.map((product, index) => (
                    <div key={index} className="rounded-lg border border-border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Line {index + 1}</span>
                        {products.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeProduct(index)} className="text-danger"><Minus className="h-4 w-4" /></Button>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Product</label>
                          <Select value={product.productId} onValueChange={v => handleProductChange(index, v)}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Select product" /></SelectTrigger>
                            <SelectContent>
                              {productsData?.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku}) - {new Intl.NumberFormat('en-IN', { style: 'currency', currency: p.currency || 'INR' }).format(p.unitPrice)}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Quantity</label>
                          <Input type="number" min="1" value={product.quantity} onChange={e => handleQuantityChange(index, parseInt(e.target.value) || 1)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Proposed Discount %</label>
                          <Input type="number" min="0" max="100" step="0.1" value={product.proposedDiscountPercent} onChange={e => handleDiscountChange(index, parseFloat(e.target.value) || 0)} />
                        </div>
                      </div>
                      {product.productId && selectedProduct(product.productId) && (
                        <p className="text-xs text-muted-foreground">Unit Price: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: selectedProduct(product.productId)?.currency || 'INR' }).format(selectedProduct(product.productId)?.unitPrice || 0)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <label className="text-sm font-medium text-foreground flex items-center gap-2"><MoneyDisplay amount={dealValue} currency="INR" className="text-lg font-bold" />Deal Value</label>
                <p className="text-xs text-muted-foreground">Auto-calculated from products</p>
              </div>

              <Button onClick={runSimulation} disabled={isSimulating || !customerId || products.some(p => !p.productId || p.quantity <= 0)} className="w-full" size="lg">
                {isSimulating ? 'Running Simulation...' : 'Run Simulation'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Evaluation Results */}
        <div className="space-y-4">
          {!simulationResult ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-[500px] text-center p-8">
                <EmptyState icon={<Target className="h-12 w-12 text-muted-foreground/50" />} title="No Simulation Run" description="Configure a scenario and click Run Simulation to evaluate discount rules, risk, and approval requirements." />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Rule Evaluation */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Rule Evaluation</CardTitle></CardHeader>
                <CardContent>
                  {simulationResult.lines.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No product lines to evaluate.</p>
                  ) : (
                    <div className="space-y-3">
                      {simulationResult.lines.map((line, idx) => (
                        <div key={idx} className="rounded-lg border border-border p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{line.productName}</p>
                            <Badge variant={line.violatedRuleIds.length > 0 ? 'danger' : 'success'}>
                              {line.violatedRuleIds.length > 0 ? 'Restricted' : 'Allowed'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div><p className="text-muted-foreground">Requested</p><p className="font-medium"><PercentageDisplay value={line.requestedDiscountPercent} /></p></div>
                            <div><p className="text-muted-foreground">Allowed</p><p className="font-medium text-success"><PercentageDisplay value={line.allowedDiscountPercent} /></p></div>
                            <div><p className="text-muted-foreground">Excess</p><p className="font-medium text-danger"><PercentageDisplay value={line.excessPercent} /></p></div>
                            <div><p className="text-muted-foreground">Ceiling</p><p className="font-medium"><PercentageDisplay value={line.categoryCeiling ?? line.customerTierCeiling ?? line.productCeiling ?? line.finalCeiling} /></p></div>
                          </div>
                          {line.violatedRuleIds.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {line.violatedRuleIds.map(rid => <Badge key={rid} variant="outline" className="text-xs">{rid}</Badge>)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Discount Result */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Discount Result</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Requested</p><p className="text-2xl font-bold"><PercentageDisplay value={simulationResult.orderLevel.requestedDiscountPercent} /></p></div>
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20"><p className="text-sm text-muted-foreground">Allowed</p><p className="text-2xl font-bold text-success"><PercentageDisplay value={simulationResult.orderLevel.allowedDiscountPercent} /></p></div>
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20"><p className="text-sm text-muted-foreground">Excess</p><p className="text-2xl font-bold text-warning">{simulationResult.orderLevel.excessPercent > 0 ? `+${simulationResult.orderLevel.excessPercent}pp` : '—'}</p></div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: `var(--${DECISION_VARIANT[simulationResult.decision] || 'muted'})/10` }}><p className="text-sm text-muted-foreground">Decision</p><Badge variant={DECISION_VARIANT[simulationResult.decision] || 'secondary'} className="text-lg px-3 py-1.5">{simulationResult.decision.replace('_', ' ').toUpperCase()}</Badge></div>
                </CardContent>
              </Card>

              {/* Risk Result */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Risk Result</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center"><p className="text-sm text-muted-foreground">Overall Risk</p><Badge variant={RISK_VARIANT[simulationResult.overallRisk] || 'secondary'} className="text-lg px-3 py-1.5">{simulationResult.overallRisk.toUpperCase()}</Badge></div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center"><p className="text-sm text-muted-foreground">Approval Required</p><Badge variant={simulationResult.approvalRequired ? 'warning' : 'success'} className="text-lg px-3 py-1.5">{simulationResult.approvalRequired ? 'YES' : 'NO'}</Badge></div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center"><p className="text-sm text-muted-foreground">Approval Level</p><p className="text-lg font-semibold capitalize">{simulationResult.approvalLevel || 'None'}</p></div>
                </CardContent>
              </Card>

              {/* Approval Result */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Approval Chain</CardTitle></CardHeader>
                <CardContent>
                  {simulationResult.approvalChain.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No approval chain required.</p>
                  ) : (
                    <div className="space-y-2">
                      {simulationResult.approvalChain.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">{step.step}</div>
                          <div className="flex-1"><p className="font-medium">{step.approverName}</p><p className="text-sm text-muted-foreground">{step.role} • SLA: {step.slaMinutes} min</p></div>
                          {idx < simulationResult.approvalChain.length - 1 && <ArrowRight className="text-muted-foreground" />}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Explanation */}
              <Card className="border-primary/20">
                <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" />Explanation</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20"><p className="text-sm font-medium text-success mb-1">Why Allowed</p><p className="text-sm text-foreground">{simulationResult.orderLevel.excessPercent <= 0 ? 'All discounts are within configured ceilings.' : 'Partial discount allowed up to the most restrictive ceiling.'}</p></div>
                  {simulationResult.lines.some(l => l.violatedRuleIds.length > 0) && (
                    <div className="p-4 rounded-lg bg-warning/10 border border-warning/20"><p className="text-sm font-medium text-warning mb-1">Why Restricted</p><p className="text-sm text-foreground">Some product lines exceed their discount ceiling (customer tier, category, or product rules).</p></div>
                  )}
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20"><p className="text-sm font-medium text-primary mb-1">Recommended Action</p><p className="text-sm text-foreground">{simulationResult.approvalRequired ? 'Submit for approval before proceeding with this discount.' : 'Discount can proceed without additional approval.'}</p></div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export { DiscountRuleSimulatorPage }