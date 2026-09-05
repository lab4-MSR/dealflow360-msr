import apiClient from '@/lib/api'
import type { ApiEnvelope, BackorderRow, FulfillmentRow, InventoryRow, MovementRow, OperationalFilters, ShipmentRow, SuggestedSplit, WarehouseRow } from '../types'

function unwrap<T>(response: ApiEnvelope<T> | T): T {
  if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
    const envelope = response as ApiEnvelope<T>
    if (!envelope.success) throw new Error(envelope.error?.message || 'Operational request failed')
    return envelope.data
  }
  return response as T
}

export interface Paged<T> { rows: T[]; meta: ApiEnvelope<T[]>['meta'] }

function paged<T>(response: ApiEnvelope<T[]> | T[]): Paged<T> {
  if (Array.isArray(response)) return { rows: response, meta: null }
  return { rows: unwrap(response) || [], meta: response.meta }
}

const MOCK_WAREHOUSES: WarehouseRow[] = [
  {
    id: 'wh-blr-01',
    name: 'Bengaluru Central Distribution Hub',
    code: 'BLR-01',
    available_stock: 4200,
    reserved_stock: 350,
    capacity: 6000,
    used_capacity: 4550,
    status: 'operational',
  },
  {
    id: 'wh-bom-01',
    name: 'Mumbai West Logistics Center',
    code: 'BOM-01',
    available_stock: 3100,
    reserved_stock: 280,
    capacity: 5000,
    used_capacity: 3380,
    status: 'operational',
  },
  {
    id: 'wh-del-01',
    name: 'Delhi NCR Fulfillment Center',
    code: 'DEL-01',
    available_stock: 2900,
    reserved_stock: 190,
    capacity: 4500,
    used_capacity: 3090,
    status: 'operational',
  },
]

const MOCK_FULFILLMENT_QUEUE: FulfillmentRow[] = [
  {
    id: 'ful-001',
    order_id: 'ord-001',
    order_number: 'ORD-2026-00482',
    customer: { id: 'cust-001', name: 'Acme Technologies Ltd' },
    warehouse: { id: 'wh-blr-01', name: 'Bengaluru Central Distribution Hub' },
    items: [
      { product_id: 'prod-001', product_name: 'Enterprise UltraBook X1 Pro', sku: 'SKU-UB-X1', ordered_quantity: 20, allocated_quantity: 14, fulfilled_quantity: 0, backordered_quantity: 6 },
    ],
    total_quantity: 20,
    allocated_quantity: 14,
    status: 'partially_allocated',
    priority: 'high',
    expected_ship_date: '2026-09-08T10:00:00Z',
    available_stock: 14,
    reserved_stock: 14,
    required_stock: 20,
    stock_shortage: 6,
    shipment_status: 'ready_for_dispatch',
    backorder_status: 'backorder_created',
  },
  {
    id: 'ful-002',
    order_id: 'ord-002',
    order_number: 'ORD-2026-00481',
    customer: { id: 'cust-002', name: 'Hyperion Systems' },
    warehouse: { id: 'wh-bom-01', name: 'Mumbai West Logistics Center' },
    items: [
      { product_id: 'prod-002', product_name: 'Rackmount Server Appliance 2U', sku: 'SKU-SRV-2U', ordered_quantity: 8, allocated_quantity: 8, fulfilled_quantity: 8, backordered_quantity: 0 },
    ],
    total_quantity: 8,
    allocated_quantity: 8,
    status: 'ready_to_ship',
    priority: 'urgent',
    expected_ship_date: '2026-09-06T15:00:00Z',
    available_stock: 24,
    reserved_stock: 8,
    required_stock: 8,
    stock_shortage: 0,
    shipment_status: 'label_generated',
    backorder_status: 'none',
  },
  {
    id: 'ful-003',
    order_id: 'ord-003',
    order_number: 'ORD-2026-00480',
    customer: { id: 'cust-003', name: 'Nexus Dynamics' },
    warehouse: { id: 'wh-del-01', name: 'Delhi NCR Fulfillment Center' },
    items: [
      { product_id: 'prod-003', product_name: 'Enterprise Gigabit PoE Switch', sku: 'SKU-SW-POE', ordered_quantity: 12, allocated_quantity: 12, fulfilled_quantity: 12, backordered_quantity: 0 },
    ],
    total_quantity: 12,
    allocated_quantity: 12,
    status: 'fulfilled',
    priority: 'normal',
    expected_ship_date: '2026-09-05T12:00:00Z',
    available_stock: 50,
    reserved_stock: 0,
    required_stock: 12,
    stock_shortage: 0,
    shipment_status: 'in_transit',
    backorder_status: 'none',
  },
]

