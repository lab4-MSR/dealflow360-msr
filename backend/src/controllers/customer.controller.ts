import type { Request, Response } from 'express';
import { envelope } from '../lib/envelope';
import { getAuth } from '../lib/context';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import * as svc from '../services/customer.service';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer';

function tenantOf(req: Request): string {
  const { businessId } = getAuth(req);
  if (!businessId) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return businessId;
}

export const listCustomers = async (req: Request, res: Response) => {
  const { tier, status, owner_id } = req.query as Record<string, string>;
  const page = Number(req.query.page ?? 1);
  const perPage = Number(req.query.per_page ?? 20);
  const data = await svc.listCustomers(tenantOf(req), { tier, status, owner_id });
  res.json(envelope.okList(data, { page, per_page: perPage, total: data.length, total_pages: Math.max(1, Math.ceil(data.length / (perPage || 20))) }));
};

export const createCustomer = async (req: Request, res: Response) => {
  const body = createCustomerSchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await svc.createCustomer(tenantOf(req), body)));
};

export const getCustomer = async (req: Request, res: Response) => {
  const include = ((req.query.include as string) ?? '').split(',').filter(Boolean);
  res.json(envelope.ok(await svc.getCustomer(tenantOf(req), String(req.params.id), { contacts: include })));
};

export const updateCustomer = async (req: Request, res: Response) => {
  const body = updateCustomerSchema.parse(req.body ?? {});
  res.json(envelope.ok(await svc.updateCustomer(tenantOf(req), String(req.params.id), body)));
};

export const customerDeals = async (req: Request, res: Response) => {
  res.json(envelope.okList(await svc.customerDeals(tenantOf(req), String(req.params.id))));
};

export const customerBilling = async (req: Request, res: Response) => {
  res.json(envelope.ok(await svc.customerBillingSummary(tenantOf(req), String(req.params.id))));
};