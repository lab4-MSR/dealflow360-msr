import { useParams, useNavigate } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Truck, Package, MapPin, Calendar, ExternalLink, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { getCustomerShipmentDetail } from '@/lib/customer-portal-api'

export function ShipmentDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: shipment, isLoading, isError, error } = useQuery({
    queryKey: ['customer-shipment-detail', id],
    queryFn: () => getCustomerShipmentDetail(id || ''),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !shipment) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-3" />
        <h2 className="text-xl font-semibold">Shipment Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">{error instanceof Error ? error.message : 'Unable to find the requested shipment details.'}</p>
        <Button onClick={() => navigate('/customer-portal/shipments')} className="mt-4" variant="outline">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Shipments
        </Button>
      </div>
    )
  }

  const timelineEvents = shipment.timeline || []

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/customer-portal/shipments')}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Shipments
        </Button>
      </div>

      {/* Shipment Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight font-mono">{shipment.id}</h1>
                <StatusBadge status={shipment.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>
                  Order:{' '}
                  <button
                    onClick={() => navigate(`/customer-portal/orders/${shipment.order_id}`)}
                    className="font-mono text-primary hover:underline font-medium"
                  >
                    {shipment.order_number || shipment.order_id}
                  </button>
                </span>
                <span>•</span>
                <span>
                  Tracking Number:{' '}
                  <span className="font-mono font-medium text-foreground">
                    {shipment.tracking_number || 'Pending'}
                  </span>
                </span>
              </div>
            </div>

            {/* Actions: Track Shipment */}
            <div>
              {shipment.tracking_url ? (
                <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full sm:w-auto">
                    <ExternalLink className="h-4 w-4 mr-2" /> Track Shipment
                  </Button>
                </a>
              ) : (
                <Button disabled variant="outline" className="w-full sm:w-auto">
                  <ExternalLink className="h-4 w-4 mr-2" /> Tracking Unavailable
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Delivery Address</p>
              <p className="text-sm font-medium mt-1 text-foreground whitespace-pre-line">
                {shipment.delivery_address || 'Address on file'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Carrier</p>
              <p className="text-sm font-medium mt-1 text-foreground">{shipment.carrier}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Expected Delivery</p>
              <p className="text-sm font-medium mt-1 text-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {shipment.expected_delivery || 'TBD'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Delivery Status</p>
              <div className="mt-1">
                <StatusBadge status={shipment.delivery_status || shipment.status} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" /> Tracking Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {timelineEvents.map((event, idx) => (
              <div key={idx} className="relative flex items-start gap-4">
                <div
                  className={`absolute -left-6 top-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    event.completed
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                      : 'bg-muted border border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {event.completed ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3 w-3" />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className={`text-sm font-medium ${event.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {event.stage}
                    </p>
                    {event.timestamp && (
                      <span className="text-xs text-muted-foreground font-mono">{event.timestamp}</span>
                    )}
                  </div>
                  {event.location && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Items Included */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Items in Shipment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Product</TableHead>
                <TableHead className="text-center w-[120px]">Quantity</TableHead>
                <TableHead className="text-right w-[140px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipment.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-sm">
                    {item.product_name || item.product_id}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={item.status || shipment.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