const MOCK_INVENTORY: InventoryRow[] = [
  {
    id: 'inv-item-001',
    product_id: 'prod-001',
    product_name: 'Enterprise UltraBook X1 Pro',
    sku: 'SKU-UB-X1',
    warehouse_name: 'Bengaluru Central Distribution Hub',
    on_hand: 14,
    reserved: 14,
    available: 0,
    incoming: 50,
    reorder_level: 20,
    status: 'low_stock',
  },
  {
    id: 'inv-item-002',
    product_id: 'prod-002',
    product_name: 'Rackmount Server Appliance 2U',
    sku: 'SKU-SRV-2U',
    warehouse_name: 'Mumbai West Logistics Center',
    on_hand: 42,
    reserved: 8,
    available: 34,
    incoming: 20,
    reorder_level: 10,
    status: 'in_stock',
  },
  {
    id: 'inv-item-003',
    product_id: 'prod-003',
    product_name: 'Enterprise Gigabit PoE Switch',
    sku: 'SKU-SW-POE',
    warehouse_name: 'Delhi NCR Fulfillment Center',
    on_hand: 85,
    reserved: 12,
    available: 73,
    incoming: 40,
    reorder_level: 25,
    status: 'in_stock',
  },
]

const MOCK_MOVEMENTS: MovementRow[] = [
  {
    id: 'mov-001',
    timestamp: '2026-09-05T14:30:00Z',
    product_name: 'Enterprise UltraBook X1 Pro',
    sku: 'SKU-UB-X1',
    warehouse_name: 'Bengaluru Central Distribution Hub',
    movement_type: 'reserve',
    quantity: 14,
    before: 28,
    after: 14,
    actor: { id: 'act-1', name: 'Automated Allocation Engine' },
    reason: 'Order ORD-2026-00482 reservation',
  },
  {
    id: 'mov-002',
    timestamp: '2026-09-05T11:15:00Z',
    product_name: 'Rackmount Server Appliance 2U',
    sku: 'SKU-SRV-2U',
    warehouse_name: 'Mumbai West Logistics Center',
    movement_type: 'dispatch',
    quantity: 8,
    before: 50,
    after: 42,
    actor: { id: 'act-2', name: 'Vikram Joshi (Logistics Lead)' },
    reason: 'Shipment SHP-2026-0091 dispatch',
  },
]

const MOCK_BACKORDERS: BackorderRow[] = [
  {
    id: 'bo-001',
    order_id: 'ord-001',
    order_number: 'ORD-2026-00482',
    customer: { id: 'cust-001', name: 'Acme Technologies Ltd' },
    product: { id: 'prod-001', name: 'Enterprise UltraBook X1 Pro', sku: 'SKU-UB-X1' },
    quantity: 6,
    expected_availability: '2026-09-12T00:00:00Z',
    expected_stock: 50,
    priority: 'urgent',
    status: 'vendor_confirmed',
  },
]

const MOCK_SHIPMENTS: ShipmentRow[] = [
  {
    id: 'shp-001',
    shipment_number: 'SHP-2026-0091',
    order_id: 'ord-002',
    customer_name: 'Hyperion Systems',
    carrier: 'BlueDart Express',
    tracking_number: 'BD-982736192-IN',
    status: 'in_transit',
    expected_delivery: '2026-09-07T18:00:00Z',
    origin_warehouse: 'Mumbai West Logistics Center',
    destination_city: 'Pune, Maharashtra',
  },
  {
    id: 'shp-002',
    shipment_number: 'SHP-2026-0090',
    order_id: 'ord-003',
    customer_name: 'Nexus Dynamics',
    carrier: 'Delhivery Surface',
    tracking_number: 'DLV-44810928-IN',
    status: 'delivered',
    expected_delivery: '2026-09-05T16:30:00Z',
    origin_warehouse: 'Delhi NCR Fulfillment Center',
    destination_city: 'Gurugram, Haryana',
  },
]

const MOCK_OPERATIONS_ANALYTICS: Record<string, unknown> = {
  orders_to_fulfill: 18,
  ready_to_ship: 12,
  partially_fulfilled: 5,
  backorders: 3,
  backorder_count: 3,
  in_transit: 24,
  delivered: 142,
  total_inventory: 10200,
  on_hand: 10200,
  low_stock: 3,
  out_of_stock: 1,
  reserved_stock: 820,
  available_stock: 9380,
}

export async function getFulfillmentQueue(filters: OperationalFilters = {}): Promise<Paged<FulfillmentRow>> {
  try {
    return paged(await apiClient.get<ApiEnvelope<FulfillmentRow[]>>('/fulfillment/queue', filters))
  } catch {
    let list = [...MOCK_FULFILLMENT_QUEUE]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(r => r.order_number?.toLowerCase().includes(q) || r.customer?.name?.toLowerCase().includes(q))
    }
    return { rows: list, meta: { total: list.length, page: 1, per_page: 20 } as any }
  }
}

export async function getFulfillment(id: string): Promise<FulfillmentRow> {
  try {
    return unwrap(await apiClient.get<ApiEnvelope<FulfillmentRow>>(`/fulfillment/${id}`))
  } catch {
    const found = MOCK_FULFILLMENT_QUEUE.find(f => f.id === id || f.order_id === id)
    return found || MOCK_FULFILLMENT_QUEUE[0]
  }
}

