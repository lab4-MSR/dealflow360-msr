import type { Request, Response } from 'express';
import { envelope } from '../lib/envelope';
import { getAuth } from '../lib/context';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import { serviceClient } from '../lib/supabase';
import * as svc from '../services/deal.service';
import { createDealSchema, updateDealSchema, createQuotationSchema, updateQuotationSchema, lineItemSchema, updateLineItemSchema, approvalActionSchema, approvalRejectSchema } from '../validators/deal';

function tenantOf(req: Request): string {
  const { businessId } = getAuth(req);
  if (!businessId) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return businessId;
}
function userId(req: Request): string { return getAuth(req).userId; }

export const listDeals = async (req: Request, res: Response) => {
  const { stage, customer_id, owner_id } = req.query as Record<string, string>;
  res.json(envelope.okList(await svc.listDeals(tenantOf(req), { stage, customer_id, owner_id })));
};
export const createDeal = async (req: Request, res: Response) => {
  const body = createDealSchema.parse(req.body ?? {});
  const authId = getAuth(req).userId;
  const { data: userProfile } = await serviceClient.from('users').select('id').eq('auth_user_id', authId).eq('business_id', tenantOf(req)).maybeSingle();
  res.status(201).json(envelope.ok(await svc.createDeal(tenantOf(req), body, userProfile?.id ?? null)));
};
export const getDeal = async (req: Request, res: Response) => res.json(envelope.ok(await svc.getDeal(tenantOf(req), String(req.params.id))));
export const updateDeal = async (req: Request, res: Response) => {
  const body = updateDealSchema.parse(req.body ?? {});
  res.json(envelope.ok(await svc.updateDeal(tenantOf(req), String(req.params.id), body)));
};
export const getDealTimeline = async (req: Request, res: Response) => res.json(envelope.okList(await svc.dealTimeline(tenantOf(req), String(req.params.id))));
export const getDealHealth = async (req: Request, res: Response) => res.json(envelope.ok(await svc.dealHealth(tenantOf(req), String(req.params.id))));

export const listQuotations = async (req: Request, res: Response) => {
  const { status, customer_id, deal_id } = req.query as Record<string, string>;
  res.json(envelope.okList(await svc.listQuotations(tenantOf(req), { status, customer_id, deal_id })));
};
export const createQuotation = async (req: Request, res: Response) => {
  const body = createQuotationSchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await svc.createQuotation(tenantOf(req), body)));
};
export const getQuotation = async (req: Request, res: Response) => res.json(envelope.ok(await svc.getFullQuotation(tenantOf(req), String(req.params.id))));
export const updateQuotation = async (req: Request, res: Response) => {
  const body = updateQuotationSchema.parse(req.body ?? {});
  res.json(envelope.ok(await svc.updateQuotation(tenantOf(req), String(req.params.id), body)));
};
export const deleteQuotation = async (req: Request, res: Response) => {
  res.json(envelope.ok(await svc.deleteQuotation(tenantOf(req), String(req.params.id))));
};
export const duplicateQuotation = async (req: Request, res: Response) => res.status(201).json(envelope.ok(await svc.duplicateQuotation(tenantOf(req), String(req.params.id))));

export const addLine = async (req: Request, res: Response) => {
  const body = lineItemSchema.parse(req.body ?? {});
  await svc.addLine(tenantOf(req), String(req.params.id), body);
  res.status(201).json(envelope.ok(await svc.getFullQuotation(tenantOf(req), String(req.params.id))));
};
export const updateLine = async (req: Request, res: Response) => {
  const body = updateLineItemSchema.parse(req.body ?? {});
  await svc.updateLine(tenantOf(req), String(req.params.id), String(req.params.line_id), body);
  res.json(envelope.ok(await svc.getFullQuotation(tenantOf(req), String(req.params.id))));
};
export const removeLine = async (req: Request, res: Response) => {
  await svc.removeLine(tenantOf(req), String(req.params.id), String(req.params.line_id));
  res.json(envelope.ok(await svc.getFullQuotation(tenantOf(req), String(req.params.id))));
};

export const evaluateQuotation = async (req: Request, res: Response) => res.json(envelope.ok(await svc.evaluateQuotation(tenantOf(req), String(req.params.id))));
export const validateQuotation = async (req: Request, res: Response) => {
  const result = await svc.evaluateQuotation(tenantOf(req), String(req.params.id));
  res.json(envelope.ok({ valid: !result.approval_preview.approval_required || result.risk.blended_risk_score < 75, issues: [] }));
};
export const submitForApproval = async (req: Request, res: Response) => res.json(envelope.ok(await svc.submitForApproval(tenantOf(req), String(req.params.id), userId(req))));
export const listApprovalInbox = async (req: Request, res: Response) => res.json(envelope.okList(await svc.listApprovalInbox(tenantOf(req), getAuth(req).role ?? '')));
export const getApproval = async (req: Request, res: Response) => res.json(envelope.ok(await svc.getApproval(tenantOf(req), String(req.params.id))));
export const approveApproval = async (req: Request, res: Response) => { const body = approvalActionSchema.parse(req.body ?? {}); res.json(envelope.ok(await svc.approveApproval(tenantOf(req), String(req.params.id), userId(req), body.comment))); };
export const rejectApproval = async (req: Request, res: Response) => { const body = approvalRejectSchema.parse(req.body ?? {}); res.json(envelope.ok(await svc.rejectApproval(tenantOf(req), String(req.params.id), userId(req), body.reason))); };
export const returnApproval = async (req: Request, res: Response) => { const body = approvalRejectSchema.parse(req.body ?? {}); res.json(envelope.ok(await svc.returnApproval(tenantOf(req), String(req.params.id), userId(req), body.reason))); };
export const approvalHistory = async (req: Request, res: Response) => res.json(envelope.okList(await svc.approvalHistory(tenantOf(req))));
export const getQuotationApproval = async (req: Request, res: Response) => res.json(envelope.ok(await svc.getQuotationApproval(tenantOf(req), String(req.params.id))));

export const getRecommendations = async (req: Request, res: Response) => res.json(envelope.okList(await svc.getRecommendations(tenantOf(req), String(req.params.id))));
export const addRecommendation = async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const qId = String(req.params.id);
  const recId = String(req.params.rec_id);
  let productId = recId;
  const { data: prod } = await serviceClient.from('products').select('id').eq('business_id', b).eq('id', recId).maybeSingle();
  if (!prod) {
    const { data: fallbackProd } = await serviceClient.from('products').select('id').eq('business_id', b).eq('status', 'active').limit(1).maybeSingle();
    if (fallbackProd) productId = fallbackProd.id;
  }
  await svc.addLine(b, qId, { product_id: productId, quantity: 1, discount_percent: 0 });
  res.json(envelope.ok(await svc.getFullQuotation(b, qId)));
};
export const dismissRecommendation = async (req: Request, res: Response) => res.json(envelope.ok({ dismissed: req.params.rec_id }));

export const sendQuotation = async (req: Request, res: Response) => res.json(envelope.ok(await svc.sendQuotation(tenantOf(req), String(req.params.id))));
export const getNegotiation = async (req: Request, res: Response) => res.json(envelope.ok(await svc.getQuotation(tenantOf(req), String(req.params.id))));