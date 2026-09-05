import type { Request, Response } from 'express';
import { envelope } from '../lib/envelope';
import { getAuth } from '../lib/context';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import * as service from '../services/intelligence.service';

function businessId(req: Request): string {
  const id = getAuth(req).businessId;
  if (!id) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return id;
}

export const listAudit = async (req: Request, res: Response) => res.json(envelope.okList(await service.listAudit(businessId(req), { action: String(req.query.action ?? '') || undefined, entity_type: String(req.query.entity_type ?? '') || undefined, actor: String(req.query.actor ?? '') || undefined })));
export const getAudit = async (req: Request, res: Response) => res.json(envelope.ok(await service.getAudit(businessId(req), String(req.params.id))));
export const auditKpis = async (req: Request, res: Response) => res.json(envelope.ok(await service.auditKpis(businessId(req))));
export const listDealHealth = async (req: Request, res: Response) => res.json(envelope.okList(await service.listDealHealth(businessId(req))));
export const getDealHealth = async (req: Request, res: Response) => res.json(envelope.ok(await service.getDealHealth(businessId(req), String(req.params.id))));
export const dealHealthKpis = async (req: Request, res: Response) => res.json(envelope.ok(await service.dealHealthKpis(businessId(req))));
export const listAnomalies = async (req: Request, res: Response) => res.json(envelope.okList(await service.listAnomalies(businessId(req), String(req.params.id) || undefined)));
export const dismissAnomaly = async (req: Request, res: Response) => res.json(envelope.ok(await service.dismissAnomaly(businessId(req), String(req.params.id), getAuth(req).userId)));
export const listInsights = async (req: Request, res: Response) => res.json(envelope.okList(await service.listInsights(businessId(req))));
export const actOnInsight = async (req: Request, res: Response) => res.json(envelope.ok(await service.actOnInsight(businessId(req), String(req.params.id), req.body ?? {})));