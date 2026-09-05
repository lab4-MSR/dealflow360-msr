import type { Request, Response } from 'express';
import { envelope } from '../lib/envelope';
import { getAuth } from '../lib/context';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import * as service from '../services/billing.service';
import { billingCycleSchema, cancelSubscriptionSchema, changePlanSchema, creditNoteSchema, paymentSchema, prorationRuleSchema, prorationTestSchema, subscriptionPlanSchema, updateSubscriptionPlanSchema } from '../validators/billing';

function businessId(req: Request): string {
  const id = getAuth(req).businessId;
  if (!id) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return id;
}

export const listPlans = async (req: Request, res: Response) => res.json(envelope.okList(await service.listSubscriptionPlans(businessId(req))));
export const createPlan = async (req: Request, res: Response) => { const body = subscriptionPlanSchema.parse(req.body ?? {}); res.status(201).json(envelope.ok(await service.createSubscriptionPlan(businessId(req), body))); };
export const getPlan = async (req: Request, res: Response) => res.json(envelope.ok(await service.getSubscriptionPlan(businessId(req), String(req.params.id))));
export const updatePlan = async (req: Request, res: Response) => { const body = updateSubscriptionPlanSchema.parse(req.body ?? {}); res.json(envelope.ok(await service.updateSubscriptionPlan(businessId(req), String(req.params.id), body))); };
export const listCycles = async (req: Request, res: Response) => res.json(envelope.okList(await service.listBillingCycles(businessId(req))));
export const updateCycle = async (req: Request, res: Response) => { const body = billingCycleSchema.parse(req.body ?? {}); res.json(envelope.ok(await service.updateBillingCycle(businessId(req), body))); };
export const getProration = async (req: Request, res: Response) => res.json(envelope.ok(await service.getProrationRules(businessId(req))));
export const updateProration = async (req: Request, res: Response) => { const body = prorationRuleSchema.parse(req.body ?? {}); res.json(envelope.ok(await service.updateProrationRules(businessId(req), body))); };
export const testProration = async (req: Request, res: Response) => { const body = prorationTestSchema.parse(req.body ?? {}); res.json(envelope.ok(await service.testProration(businessId(req), body))); };
export const listSubscriptions = async (req: Request, res: Response) => res.json(envelope.okList(await service.listSubscriptions(businessId(req), { status: String(req.query.status ?? '') || undefined, plan_id: String(req.query.plan_id ?? '') || undefined, customer_id: String(req.query.customer_id ?? '') || undefined })));
export const getSubscription = async (req: Request, res: Response) => res.json(envelope.ok(await service.getSubscription(businessId(req), String(req.params.id))));
export const changeSubscriptionPlan = async (req: Request, res: Response) => { const body = changePlanSchema.parse(req.body ?? {}); res.json(envelope.ok(await service.changeSubscriptionPlan(businessId(req), String(req.params.id), body))); };
export const cancelSubscription = async (req: Request, res: Response) => { const body = cancelSubscriptionSchema.parse(req.body ?? {}); res.json(envelope.ok(await service.cancelSubscription(businessId(req), String(req.params.id), body))); };
export const getSubscriptionProration = async (req: Request, res: Response) => res.json(envelope.okList(await service.getSubscriptionProration(businessId(req), String(req.params.id))));
export const listInvoices = async (req: Request, res: Response) => res.json(envelope.okList(await service.listInvoices(businessId(req), { status: String(req.query.status ?? '') || undefined, customer_id: String(req.query.customer_id ?? '') || undefined })));
export const getInvoice = async (req: Request, res: Response) => res.json(envelope.ok(await service.getInvoice(businessId(req), String(req.params.id))));
export const voidInvoice = async (req: Request, res: Response) => res.json(envelope.ok(await service.voidInvoice(businessId(req), String(req.params.id))));
export const listPayments = async (req: Request, res: Response) => res.json(envelope.okList(await service.listPayments(businessId(req), { status: String(req.query.status ?? '') || undefined, customer_id: String(req.query.customer_id ?? '') || undefined })));
export const listFailedPayments = async (req: Request, res: Response) => res.json(envelope.okList(await service.listPayments(businessId(req), { status: 'failed' })));
export const recordPayment = async (req: Request, res: Response) => { const body = paymentSchema.parse(req.body ?? {}); res.status(201).json(envelope.ok(await service.recordPayment(businessId(req), body))); };
export const retryPayment = async (req: Request, res: Response) => res.json(envelope.ok(await service.retryPayment(businessId(req), String(req.params.id))));
export const issueCreditNote = async (req: Request, res: Response) => { const body = creditNoteSchema.parse(req.body ?? {}); res.status(201).json(envelope.ok(await service.issueCreditNote(businessId(req), String(req.params.id), body, getAuth(req).userId))); };