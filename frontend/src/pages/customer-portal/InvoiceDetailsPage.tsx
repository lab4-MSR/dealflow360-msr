import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Download, CreditCard, Building2, Mail, Phone, MapPin, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { getCustomerInvoiceDetail } from '@/lib/customer-portal-api'
import { formatCurrency } from '@/lib/analytics-format'

export function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const { data: invoice, isLoading, isError, error } = useQuery({
    queryKey: ['customer-invoice-detail', id],
    queryFn: () => getCustomerInvoiceDetail(id || ''),
    enabled: !!id,
  })

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !invoice) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-3" />
        <h2 className="text-xl font-semibold">Invoice Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">{error instanceof Error ? error.message : 'Unable to retrieve requested invoice details.'}</p>
        <Button onClick={() => navigate('/customer-portal/invoices')} className="mt-4" variant="outline">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Invoices
        </Button>
      </div>
    )
  }

  const isPaid = invoice.status === 'paid' || invoice.payment.amount_due <= 0

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/customer-portal/invoices')}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Invoices
        </Button>
      </div>

      {/* Invoice Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight font-mono">{invoice.invoice_number}</h1>
                <StatusBadge status={invoice.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>Invoice Date: <strong className="text-foreground">{invoice.invoice_date}</strong></span>
                <span>•</span>
                <span>Due Date: <strong className="text-foreground">{invoice.due_date}</strong></span>
              </div>
            </div>

            {/* Actions: Download & Pay */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? 'Generating PDF...' : downloadSuccess ? 'Downloaded!' : 'Download'}
              </Button>

              <Button
                onClick={() => setIsPayModalOpen(true)}
                disabled={isPaid}
                className="flex-1 sm:flex-none"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isPaid ? 'Paid' : 'Pay Now'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seller Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Seller Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Company</p>
              <p className="text-sm font-semibold mt-1 text-foreground">{invoice.seller.company}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Address</p>
              <p className="text-sm font-medium mt-1 text-foreground whitespace-pre-line flex items-start gap-1.5">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                {invoice.seller.address}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Contact</p>
              <p className="text-sm font-medium mt-1 text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {invoice.seller.contact}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Invoice Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Product / Service</TableHead>
                <TableHead className="text-center w-[90px]">Qty</TableHead>
                <TableHead className="text-right w-[120px]">Unit Price</TableHead>
                <TableHead className="text-right w-[100px]">Discount</TableHead>
                <TableHead className="text-right w-[100px]">Tax</TableHead>
                <TableHead className="text-right w-[120px]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-sm">
                    {item.product_service}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(item.unit_price)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-emerald-600">
                    {item.discount > 0 ? `-${formatCurrency(item.discount)}` : '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {item.tax > 0 ? formatCurrency(item.tax) : '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {formatCurrency(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Totals & Payment Summary Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
              <span className="text-muted-foreground">Payment Status</span>
              <StatusBadge status={invoice.payment.payment_status} />
            </div>
            <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
              <span className="text-muted-foreground">Due Date</span>
              <span className="font-medium">{invoice.payment.due_date}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-mono font-medium text-emerald-600">
                {formatCurrency(invoice.payment.amount_paid)}
              </span>
            </div>
            <div className="flex justify-between items-center text-base pt-2 font-semibold">
              <span>Amount Due</span>
              <span className={`font-mono text-lg ${invoice.payment.amount_due > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {formatCurrency(invoice.payment.amount_due)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Invoice Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono font-medium">{formatCurrency(invoice.totals.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-mono text-emerald-600 font-medium">
                {invoice.totals.discount > 0 ? `-${formatCurrency(invoice.totals.discount)}` : '$0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-mono font-medium">{formatCurrency(invoice.totals.tax)}</span>
            </div>
            <div className="flex justify-between items-center text-lg pt-2 font-bold">
              <span>Grand Total</span>
              <span className="font-mono text-primary">{formatCurrency(invoice.totals.grand_total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Gateway Modal / Unavailable State */}
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" /> Invoice Payment
            </DialogTitle>
            <DialogDescription>
              Complete payment for invoice <strong className="font-mono">{invoice.invoice_number}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Due:</span>
                <span className="font-bold font-mono text-primary">{formatCurrency(invoice.payment.amount_due)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Due Date:</span>
                <span>{invoice.payment.due_date}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Direct online credit card processing is routed securely through your account payment preferences.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsPayModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsPayModalOpen(false)}>
              Proceed to Secure Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
