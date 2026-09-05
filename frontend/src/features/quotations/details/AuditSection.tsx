import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  History,
  Clock,
  User,
  Shield,
  FileEdit,
  Tag,
  MessageSquare,
  Truck,
  CreditCard,
  Filter,
} from 'lucide-react'
import type { AuditEventItem, AuditEventCategory } from '@/types/quotation'

interface AuditSectionProps {
  auditEvents: AuditEventItem[]
}

const categoryIcons: Record<AuditEventCategory, React.ReactNode> = {
  created: <History className="h-4 w-4 text-primary" />,
  edited: <FileEdit className="h-4 w-4 text-primary" />,
  discount_changes: <Tag className="h-4 w-4 text-warning" />,
  approval_events: <Shield className="h-4 w-4 text-warning" />,
  customer_events: <User className="h-4 w-4 text-info" />,
  negotiation_events: <MessageSquare className="h-4 w-4 text-intelligence" />,
  fulfillment_events: <Truck className="h-4 w-4 text-success" />,
  billing_events: <CreditCard className="h-4 w-4 text-primary" />,
}

export function AuditSection({ auditEvents }: AuditSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Events' },
    { id: 'created', label: 'Created' },
    { id: 'edited', label: 'Edited' },
    { id: 'discount_changes', label: 'Discount Changes' },
    { id: 'approval_events', label: 'Approval Events' },
    { id: 'customer_events', label: 'Customer Events' },
    { id: 'negotiation_events', label: 'Negotiation Events' },
    { id: 'fulfillment_events', label: 'Fulfillment Events' },
    { id: 'billing_events', label: 'Billing Events' },
  ]

  const filteredEvents =
    activeCategory === 'all'
      ? auditEvents
      : auditEvents.filter((e) => e.category === activeCategory)

  return (
    <section id="audit" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-h3 font-semibold text-foreground flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Audit & Decision Stream
          </h2>
          <Badge variant="outline" className="text-caption font-mono">
            {auditEvents.length} Immutable Events
          </Badge>
        </div>
        <span className="text-caption text-muted-foreground">
          Tenant-isolated tamper-proof audit trail
        </span>
      </div>

      {/* Category Filter Pills */}
      <Card className="shadow-sm">
        <CardContent className="p-3 flex items-center gap-2 overflow-x-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-caption font-medium transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Stream */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-5 border-b border-border">
          <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
            Chronological Activity Feed ({filteredEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-small">
              No audit events found for selected category.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {filteredEvents.map((evt) => {
                const formattedDate = new Date(evt.timestamp).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })

                return (
                  <div key={evt.id} className="relative group">
                    {/* Node marker */}
                    <div className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>

                    <div className="rounded-xl border border-border p-4 bg-card hover:bg-muted/20 transition-colors space-y-2">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                            {categoryIcons[evt.category] || <Clock className="h-3.5 w-3.5" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-small text-foreground">{evt.title}</h4>
                            <span className="text-[11px] text-muted-foreground font-mono capitalize">
                              {evt.event_type.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-caption text-muted-foreground font-mono">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      <p className="text-small text-foreground/90 leading-relaxed">
                        {evt.description}
                      </p>

                      {evt.reason && (
                        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-caption text-muted-foreground font-mono">
                          <strong className="text-foreground">Reason / Trigger: </strong>
                          {evt.reason}
                        </div>
                      )}

                      {/* Actor Information */}
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-caption text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {evt.actor.avatar ? (
                            <img
                              src={evt.actor.avatar}
                              alt={evt.actor.name}
                              className="h-5 w-5 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {evt.actor.name.slice(0, 1)}
                            </div>
                          )}
                          <span className="font-medium text-foreground">{evt.actor.name}</span>
                          <span>•</span>
                          <span>{evt.actor.role}</span>
                        </div>

                        <Badge variant="secondary" className="text-[10px] py-0 font-mono capitalize">
                          {evt.category.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
