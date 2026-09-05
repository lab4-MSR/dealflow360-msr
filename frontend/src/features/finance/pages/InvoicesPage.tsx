import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FileText, RefreshCw, Search, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InvoiceStatusBadge, CurrencyValue } from "../components/FinanceBadges"
import { getInvoices, getInvoiceKpis } from "../services/finance.service"

export function InvoicesPage() {
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])
  const [kpis, setKpis] = useState<any>(null)
  const [search, setSearch] = useState("")

  useEffect(() => { loadInvoices() }, [])
  async function loadInvoices() {
    setLoading(true)
    try {
      const [invData, kpiData] = await Promise.all([getInvoices(), getInvoiceKpis()])
      setInvoices(invData.data || [])
      setKpis(kpiData)
    } catch (error) { console.error("Failed to load invoices:", error) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div><h1 className="text-2xl font-bold tracking-tight">Invoices</h1><p className="text-sm text-muted-foreground mt-1">Manage billing and invoices</p></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button variant="outline" size="sm" onClick={loadInvoices}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
        </div>
      </div>

      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card><CardContent className="p-4"><p className="text-caption text-muted-foreground">Total</p><p className="text-h2 font-semibold">{kpis.total || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-caption text-muted-foreground">Paid</p><p className="text-h2 font-semibold text-success">{kpis.paid || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-caption text-muted-foreground">Pending</p><p className="text-h2 font-semibold text-warning">{kpis.issued || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-caption text-muted-foreground">Overdue</p><p className="text-h2 font-semibold text-danger">{kpis.overdue || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-caption text-muted-foreground">Failed</p><p className="text-h2 font-semibold text-danger">{kpis.failed || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-caption text-muted-foreground">Draft</p><p className="text-h2 font-semibold text-muted-foreground">{kpis.draft || 0}</p></CardContent></Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No invoices found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-y border-border"><tr><th className="px-4 py-2.5 font-semibold">Invoice</th><th className="px-4 py-2.5 font-semibold">Customer</th><th className="px-4 py-2.5 font-semibold text-right">Amount</th><th className="px-4 py-2.5 font-semibold">Due Date</th><th className="px-4 py-2.5 font-semibold">Status</th><th className="px-4 py-2.5 font-semibold text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono font-medium">{inv.invoice_number}</td>
                      <td className="px-4 py-3">{inv.customer?.name}</td>
                      <td className="px-4 py-3 text-right font-semibold"><CurrencyValue value={inv.amount} /></td>
                      <td className="px-4 py-3">{new Date(inv.due_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                      <td className="px-4 py-3"><InvoiceStatusBadge status={inv.status} /></td>
                      <td className="px-4 py-3 text-right"><Button asChild size="sm" variant="ghost" className="h-7 text-xs"><Link to={`/finance/invoices/${inv.id}`}>View</Link></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
