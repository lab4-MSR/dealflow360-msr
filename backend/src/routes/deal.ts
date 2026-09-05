import { Router } from 'express';
import { authenticate, requireBusiness, requireRole } from '../middleware/auth';
import * as dc from '../controllers/deal.controller';
import * as fc from '../controllers/fulfillment.controller';

const scoped = [authenticate, requireBusiness()] as const;
const write = [...scoped, requireRole('business_admin', 'sales_rep', 'sales_manager')] as const;
const fulfillmentWrite = [...scoped, requireRole('business_admin', 'sales_rep', 'sales_manager', 'operations')] as const;
const fulfillmentOverride = [...scoped, requireRole('business_admin', 'sales_manager', 'operations')] as const;
const approver = [authenticate, requireBusiness(), requireRole('business_admin', 'sales_manager', 'finance')] as const;

export const dealsRouter = Router();
dealsRouter.get('/', ...scoped, dc.listDeals);
dealsRouter.post('/', ...write, dc.createDeal);
dealsRouter.get('/:id', ...scoped, dc.getDeal);
dealsRouter.patch('/:id', ...write, dc.updateDeal);
dealsRouter.get('/:id/timeline', ...scoped, dc.getDealTimeline);
dealsRouter.get('/:id/health', ...scoped, dc.getDealHealth);

export const quotationsRouter = Router();
quotationsRouter.get('/', ...scoped, dc.listQuotations);
quotationsRouter.post('/', ...write, dc.createQuotation);
quotationsRouter.get('/:id', ...scoped, dc.getQuotation);
quotationsRouter.patch('/:id', ...write, dc.updateQuotation);
quotationsRouter.delete('/:id', ...write, dc.deleteQuotation);
quotationsRouter.post('/:id/duplicate', ...write, dc.duplicateQuotation);
quotationsRouter.post('/:id/lines', ...write, dc.addLine);
quotationsRouter.patch('/:id/lines/:line_id', ...write, dc.updateLine);
quotationsRouter.delete('/:id/lines/:line_id', ...write, dc.removeLine);
quotationsRouter.get('/:id/evaluate', ...scoped, dc.evaluateQuotation);
quotationsRouter.post('/:id/validate', ...scoped, dc.validateQuotation);
quotationsRouter.post('/:id/submit-for-approval', ...write, dc.submitForApproval);
quotationsRouter.get('/:id/fulfillment/suggested-split', ...scoped, fc.suggestQuotationSplit);
quotationsRouter.post('/:id/fulfillment/accept-split', ...fulfillmentWrite, fc.acceptQuotationSplit);
quotationsRouter.post('/:id/fulfillment/override-split', ...fulfillmentOverride, fc.overrideQuotationSplit);
quotationsRouter.get('/:id/approval', ...scoped, dc.getQuotationApproval);
quotationsRouter.get('/:id/recommendations', ...scoped, dc.getRecommendations);
quotationsRouter.post('/:id/recommendations/:rec_id/add', ...write, dc.addRecommendation);
quotationsRouter.post('/:id/recommendations/:rec_id/dismiss', ...scoped, dc.dismissRecommendation);
quotationsRouter.post('/:id/send', ...write, dc.sendQuotation);
quotationsRouter.get('/:id/negotiation', ...scoped, dc.getNegotiation);

export const approvalsRouter = Router();
approvalsRouter.get('/inbox', ...approver, dc.listApprovalInbox);
approvalsRouter.get('/history', ...approver, dc.approvalHistory);
approvalsRouter.get('/:id', ...approver, dc.getApproval);
approvalsRouter.post('/:id/approve', ...approver, dc.approveApproval);
approvalsRouter.post('/:id/reject', ...approver, dc.rejectApproval);
approvalsRouter.post('/:id/return', ...approver, dc.returnApproval);