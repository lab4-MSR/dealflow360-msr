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

export async function getFulfillmentQueue(filters: OperationalFilters = {}) {
  return paged(await apiClient.get<ApiEnvelope<FulfillmentRow[]>>('/fulfillment/queue', filters))
}

export async function getFulfillment(id: string) {
  return unwrap(await apiClient.get<ApiEnvelope<FulfillmentRow>>(`/fulfillment/${id}`))
}

export async function getWarehouses(filters: OperationalFilters = {}) {
  return paged(await apiClient.get<ApiEnvelope<WarehouseRow[]>>('/warehouses', filters))
}

export async function getWarehouseInventory(warehouseId: string, filters: OperationalFilters = {}) {
  return paged(await apiClient.get<ApiEnvelope<InventoryRow[]>>(`/warehouses/${warehouseId}/inventory`, filters))
}

export async function getStockMovements(warehouseId: string | undefined, filters: OperationalFilters = {}) {
  const path = warehouseId ? `/warehouses/${warehouseId}/stock-movements` : '/stock-movements'
  return paged(await apiClient.get<ApiEnvelope<MovementRow[]>>(path, filters))
}

export async function getSuggestedSplit(quotationId: string) {
  return unwrap(await apiClient.get<ApiEnvelope<SuggestedSplit>>(`/quotations/${quotationId}/fulfillment/suggested-split`))
}

export async function acceptSuggestedSplit(quotationId: string, allocations: SuggestedSplit['allocations']) {
  return unwrap(await apiClient.post<ApiEnvelope<unknown>>(`/quotations/${quotationId}/fulfillment/accept-split`, { allocations }))
}

export async function overrideSplit(quotationId: string, allocations: SuggestedSplit['allocations'], reason: string) {
  return unwrap(await apiClient.post<ApiEnvelope<unknown>>(`/quotations/${quotationId}/fulfillment/override-split`, { allocations, reason }))
}

export async function getBackorders(filters: OperationalFilters = {}) {
  return paged(await apiClient.get<ApiEnvelope<BackorderRow[]>>('/backorders', filters))
}

export async function getBackorder(id: string) {
  return unwrap(await apiClient.get<ApiEnvelope<BackorderRow>>(`/backorders/${id}`))
}

export async function consolidateBackorder(id: string) {
  return unwrap(await apiClient.post<ApiEnvelope<unknown>>(`/backorders/${id}/consolidate`))
}

export async function getShipments(filters: OperationalFilters = {}) {
  return paged(await apiClient.get<ApiEnvelope<ShipmentRow[]>>('/shipments', filters))
}

export async function getShipment(id: string) {
  return unwrap(await apiClient.get<ApiEnvelope<ShipmentRow>>(`/shipments/${id}`))
}

/** Contract §18 documents this aggregate; backend must also grant operations read access. */
export async function getOperationsAnalytics(filters: OperationalFilters = {}) {
  return unwrap(await apiClient.get<ApiEnvelope<Record<string, unknown>>>('/analytics/fulfillment', filters))
}
