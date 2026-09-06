import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useCustomers } from '../hooks/use-business-admin'
import { useProducts } from '../hooks/use-business-admin'
import { useCategories } from '../hooks/use-business-admin'
import { useSimulateApproval } from '../hooks/use-business-admin'
import type { ApprovalSimulatorRequest, ApprovalSimulatorResponse } from '../types'
import { toast } from 'sonner'
import { Plus, Minus, Search, RefreshCw, Shield, AlertTriangle, CheckCircle, XCircle, HelpCircle, ArrowRight, Users, Package, Layers, IndianRupee, BarChart, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PercentageDisplay } from '@/components/shared'
import { MoneyDisplay } from '@/components/shared'

const DECISION_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  auto_approve: 'success', approval_required: 'warning', blocked: 'danger',
}

function ApprovalSimulatorPage() {
  const [customerId, setCustomerId] = useState('')
  const [dealValue, setDealValue] = useState(0)
  const [products, setProducts] = useState<{ productId: string; quantity: number; unitPrice: number; categoryId?: string }[]>([{ productId: '', quantity: 1, unitPrice: 0, categoryId: '' }])
  const [discountPercent, setDiscountPercent] = useState(0)
  const [marginPercent, setMarginPercent] = useState(0)
  const [riskScore, setRiskScore] = useState(0)
  const [simulationResult, setSimulationResult] = useState<ApprovalSimulatorResponse | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const { data: customersData } = useCustomers({ perPage: 100 })
  const { data: productsData } = useProducts({ perPage: 100, status: 'active' })
  const { data: categoriesData } = useCategories({ status: 'active' })
  const simulateApproval = useSimulateApproval()

  const selectedCustomer = useMemo(() => customersData?.customers.find(c => c.id === customerId), [customersData, customerId])
  const selectedProduct = (id: string) => productsData?.products.find(p => p.id === id)

  const updateDealValue = () => {
    const total = products.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0)
    setDealValue(total)
  }

  const handleCustomerChange = (id: string) => { setCustomerId(id) }
  const handleProductChange = (index: number, productId: string) => {
    const product = selectedProduct(productId)
    setProducts(prev => prev.map((p, i) => i === index ? { ...p, productId, unitPrice: product?.unitPrice || 0, categoryId: product?.categoryId || '' } : p))
    updateDealValue()
  }
  const handleQuantityChange = (index: number, quantity: number) => {
    setProducts(prev => prev.map((p, i) => i === index ? { ...p, quantity } : p))
    updateDealValue()
  }
  const addProduct = () => setProducts(prev => [...prev, { productId: '', quantity: 1, unitPrice: 0, categoryId: '' }])
  const removeProduct = (index: number) => setProducts(prev => prev.filter((_, i) => i !== index))

  const runSimulation = async () => {
    if (!customerId || dealValue <= 0 || products.some(p => !p.productId || p.quantity <= 0)) {
      toast.error('Please select a customer and add at least one valid product with quantity')
      return
    }
    setIsSimulating(true)
    try {
      const request: ApprovalSimulatorRequest = {
        customerId,
        dealValue,
        products: products.map(p => ({ productId: p.productId, quantity: p.quantity, unitPrice: p.unitPrice, categoryId: p.categoryId })),
        discountPercent,
        marginPercent: marginPercent || undefined,
        riskScore: riskScore || undefined,
      }
      const result = await simulateApproval.mutateAsync(request)
      setSimulationResult(result)
      toast.success('Simulation complete')
    } catch { toast.error('Simulation failed') }
    finally { setIsSimulating(false) }
  }

  const resetSimulation = () => {
    setSimulationResult(null)
    setProducts([{ productId: '', quantity: 1, unitPrice: 0, categoryId: '' }])
    setDealValue(0)
    setCustomerId('')
    setDiscountPercent(0)
    setMarginPercent(0)
    setRiskScore(0)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Approval Simulator"
        description="Simulate approval outcomes to understand which rules trigger, what chain activates, and who needs to approve before quotation submission"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Approval Configuration' },
          { label: 'Approval Simulator' },
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Scenario</CardTitle></CardHeader>
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
                <label className="text-sm font-medium text-foreground flex items-center gap-2"><IndianRupee className="h-4 w-4" />Deal Value</label>
                <MoneyDisplay amount={dealValue} currency="INR" className="text-2xl font-bold" />
                <p className="text-xs text-muted-foreground">Auto-calculated from products</p>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Discount %</label>
                  <Input type="number" min="0" max="100" step="0.1" value={discountPercent} onChange={e => setDiscountPercent(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Margin % (optional)</label>
                  <Input type="number" min="0" max="100" step="0.1" value={marginPercent} onChange={e => setMarginPercent(parseFloat(e.target.value) || 0)} placeholder="Auto-calculated" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Risk Score 0-100 (optional)</label>
                  <Input type="number" min="0" max="100" value={riskScore} onChange={e => setRiskScore(parseInt(e.target.value) || 0)} placeholder="Backend-generated" />
                </div>
              </div>

              <Button onClick={runSimulation} disabled={isSimulating || !customerId || dealValue <= 0 || products.some(p => !p.productId || p.quantity <= 0)} className="w-full" size="lg">
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
                <EmptyState icon={<Shield className="h-12 w-12 text-muted-foreground/50" />} title="No Simulation Run" description="Configure a scenario and click Run Simulation to evaluate approval rules, thresholds, and routing." />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Rule Evaluation */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Rule Evaluation</CardTitle></CardHeader>
                <CardContent>
                  {simulationResult.triggeredRules.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No rules triggered. All thresholds within acceptable range.</p>
                  ) : (
                    <div className="space-y-2">
                      {simulationResult.triggeredRules.map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                          <AlertTriangle className="h-5 w-5 text-warning" />
                          <div className="flex-1">
                            <p className="font-medium">{rule.name}</p>
                            <p className="text-sm text-muted-foreground">{rule.reason}</p>
                          </div>
                          <Badge variant="warning">TRIGGERED</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Approval Decision - VISUALLY DOMINANT */}
              <Card className="border-primary/30 shadow-lg">
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Approval Decision</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 rounded-xl text-center" style={{ backgroundColor: `var(--${DECISION_VARIANT[simulationResult.decision] || 'muted'})/10` }}>
                    <Badge variant={DECISION_VARIANT[simulationResult.decision] || 'secondary'} className="text-xl px-4 py-2 mb-3">
                      {simulationResult.decision === 'auto_approve' && <CheckCircle className="h-5 w-5 mr-2" />}
                      {simulationResult.decision === 'approval_required' && <AlertTriangle className="h-5 w-5 mr-2" />}
                      {simulationResult.decision === 'blocked' && <XCircle className="h-5 w-5 mr-2" />}
                      {simulationResult.decision.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <p className="text-lg text-muted-foreground mt-2">{simulationResult.decisionReason}</p>
                  </div>

                  {simulationResult.approvalRequired && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Approval Level</p>
                        <p className="text-xl font-bold capitalize">{simulationResult.approvalLevel}</p>
                      </div>

                      {simulationResult.approvalChain.length > 0 && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm font-medium text-muted-foreground mb-3">Approval Chain</p>
                          <div className="space-y-2">
                            {simulationResult.approvalChain.map((step, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">{step.step}</div>
                                <div className="flex-1">
                                  <p className="font-medium">{step.approverName}</p>
                                  <p className="text-sm text-muted-foreground">{step.role} • SLA: {step.slaMinutes} min</p>
                                </div>
                                {idx < simulationResult.approvalChain.length - 1 && <ArrowRight className="text-muted-foreground" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {simulationResult.escalation && (
                    <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                      <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" /><p className="font-medium text-warning">Escalation Path</p></div>
                      <p className="text-sm text-muted-foreground mt-1">{simulationResult.escalation.escalationPath}</p>
                      <p className="text-xs text-muted-foreground mt-1">SLA: {simulationResult.escalation.slaMinutes} minutes</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Explanation */}
              <Card className="border-primary/20">
                <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" />Explanation</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20"><p className="text-sm font-medium text-primary mb-1">Triggered Rules</p><p className="text-sm text-foreground">{simulationResult.triggeredRules.map(r => r.name).join(', ') || 'None'}</p></div>
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20"><p className="text-sm font-medium text-primary mb-1">Decision Reason</p><p className="text-sm text-foreground">{simulationResult.decisionReason}</p></div>
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20"><p className="text-sm font-medium text-success mb-1">Recommended Action</p><p className="text-sm text-foreground">{simulationResult.recommendedAction}</p></div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export { ApprovalSimulatorPage }