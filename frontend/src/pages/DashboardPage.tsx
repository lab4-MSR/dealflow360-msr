import { Link } from 'react-router-dom'
import { KpiCard } from '@/components/ui/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoneyDisplay, PercentageDisplay, DiscountIndicator, RiskIndicator } from '@/components/shared'
import {
  FileText,
  Users,
  DollarSign,
  AlertTriangle,
  Plus,
  ArrowRight,
} from 'lucide-react'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 text-foreground">Sales Dashboard</h1>
          <p className="text-body text-muted-foreground mt-1">
            Welcome back. Here is your sales pipeline overview and activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link to="/sales/quotations/create">
              <Plus className="h-4 w-4" />
              New Quotation
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm">
            <Link to="/sales/deals">
              View Deals
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/sales/deals" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
          <KpiCard
            label="Total Revenue"
            value="₹2,84,500"
            trend={{ value: 12.5, direction: 'up' }}
            icon={<DollarSign className="h-5 w-5" />}
            className="hover:shadow-md transition-all cursor-pointer h-full"
          />
        </Link>
        <Link to="/sales/quotations" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
          <KpiCard
            label="Active Quotations"
            value="47"
            trend={{ value: 8.2, direction: 'up' }}
            icon={<FileText className="h-5 w-5" />}
            className="hover:shadow-md transition-all cursor-pointer h-full"
          />
        </Link>
        <Link to="/sales/customers" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
          <KpiCard
            label="Customers"
            value="156"
            trend={{ value: 3.1, direction: 'up' }}
            icon={<Users className="h-5 w-5" />}
            className="hover:shadow-md transition-all cursor-pointer h-full"
          />
        </Link>
        <Link to="/sales/deals" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
          <KpiCard
            label="Pending Approvals"
            value="12"
            variant="warning"
            trend={{ value: 2.4, direction: 'down' }}
            icon={<AlertTriangle className="h-5 w-5" />}
            className="hover:shadow-md transition-all cursor-pointer h-full"
          />
        </Link>
      </div>

      {/* Status & Risk Demos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Status System Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="draft">Draft</StatusBadge>
              <StatusBadge status="pending">Pending</StatusBadge>
              <StatusBadge status="approved">Approved</StatusBadge>
              <StatusBadge status="rejected">Rejected</StatusBadge>
              <StatusBadge status="negotiation">Negotiation</StatusBadge>
              <StatusBadge status="confirmed">Confirmed</StatusBadge>
              <StatusBadge status="fulfillment">Fulfillment</StatusBadge>
              <StatusBadge status="backorder">Backorder</StatusBadge>
              <StatusBadge status="completed">Completed</StatusBadge>
              <StatusBadge status="failed">Failed</StatusBadge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk System Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <RiskBadge risk="low">Low Risk</RiskBadge>
              <RiskBadge risk="medium">Medium Risk</RiskBadge>
              <RiskBadge risk="high">High Risk</RiskBadge>
              <RiskBadge risk="critical">Critical Risk</RiskBadge>
            </div>
            <div className="space-y-3">
              <RiskIndicator level="low" score={15} />
              <RiskIndicator level="medium" score={45} />
              <RiskIndicator level="high" score={72} />
              <RiskIndicator level="critical" score={92} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Components */}
      <Card>
        <CardHeader>
          <CardTitle>Business Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-small text-muted-foreground">Revenue:</span>
              <MoneyDisplay amount={284500} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-small text-muted-foreground">Margin:</span>
              <PercentageDisplay value={23.5} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-small text-muted-foreground">Discount:</span>
              <DiscountIndicator allowed={10} applied={18} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-small text-muted-foreground">Discount:</span>
              <DiscountIndicator allowed={15} applied={12} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="default">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="intelligence">Intelligence</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
