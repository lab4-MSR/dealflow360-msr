import { Router } from 'express';
import { authenticate, requireBusiness, requireRole } from '../middleware/auth';
import * as controller from '../controllers/billing.controller';

const read = [authenticate, requireBusiness(), requireRole('business_admin', 'finance', 'sales_rep', 'sales_manager')] as const;
const write = [authenticate, requireBusiness(), requireRole('business_admin')] as const;

export const subscriptionPlansRouter = Router();
subscriptionPlansRouter.get('/', ...read, controller.listPlans);
subscriptionPlansRouter.post('/', ...write, controller.createPlan);
subscriptionPlansRouter.get('/:id', ...read, controller.getPlan);
subscriptionPlansRouter.patch('/:id', ...write, controller.updatePlan);

export const billingCyclesRouter = Router();
billingCyclesRouter.get('/', ...read, controller.listCycles);
billingCyclesRouter.patch('/', ...write, controller.updateCycle);

export const prorationRulesRouter = Router();
prorationRulesRouter.get('/', ...read, controller.getProration);
prorationRulesRouter.patch('/', ...write, controller.updateProration);
prorationRulesRouter.post('/test-calculation', ...read, controller.testProration);

export const subscriptionsRouter = Router();
subscriptionsRouter.get('/', ...read, controller.listSubscriptions);
subscriptionsRouter.get('/:id', ...read, controller.getSubscription);
subscriptionsRouter.post('/:id/change-plan', ...read, controller.changeSubscriptionPlan);
subscriptionsRouter.post('/:id/cancel', ...read, controller.cancelSubscription);
subscriptionsRouter.get('/:id/proration', ...read, controller.getSubscriptionProration);

export const invoicesRouter = Router();
invoicesRouter.get('/', ...read, controller.listInvoices);
invoicesRouter.get('/:id', ...read, controller.getInvoice);
invoicesRouter.post('/:id/void', ...write, controller.voidInvoice);
invoicesRouter.post('/:id/credit-note', ...write, controller.issueCreditNote);

export const paymentsRouter = Router();
paymentsRouter.get('/', ...read, controller.listPayments);
paymentsRouter.post('/', ...write, controller.recordPayment);
paymentsRouter.get('/failed', ...read, controller.listFailedPayments);
paymentsRouter.post('/:id/retry', ...write, controller.retryPayment);