export type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'backordered'
export type ShipmentStatus = 'pending' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'exception'
export type BackorderStatus = 'awaiting_stock' | 'delayed' | 'ready_to_fulfill' | 'fulfilled' | 'cancelled' | (string & {})
export type Priority = 'critical' | 'high' | 'normal' | 'low' | (string & {})

export interface ApiMeta {
  page?: number
  per_page?: number
  total?: number
  total_pages?: number
  [key: string]: unknown
}

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  meta: ApiMeta | null
  error: { code: string; message: string; details?: Record<string, unknown> } | null
}

export interface OperationalFilters {
  page?: number
  per_page?: number
  search?: string
  warehouse_id?: string
  customer_id?: string
  product_id?: string
  status?: string
  priority?: string
  date_from?: string
  date_to?: string
  sort?: string
  [key: string]: string | number | undefined
}

export interface FulfillmentRow {
  id: string
  order_id?: string
  order_number?: string
  customer?: { id?: string; name?: string }
  items?: Array<{ product_id?: string; product_name?: string; sku?: string; ordered_quantity?: number; allocated_quantity?: number; fulfilled_quantity?: number; backordered_quantity?: number }>
  total_quantity?: number
  allocated_quantity?: number
  fulfilled_quantity?: number
  backordered_quantity?: number
  warehouse?: { id?: string; name?: string }
  status?: FulfillmentStatus | string
  priority?: Priority
  expected_ship_date?: string | null
  [key: string]: unknown
}

export interface WarehouseRow {
  id: string
  name: string
  code?: string
  status?: string
  capacity?: number | null
  used_capacity?: number | null
  available_stock?: number | null
  reserved_stock?: number | null
  [key: string]: unknown
}

export interface InventoryRow {
  id?: string
  product_id?: string
  product_name?: string
  sku?: string
  warehouse_id?: string
  warehouse_name?: string
  on_hand?: number
  reserved?: number
  available?: number
  incoming?: number
  reorder_level?: number
  status?: string
  [key: string]: unknown
}

export interface MovementRow {
  id: string
  timestamp?: string
  product_name?: string
  sku?: string
  warehouse_name?: string
  movement_type?: string
  quantity?: number
  before?: number
  after?: number
  actor?: { name?: string }
  reason?: string
  [key: string]: unknown
}

export interface BackorderRow {
  id: string
  order_id?: string
  order_number?: string
  customer?: { id?: string; name?: string }
  product?: { id?: string; name?: string; sku?: string }
  quantity?: number
  expected_stock?: number | null
  expected_availability?: string | null
  priority?: Priority
  status?: BackorderStatus
  [key: string]: unknown
}

export interface ShipmentRow {
  id: string
  shipment_number?: string
  order_id?: string
  order_number?: string
  customer?: { name?: string }
  carrier?: string
  tracking_number?: string | null
  status?: ShipmentStatus | string
  expected_delivery?: string | null
  shipped_at?: string | null
  delivered_at?: string | null
  [key: string]: unknown
}

export interface SuggestedSplit {
  quotation_id?: string
  order_id?: string
  allocations?: Array<{ warehouse_id: string; warehouse_name?: string; product_id: string; quantity: number }>
  estimated_shipment_count?: number
  estimated_shipping_cost?: number
  backorder_risk?: string
  unfulfillable_quantity?: number
  [key: string]: unknown
}