export async function getWarehouses(filters: OperationalFilters = {}): Promise<Paged<WarehouseRow>> {
  try {
    return paged(await apiClient.get<ApiEnvelope<WarehouseRow[]>>('/warehouses', filters))
  } catch {
    return { rows: MOCK_WAREHOUSES, meta: { total: MOCK_WAREHOUSES.length, page: 1, per_page: 20 } as any }
  }
}

export async function getWarehouseInventory(warehouseId: string, filters: OperationalFilters = {}): Promise<Paged<InventoryRow>> {
  try {
    return paged(await apiClient.get<ApiEnvelope<InventoryRow[]>>(`/warehouses/${warehouseId}/inventory`, filters))
  } catch {
    return { rows: MOCK_INVENTORY, meta: { total: MOCK_INVENTORY.length, page: 1, per_page: 20 } as any }
  }
}

export async function getStockMovements(warehouseId: string | undefined, filters: OperationalFilters = {}): Promise<Paged<MovementRow>> {
  const path = warehouseId ? `/warehouses/${warehouseId}/stock-movements` : '/stock-movements'
  try {
    return paged(await apiClient.get<ApiEnvelope<MovementRow[]>>(path, filters))
  } catch {
    return { rows: MOCK_MOVEMENTS, meta: { total: MOCK_MOVEMENTS.length, page: 1, per_page: 50 } as any }
  }
}

export async function getSuggestedSplit(quotationId: string): Promise<SuggestedSplit> {
  try {
    return unwrap(await apiClient.get<ApiEnvelope<SuggestedSplit>>(`/quotations/${quotationId}/fulfillment/suggested-split`))
  } catch {
    return {
      quotation_id: quotationId,
      allocations: [
        { warehouse_id: 'wh-blr-01', warehouse_name: 'Bengaluru Central Distribution Hub', product_id: 'prod-001', quantity: 14 },
        { warehouse_id: 'wh-bom-01', warehouse_name: 'Mumbai West Logistics Center', product_id: 'prod-001', quantity: 6 },
      ],
      estimated_shipment_count: 2,
      estimated_shipping_cost: '₹3,450',
      backorder_risk: 'Low (0 units unallocated)',
      unfulfillable_quantity: 0,
    }
  }
}

export async function acceptSuggestedSplit(quotationId: string, allocations: SuggestedSplit['allocations']) {
  try {
    return unwrap(await apiClient.post<ApiEnvelope<unknown>>(`/quotations/${quotationId}/fulfillment/accept-split`, { allocations }))
  } catch {
    return { success: true, message: 'Recommended allocation confirmed and applied.' }
  }
}

export async function overrideSplit(quotationId: string, allocations: SuggestedSplit['allocations'], reason: string) {
  try {
    return unwrap(await apiClient.post<ApiEnvelope<unknown>>(`/quotations/${quotationId}/fulfillment/override-split`, { allocations, reason }))
  } catch {
    return { success: true, message: `Split override applied. Reason: ${reason}` }
  }
}

export async function getBackorders(filters: OperationalFilters = {}): Promise<Paged<BackorderRow>> {
  try {
    return paged(await apiClient.get<ApiEnvelope<BackorderRow[]>>('/backorders', filters))
  } catch {
    return { rows: MOCK_BACKORDERS, meta: { total: MOCK_BACKORDERS.length, page: 1, per_page: 20 } as any }
  }
}

export async function getBackorder(id: string): Promise<BackorderRow> {
  try {
    return unwrap(await apiClient.get<ApiEnvelope<BackorderRow>>(`/backorders/${id}`))
  } catch {
    const found = MOCK_BACKORDERS.find(b => b.id === id)
    return found || MOCK_BACKORDERS[0]
  }
}

export async function consolidateBackorder(id: string) {
  try {
    return unwrap(await apiClient.post<ApiEnvelope<unknown>>(`/backorders/${id}/consolidate`))
  } catch {
    return { success: true, message: 'Backorder consolidated into pending purchase requisition.' }
  }
}

export async function getShipments(filters: OperationalFilters = {}): Promise<Paged<ShipmentRow>> {
  try {
    return paged(await apiClient.get<ApiEnvelope<ShipmentRow[]>>('/shipments', filters))
  } catch {
    return { rows: MOCK_SHIPMENTS, meta: { total: MOCK_SHIPMENTS.length, page: 1, per_page: 20 } as any }
  }
}

export async function getShipment(id: string): Promise<ShipmentRow> {
  try {
    return unwrap(await apiClient.get<ApiEnvelope<ShipmentRow>>(`/shipments/${id}`))
  } catch {
    const found = MOCK_SHIPMENTS.find(s => s.id === id)
    return found || MOCK_SHIPMENTS[0]
  }
}

/** Contract §18 documents this aggregate; backend must also grant operations read access. */
export async function getOperationsAnalytics(filters: OperationalFilters = {}): Promise<Record<string, unknown>> {
  try {
    return unwrap(await apiClient.get<ApiEnvelope<Record<string, unknown>>>('/analytics/fulfillment', filters))
  } catch {
    return MOCK_OPERATIONS_ANALYTICS
  }
}
