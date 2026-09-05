import type { Request, Response } from 'express';
import { envelope } from '../lib/envelope';
import { getAuth } from '../lib/context';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import * as svc from '../services/discount.service';
import { createDiscountRuleSchema, updateDiscountRuleSchema, customerTiersSchema, discountSimulatorSchema } from '../validators/discount';

function tenantOf(req: Request): string {
  const { businessId } = getAuth(req);
  if (!businessId) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return businessId;
}

export const listDiscountRules = async (req: Request, res: Response) => {
  const { type, status } = req.query as Record<string, string>;
  res.json(envelope.okList(await svc.listDiscountRules(tenantOf(req), { type, status })));
};
export const createDiscountRule = async (req: Request, res: Response) => {
  const body = createDiscountRuleSchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await svc.createDiscountRule(tenantOf(req), body)));
};
export const getDiscountRule = async (req: Request, res: Response) => {
  res.json(envelope.ok(await svc.getDiscountRule(tenantOf(req), String(req.params.id))));
};
export const updateDiscountRule = async (req: Request, res: Response) => {
  const body = updateDiscountRuleSchema.parse(req.body ?? {});
  res.json(envelope.ok(await svc.updateDiscountRule(tenantOf(req), String(req.params.id), body)));
};
export const deleteDiscountRule = async (req: Request, res: Response) => {
  res.json(envelope.ok(await svc.archiveDiscountRule(tenantOf(req), String(req.params.id))));
};

export const getCustomerTiers = async (req: Request, res: Response) => {
  res.json(envelope.ok(await svc.getCustomerTiers(tenantOf(req))));
};
export const updateCustomerTiers = async (req: Request, res: Response) => {
  const body = customerTiersSchema.parse(req.body ?? {});
  res.json(envelope.ok(await svc.updateCustomerTiers(tenantOf(req), body)));
};

export const runDiscountSimulator = async (req: Request, res: Response) => {
  const body = discountSimulatorSchema.parse(req.body ?? {});
  res.json(envelope.ok(await svc.runDiscountSimulator(tenantOf(req), body)));
};