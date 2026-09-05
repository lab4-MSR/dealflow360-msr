import type { Request, Response } from 'express';
import { envelope } from '../lib/envelope';
import { getAuth } from '../lib/context';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import * as svc from '../services/approval.service';
import { createApprovalRuleSchema, updateApprovalRuleSchema, createApprovalChainSchema, updateApprovalChainSchema, approvalThresholdsSchema, approvalSimulatorSchema } from '../validators/discount';

function tenantOf(req: Request): string {
  const { businessId } = getAuth(req);
  if (!businessId) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return businessId;
}

export const listApprovalRules = async (req: Request, res: Response) => res.json(envelope.okList(await svc.listApprovalRules(tenantOf(req))));
export const createApprovalRule = async (req: Request, res: Response) => { const body = createApprovalRuleSchema.parse(req.body ?? {}); res.status(201).json(envelope.ok(await svc.createApprovalRule(tenantOf(req), body))); };
export const getApprovalRule = async (req: Request, res: Response) => res.json(envelope.ok(await svc.getApprovalRule(tenantOf(req), String(req.params.id))));
export const updateApprovalRule = async (req: Request, res: Response) => { const body = updateApprovalRuleSchema.parse(req.body ?? {}); res.json(envelope.ok(await svc.updateApprovalRule(tenantOf(req), String(req.params.id), body))); };
export const deleteApprovalRule = async (req: Request, res: Response) => res.json(envelope.ok(await svc.deleteApprovalRule(tenantOf(req), String(req.params.id))));

export const listApprovalChains = async (req: Request, res: Response) => res.json(envelope.okList(await svc.listApprovalChains(tenantOf(req))));
export const createApprovalChain = async (req: Request, res: Response) => { const body = createApprovalChainSchema.parse(req.body ?? {}); res.status(201).json(envelope.ok(await svc.createApprovalChain(tenantOf(req), body))); };
export const getApprovalChain = async (req: Request, res: Response) => res.json(envelope.ok(await svc.getApprovalChain(tenantOf(req), String(req.params.id))));
export const updateApprovalChain = async (req: Request, res: Response) => { const body = updateApprovalChainSchema.parse(req.body ?? {}); res.json(envelope.ok(await svc.updateApprovalChain(tenantOf(req), String(req.params.id), body))); };
export const activateChain = async (req: Request, res: Response) => res.json(envelope.ok(await svc.setChainStatus(tenantOf(req), String(req.params.id), 'active')));
export const deactivateChain = async (req: Request, res: Response) => res.json(envelope.ok(await svc.setChainStatus(tenantOf(req), String(req.params.id), 'inactive')));

export const getApprovalThresholds = async (req: Request, res: Response) => res.json(envelope.ok(await svc.getApprovalThresholds(tenantOf(req))));
export const updateApprovalThresholds = async (req: Request, res: Response) => { const body = approvalThresholdsSchema.parse(req.body ?? {}); res.json(envelope.ok(await svc.updateApprovalThresholds(tenantOf(req), body.metric, body.bands))); };

export const runApprovalSimulator = async (req: Request, res: Response) => { const body = approvalSimulatorSchema.parse(req.body ?? {}); res.json(envelope.ok(await svc.runApprovalSimulator(tenantOf(req), body))); };