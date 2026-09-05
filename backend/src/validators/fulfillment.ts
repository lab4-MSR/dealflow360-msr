import { z } from 'zod';

export const warehouseSchema = z.object({
  name: z.string().min(1).max(160),
  code: z.string().max(40).optional().nullable(),
  type: z.string().max(40).optional().nullable(),
  address: z.record(z.string(), z.unknown()).optional(),
  contact: z.record(z.string(), z.unknown()).optional(),
  capacity: z.record(z.string(), z.unknown()).optional(),
  fulfillment_settings: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateWarehouseSchema = warehouseSchema.partial();

export const stockMovementSchema = z.object({
  product_id: z.string().uuid(),
  movement_type: z.enum(['incoming', 'outgoing', 'transfer', 'adjustment']),
  quantity: z.number().positive(),
  reference: z.string().max(160).optional().nullable(),
}).strict();

export const shippingRuleSchema = z.object({
  name: z.string().min(1).max(160),
  destination: z.record(z.string(), z.unknown()).optional(),
  warehouse_id: z.string().uuid().optional().nullable(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  strategy: z.enum(['stock_availability', 'shipping_cost', 'shipment_count', 'warehouse_priority']).optional(),
  shipping_method: z.string().max(80).optional().nullable(),
  shipping_cost: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  priority: z.number().int().min(0).optional(),
}).strict();

export const fulfillmentAllocationsSchema = z.object({
  allocations: z.array(z.object({
    warehouse_id: z.string().uuid(),
    product_id: z.string().uuid(),
    quantity: z.number().positive(),
  }).strict()).min(1),
}).strict();