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
