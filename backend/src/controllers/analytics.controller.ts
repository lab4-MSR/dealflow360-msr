import type { Request, Response } from 'express';
import { envelope } from '../lib/envelope';
import { getAuth } from '../lib/context';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import * as service from '../services/analytics.service';

function businessId(req: Request): string {
  const id = getAuth(req).businessId;
  if (!id) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return id;
}

export const executive = async (req: Request, res: Response) => res.json(envelope.ok(await service.executive(businessId(req))));
export const sales = async (req: Request, res: Response) => res.json(envelope.ok(await service.sales(businessId(req))));
export const revenue = async (req: Request, res: Response) => res.json(envelope.ok(await service.revenue(businessId(req))));
export const approvals = async (req: Request, res: Response) => res.json(envelope.ok(await service.approvals(businessId(req))));
export const discount = async (req: Request, res: Response) => res.json(envelope.ok(await service.discount(businessId(req))));
export const margin = async (req: Request, res: Response) => res.json(envelope.ok(await service.margin(businessId(req))));
export const fulfillment = async (req: Request, res: Response) => res.json(envelope.ok(await service.fulfillment(businessId(req))));
export const subscription = async (req: Request, res: Response) => res.json(envelope.ok(await service.subscription(businessId(req))));
export const reports = async (req: Request, res: Response) => res.json(envelope.ok(await service.reports(businessId(req))));
export const finance = async (req: Request, res: Response) => res.json(envelope.ok(await service.finance(businessId(req))));
export const scheduleReport = async (req: Request, res: Response) => res.json(envelope.ok({ success: true, message: 'Report scheduled' }));
