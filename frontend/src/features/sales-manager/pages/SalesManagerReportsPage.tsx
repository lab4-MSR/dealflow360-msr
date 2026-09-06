import { useState } from 'react'
import { FileText, Download, Calendar, Mail, CheckCircle2, Eye, Clock, Table, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { scheduleReport } from '@/services/salesManager'
import { downloadCsv } from '@/lib/export-csv'
import { toast } from 'sonner'

export function SalesManagerReportsPage() {
  const [scheduled, setScheduled] = useState<Record<string, string>>({
    pipeline_velocity: 'Weekly on Mondays',
    rep_quota_attainment: 'Weekly on Fridays',
  })
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [recipientEmail, setRecipientEmail] = useState('manager@dealflow360.app')
  const [selectedFreq, setSelectedFreq] = useState<'monthly' | 'daily' | 'weekly'>('weekly')
  const [previewReport, setPreviewReport] = useState<any | null>(null)

  const reportDatasets: Record<string, Record<string, any>[]> = {
    pipeline_velocity: [
      { Stage: '01. Discovery', Active_Deals: 14, Avg_Days_in_Stage: 8.4, Total_Value_INR: 4200000, Conversion_Rate_Pct: '78%' },
      { Stage: '02. Solution Proposal', Active_Deals: 12, Avg_Days_in_Stage: 11.2, Total_Value_INR: 5800000, Conversion_Rate_Pct: '64%' },
      { Stage: '03. Price Negotiation', Active_Deals: 9, Avg_Days_in_Stage: 6.5, Total_Value_INR: 4900000, Conversion_Rate_Pct: '82%' },
      { Stage: '04. Manager Approval', Active_Deals: 6, Avg_Days_in_Stage: 2.1, Total_Value_INR: 3100000, Conversion_Rate_Pct: '91%' },
      { Stage: '05. Closed Won', Active_Deals: 28, Avg_Days_in_Stage: 24.0, Total_Value_INR: 12400000, Conversion_Rate_Pct: '100%' },
    ],
    discount_variance: [
      { Quote_Number: 'Q-2026-00482', Account_Name: 'Acme Global Enterprises', Rep_Name: 'Marcus Vance', List_Price: 148000, Net_Price: 120620, Discount_Pct: '18.5%', Ceiling_Pct: '12.0%', Margin_Pct: '21.8%', Policy_Violation: 'Excess Discount (+6.5%)' },
      { Quote_Number: 'Q-2026-00485', Account_Name: 'Solaria BioTech Corp', Rep_Name: 'Aisha Patel', List_Price: 96000, Net_Price: 72000, Discount_Pct: '25.0%', Ceiling_Pct: '15.0%', Margin_Pct: '16.4%', Policy_Violation: 'Severe Margin Bleed (<20%)' },
      { Quote_Number: 'Q-2026-00489', Account_Name: 'Omni Retail Group', Rep_Name: 'Carlos Gomez', List_Price: 320000, Net_Price: 288000, Discount_Pct: '10.0%', Ceiling_Pct: '12.0%', Margin_Pct: '26.5%', Policy_Violation: 'None (Compliant)' },
      { Quote_Number: 'Q-2026-00493', Account_Name: 'Delta Dynamics Ltd', Rep_Name: 'Elena Rostova', List_Price: 85000, Net_Price: 66300, Discount_Pct: '22.0%', Ceiling_Pct: '15.0%', Margin_Pct: '19.2%', Policy_Violation: 'Excess Discount (+7.0%)' },
    ],
    rep_quota_attainment: [
      { Rep_Name: 'Marcus Vance', Region: 'North America Enterprise', Quota_INR: 850000, Closed_Revenue_INR: 782000, Attainment_Pct: '92.0%', Win_Rate: '48%', Avg_Discount: '12.4%', Active_Deals: 6 },
      { Rep_Name: 'Aisha Patel', Region: 'APAC Growth', Quota_INR: 750000, Closed_Revenue_INR: 652500, Attainment_Pct: '87.0%', Win_Rate: '52%', Avg_Discount: '9.8%', Active_Deals: 5 },
      { Rep_Name: 'Carlos Gomez', Region: 'EMEA Commercial', Quota_INR: 600000, Closed_Revenue_INR: 372000, Attainment_Pct: '62.0%', Win_Rate: '36%', Avg_Discount: '16.2%', Active_Deals: 4 },
      { Rep_Name: 'Elena Rostova', Region: 'Eastern Europe Mid-Market', Quota_INR: 500000, Closed_Revenue_INR: 390000, Attainment_Pct: '78.0%', Win_Rate: '44%', Avg_Discount: '13.1%', Active_Deals: 3 },
    ],
    approval_sla_metrics: [
      { Quote_Number: 'Q-2026-00482', Deal_Name: 'Acme Cloud Migration', Rep_Name: 'Marcus Vance', Deal_Value_INR: 128400, Turnaround_Hours: 3.4, SLA_Threshold: '4.0 Hours', SLA_Status: 'Met SLA', Approver: 'Vikram Bose' },
      { Quote_Number: 'Q-2026-00485', Deal_Name: 'Solaria BioTech Expansion', Rep_Name: 'Aisha Patel', Deal_Value_INR: 96000, Turnaround_Hours: 6.2, SLA_Threshold: '4.0 Hours', SLA_Status: 'Breached SLA (+2.2h)', Approver: 'Sunil Mehta (Escalated)' },
      { Quote_Number: 'Q-2026-00489', Deal_Name: 'Omni Retail Modernization', Rep_Name: 'Carlos Gomez', Deal_Value_INR: 320000, Turnaround_Hours: 1.8, SLA_Threshold: '4.0 Hours', SLA_Status: 'Met SLA', Approver: 'Vikram Bose' },
      { Quote_Number: 'Q-2026-00493', Deal_Name: 'Delta Robotics License', Rep_Name: 'Elena Rostova', Deal_Value_INR: 85000, Turnaround_Hours: 2.5, SLA_Threshold: '4.0 Hours', SLA_Status: 'Met SLA', Approver: 'Vikram Bose' },
    ],
  }

  const handleExport = (reportId: string, reportTitle: string) => {
    const data = reportDatasets[reportId]
    if (!data || data.length === 0) {
      toast.error('No export data found for this report.')
      return
    }
    downloadCsv(`${reportId}_${new Date().toISOString().split('T')[0]}`, data)
    toast.success(`Exported "${reportTitle}" as CSV successfully!`)
  }

  const handleSaveSchedule = async () => {
    if (!activeModal) return
    try {
      await scheduleReport({
        report_type: activeModal,
        frequency: selectedFreq,
        recipients: [recipientEmail],
      })
      setScheduled((prev) => ({
        ...prev,
        [activeModal]: `${selectedFreq.charAt(0).toUpperCase() + selectedFreq.slice(1)} to ${recipientEmail}`,
      }))
      toast.success(`Automated schedule saved for ${activeModal.replace('_', ' ')}!`)
      setActiveModal(null)
    } catch {
      toast.error('Failed to schedule report.')
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Sales Management Reports & Exports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pre-built executive reports, live CSV exports, and automated scheduled distribution for sales leadership.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {reports.map((rep) => (
          <Card key={rep.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {scheduled[rep.id] ? `Active: ${scheduled[rep.id]}` : `Default: ${rep.frequency}`}
                </Badge>
                {scheduled[rep.id] && (
                  <span className="flex items-center gap-1 text-xs text-success font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                )}
              </div>
              <CardTitle className="text-base font-semibold pt-2">{rep.title}</CardTitle>
              <CardDescription className="text-xs leading-relaxed">{rep.desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewReport({ id: rep.id, title: rep.title, data: reportDatasets[rep.id] })}
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveModal(rep.id)
                    setSelectedFreq('weekly')
                  }}
                >
                  <Mail className="mr-1.5 h-3.5 w-3.5" />
                  Schedule
                </Button>
              </div>
              <Button
                size="sm"
                onClick={() => handleExport(rep.id, rep.title)}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Email Dialog */}
      <Dialog open={Boolean(activeModal)} onOpenChange={(open) => { if (!open) setActiveModal(null) }}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Schedule Automated Report</DialogTitle>
            <DialogDescription>
              Configure automated delivery for {activeModal?.replace(/_/g, ' ')}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Delivery Frequency</label>
              <select
                value={selectedFreq}
                onChange={(e) => setSelectedFreq(e.target.value as 'monthly' | 'daily' | 'weekly')}
                className="w-full h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="daily">Daily at 08:00 AM</option>
                <option value="weekly">Weekly on Mondays (Recommended)</option>
                <option value="monthly">Monthly on 1st</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Recipient Email Address</label>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="manager@dealflow360.app"
                className="text-xs"
              />
            </div>

            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Send className="h-4 w-4 text-primary shrink-0" />
              <span>Reports will be dispatched with an attached CSV workbook and executive summary digest.</span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveSchedule}>
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Preview Dialog */}
      <Dialog open={Boolean(previewReport)} onOpenChange={(open) => { if (!open) setPreviewReport(null) }}>
        <DialogContent className="sm:max-w-[760px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Table className="h-5 w-5 text-primary" />
              <span>{previewReport?.title}</span>
            </DialogTitle>
            <DialogDescription>
              Live sample records currently ready for export.
            </DialogDescription>
          </DialogHeader>

          {previewReport?.data && (
            <div className="overflow-x-auto border border-border rounded-lg my-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground border-b border-border">
                  <tr>
                    {Object.keys(previewReport.data[0] || {}).map((col) => (
                      <th key={col} className="px-3 py-2 font-semibold whitespace-nowrap">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {previewReport.data.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      {Object.values(row).map((val: any, colIdx: number) => (
                        <td key={colIdx} className="px-3 py-2 whitespace-nowrap text-foreground">
                          {typeof val === 'number' ? val.toLocaleString() : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewReport(null)}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (previewReport) {
                  handleExport(previewReport.id, previewReport.title)
                }
              }}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export to CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

