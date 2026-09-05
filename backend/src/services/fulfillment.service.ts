import { randomUUID } from 'crypto';
import { serviceClient } from '../lib/supabase';
import { ApiError, ErrorCode } from '../lib/apiErrors';

function tenant(businessId: string | null): string {
  if (!businessId) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return businessId;
}

async function profileId(businessId: string, actorId: string | null): Promise<string | null> {
  if (!actorId) return null;
  const { data } = await serviceClient.from('users').select('id').eq('business_id', businessId).eq('auth_user_id', actorId).maybeSingle();
  return data?.id ?? null;
}

export async function listWarehouses(businessId: string) {
  const { data, error } = await serviceClient.from('warehouses').select('*').eq('business_id', tenant(businessId)).is('deleted_at', null);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function createWarehouse(businessId: string, input: Record<string, unknown>) {
  const { data, error } = await serviceClient.from('warehouses').insert({
    business_id: tenant(businessId),
    name: input.name,
    code: input.code ?? null,
    type: input.type ?? null,
    address: input.address ?? {},
    contact: input.contact ?? {},
    capacity: input.capacity ?? {},
    fulfillment_settings: input.fulfillment_settings ?? {},
  }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function getWarehouse(businessId: string, warehouseId: string) {
  const { data, error } = await serviceClient.from('warehouses').select('*').eq('business_id', tenant(businessId)).eq('id', warehouseId).is('deleted_at', null).maybeSingle();
  if (error || !data) throw ApiError.notFound('Warehouse not found.');
  return data;
}

export async function updateWarehouse(businessId: string, warehouseId: string, input: Record<string, unknown>) {
  await getWarehouse(businessId, warehouseId);
  const patch: Record<string, unknown> = {};
  for (const key of ['name', 'code', 'type', 'address', 'contact', 'capacity', 'fulfillment_settings']) {
    if (input[key] !== undefined) patch[key] = input[key];
  }
  const { data, error } = await serviceClient.from('warehouses').update(patch).eq('business_id', businessId).eq('id', warehouseId).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function listInventory(businessId: string, warehouseId: string) {
  await getWarehouse(businessId, warehouseId);
  const { data, error } = await serviceClient.from('warehouse_inventory').select('*, products(id,name,sku)').eq('business_id', businessId).eq('warehouse_id', warehouseId);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function recordStockMovement(businessId: string, warehouseId: string, input: Record<string, unknown>, actor: string | null) {
  const id = tenant(businessId);
  await getWarehouse(id, warehouseId);
  const actorProfileId = await profileId(id, actor);
  const quantity = Number(input.quantity);
  const movementType = String(input.movement_type);
  const { data: existing } = await serviceClient.from('warehouse_inventory').select('*').eq('business_id', businessId).eq('warehouse_id', warehouseId).eq('product_id', input.product_id).maybeSingle();
  const available = Number(existing?.available_qty ?? 0);
  const nextAvailable = movementType === 'outgoing' ? available - quantity : movementType === 'incoming' ? available + quantity : quantity;
  if (nextAvailable < 0) throw new ApiError({ code: ErrorCode.INSUFFICIENT_STOCK, message: 'Movement exceeds available stock.' });
  const { data: movement, error: movementError } = await serviceClient.from('stock_movements').insert({
    business_id: id, warehouse_id: warehouseId, product_id: input.product_id,
    movement_type: movementType, quantity, reference: input.reference ?? null, created_by: actorProfileId,
  }).select().single();
  if (movementError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: movementError.message });
  const { error: inventoryError } = await serviceClient.from('warehouse_inventory').upsert({
    business_id: id, warehouse_id: warehouseId, product_id: input.product_id,
    available_qty: nextAvailable, reserved_qty: Number(existing?.reserved_qty ?? 0), reorder_level: Number(existing?.reorder_level ?? 0),
    status: nextAvailable > 0 ? 'in_stock' : 'out_of_stock',
  }, { onConflict: 'warehouse_id,product_id' });
  if (inventoryError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: inventoryError.message });
  return movement;
}

export async function listShippingRules(businessId: string) {
  const { data, error } = await serviceClient.from('shipping_rules').select('*, warehouses(id,name,code)').eq('business_id', tenant(businessId)).order('priority');
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function createShippingRule(businessId: string, input: Record<string, unknown>) {
  const id = tenant(businessId);
  if (input.warehouse_id) await getWarehouse(id, String(input.warehouse_id));
  const { data, error } = await serviceClient.from('shipping_rules').insert({
    business_id: id,
    name: input.name,
    destination: input.destination ?? {},
    warehouse_id: input.warehouse_id ?? null,
    conditions: input.conditions ?? {},
    strategy: input.strategy ?? 'stock_availability',
    shipping_method: input.shipping_method ?? null,
    shipping_cost: input.shipping_cost ?? 0,
    currency: input.currency ?? 'USD',
    priority: input.priority ?? 100,
  }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function suggestQuotationSplit(businessId: string, quotationId: string) {
  const id = tenant(businessId);
  const { data: quotation, error: quotationError } = await serviceClient
    .from('quotations')
    .select('id, quotation_lines(id, product_id, quantity)')
    .eq('business_id', id)
    .eq('id', quotationId)
    .maybeSingle();
  if (quotationError || !quotation) throw ApiError.notFound('Quotation not found.');

  const { data: inventory, error: inventoryError } = await serviceClient
    .from('warehouse_inventory')
    .select('warehouse_id, product_id, available_qty, warehouses(id,name,fulfillment_settings)')
    .eq('business_id', id)
    .gt('available_qty', 0);
  if (inventoryError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: inventoryError.message });

  const allocations: Array<Record<string, unknown>> = [];
  let unfulfillableQuantity = 0;
  for (const line of (quotation.quotation_lines ?? []) as Array<Record<string, unknown>>) {
    let remaining = Number(line.quantity);
    const candidates = (inventory ?? [])
      .filter((row) => row.product_id === line.product_id)
      .sort((left, right) => String(left.warehouse_id).localeCompare(String(right.warehouse_id)));
    for (const row of candidates) {
      if (remaining <= 0) break;
      const quantity = Math.min(remaining, Number(row.available_qty));
      if (quantity <= 0) continue;
      const warehouse = row.warehouses as { id?: string; name?: string; fulfillment_settings?: Record<string, unknown> } | null;
      allocations.push({
        warehouse_id: row.warehouse_id,
        warehouse_name: warehouse?.name ?? null,
        product_id: line.product_id,
        quantity,
      });
      remaining -= quantity;
    }
    unfulfillableQuantity += Math.max(0, remaining);
  }

  const warehouseIds = [...new Set(allocations.map((allocation) => allocation.warehouse_id as string))];
  const estimatedShippingCost = warehouseIds.reduce((total, warehouseId) => {
    const row = (inventory ?? []).find((candidate) => candidate.warehouse_id === warehouseId);
    const warehouse = row?.warehouses as { fulfillment_settings?: Record<string, unknown> } | null;
    return total + Number(warehouse?.fulfillment_settings?.shipping_cost ?? 0);
  }, 0);
  return {
    quotation_id: quotationId,
    allocations,
    estimated_shipment_count: warehouseIds.length,
    estimated_shipping_cost: Number(estimatedShippingCost.toFixed(2)),
    backorder_risk: unfulfillableQuantity > 0 ? 'high' : 'low',
    unfulfillable_quantity: unfulfillableQuantity,
  };
}

export async function acceptQuotationSplit(
  businessId: string,
  quotationId: string,
  requestedAllocations: Array<{ warehouse_id: string; product_id: string; quantity: number }>,
) {
  const id = tenant(businessId);
  const { data: quotation, error: quotationError } = await serviceClient
    .from('quotations')
    .select('id, status, currency, quotation_lines(product_id, quantity)')
    .eq('business_id', id)
    .eq('id', quotationId)
    .maybeSingle();
  if (quotationError || !quotation) throw ApiError.notFound('Quotation not found.');
  if (!['approved', 'sent'].includes(quotation.status)) {
    throw new ApiError({ code: ErrorCode.QUOTATION_LOCKED, message: 'Only approved or sent quotations can enter fulfillment.' });
  }

  const required = new Map<string, number>();
  for (const line of (quotation.quotation_lines ?? []) as Array<Record<string, unknown>>) {
    required.set(String(line.product_id), (required.get(String(line.product_id)) ?? 0) + Number(line.quantity));
  }
  const allocated = new Map<string, number>();
  for (const allocation of requestedAllocations) {
    allocated.set(allocation.product_id, (allocated.get(allocation.product_id) ?? 0) + allocation.quantity);
  }
  for (const [productId, quantity] of required) {
    if ((allocated.get(productId) ?? 0) !== quantity) throw ApiError.validation(`Allocation quantity for product ${productId} must equal the quotation quantity.`);
  }
  for (const productId of allocated.keys()) {
    if (!required.has(productId)) throw ApiError.validation(`Product ${productId} is not part of the quotation.`);
  }

  const inventoryRows: Array<{ warehouse_id: string; product_id: string; available_qty: number; reserved_qty: number }> = [];
  for (const allocation of requestedAllocations) {
    const { data: inventory, error } = await serviceClient.from('warehouse_inventory').select('warehouse_id,product_id,available_qty,reserved_qty').eq('business_id', id).eq('warehouse_id', allocation.warehouse_id).eq('product_id', allocation.product_id).maybeSingle();
    if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
    if (!inventory || Number(inventory.available_qty) < allocation.quantity) throw new ApiError({ code: ErrorCode.INSUFFICIENT_STOCK, message: 'Allocation exceeds available warehouse stock.' });
    inventoryRows.push({ warehouse_id: inventory.warehouse_id, product_id: inventory.product_id, available_qty: Number(inventory.available_qty), reserved_qty: Number(inventory.reserved_qty) });
  }

  const { data: order, error: orderError } = await serviceClient.from('fulfillment_orders').insert({
    business_id: id, quotation_id: quotationId, order_number: `FO-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`, status: 'in_fulfillment', fulfillment_status: 'unfulfilled',
  }).select().single();
  if (orderError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: orderError.message });
  const { error: allocationError } = await serviceClient.from('fulfillment_allocations').insert(requestedAllocations.map((allocation) => ({
    business_id: id, fulfillment_order_id: order.id, warehouse_id: allocation.warehouse_id, product_id: allocation.product_id, quantity: allocation.quantity,
  })));
  if (allocationError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: allocationError.message });

  const warehouseIds = [...new Set(requestedAllocations.map((allocation) => allocation.warehouse_id))];
  const { data: warehouses } = await serviceClient.from('warehouses').select('id,fulfillment_settings').eq('business_id', id).in('id', warehouseIds);
  const { data: shipments, error: shipmentError } = await serviceClient.from('shipments').insert(warehouseIds.map((warehouseId) => {
    const warehouse = (warehouses ?? []).find((row) => row.id === warehouseId);
    return { business_id: id, fulfillment_order_id: order.id, shipment_number: `S-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`, status: 'pending', shipping_cost: Number(warehouse?.fulfillment_settings?.shipping_cost ?? 0), currency: quotation.currency ?? 'USD' };
  })).select();
  if (shipmentError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: shipmentError.message });

  for (let index = 0; index < requestedAllocations.length; index += 1) {
    const allocation = requestedAllocations[index];
    const inventory = inventoryRows[index];
    await serviceClient.from('warehouse_inventory').update({ available_qty: inventory.available_qty - allocation.quantity, reserved_qty: inventory.reserved_qty + allocation.quantity }).eq('business_id', id).eq('warehouse_id', allocation.warehouse_id).eq('product_id', allocation.product_id);
  }
  await serviceClient.from('quotations').update({ status: 'confirmed' }).eq('business_id', id).eq('id', quotationId);
  return { fulfillment_order: order, shipments: shipments ?? [], allocations: requestedAllocations };
}

export async function listFulfillmentQueue(businessId: string) {
  const { data, error } = await serviceClient
    .from('fulfillment_orders')
    .select('*, quotations(id,quote_number,customer:customers(id,name)), fulfillment_allocations(*), shipments(*)')
    .eq('business_id', tenant(businessId))
    .in('status', ['pending', 'in_fulfillment'])
    .order('created_at', { ascending: true });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function getFulfillmentOrder(businessId: string, orderId: string) {
  const { data, error } = await serviceClient
    .from('fulfillment_orders')
    .select('*, quotations(id,quote_number,customer:customers(id,name)), fulfillment_allocations(*), shipments(*, shipment_items(*))')
    .eq('business_id', tenant(businessId))
    .eq('id', orderId)
    .maybeSingle();
  if (error || !data) throw ApiError.notFound('Fulfillment order not found.');
  return data;
}

export async function listShipments(businessId: string) {
  const { data, error } = await serviceClient
    .from('shipments')
    .select('*, fulfillment_orders(id,order_number,quotation_id), shipment_items(*)')
    .eq('business_id', tenant(businessId))
    .order('created_at', { ascending: false });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function getShipment(businessId: string, shipmentId: string) {
  const { data, error } = await serviceClient
    .from('shipments')
    .select('*, fulfillment_orders(id,order_number,quotation_id), shipment_items(*)')
    .eq('business_id', tenant(businessId))
    .eq('id', shipmentId)
    .maybeSingle();
  if (error || !data) throw ApiError.notFound('Shipment not found.');
  return data;
}

export async function listBackorders(businessId: string) {
  const { data, error } = await serviceClient
    .from('backorders')
    .select('*, products(id,name,sku), warehouses(id,name,code), fulfillment_orders(id,order_number)')
    .eq('business_id', tenant(businessId))
    .eq('status', 'open')
    .order('created_at', { ascending: true });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function getBackorder(businessId: string, backorderId: string) {
  const { data, error } = await serviceClient
    .from('backorders')
    .select('*, products(id,name,sku), warehouses(id,name,code), fulfillment_orders(id,order_number)')
    .eq('business_id', tenant(businessId))
    .eq('id', backorderId)
    .maybeSingle();
  if (error || !data) throw ApiError.notFound('Backorder not found.');
  return data;
}

export async function consolidateBackorder(businessId: string, backorderId: string) {
  const id = tenant(businessId);
  const backorder = await getBackorder(id, backorderId);
  if (backorder.status !== 'open') throw new ApiError({ code: ErrorCode.QUOTATION_LOCKED, message: 'Backorder is already consolidated or fulfilled.' });
  if (!backorder.warehouse_id || !backorder.product_id) throw ApiError.validation('Backorder is missing warehouse or product information.');
  const { data: inventory, error: inventoryError } = await serviceClient
    .from('warehouse_inventory')
    .select('available_qty')
    .eq('business_id', id)
    .eq('warehouse_id', backorder.warehouse_id)
    .eq('product_id', backorder.product_id)
    .maybeSingle();
  if (inventoryError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: inventoryError.message });
  if (!inventory || Number(inventory.available_qty) < Number(backorder.quantity)) {
    throw new ApiError({ code: ErrorCode.INSUFFICIENT_STOCK, message: 'Insufficient stock to consolidate this backorder.' });
  }
  const { data, error } = await serviceClient
    .from('backorders')
    .update({ status: 'consolidated' })
    .eq('business_id', id)
    .eq('id', backorderId)
    .select()
    .single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}