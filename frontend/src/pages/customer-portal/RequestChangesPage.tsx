import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, X, Paperclip, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { getCustomerQuotationDetail, submitRequestChangesFull } from '@/lib/customer-portal-api'
import { formatCurrency } from '@/lib/analytics-format'

export function RequestChangesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: quote, isLoading } = useQuery({
    queryKey: ['customer-quotation', id],
    queryFn: () => getCustomerQuotationDetail(id ?? ''),
  })

  // Form State for 08.5 Change Request
  const [selectedProduct, setSelectedProduct] = useState<string>('all')
  const [requestedQty, setRequestedQty] = useState<string>('')
  const [requestedPrice, setRequestedPrice] = useState<string>('')
  const [requestedDiscount, setRequestedDiscount] = useState<string>('')
  const [requestedDelivery, setRequestedDelivery] = useState<string>('')
  const [otherRequest, setOtherRequest] = useState<string>('')

  // Message State
  const [customerComment, setCustomerComment] = useState<string>('')
  const [attachment, setAttachment] = useState<{ file: File; name: string; size: string } | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const items = quote?.items ?? []
  const grandTotal = quote?.pricing?.grand_total ?? 0
  const version = quote?.version ?? 1
  const quoteNumber = quote?.quote_number ?? `Q-${id}`

  // Derive original values for selected product
  const activeItem = items.find((it) => it.product === selectedProduct) || items[0]
  const origQty = activeItem?.quantity ?? 10
  const origPrice = activeItem?.unit_price ?? 1200
  const origDiscount = activeItem?.discount ?? 12

  // Numeric requested values with fallbacks to original
  const numQty = requestedQty !== '' ? Number(requestedQty) : origQty
  const numPrice = requestedPrice !== '' ? Number(requestedPrice) : origPrice
  const numDiscount = requestedDiscount !== '' ? Number(requestedDiscount) : origDiscount

  // Calculate Differences for Requested Changes Summary
  const qtyDiff = numQty - origQty
  const priceDiff = numPrice - origPrice
  const discountDiff = numDiscount - origDiscount

  const origLineTotal = origQty * origPrice * (1 - origDiscount / 100)
  const reqLineTotal = numQty * numPrice * (1 - numDiscount / 100)
  const totalDiff = reqLineTotal - origLineTotal

  // File Attachment handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setValidationError('File size exceeds 10MB limit.')
        return
      }
      setAttachment({
        file,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      })
      setValidationError(null)
    }
  }

  const removeAttachment = () => {
    setAttachment(null)
  }

  // Submit Mutation
  const mutation = useMutation({
    mutationFn: async () => {
      if (!customerComment.trim()) {
        throw new Error('Please provide a comment explaining your change request.')
      }
      return await submitRequestChangesFull(id ?? '', {
        product: selectedProduct !== 'all' ? selectedProduct : 'All Products',
        quantity: numQty !== origQty ? numQty : undefined,
        price: numPrice !== origPrice ? numPrice : undefined,
        discount: numDiscount !== origDiscount ? numDiscount : undefined,
        delivery: requestedDelivery || undefined,
        other_request: otherRequest || undefined,
        comment: customerComment,
        attachment_name: attachment?.name,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-quotation', id] })
      setIsSuccess(true)
    },
    onError: (err: Error) => {
      setValidationError(err.message || 'Failed to submit change request. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    if (!customerComment.trim()) {
      setValidationError('Please enter a customer comment explaining your request.')
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
            <h2 className="text-2xl font-semibold tracking-tight">Change Request Submitted</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your request for quotation <span className="font-semibold text-foreground">{quoteNumber}</span> (Version {version}) has been submitted to your sales representative.
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
      {/* Header Navigation */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Request Changes</h1>
          <p className="text-sm text-muted-foreground">Submit requested modifications for this quotation</p>
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
              <p className="mt-1 text-base font-semibold text-primary tabular-nums">{formatCurrency(grandTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Change Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Change Request</CardTitle>
            <CardDescription>Specify the line items or commercial terms you wish to adjust</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Product */}
              <div className="space-y-2">
                <label htmlFor="product-select" className="text-sm font-medium text-foreground">
                  Product
                </label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger id="product-select">
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
                <label htmlFor="quantity-input" className="text-sm font-medium text-foreground">
                  Quantity
                </label>
                <Input
                  id="quantity-input"
                  type="number"
                  min="1"
                  placeholder={`Current: ${origQty}`}
                  value={requestedQty}
                  onChange={(e) => setRequestedQty(e.target.value)}
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label htmlFor="price-input" className="text-sm font-medium text-foreground">
                  Price (₹)
                </label>
                <Input
                  id="price-input"
                  type="number"
                  step="0.01"
                  placeholder={`Current: ₹${origPrice}`}
                  value={requestedPrice}
                  onChange={(e) => setRequestedPrice(e.target.value)}
                />
              </div>

              {/* Discount */}
              <div className="space-y-2">
                <label htmlFor="discount-input" className="text-sm font-medium text-foreground">
                  Discount (%)
                </label>
                <Input
                  id="discount-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder={`Current: ${origDiscount}%`}
                  value={requestedDiscount}
                  onChange={(e) => setRequestedDiscount(e.target.value)}
                />
              </div>

              {/* Delivery */}
              <div className="space-y-2">
                <label htmlFor="delivery-input" className="text-sm font-medium text-foreground">
                  Delivery Request
                </label>
                <Input
                  id="delivery-input"
                  placeholder="e.g. Expedited delivery by Sep 20, 2026"
                  value={requestedDelivery}
                  onChange={(e) => setRequestedDelivery(e.target.value)}
                />
              </div>

              {/* Other Request */}
              <div className="space-y-2">
                <label htmlFor="other-request-input" className="text-sm font-medium text-foreground">
                  Other Request
                </label>
                <Input
                  id="other-request-input"
                  placeholder="e.g. Custom packaging or extended support"
                  value={otherRequest}
                  onChange={(e) => setOtherRequest(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message: Customer Comment & Attachment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Message</CardTitle>
            <CardDescription>Provide details and optional attachments for your sales team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Comment */}
            <div className="space-y-2">
              <label htmlFor="customer-comment" className="text-sm font-medium text-foreground">
                Customer Comment <span className="text-danger">*</span>
              </label>
              <Textarea
                id="customer-comment"
                rows={4}
                placeholder="Explain the reasons for your requested changes..."
                value={customerComment}
                onChange={(e) => setCustomerComment(e.target.value)}
                required
              />
            </div>

            {/* Attachment */}
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium text-foreground">Attachment</label>
              {!attachment ? (
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="file-upload"
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <Paperclip className="h-4 w-4" aria-hidden="true" />
                    <span>Upload Attachment</span>
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.png,.jpg,.xlsx,.csv"
                    />
                  </label>
                  <span className="text-xs text-muted-foreground">PDF, DOC, XLSX, or Images up to 10MB</span>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3 max-w-md">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <div className="truncate">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">{attachment.size}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeAttachment}
                    aria-label="Remove attachment"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-danger" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Requested Changes Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Requested Changes Summary</CardTitle>
            <CardDescription>Comparison between original quotation terms and your request</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field / Parameter</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Difference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Quantity</TableCell>
                  <TableCell className="tabular-nums">{origQty}</TableCell>
                  <TableCell className="tabular-nums font-semibold">{numQty}</TableCell>
                  <TableCell className="tabular-nums">
                    <span className={qtyDiff > 0 ? 'text-success font-medium' : qtyDiff < 0 ? 'text-warning font-medium' : 'text-muted-foreground'}>
                      {qtyDiff > 0 ? `+${qtyDiff}` : qtyDiff === 0 ? '—' : qtyDiff}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Unit Price</TableCell>
                  <TableCell className="tabular-nums">{formatCurrency(origPrice)}</TableCell>
                  <TableCell className="tabular-nums font-semibold">{formatCurrency(numPrice)}</TableCell>
                  <TableCell className="tabular-nums">
                    <span className={priceDiff < 0 ? 'text-success font-medium' : priceDiff > 0 ? 'text-warning font-medium' : 'text-muted-foreground'}>
                      {priceDiff === 0 ? '—' : formatCurrency(priceDiff)}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Discount</TableCell>
                  <TableCell className="tabular-nums">{origDiscount}%</TableCell>
                  <TableCell className="tabular-nums font-semibold">{numDiscount}%</TableCell>
                  <TableCell className="tabular-nums">
                    <span className={discountDiff > 0 ? 'text-success font-medium' : discountDiff < 0 ? 'text-warning font-medium' : 'text-muted-foreground'}>
                      {discountDiff > 0 ? `+${discountDiff}%` : discountDiff === 0 ? '—' : `${discountDiff}%`}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/30 font-semibold">
                  <TableCell>Line Estimated Total</TableCell>
                  <TableCell className="tabular-nums">{formatCurrency(origLineTotal)}</TableCell>
                  <TableCell className="tabular-nums">{formatCurrency(reqLineTotal)}</TableCell>
                  <TableCell className="tabular-nums">
                    <span className={totalDiff < 0 ? 'text-success font-semibold' : totalDiff > 0 ? 'text-warning font-semibold' : ''}>
                      {totalDiff === 0 ? '—' : formatCurrency(totalDiff)}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
                <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
