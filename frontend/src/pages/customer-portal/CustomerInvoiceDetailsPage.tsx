import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  CreditCard,
  ArrowLeft,
  Download,
  CheckCircle,
  Clock,
  Printer,
  FileCheck,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getCustomerInvoiceDetail, type CustomerInvoice } from '@/lib/customer-portal-api'

export const CustomerInvoiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<CustomerInvoice | null>(null)
  const [paidMessage, setPaidMessage] = useState(false)

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await getCustomerInvoiceDetail(id)
      setInvoice(res)
    } catch (err) {
      console.error('Failed to load invoice details', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (loading || !invoice) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/customer-portal/invoices')}
            className="gap-1 text-xs mb-2 text-muted-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Invoices
          </Button>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Tax Invoice: {invoice.invoice_number}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Issued on {invoice.issue_date} · Due by {invoice.due_date}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1 text-xs">
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button
            size="sm"
            onClick={() => alert('Downloading official GST-compliant signed PDF invoice...')}
            className="gap-1 text-xs bg-primary"
          >
            <Download className="h-3.5 w-3.5" /> Download PDF
          </Button>
        </div>
      </div>

      {paidMessage && (
        <div className="p-4 bg-success-subtle text-success text-sm font-semibold rounded-lg">
          ✓ Payment initiated via corporate gateway. Reference ID generated.
        </div>
      )}

      {/* Invoice Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Status</span>
          <div className="mt-1">
            <Badge
              className={
                invoice.status === 'paid'
                  ? 'bg-success text-white'
                  : invoice.status === 'overdue'
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-500 text-white'
              }
            >
              {invoice.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Total Invoiced</span>
          <p className="text-xl font-bold text-foreground mt-1">₹{invoice.total_amount.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Amount Paid</span>
          <p className="text-xl font-bold text-success mt-1">₹{invoice.paid_amount.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Balance Due</span>
          <p className="text-xl font-bold text-amber-600 mt-1">₹{invoice.balance_due.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold">Line Items Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-muted border-b border-border text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-3 text-right">Qty</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-3 text-right">Discount</th>
                  <th className="py-3 px-3 text-right">GST / Tax</th>
                  <th className="py-3 px-4 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(invoice.items || []).map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4 font-medium text-foreground">{item.description}</td>
                    <td className="py-3 px-3 text-right font-medium">{item.quantity}</td>
                    <td className="py-3 px-3 text-right">₹{item.unit_price.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right">{item.discount_percent}%</td>
                    <td className="py-3 px-3 text-right">₹{item.tax_amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-semibold text-foreground">
                      ₹{item.line_total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border flex justify-end">
            <div className="w-72 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span>₹{invoice.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Total Tax (GST 18%):</span>
                <span>₹{invoice.tax_total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-foreground pt-2 border-t border-border">
                <span>Grand Total:</span>
                <span>₹{invoice.total_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions / Recorded Payments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {(invoice.payments || []).length === 0 ? (
              <p className="text-xs text-muted-foreground">No payments recorded yet.</p>
            ) : (
              (invoice.payments || []).map((p: any) => (
                <div key={p.id} className="p-3 rounded-lg border border-border bg-surface text-xs space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{p.payment_method}</span>
                    <span className="text-success font-bold">+₹{p.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex justify-between">
                    <span>Ref: {p.transaction_ref}</span>
                    <span>{p.payment_date}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold">Bank Remittance Instructions</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-xs space-y-2 text-muted-foreground">
            <p>
              <strong className="text-foreground">Bank:</strong> HDFC Bank Ltd, Fort Branch, Mumbai
            </p>
            <p>
              <strong className="text-foreground">Account Name:</strong> DealFlow360 Technologies Pvt Ltd
            </p>
            <p>
              <strong className="text-foreground">Account Number:</strong> 50200088991244
            </p>
            <p>
              <strong className="text-foreground">IFSC Code:</strong> HDFC0000060
            </p>
            <p className="pt-2 text-[11px]">
              Please mention invoice number <strong>{invoice.invoice_number}</strong> in the transfer remarks.
            </p>
          </CardContent>
          {invoice.balance_due > 0 && (
            <div className="p-4 border-t border-border">
              <Button
                onClick={() => setPaidMessage(true)}
                className="w-full bg-primary text-xs h-9"
              >
                Pay Outstanding Balance (₹{invoice.balance_due.toLocaleString('en-IN')})
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
