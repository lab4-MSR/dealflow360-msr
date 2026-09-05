import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  Building2,
  AlertCircle,
  Ban,
  Send,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { InvoiceStatusBadge, CurrencyValue } from "../components/FinanceBadges"
import { getInvoice, voidInvoice, sendInvoice } from "../services/finance.service"

export function FinanceInvoiceDetailsPage() {
  const { id = "inv-001" } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadInvoice()
  }, [id])

  async function loadInvoice() {
    setLoading(true)
    try {
      const data = await getInvoice(id)
      setInvoice(data)
    } catch (error) {
      console.error("Failed to load invoice details:", error)
      toast.error("Failed to load invoice details")
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    setActionLoading(true)
    try {
      await sendInvoice(id)
      toast.success("Invoice dispatched to customer via email")
    } catch (e: any) {
      toast.error(e.message || "Failed to send invoice")
    } finally {
      setActionLoading(false)
    }
  }

  const handleVoid = async () => {
    setActionLoading(true)
    try {
      await voidInvoice(id)
      setInvoice((prev: any) => ({ ...prev, status: "void" }))
      toast.success("Invoice voided successfully")
    } catch (e: any) {
      toast.error(e.message || "Failed to void invoice")
    } finally {
      setActionLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold">Invoice not found</h2>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/finance/billing/invoices">Back to Invoices</Link>
        </Button>
      </div>
    )
  }

  const subtotal = invoice.items?.reduce((acc: number, item: any) => acc + (item.quantity * item.unit_price), 0) || invoice.amount
  const tax = Math.round(subtotal * 0.18)
  const grandTotal = subtotal + tax

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/finance/billing/invoices")}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Invoices
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {invoice.invoice_number}
            </h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Created on {new Date(invoice.created_at || Date.now()).toLocaleDateString("en-IN", { dateStyle: "long" })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" /> Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("PDF generation initiated")}
          >
            <Download className="h-4 w-4 mr-1.5" /> Download PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSend}
            disabled={actionLoading || invoice.status === "void"}
          >
            <Send className="h-4 w-4 mr-1.5" /> Send to Customer
          </Button>
          {invoice.status !== "void" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleVoid}
              disabled={actionLoading}
            >
              <Ban className="h-4 w-4 mr-1.5" /> Void
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-caption text-muted-foreground">Invoice Amount</span>
            <p className="text-h3 font-bold mt-1 text-foreground">
              <CurrencyValue value={grandTotal} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-caption text-muted-foreground">Due Date</span>
            <p className="text-h3 font-semibold mt-1 text-foreground">
              {new Date(invoice.due_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-caption text-muted-foreground">Payment Status</span>
            <div className="mt-1">
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-caption text-muted-foreground">Payment Terms</span>
            <p className="text-h3 font-semibold mt-1 text-foreground">Net 30</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer & Billing Entity Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Billed To (Customer)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p className="font-semibold text-sm text-foreground">{invoice.customer?.name || "Acme Technologies Ltd"}</p>
            <p className="text-muted-foreground">Email: {invoice.customer?.email || "accounts@acme.corp"}</p>
            <p className="text-muted-foreground">GSTIN / Tax ID: 29AABCU9603R1ZM</p>
            <p className="text-muted-foreground">Address: Cyber City, Tower B, Gurugram, HR - 122002</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Issued By (DealFlow360 Tenant)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p className="font-semibold text-sm text-foreground">DealFlow360 Enterprise Solutions Pvt Ltd</p>
            <p className="text-muted-foreground">GSTIN: 07AAECB2941Q1ZP</p>
            <p className="text-muted-foreground">PAN: AAECB2941Q</p>
            <p className="text-muted-foreground">Bank: HDFC Bank, Escrow Branch · IFSC: HDFC0001234</p>
          </CardContent>
        </Card>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Description</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Quantity</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Unit Price</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium text-foreground">{item.description}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{item.quantity}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <CurrencyValue value={item.unit_price} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        <CurrencyValue value={item.total || item.quantity * item.unit_price} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-3 font-medium text-foreground">Enterprise Licensing & Subscription</td>
                    <td className="px-4 py-3 text-right tabular-nums">1</td>
                    <td className="px-4 py-3 text-right tabular-nums"><CurrencyValue value={invoice.amount} /></td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums"><CurrencyValue value={invoice.amount} /></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end mt-4 pt-4 border-t border-border">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono"><CurrencyValue value={subtotal} /></span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST (18%)</span>
                <span className="font-mono"><CurrencyValue value={tax} /></span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground border-t border-border pt-2">
                <span>Grand Total</span>
                <span className="font-mono"><CurrencyValue value={grandTotal} /></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
