import {
  BadgeCheck,
  CreditCard,
  Handshake,
  Repeat,
  Server,
  Target,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { Notification, NotificationFilter, NotificationType } from '@/types/shared'
import { NOTIFICATION_FILTERS } from '@/constants/shared'

export const NOTIFICATION_CATEGORY_ICON: Record<string, LucideIcon> = {
  approval: BadgeCheck,
  deal: Handshake,
  customer: Users,
  fulfillment: Truck,
  billing: CreditCard,
  subscription: Repeat,
  system: Server,
  operations: Target,
}

export function categoryIcon(type: NotificationType | string): LucideIcon {
  return NOTIFICATION_CATEGORY_ICON[type] ?? Target
}

/** Resolve a related record to an existing app route, or undefined when unknown. */
export function relatedRecordUrl(record?: { type: string; id: string } | null): string | undefined {
  if (!record?.type || !record?.id) return undefined
  const routeByType: Record<string, string> = {
    deal: '/deals',
    quotation: '/quotations',
    customer: '/customers',
    order: '/orders',
    invoice: '/invoices',
    shipment: '/shipments',
    product: '/products',
    warehouse: '/warehouses',
  }
  const base = routeByType[record.type]
  return base ? `${base}/${record.id}` : undefined
}

export { NOTIFICATION_FILTERS }

export type { Notification, NotificationFilter, NotificationType }