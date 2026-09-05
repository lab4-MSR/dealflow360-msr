import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { acceptSuggestedSplit, consolidateBackorder, getBackorder, getBackorders, getFulfillment, getFulfillmentQueue, getOperationsAnalytics, getShipment, getShipments, getStockMovements, getSuggestedSplit, getWarehouseInventory, getWarehouses, overrideSplit } from '../services/operations'
import type { OperationalFilters, SuggestedSplit } from '../types'

export function useFulfillmentQueue(filters: OperationalFilters) { return useQuery({ queryKey: ['operations', 'fulfillment', filters], queryFn: () => getFulfillmentQueue(filters), staleTime: 30_000 }) }
export function useFulfillment(id: string | undefined) { return useQuery({ queryKey: ['operations', 'fulfillment', id], queryFn: () => getFulfillment(id!), enabled: !!id, staleTime: 30_000 }) }
export function useWarehouses(filters: OperationalFilters = {}) { return useQuery({ queryKey: ['operations', 'warehouses', filters], queryFn: () => getWarehouses(filters), staleTime: 60_000 }) }
export function useWarehouseInventory(id: string | undefined, filters: OperationalFilters = {}) { return useQuery({ queryKey: ['operations', 'inventory', id, filters], queryFn: () => getWarehouseInventory(id!, filters), enabled: !!id, staleTime: 30_000 }) }
export function useStockMovements(warehouseId: string | undefined, filters: OperationalFilters = {}) { return useQuery({ queryKey: ['operations', 'movements', warehouseId, filters], queryFn: () => getStockMovements(warehouseId, filters), staleTime: 30_000 }) }
export function useSuggestedSplit(id: string | undefined) { return useQuery({ queryKey: ['operations', 'split', id], queryFn: () => getSuggestedSplit(id!), enabled: !!id, staleTime: 0 }) }
export function useBackorders(filters: OperationalFilters = {}) { return useQuery({ queryKey: ['operations', 'backorders', filters], queryFn: () => getBackorders(filters), staleTime: 30_000 }) }
export function useBackorder(id: string | undefined) { return useQuery({ queryKey: ['operations', 'backorder', id], queryFn: () => getBackorder(id!), enabled: !!id, staleTime: 30_000 }) }
export function useShipments(filters: OperationalFilters = {}) { return useQuery({ queryKey: ['operations', 'shipments', filters], queryFn: () => getShipments(filters), staleTime: 30_000 }) }
export function useShipment(id: string | undefined) { return useQuery({ queryKey: ['operations', 'shipment', id], queryFn: () => getShipment(id!), enabled: !!id, staleTime: 30_000 }) }
export function useOperationsAnalytics(filters: OperationalFilters = {}) { return useQuery({ queryKey: ['operations', 'analytics', filters], queryFn: () => getOperationsAnalytics(filters), staleTime: 60_000 }) }

export function useAcceptSplit() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, allocations }: { id: string; allocations: SuggestedSplit['allocations'] }) => acceptSuggestedSplit(id, allocations), onSuccess: () => qc.invalidateQueries({ queryKey: ['operations'] }) }) }
export function useOverrideSplit() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, allocations, reason }: { id: string; allocations: SuggestedSplit['allocations']; reason: string }) => overrideSplit(id, allocations, reason), onSuccess: () => qc.invalidateQueries({ queryKey: ['operations'] }) }) }
export function useConsolidateBackorder() { const qc = useQueryClient(); return useMutation({ mutationFn: consolidateBackorder, onSuccess: () => qc.invalidateQueries({ queryKey: ['operations'] }) }) }
