import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { History, Search, ArrowLeft, CheckCircle2, XCircle, Undo2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { getApprovalHistory } from '@/services/salesManager'
import { downloadCsv } from '@/lib/export-csv'
import type { ApprovalHistoryItem } from '@/types/salesManager'
import { toast } from 'sonner'

export function ApprovalHistoryPage() {
  const [history, setHistory] = useState<ApprovalHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [decisionFilter, setDecisionFilter] = useState('all')

  useEffect(() => {
    getApprovalHistory()
      .then((data) => setHistory(data))
      .catch((err) => toast.error('Failed to load history: ' + err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = history.filter((item) => {
    if (decisionFilter !== 'all' && item.decision !== decisionFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      item.quote_number.toLowerCase().includes(q) ||
      item.deal_name.toLowerCase().includes(q) ||
      item.customer_name.toLowerCase().includes(q) ||
      item.rep_name.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/sales-manager/approvals" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Inbox</span>
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Approval Decision Audit Log</h1>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (!filtered.length) {
              toast.error('No decision records to export.')
              return
            }
            const rows = filtered.map((item) => ({
              Quote_Number: item.quote_number,
              Deal_Name: item.deal_name,
              Customer_Name: item.customer_name,
              Rep_Name: item.rep_name,
              Total_Value_INR: Number(item.total_value ?? item.deal_value ?? 0),
              Decision: item.decision.toUpperCase(),
              Decided_By: typeof item.decided_by === 'object' && item.decided_by !== null ? (item.decided_by as any).name : item.decided_by,
              Decided_At: item.decided_at,
              Notes_or_Reason: item.comment || item.reason_or_notes || '',
            }))
            downloadCsv(`Approval_Decision_Log_${new Date().toISOString().split('T')[0]}`, rows)
            toast.success('Approval decision history exported to CSV!')
          }}
          className="text-xs"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export Log CSV
        </Button>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quote, deal, customer..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            {['all', 'approved', 'rejected', 'returned'].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={decisionFilter === d ? 'default' : 'outline'}
                onClick={() => setDecisionFilter(d)}
                className="capitalize"
              >
                {d}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-body font-semibold">Decision Records ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border text-caption text-muted-foreground">
                <tr>
                  <th className="pb-3 font-medium">Quote & Deal</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Rep</th>
                  <th className="pb-3 text-right font-medium">Value</th>
                  <th className="pb-3 text-center font-medium">Decision</th>
                  <th className="pb-3 font-medium">Decided By</th>
                  <th className="pb-3 font-medium">Date & Time</th>
                  <th className="pb-3 font-medium">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      Loading decision history...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No decision records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="py-3 font-medium">
                        <Link
                          to={`/sales/quotations/${item.quotation_id}`}
                          className="text-primary hover:underline font-mono"
                        >
                          {item.quote_number}
                        </Link>
                        <span className="text-caption text-muted-foreground block">{item.deal_name}</span>
                      </td>
                      <td className="py-3">{item.customer_name}</td>
                      <td className="py-3 text-muted-foreground">{item.rep_name}</td>
                      <td className="py-3 text-right tabular-nums font-medium">
                        ₹{Number(item.total_value ?? item.deal_value ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-semibold capitalize ${
                            item.decision === 'approved'
                              ? 'bg-success-subtle text-success'
                              : item.decision === 'rejected'
                              ? 'bg-danger-subtle text-danger'
                              : 'bg-warning-subtle text-warning'
                          }`}
                        >
                          {item.decision === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                          {item.decision === 'rejected' && <XCircle className="h-3 w-3" />}
                          {item.decision === 'returned' && <Undo2 className="h-3 w-3" />}
                          {item.decision}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {typeof item.decided_by === 'object' && item.decided_by !== null ? (item.decided_by as any).name : item.decided_by}
                      </td>
                      <td className="py-3 text-muted-foreground text-caption">
                        {new Date(item.decided_at).toLocaleDateString()} {new Date(item.decided_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 max-w-xs truncate text-muted-foreground text-caption">
                        {item.comment || item.reason_or_notes || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
