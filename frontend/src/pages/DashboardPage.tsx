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
} from 'lucide-react'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-foreground">Dashboard</h1>
        <p className="text-body text-muted-foreground mt-1">
          Welcome back. Here's your sales overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Revenue"
          value="$284,500"
          trend={{ value: 12.5, direction: 'up' }}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          label="Active Quotations"
          value="47"
          trend={{ value: 8.2, direction: 'up' }}
          icon={<FileText className="h-5 w-5" />}
        />
        <KpiCard
          label="Customers"
          value="156"
          trend={{ value: 3.1, direction: 'up' }}
          icon={<Users className="h-5 w-5" />}
        />
        <KpiCard
          label="Pending Approvals"
          value="12"
          variant="warning"
          trend={{ value: 2.4, direction: 'down' }}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
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

      {/* Button & Typography Demos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Button System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="intelligence">Intelligence</Button>
              <Button variant="outline">Outline</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </CardContent>
        </Card>

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

      {/* Typography Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Scale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-display text-foreground">Display (48/56)</p>
            <p className="text-h1 text-foreground">Heading 1 (32/40)</p>
            <p className="text-h2 text-foreground">Heading 2 (24/32)</p>
            <p className="text-h3 text-foreground">Heading 3 (20/28)</p>
            <p className="text-h4 text-foreground">Heading 4 (18/26)</p>
            <p className="text-body text-foreground">Body (16/24)</p>
            <p className="text-body-small text-muted-foreground">Body Small (14/22)</p>
            <p className="text-small text-muted-foreground">Small (13/20)</p>
            <p className="text-caption text-muted-foreground">Caption (12/16)</p>
            <p className="text-label text-muted-foreground">Label (13/18)</p>
            <p className="text-body tabular-nums">Tabular: $12,345.67 | 23.5% | 1,234</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
