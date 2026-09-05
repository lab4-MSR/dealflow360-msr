import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Handshake, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getCustomerQuotationDetail, submitCounterOfferFull } from '@/lib/customer-portal-api'
import { formatCurrency } from '@/lib/analytics-format'

export function CounterOfferPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: quote, isLoading } = useQuery({
    queryKey: ['customer-quotation', id],
    queryFn: () => getCustomerQuotationDetail(id ?? ''),
  })

  // Counter Offer Form State
  const [selectedProduct, setSelectedProduct] = useState<string>('all')
  const [quantity, setQuantity] = useState<string>('')
  const [requestedPrice, setRequestedPrice] = useState<string>('')
  const [requestedDiscount, setRequestedDiscount] = useState<string>('15')
  const [requestedTerms, setRequestedTerms] = useState<string>('')

  // Message State
  const [customerNote, setCustomerNote] = useState<string>('')
  const [supportingInfo, setSupportingInfo] = useState<string>('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const items = quote?.items ?? []
  const currentOfferTotal = quote?.pricing?.grand_total ?? 11660.00
  const version = quote?.version ?? 1
  const quoteNumber = quote?.quote_number ?? `Q-${id}`

  // Derive original values
  const activeItem = items.find((it) => it.product === selectedProduct) || items[0]
  const origQty = activeItem?.quantity ?? 10
  const origPrice = activeItem?.unit_price ?? 1200
  const origDiscount = activeItem?.discount ?? 12

  // Numeric inputs
  const numQty = quantity !== '' ? Number(quantity) : origQty
  const numPrice = requestedPrice !== '' ? Number(requestedPrice) : origPrice
  const numDiscount = requestedDiscount !== '' ? Number(requestedDiscount) : origDiscount

  // Calculate Customer Offer Total
  const calculatedLineTotal = numQty * numPrice * (1 - numDiscount / 100)
  const otherLinesTotal = items
    .filter((it) => it.product !== activeItem?.product)
    .reduce((acc, it) => acc + (it.line_total ?? 0), 0)

  const customerOfferTotal = Math.max(0, calculatedLineTotal + (selectedProduct === 'all' ? 0 : otherLinesTotal))
  const differenceAmount = customerOfferTotal - currentOfferTotal
  const differencePercent = currentOfferTotal > 0 ? (differenceAmount / currentOfferTotal) * 100 : 0

  // Mutation
  const mutation = useMutation({
    mutationFn: async () => {
      if (!customerNote.trim()) {
        throw new Error('Please provide a note explaining your counter offer.')
      }
      return await submitCounterOfferFull(id ?? '', {
        product: selectedProduct !== 'all' ? selectedProduct : 'All Products',
        quantity: numQty,
        requested_price: numPrice,
        requested_discount: numDiscount,
        requested_terms: requestedTerms || undefined,
        note: customerNote,
        supporting_info: supportingInfo || undefined,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-quotation', id] })
      setIsSuccess(true)
    },
    onError: (err: Error) => {
      setValidationError(err.message || 'Failed to submit counter offer. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    if (!customerNote.trim()) {
      setValidationError('Please enter a customer note explaining your proposal.')
      return
    }
    mutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-8">
        <Card className="border-success/30 bg-success-subtle/10 text-center p-8">
          <CardContent className="space-y-4 pt-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-subtle text-success">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Counter Offer Submitted</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your counter offer of <span className="font-semibold text-foreground">{formatCurrency(customerOfferTotal)}</span> for quotation <span className="font-semibold text-foreground">{quoteNumber}</span> (Version {version}) has been transmitted to your account team.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Button onClick={() => navigate(`/customer-portal/quotations/${id}`)}>
                Return to Quotation Details
              </Button>
              <Button variant="outline" onClick={() => navigate('/customer-portal/quotations')}>
                My Quotations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Counter Offer</h1>
          <p className="text-sm text-muted-foreground">Propose commercial terms and pricing for this quotation</p>
        </div>
      </div>

      {/* Quote Context */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wider text-xs">
            Quote Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs text-muted-foreground">Quote Number</p>
              <p className="mt-1 text-base font-semibold text-foreground">{quoteNumber}</p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs text-muted-foreground">Current Version</p>
              <p className="mt-1 text-base font-semibold text-foreground">Version {version}</p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs text-muted-foreground">Current Total</p>
              <p className="mt-1 text-base font-semibold text-primary tabular-nums">{formatCurrency(currentOfferTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Counter Offer Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Counter Offer</CardTitle>
            <CardDescription>Enter your proposed commercial terms, quantities, and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Product */}
              <div className="space-y-2">
                <label htmlFor="product-select-counter" className="text-sm font-medium text-foreground">
                  Product
                </label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger id="product-select-counter">
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Line Items / General Quote</SelectItem>
                    {items.map((item, idx) => (
                      <SelectItem key={idx} value={item.product || `Product ${idx + 1}`}>
                        {item.product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label htmlFor="quantity-counter" className="text-sm font-medium text-foreground">
                  Quantity
                </label>
                <Input
                  id="quantity-counter"
                  type="number"
                  min="1"
                  placeholder={`Current: ${origQty}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              {/* Requested Price */}
              <div className="space-y-2">
                <label htmlFor="price-counter" className="text-sm font-medium text-foreground">
                  Requested Price (₹)
                </label>
                <Input
                  id="price-counter"
                  type="number"
                  step="0.01"
                  placeholder={`Current: ₹${origPrice}`}
                  value={requestedPrice}
                  onChange={(e) => setRequestedPrice(e.target.value)}
                />
              </div>

              {/* Requested Discount */}
              <div className="space-y-2">
                <label htmlFor="discount-counter" className="text-sm font-medium text-foreground">
                  Requested Discount (%)
                </label>
                <Input
                  id="discount-counter"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder={`Current: ${origDiscount}%`}
                  value={requestedDiscount}
                  onChange={(e) => setRequestedDiscount(e.target.value)}
                />
              </div>

              {/* Requested Terms */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="terms-counter" className="text-sm font-medium text-foreground">
                  Requested Terms
                </label>
                <Input
                  id="terms-counter"
                  placeholder="e.g. Net 45 Payment Terms, Free Shipping, 1 Year Extended Warranty"
                  value={requestedTerms}
                  onChange={(e) => setRequestedTerms(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offer Summary */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Offer Summary</CardTitle>
            <CardDescription>Comparison between current offer and your proposed counter offer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Current Offer</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{formatCurrency(currentOfferTotal)}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Customer Offer</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-primary">{formatCurrency(customerOfferTotal)}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Difference</p>
                <p
                  className={`mt-1 text-xl font-bold tabular-nums ${
                    differenceAmount < 0 ? 'text-success' : differenceAmount > 0 ? 'text-warning' : 'text-muted-foreground'
                  }`}
                >
                  {differenceAmount === 0 ? '—' : `${formatCurrency(differenceAmount)} (${differencePercent.toFixed(1)}%)`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message: Customer Note & Supporting Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Message</CardTitle>
            <CardDescription>Provide context and supporting details for your counter offer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Note */}
            <div className="space-y-2">
              <label htmlFor="customer-note" className="text-sm font-medium text-foreground">
                Customer Note <span className="text-danger">*</span>
              </label>
              <Textarea
                id="customer-note"
                rows={4}
                placeholder="Explain the commercial justification for your counter offer..."
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                required
              />
            </div>

            {/* Supporting Information */}
            <div className="space-y-2">
              <label htmlFor="supporting-info" className="text-sm font-medium text-foreground">
                Supporting Information
              </label>
              <Input
                id="supporting-info"
                placeholder="e.g. Competitor quote reference, budget allocation code, or project volume commitment"
                value={supportingInfo}
                onChange={(e) => setSupportingInfo(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Validation or API Errors */}
        {validationError && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger-subtle p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
            <p className="text-sm font-medium text-danger">{validationError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              'Submitting...'
            ) : (
              <>
                <Handshake className="mr-2 h-4 w-4" aria-hidden="true" />
                Submit Counter Offer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
