import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  RefreshCw,
  RefreshCcw,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PauseCircle,
  CreditCard,
  ShieldCheck,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { SubscriptionStatusBadge, InvoiceStatusBadge, CurrencyValue } from "../components/FinanceBadges"
import { getSubscription } from "../services/finance.service"

export function FinanceSubscriptionDetailsPage() {
  const { id = "sub-001" } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [sub, setSub] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadSubscription()
  }, [id])

  async function loadSubscription() {
    setLoading(true)
    try {
      const data = await getSubscription(id)
      setSub(data)
    } catch (error) {
      console.error("Failed to load subscription details:", error)
      toast.error("Failed to load subscription details")
    } finally {
      setLoading(false)
    }
  }

  const handlePauseResume = () => {
    setActionLoading(true)
    setTimeout(() => {
      const newStatus = sub.status === "paused" ? "active" : "paused"
      setSub((prev: any) => ({ ...prev, status: newStatus }))
      setActionLoading(false)
      toast.success(`Subscription marked as ${newStatus}`)
    }, 400)
  }

  const handleCancel = () => {
    setActionLoading(true)
    setTimeout(() => {
      setSub((prev: any) => ({ ...prev, status: "cancelled" }))
      setActionLoading(false)
      toast.success("Subscription cancelled per proration terms")
    }, 400)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!sub) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold">Subscription not found</h2>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/finance/subscriptions">Back to Subscriptions</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/finance/subscriptions")}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Subscriptions
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {sub.subscription_name}
            </h1>
            <SubscriptionStatusBadge status={sub.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Started on {new Date(sub.started_at || Date.now()).toLocaleDateString("en-IN", { dateStyle: "long" })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sub.status !== "cancelled" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseResume}
                disabled={actionLoading}
              >
                <PauseCircle className="h-4 w-4 mr-1.5" />
                {sub.status === "paused" ? "Resume Billing" : "Pause Subscription"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                <XCircle className="h-4 w-4 mr-1.5" /> Cancel Subscription
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-caption text-muted-foreground">Recurring Amount</span>
            <p className="text-h3 font-bold mt-1 text-foreground">
              <CurrencyValue value={sub.amount} />
            </p>
            <span className="text-[11px] text-muted-foreground capitalize">per {sub.billing_cycle}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-caption text-muted-foreground">Current Billing Term</span>
            <p className="text-sm font-semibold mt-1 text-foreground">
              {new Date(sub.current_period_start).toLocaleDateString("en-IN", { dateStyle: "short" })} –{" "}
              {new Date(sub.current_period_end).toLocaleDateString("en-IN", { dateStyle: "short" })}
            </p>
            <span className="text-[11px] text-success flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3" /> Term Active
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-caption text-muted-foreground">Next Invoice Date</span>
            <p className="text-h3 font-semibold mt-1 text-foreground">
              {new Date(sub.next_billing_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-caption text-muted-foreground">Allocated Capacity</span>
            <p className="text-h3 font-bold mt-1 text-foreground">{sub.seats || 1} Seats</p>
            <span className="text-[11px] text-muted-foreground">Concurrent user licenses</span>
          </CardContent>
        </Card>
      </div>

      {/* Plan & Customer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Plan Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Plan Name</span>
              <span className="font-semibold text-foreground">{sub.plan?.name || "Enterprise Cloud Suite"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Plan Code</span>
              <span className="font-mono text-muted-foreground">{sub.plan?.code || "PLAN-ENT-01"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Billing Cycle</span>
              <span className="capitalize text-foreground">{sub.billing_cycle}</span>
            </div>
            <div className="flex justify-between py-1 pt-2">
              <span className="text-muted-foreground">Auto-Renewal</span>
              <Badge variant="success" className="text-[10px]">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Customer Account
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-semibold text-foreground">{sub.customer?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Billing Email</span>
              <span className="text-foreground">{sub.customer?.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Customer Tier</span>
              <Badge variant="outline" className="capitalize text-[10px]">{sub.customer?.tier || "Enterprise"}</Badge>
            </div>
            <div className="flex justify-between py-1 pt-2">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="text-foreground">Corporate Auto-Debit / ACH</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proration & Cancellation Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <RefreshCcw className="h-4 w-4 text-primary" /> Proration & Cancellation Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-border bg-muted/20">
              <p className="font-semibold text-foreground mb-1">Proration Behavior</p>
              <p className="text-muted-foreground">
                Mid-term upgrades or additions are calculated on a day-by-day proportional credit basis ({sub.proration?.policy || "Immediate Credit"}).
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-muted/20">
              <p className="font-semibold text-foreground mb-1">Cancellation Rule</p>
              <p className="text-muted-foreground">
                Cancellation takes effect at the end of the current billing period ({sub.proration?.cancellation_rule || "End of Period"}).
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-muted/20">
              <p className="font-semibold text-foreground mb-1">Refund Terms</p>
              <p className="text-muted-foreground">
                Unused service days are credited to the customer account balance for future quotation settlements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linked Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Subscription Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Invoice Number</th>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sub.invoices && sub.invoices.length > 0 ? (
                  sub.invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono font-medium text-foreground">{inv.invoice_number}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        <CurrencyValue value={inv.amount} />
                      </td>
                      <td className="px-4 py-3">
                        <InvoiceStatusBadge status={inv.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                          <Link to={`/finance/invoices/${inv.id}`}>View Invoice</Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No invoices linked yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
