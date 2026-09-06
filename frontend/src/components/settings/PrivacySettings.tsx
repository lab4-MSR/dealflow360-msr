import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Download,
  Lock,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  FileCode,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

interface ExportHistoryItem {
  id: string
  filename: string
  size: string
  format: 'JSON' | 'CSV'
  created: string
  status: 'Ready' | 'Processing'
}

const INITIAL_EXPORTS: ExportHistoryItem[] = [
  {
    id: 'exp-1',
    filename: 'dealflow360_deals_pipeline_2026-09-01.json',
    size: '1.4 MB',
    format: 'JSON',
    created: '5 days ago',
    status: 'Ready',
  },
  {
    id: 'exp-2',
    filename: 'dealflow360_audit_trail_2026-08-15.csv',
    size: '840 KB',
    format: 'CSV',
    created: '3 weeks ago',
    status: 'Ready',
  },
]

export function PrivacySettings() {
  const [exportFormat, setExportFormat] = React.useState<'json' | 'csv'>('json')
  const [exporting, setExporting] = React.useState(false)
  const [exportHistory, setExportHistory] = React.useState<ExportHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('dealflow360_export_history')
      return stored ? JSON.parse(stored) : INITIAL_EXPORTS
    } catch {
      return INITIAL_EXPORTS
    }
  })

  // Privacy toggles
  const [anonymizeIps, setAnonymizeIps] = React.useState(true)
  const [telemetry, setTelemetry] = React.useState(false)
  const [crashReporting, setCrashReporting] = React.useState(true)

  // Retention selectors
  const [auditRetention, setAuditRetention] = React.useState('90')
  const [customerRetention, setCustomerRetention] = React.useState('365')
  const [draftRetention, setDraftRetention] = React.useState('30')

  const saveHistory = (items: ExportHistoryItem[]) => {
    setExportHistory(items)
    try {
      localStorage.setItem('dealflow360_export_history', JSON.stringify(items))
    } catch {}
  }

  const handleGenerateExport = () => {
    setExporting(true)

    setTimeout(() => {
      setExporting(false)
      const timestamp = new Date().toISOString().slice(0, 10)
      const filename = `dealflow360_workspace_export_${timestamp}.${exportFormat}`

      // Create realistic export payload
      const exportData = {
        organization: 'DealFlow360 Platform',
        export_date: new Date().toISOString(),
        format: exportFormat.toUpperCase(),
        summary: {
          total_deals: 124,
          total_quotations: 86,
          total_customers: 42,
          audit_records: 389,
        },
        metadata: {
          generated_by: 'Platform Admin (admin@dealflow360.com)',
          compliance_tier: 'ISO-27001 SOC-2',
        },
      }

      const content =
        exportFormat === 'json'
          ? JSON.stringify(exportData, null, 2)
          : 'ID,Record_Type,Name,Status,Created_At\n1,Deal,Enterprise Cloud Migration,Won,2026-09-01\n2,Quote,QT-2026-00482,Approved,2026-09-02\n'

      const blob = new Blob([content], {
        type: exportFormat === 'json' ? 'application/json' : 'text/csv',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      const newItem: ExportHistoryItem = {
        id: `exp-${Date.now()}`,
        filename,
        size: exportFormat === 'json' ? '1.8 MB' : '420 KB',
        format: exportFormat.toUpperCase() as 'JSON' | 'CSV',
        created: 'Just now',
        status: 'Ready',
      }

      saveHistory([newItem, ...exportHistory])
      toast.success('Export archive downloaded', {
        description: `Generated and downloaded ${filename}`,
      })
    }, 1000)
  }

  const handleDeleteHistory = (id: string) => {
    const updated = exportHistory.filter((h) => h.id !== id)
    saveHistory(updated)
    toast.success('Export archive removed from history')
  }

  const handleSavePrivacy = () => {
    toast.success('Privacy & telemetry settings saved')
  }

  const handleSaveRetention = () => {
    toast.success('Data retention policies updated successfully', {
      description: `Audit retention set to ${auditRetention} days. Customer records to ${customerRetention} days.`,
    })
  }

  const handlePurgeStale = () => {
    toast.success('Diagnostic cleanup complete', {
      description: '0 orphaned temporary quotation drafts purged.',
    })
  }

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" aria-hidden />
            Workspace Data Export
          </CardTitle>
          <CardDescription>
            Generate a full archive of deals, quotations, customer records, and financial ledgers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Export All Workspace Data</p>
              <p className="text-xs text-muted-foreground">
                Export includes pipeline deals, approvals history, customer accounts, and settings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
                <button
                  type="button"
                  onClick={() => setExportFormat('json')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    exportFormat === 'json'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  JSON
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('csv')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    exportFormat === 'csv'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  CSV
                </button>
              </div>
              <Button
                onClick={handleGenerateExport}
                loading={exporting}
                size="sm"
                className="cursor-pointer gap-1.5"
              >
                <Download className="h-4 w-4" />
                Download Archive
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Recent Export Jobs
            </h4>
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {exportHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 text-xs bg-card hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.format === 'JSON' ? (
                      <FileCode className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-mono font-medium text-foreground truncate">{item.filename}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.size} · Generated {item.created}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="outline" className="text-[10px] mr-2">
                      {item.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGenerateExport()}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteHistory(item.id)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-danger cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" aria-hidden />
            Privacy & Telemetry Controls
          </CardTitle>
          <CardDescription>
            Configure telemetry tracking, anonymization, and diagnostic transparency.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-foreground">
                Anonymize IP Addresses in Audit Logs
              </Label>
              <p className="text-xs text-muted-foreground">
                Zero out client octets (e.g. 192.168.xxx.xxx) for GDPR compliance.
              </p>
            </div>
            <Switch
              checked={anonymizeIps}
              onCheckedChange={setAnonymizeIps}
              aria-label="Anonymize IP Addresses"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-foreground">
                Product Usage Telemetry
              </Label>
              <p className="text-xs text-muted-foreground">
                Send anonymous performance metrics and UX interaction counts.
              </p>
            </div>
            <Switch
              checked={telemetry}
              onCheckedChange={setTelemetry}
              aria-label="Product Usage Telemetry"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-foreground">
                Automated Crash & Error Diagnostics
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically capture and transmit client exception stack traces.
              </p>
            </div>
            <Switch
              checked={crashReporting}
              onCheckedChange={setCrashReporting}
              aria-label="Automated Crash Diagnostics"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={handleSavePrivacy} className="cursor-pointer">
              Save Privacy Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" aria-hidden />
            Data Retention & Purge Policy
          </CardTitle>
          <CardDescription>
            Automated lifecycle retention windows for historical operational records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ret-audit" className="text-xs font-semibold text-muted-foreground">
                Audit Trail Retention
              </Label>
              <select
                id="ret-audit"
                value={auditRetention}
                onChange={(e) => setAuditRetention(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="30">30 Days</option>
                <option value="90">90 Days (Standard)</option>
                <option value="180">180 Days</option>
                <option value="365">1 Year</option>
                <option value="2555">7 Years (Compliance)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ret-cust" className="text-xs font-semibold text-muted-foreground">
                Inactive Records Archival
              </Label>
              <select
                id="ret-cust"
                value={customerRetention}
                onChange={(e) => setCustomerRetention(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="180">6 Months</option>
                <option value="365">1 Year</option>
                <option value="1095">3 Years</option>
                <option value="never">Indefinite (Never)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ret-draft" className="text-xs font-semibold text-muted-foreground">
                Quotation Draft Cleanup
              </Label>
              <select
                id="ret-draft"
                value={draftRetention}
                onChange={(e) => setDraftRetention(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="14">14 Days</option>
                <option value="30">30 Days (Recommended)</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePurgeStale}
              className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 cursor-pointer gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Purge Expired Drafts Now
            </Button>
            <Button size="sm" onClick={handleSaveRetention} className="cursor-pointer">
              Save Retention Policy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}