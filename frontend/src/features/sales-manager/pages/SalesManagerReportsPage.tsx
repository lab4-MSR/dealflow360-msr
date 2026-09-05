import { useState } from 'react'
import { FileText, Download, Calendar, Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { scheduleReport } from '@/services/salesManager'
import { toast } from 'sonner'

export function SalesManagerReportsPage() {
  const [scheduled, setScheduled] = useState<string | null>(null)

  const handleExport = (reportName: string) => {
    toast.success(`Exporting ${reportName} to CSV...`)
  }

  const handleSchedule = async (type: string) => {
    try {
      await scheduleReport(type, 'weekly')
      setScheduled(type)
      toast.success(`Weekly schedule active for ${type}`)
    } catch {
      toast.error('Failed to schedule report')
    }
  }

  const reports = [
    {
      id: 'pipeline_velocity',
      title: 'Pipeline Velocity & Conversion Report',
      desc: 'Weekly breakdown of time spent per deal stage and conversion rate drop-offs.',
      frequency: 'Weekly on Mondays',
    },
    {
      id: 'discount_variance',
      title: 'Discount Variance & Margin Bleed Audit',
      desc: 'Detailed log of all quotes exceeding ceiling guidelines and margin compression impact.',
      frequency: 'Daily digest',
    },
    {
      id: 'rep_quota_attainment',
      title: 'Quota Attainment & Forecasting Digest',
      desc: 'Individual representative performance versus monthly and quarterly targets.',
      frequency: 'Weekly on Fridays',
    },
    {
      id: 'approval_sla_metrics',
      title: 'Approval Turnaround & SLA Compliance',
      desc: 'Operational metrics on approval cycle duration and manager bottleneck analysis.',
      frequency: 'Monthly digest',
    },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-h2 font-semibold text-foreground">Sales Management Reports & Exports</h1>
        <p className="text-body-small text-muted-foreground">
          Pre-built executive reports, CSV exports, and automated scheduled distribution for sales leadership.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {reports.map((rep) => (
          <Card key={rep.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-caption">Scheduled: {rep.frequency}</Badge>
                {scheduled === rep.id && (
                  <span className="flex items-center gap-1 text-caption text-success font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                )}
              </div>
              <CardTitle className="text-body font-semibold pt-2">{rep.title}</CardTitle>
              <CardDescription className="text-body-small">{rep.desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSchedule(rep.id)}
              >
                <Mail className="mr-1.5 h-3.5 w-3.5" />
                Schedule Email
              </Button>
              <Button
                size="sm"
                onClick={() => handleExport(rep.title)}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
