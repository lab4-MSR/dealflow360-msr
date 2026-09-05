import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CreditCard,
  Search,
  ArrowRight,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getCustomerInvoices, type CustomerInvoice } from '@/lib/customer-portal-api'

export const CustomerInvoicesPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getCustomerInvoices()
      setInvoices(res.invoices || [])
    } catch (err) {
      console.error('Failed to load customer invoices', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success text-white">Paid</Badge>
      case 'pending':
        return <Badge className="bg-amber-500 text-white">Pending</Badge>
      case 'overdue':
        return <Badge variant="danger">Overdue</Badge>
      default:
        return <Badge variant="secondary">Partial</Badge>
    }
  }

  const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balance_due, 0)
  const totalPaid = invoices.reduce((acc, inv) => acc + inv.paid_amount, 0)

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (inv.order_number || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing & Invoices</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tax invoices, payment histories, and direct electronic receipt downloads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Total Invoiced</span>
          <p className="text-2xl font-bold text-foreground mt-1">
            ₹{(totalOutstanding + totalPaid).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-muted-foreground">{invoices.length} invoices issued</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Outstanding Balance</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-muted-foreground">Due per payment terms</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Total Settled</span>
          <p className="text-2xl font-bold text-success mt-1">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-muted-foreground">Successfully processed</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice number, order reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'pending', 'paid', 'overdue'].map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(st)}
              className="text-xs capitalize h-9"
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-muted border-b border-border text-muted-foreground uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-3">Order Ref</th>
                    <th className="py-3 px-3">Issue Date</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Total (₹)</th>
                    <th className="py-3 px-3">Balance Due</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        <Link
                          to={`/customer-portal/invoices/${inv.id}`}
                          className="text-primary hover:underline"
                        >
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-foreground">{inv.order_number || '—'}</td>
                      <td className="py-3.5 px-3 text-muted-foreground">{inv.issue_date}</td>
                      <td className="py-3.5 px-3 font-medium text-foreground">{inv.due_date}</td>
                      <td className="py-3.5 px-3 font-semibold text-foreground">
                        ₹{inv.total_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 font-semibold">
                        {inv.balance_due > 0 ? (
                          <span className="text-amber-600">₹{inv.balance_due.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-success">₹0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">{getStatusBadge(inv.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Link to={`/customer-portal/invoices/${inv.id}`}>
                          <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                            View <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
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
