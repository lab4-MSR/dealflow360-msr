import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FileText, RefreshCw, Search, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { KpiCard } from "@/components/ui/kpi-card"
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

  const handleExport = () => {
    if (!invoices.length) return
    const headers = ["Invoice Number", "Customer", "Amount", "Due Date", "Status"]
    const rows = invoices.map(i => [
      `"${i.invoice_number || ""}"`,
      `"${i.customer?.name || ""}"`,
      `"${i.amount || 0}"`,
      `"${i.due_date || ""}"`,
      `"${i.status || ""}"`
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `invoices_export_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredInvoices = invoices.filter(inv =>
    !search ||
    inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.status?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage billing, invoice generation, payment statuses, and financial collections"
        breadcrumbs={[
          { label: 'Finance', href: '/finance' },
          { label: 'Invoices' },
        ]}
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            Billing
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
            <Button variant="outline" size="sm" onClick={loadInvoices} className="gap-1.5 text-xs">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        }
      />

      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <KpiCard label="Total" value={kpis.total || 0} />
          <KpiCard label="Paid" value={kpis.paid || 0} variant="success" />
          <KpiCard label="Pending" value={kpis.issued || 0} variant="warning" />
          <KpiCard label="Overdue" value={kpis.overdue || 0} variant="danger" />
          <KpiCard label="Failed" value={kpis.failed || 0} variant="danger" />
          <KpiCard label="Total Value" value={`₹${((kpis.total_amount || 0) / 100000).toFixed(1)}L`} />
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
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>{search ? "No invoices matching search" : "No invoices found"}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-y border-border"><tr><th className="px-4 py-2.5 font-semibold">Invoice</th><th className="px-4 py-2.5 font-semibold">Customer</th><th className="px-4 py-2.5 font-semibold text-right">Amount</th><th className="px-4 py-2.5 font-semibold">Due Date</th><th className="px-4 py-2.5 font-semibold">Status</th><th className="px-4 py-2.5 font-semibold text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {filteredInvoices.map((inv) => (
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
