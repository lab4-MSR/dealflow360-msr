import type { Request, Response } from 'express';
import { envelope } from '../lib/envelope';
import { getAuth } from '../lib/context';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import * as service from '../services/fulfillment.service';
import { fulfillmentAllocationsSchema, shippingRuleSchema, stockMovementSchema, updateWarehouseSchema, warehouseSchema } from '../validators/fulfillment';

function businessId(req: Request): string {
  const id = getAuth(req).businessId;
  if (!id) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return id;
}

export const listWarehouses = async (req: Request, res: Response) => res.json(envelope.okList(await service.listWarehouses(businessId(req))));
export const createWarehouse = async (req: Request, res: Response) => {
  const body = warehouseSchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await service.createWarehouse(businessId(req), body)));
};
export const getWarehouse = async (req: Request, res: Response) => res.json(envelope.ok(await service.getWarehouse(businessId(req), String(req.params.id))));
export const updateWarehouse = async (req: Request, res: Response) => {
  const body = updateWarehouseSchema.parse(req.body ?? {});
  res.json(envelope.ok(await service.updateWarehouse(businessId(req), String(req.params.id), body)));
};
export const listInventory = async (req: Request, res: Response) => res.json(envelope.okList(await service.listInventory(businessId(req), String(req.params.id))));
export const recordStockMovement = async (req: Request, res: Response) => {
  const body = stockMovementSchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await service.recordStockMovement(businessId(req), String(req.params.id), body, getAuth(req).userId)));
};
export const listShippingRules = async (req: Request, res: Response) => res.json(envelope.okList(await service.listShippingRules(businessId(req))));
export const createShippingRule = async (req: Request, res: Response) => {
  const body = shippingRuleSchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await service.createShippingRule(businessId(req), body)));
};
export const suggestQuotationSplit = async (req: Request, res: Response) => {
  res.json(envelope.ok(await service.suggestQuotationSplit(businessId(req), String(req.params.id))));
};
export const acceptQuotationSplit = async (req: Request, res: Response) => {
  const body = fulfillmentAllocationsSchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await service.acceptQuotationSplit(businessId(req), String(req.params.id), body.allocations)));
};
export const overrideQuotationSplit = async (req: Request, res: Response) => {
  const body = fulfillmentAllocationsSchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await service.acceptQuotationSplit(businessId(req), String(req.params.id), body.allocations)));
};
export const listFulfillmentQueue = async (req: Request, res: Response) => res.json(envelope.okList(await service.listFulfillmentQueue(businessId(req))));
export const getFulfillmentOrder = async (req: Request, res: Response) => res.json(envelope.ok(await service.getFulfillmentOrder(businessId(req), String(req.params.id))));
export const listShipments = async (req: Request, res: Response) => res.json(envelope.okList(await service.listShipments(businessId(req))));
export const getShipment = async (req: Request, res: Response) => res.json(envelope.ok(await service.getShipment(businessId(req), String(req.params.id))));
export const listBackorders = async (req: Request, res: Response) => res.json(envelope.okList(await service.listBackorders(businessId(req))));
export const getBackorder = async (req: Request, res: Response) => res.json(envelope.ok(await service.getBackorder(businessId(req), String(req.params.id))));
export const consolidateBackorder = async (req: Request, res: Response) => res.json(envelope.ok(await service.consolidateBackorder(businessId(req), String(req.params.id))));