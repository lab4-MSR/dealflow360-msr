import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Truck,
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getCustomerShipmentDetail, type CustomerShipment } from '@/lib/customer-portal-api'

export const CustomerShipmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [shipment, setShipment] = useState<CustomerShipment | null>(null)

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await getCustomerShipmentDetail(id)
      setShipment(res)
    } catch (err) {
      console.error('Failed to load shipment details', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (loading || !shipment) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/customer-portal/shipments')}
            className="gap-1 text-xs mb-2 text-muted-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Shipments
          </Button>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Truck className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Shipment: {shipment.tracking_number}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Order #{shipment.order_number} · Courier: {shipment.courier}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={
              shipment.status === 'delivered'
                ? 'bg-success text-white'
                : shipment.status === 'delayed'
                ? 'bg-amber-500 text-white'
                : 'bg-primary text-white'
            }
          >
            {shipment.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Carrier / Courier</span>
          <p className="text-base font-bold text-foreground mt-1">{shipment.courier}</p>
          <span className="text-[11px] text-muted-foreground">Direct API integration</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Shipped Date</span>
          <p className="text-base font-bold text-foreground mt-1">{shipment.shipped_date}</p>
          <span className="text-[11px] text-muted-foreground">Origin: {shipment.origin}</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Destination</span>
          <p className="text-sm font-semibold text-foreground mt-1 truncate">{shipment.destination}</p>
          <span className="text-[11px] text-muted-foreground">Verified delivery address</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Estimated Arrival</span>
          <p className="text-base font-bold text-primary mt-1">{shipment.estimated_delivery}</p>
          <span className="text-[11px] text-success">
            {shipment.actual_delivery ? 'Delivered' : 'On Schedule'}
          </span>
        </div>
      </div>

      {/* Progress Timeline & Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline */}
        <Card className="lg:col-span-7">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold">Carrier Transit Milestones</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {(shipment.events || []).map((ev: any, i: number) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 top-0.5 h-4 w-4 rounded-full border-2 border-primary bg-surface flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{ev.status}</span>
                      <span className="text-[11px] text-muted-foreground">{ev.timestamp}</span>
                    </div>
                    <p className="text-xs font-medium text-foreground mt-0.5">{ev.location}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Package Contents */}
        <Card className="lg:col-span-5">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold">Package Contents ({shipment.item_count} items)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {(shipment.items || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface">
                <div>
                  <span className="text-xs font-semibold text-foreground block">{item.name}</span>
                  <span className="text-[11px] text-muted-foreground">SKU: {item.sku}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Qty: {item.quantity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
