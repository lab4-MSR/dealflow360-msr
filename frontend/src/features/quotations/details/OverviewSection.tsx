import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Building2,
  Briefcase,
  User,
  Calendar,
  Clock,
  GitBranch,
  Mail,
  Phone,
  MapPin,
  Tag,
  CreditCard,
  Truck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import type { QuotationOverviewData } from '@/types/quotation'

interface OverviewSectionProps {
  overview: QuotationOverviewData
  currency: string
  onJumpToVersions?: () => void
}

export function OverviewSection({ overview, currency, onJumpToVersions }: OverviewSectionProps) {
  const createdDateFormatted = new Date(overview.created_date).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const expiryDateFormatted = new Date(overview.expiry_date).toLocaleDateString('en-US', {
    dateStyle: 'medium',
  })
  const closeDateFormatted = new Date(overview.expected_close_date).toLocaleDateString('en-US', {
    dateStyle: 'medium',
  })

  return (
    <section id="overview" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-h3 font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <span className="text-caption text-muted-foreground">
          Core quotation metadata, customer profile, and commercial parameters
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Quote Information */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Quote Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-small">
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Quote Number</span>
              <span className="font-mono font-medium">{overview.quote_number}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={overview.status as never} className="capitalize text-caption">
                {overview.status.replace(/_/g, ' ')}
              </StatusBadge>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Currency</span>
              <span className="font-semibold font-mono">{overview.currency}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Type</span>
              <span>{overview.quote_type || 'Standard Commercial'}</span>
            </div>
            <div className="flex justify-between items-start py-1 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5" /> Payment Terms
              </span>
              <span className="text-right text-caption max-w-[55%] font-medium">{overview.payment_terms}</span>
            </div>
            <div className="flex justify-between items-start py-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" /> Shipping Terms
              </span>
              <span className="text-right text-caption max-w-[55%] font-medium">{overview.shipping_terms}</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Customer Information */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              Customer Information
            </CardTitle>
            <Link
              to={`/sales/customers/${overview.customer_id}`}
              className="text-caption text-primary hover:underline flex items-center gap-0.5 font-medium"
            >
              Profile <ExternalLink className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5 text-small">
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Company</span>
              <span className="font-semibold text-foreground">{overview.company_name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Customer Tier</span>
              <Badge variant="secondary" className="capitalize text-caption">
                {overview.customer_tier}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Primary Contact</span>
              <span className="font-medium">{overview.primary_contact}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> Email
              </span>
              <span className="font-mono text-caption text-muted-foreground">{overview.customer_email}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> Phone
              </span>
              <span className="font-mono text-caption">{overview.customer_phone}</span>
            </div>
            <div className="flex justify-between items-start py-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" /> Price List
              </span>
              <span className="font-mono text-caption font-semibold text-primary">{overview.price_list}</span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Deal Information */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <Briefcase className="h-4 w-4 text-primary" />
              Deal Information
            </CardTitle>
            <Link
              to={`/sales/deals/${overview.deal_id}`}
              className="text-caption text-primary hover:underline flex items-center gap-0.5 font-medium"
            >
              Deal <ExternalLink className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5 text-small">
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Deal Name</span>
              <span className="font-medium text-foreground text-right max-w-[60%]">{overview.deal_name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Deal ID</span>
              <span className="font-mono text-caption">{overview.deal_id}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Stage</span>
              <Badge variant="outline" className="font-normal text-caption">
                {overview.deal_stage}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Sales Rep</span>
              <span className="font-medium">{overview.sales_rep_name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Target Close</span>
              <span className="font-medium">{closeDateFormatted}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Total Deal Value</span>
              <span className="font-mono font-bold text-foreground">
                '₹'
                {overview.deal_value.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Created By */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <User className="h-4 w-4 text-primary" />
              Created By
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-small">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                {overview.created_by_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground">{overview.created_by_name}</p>
                <p className="text-caption text-muted-foreground">{overview.created_by_role}</p>
              </div>
            </div>
            <p className="text-caption text-muted-foreground pt-1 border-t border-border">
              Ownership authenticated with tenant isolation scope. Authoritative record owner.
            </p>
          </CardContent>
        </Card>

        {/* 5. Created Date */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              Created Date
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-small">
            <span className="text-caption text-muted-foreground block">Exact Timestamp (Tenant Timezone)</span>
            <span className="font-medium text-foreground text-base block font-mono">{createdDateFormatted}</span>
            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border">
              Recorded at quotation initialization. Governed by UTC server clock.
            </p>
          </CardContent>
        </Card>

        {/* 6. Expiry Date */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Expiry Date
            </CardTitle>
            {overview.is_expired ? (
              <Badge variant="danger" className="gap-1 text-[10px] py-0">
                <AlertCircle className="h-3 w-3" />
                Expired
              </Badge>
            ) : (
              <Badge
                variant={overview.remaining_days <= 7 ? 'warning' : 'secondary'}
                className="gap-1 text-[10px] py-0"
              >
                Expires in {overview.remaining_days} days
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-2 text-small">
            <span className="text-caption text-muted-foreground block">Quote Validity Window</span>
            <span className="font-medium text-foreground text-base block font-mono">{expiryDateFormatted}</span>
            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border">
              Pricing terms, inventory preview, and discounts expire automatically on this date.
            </p>
          </CardContent>
        </Card>

        {/* 6. Current Version */}
        <Card className="shadow-sm border-primary/20 bg-primary-subtle/20">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <GitBranch className="h-4 w-4 text-primary" />
              Current Version
            </CardTitle>
            <Badge variant="default" className="font-mono text-caption">
              v{overview.version} of {overview.total_versions}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-small">
            <p className="text-caption text-foreground font-medium leading-relaxed">
              {overview.current_version_summary}
            </p>
            <div className="pt-2 border-t border-border/80 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Updated: {new Date(overview.last_updated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {onJumpToVersions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onJumpToVersions}
                  className="text-caption h-7 px-2.5 font-medium"
                >
                  View Version History
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
