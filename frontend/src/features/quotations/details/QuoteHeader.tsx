import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Copy,
  Check,
  Building2,
  Briefcase,
  ChevronDown,
  Edit,
  CheckCircle2,
  Send,
  Shield,
  Layers,
  Printer,
  Archive,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import type { QuotationCompleteDetails } from '@/types/quotation'

interface QuoteHeaderProps {
  quote: QuotationCompleteDetails
  onVersionChange: (version: number) => void
  onAction: (action: 'validate' | 'submit' | 'send' | 'duplicate' | 'archive' | 'approve_modal') => void
  actionLoading?: boolean
}

export function QuoteHeader({ quote, onVersionChange, onAction, actionLoading }: QuoteHeaderProps) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopyQuoteNumber = () => {
    navigator.clipboard.writeText(quote.quote_number)
    setCopied(true)
    toast.success(`Quote number ${quote.quote_number} copied to clipboard`)
    setTimeout(() => setCopied(false), 2000)
  }

  const { overview, permissions, approval } = quote
  const isLatestVersion = quote.version === quote.total_versions
  const canSend = permissions.can_send_to_customer && (quote.approval.approval_status === 'approved' || quote.approval.approval_status === 'not_required')

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
      {/* Upper Row: Identity, Badges, Total Value & Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-mono font-bold text-lg">
            QT
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 font-mono text-xl font-bold tracking-tight text-foreground">
                <span>{quote.quote_number}</span>
                <button
                  onClick={handleCopyQuoteNumber}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                  title="Copy Quote Number"
                  aria-label="Copy Quote Number"
                >
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Version Badge & Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-semibold bg-muted hover:bg-accent border border-border text-foreground transition-colors cursor-pointer">
                    <span>v{quote.version}</span>
                    <span className="text-muted-foreground">/ v{quote.total_versions}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <div className="px-2 py-1.5 text-caption font-semibold text-muted-foreground">
                    Select Quotation Version
                  </div>
                  <DropdownMenuSeparator />
                  {quote.available_versions.map((v) => (
                    <DropdownMenuItem
                      key={v}
                      onClick={() => onVersionChange(v)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span className={v === quote.version ? 'font-bold text-primary' : ''}>
                        Version {v} {v === quote.total_versions && '(Latest)'}
                      </span>
                      {v === quote.version && <Check className="h-3.5 w-3.5 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Status Badge */}
              <StatusBadge status={quote.status as never} className="capitalize">
                {quote.status.replace(/_/g, ' ')}
              </StatusBadge>

              {isLatestVersion && (
                <Badge variant="outline" className="text-caption font-mono border-primary/30 text-primary">
                  Active Head
                </Badge>
              )}
            </div>

            {/* Subtitle with Customer & Deal quick links */}
            <div className="flex items-center gap-4 text-small text-muted-foreground mt-1.5 flex-wrap">
              <Link
                to={`/sales/customers/${overview.customer_id}`}
                className="inline-flex items-center gap-1 hover:text-primary transition-colors font-medium text-foreground"
              >
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{overview.company_name}</span>
                <Badge variant="secondary" className="text-[11px] py-0 px-1.5 font-normal capitalize ml-1">
                  {overview.customer_tier}
                </Badge>
              </Link>
              <span>•</span>
              <Link
                to={`/sales/deals/${overview.deal_id}`}
                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{overview.deal_name}</span>
                <span className="font-mono text-caption text-muted-foreground">({overview.deal_stage})</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right side: Total Value & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 self-start lg:self-center">
          <div className="text-right sm:pr-4 sm:border-r border-border">
            <span className="text-caption uppercase tracking-wider text-muted-foreground font-medium block">
              Total Value
            </span>
            <span className="text-2xl font-bold font-mono tracking-tight tabular-nums text-foreground">
              '₹'
              {quote.total_value.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground block">
              Authoritative Grand Total ({quote.currency})
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {permissions.can_edit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/sales/quotations/${quote.id}/builder`)}
                className="gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Builder</span>
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onAction('validate')}
              disabled={actionLoading}
              className="gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Validate</span>
            </Button>

            {approval.approval_required && approval.approval_status === 'pending' && (
              <Button
                size="sm"
                variant="default"
                onClick={() => onAction('approve_modal')}
                className="gap-1.5 bg-warning text-warning-foreground hover:bg-warning/90"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Review Approval</span>
              </Button>
            )}

            {permissions.can_submit_approval && approval.approval_status !== 'approved' && (
              <Button
                size="sm"
                onClick={() => onAction('submit')}
                disabled={actionLoading}
                className="gap-1.5"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Submit for Approval</span>
              </Button>
            )}

            <Button
              size="sm"
              variant={canSend ? 'default' : 'secondary'}
              onClick={() => onAction('send')}
              disabled={!canSend || actionLoading}
              title={!canSend ? 'Approval required before sending to customer' : 'Send quotation to customer portal'}
              className="gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send to Customer</span>
            </Button>

            {/* Overflow Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-2.5">
                  <span className="sr-only">More actions</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => onAction('duplicate')} className="cursor-pointer">
                  <Layers className="h-4 w-4 mr-2" />
                  Duplicate Quote
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/sales/deals/${overview.deal_id}`)}
                  className="cursor-pointer"
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  View Deal Record
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/sales/customers/${overview.customer_id}`)}
                  className="cursor-pointer"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  View Customer Record
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.print()} className="cursor-pointer">
                  <Printer className="h-4 w-4 mr-2" />
                  Print / Export PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onAction('archive')}
                  className="text-danger hover:text-danger cursor-pointer"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Quotation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
