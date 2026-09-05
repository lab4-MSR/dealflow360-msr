import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTeamDealTimeline } from '@/services/salesManager'
import type { DealTimelineEvent } from '@/types/salesManager'
import { toast } from 'sonner'

export function TeamDealTimelinePage() {
  const { id } = useParams<{ id: string }>()
  const [timeline, setTimeline] = useState<DealTimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getTeamDealTimeline(id)
      .then((res) => setTimeline(res))
      .catch((err) => toast.error('Failed to load timeline: ' + err.message))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/sales-manager/deals/${id}`} className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Deal</span>
          </Link>
        </Button>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-h2 font-semibold text-foreground">Deal Progression Timeline</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-body font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Stage Progression & Audit History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading timeline events...</div>
          ) : timeline.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No events recorded for this deal.</div>
          ) : (
            <div className="relative border-l-2 border-border pl-6 space-y-8 ml-4">
              {timeline.map((event) => (
                <div key={event.id} className="relative">
                  <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-primary" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-caption text-muted-foreground">
                        {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Badge variant="outline" className="text-caption uppercase">
                        {event.event_type}
                      </Badge>
                    </div>
                    <h3 className="text-body font-semibold text-foreground">{event.title}</h3>
                    <p className="text-body-small text-muted-foreground">{event.description}</p>
                    <span className="text-caption text-muted-foreground block">
                      Actor: <b className="text-foreground">{event.actor.name}</b> ({event.actor.role})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
