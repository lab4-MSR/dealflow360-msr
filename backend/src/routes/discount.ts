import { Router } from 'express';
import { authenticate, requireBusiness, requireRole } from '../middleware/auth';
import * as dc from '../controllers/discount.controller';
import * as ac from '../controllers/approval.controller';

const scoped = [authenticate, requireBusiness()] as const;
const write = [...scoped, requireRole('business_admin')] as const;
const read = [...scoped, requireRole('business_admin', 'sales_manager', 'finance')] as const;

export const discountRulesRouter = Router();
discountRulesRouter.get('/', ...read, dc.listDiscountRules);
discountRulesRouter.post('/', ...write, dc.createDiscountRule);
discountRulesRouter.get('/:id', ...read, dc.getDiscountRule);
discountRulesRouter.patch('/:id', ...write, dc.updateDiscountRule);
discountRulesRouter.delete('/:id', ...write, dc.deleteDiscountRule);

export const customerTiersRouter = Router();
customerTiersRouter.get('/', ...read, dc.getCustomerTiers);
customerTiersRouter.patch('/', ...write, dc.updateCustomerTiers);

export const discountSimulatorRouter = Router();
discountSimulatorRouter.post('/', ...read, dc.runDiscountSimulator);

export const approvalRulesRouter = Router();
approvalRulesRouter.get('/', ...read, ac.listApprovalRules);
approvalRulesRouter.post('/', ...write, ac.createApprovalRule);
approvalRulesRouter.get('/:id', ...read, ac.getApprovalRule);
approvalRulesRouter.patch('/:id', ...write, ac.updateApprovalRule);
approvalRulesRouter.delete('/:id', ...write, ac.deleteApprovalRule);

export const approvalChainsRouter = Router();
approvalChainsRouter.get('/', ...read, ac.listApprovalChains);
approvalChainsRouter.post('/', ...write, ac.createApprovalChain);
approvalChainsRouter.get('/:id', ...read, ac.getApprovalChain);
approvalChainsRouter.patch('/:id', ...write, ac.updateApprovalChain);
approvalChainsRouter.post('/:id/activate', ...write, ac.activateChain);
approvalChainsRouter.post('/:id/deactivate', ...write, ac.deactivateChain);

export const approvalThresholdsRouter = Router();
approvalThresholdsRouter.get('/', ...read, ac.getApprovalThresholds);
approvalThresholdsRouter.patch('/', ...write, ac.updateApprovalThresholds);

export const approvalSimulatorRouter = Router();
approvalSimulatorRouter.post('/', ...read, ac.runApprovalSimulator);