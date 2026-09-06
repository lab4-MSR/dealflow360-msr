import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env, assertEnv } from './config/env';
import { rateLimit, bulkRateLimit } from './middleware/rateLimit';
import { notFound, errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { orgRouter, usersRouter, teamsRouter, rolesRouter } from './routes/org';
import { customersRouter } from './routes/customer';
import {
  productsRouter, categoriesRouter, priceListsRouter, customerPricingRouter, volumePricingRouter, pricingRouter,
  pricingHistoryRouter,
} from './routes/product';
import {
  discountRulesRouter, customerTiersRouter, discountSimulatorRouter,
  approvalRulesRouter, approvalChainsRouter, approvalThresholdsRouter, approvalSimulatorRouter,
} from './routes/discount';
import { dealsRouter, quotationsRouter, approvalsRouter } from './routes/deal';
import { backordersRouter, fulfillmentRouter, shippingRulesRouter, shipmentsRouter, warehousesRouter } from './routes/fulfillment';
import { billingCyclesRouter, invoicesRouter, paymentsRouter, prorationRulesRouter, subscriptionPlansRouter, subscriptionsRouter } from './routes/billing';
import { auditRouter, dealHealthRouter, insightsRouter, riskRouter, recommendationsRouter } from './routes/intelligence';
import { meRouter, notificationsRouter, searchRouter } from './routes/shared';
import { portalRouter } from './routes/portal';
import { analyticsRouter } from './routes/analytics';
import { platformRouter } from './routes/platform';

/**
 * Build the Express application (kept separate from server for testability).
 */
export function createApp(): Application {
  assertEnv();

  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Rate limiter (120 requests/min per user by default)
  app.use(rateLimit());
  app.use(bulkRateLimit());

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // API v1
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/org', orgRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/teams', teamsRouter);
  app.use('/api/v1/roles', rolesRouter);
  app.use('/api/v1/customers', customersRouter);
  app.use('/api/v1/products', productsRouter);
  app.use('/api/v1/categories', categoriesRouter);
  app.use('/api/v1/price-lists', priceListsRouter);
  app.use('/api/v1/customer-pricing', customerPricingRouter);
  app.use('/api/v1/volume-pricing', volumePricingRouter);
  app.use('/api/v1/pricing', pricingRouter);
  app.use('/api/v1/pricing-history', pricingHistoryRouter);
  app.use('/api/v1/discount-rules', discountRulesRouter);
  app.use('/api/v1/customer-tiers', customerTiersRouter);
  app.use('/api/v1/discount-simulator', discountSimulatorRouter);
  app.use('/api/v1/approval-rules', approvalRulesRouter);
  app.use('/api/v1/approval-chains', approvalChainsRouter);
  app.use('/api/v1/approval-thresholds', approvalThresholdsRouter);
  app.use('/api/v1/approval-simulator', approvalSimulatorRouter);
  app.use('/api/v1/deals', dealsRouter);
  app.use('/api/v1/quotations', quotationsRouter);
  app.use('/api/v1/approvals', approvalsRouter);
  app.use('/api/v1/warehouses', warehousesRouter);
  app.use('/api/v1/shipping-rules', shippingRulesRouter);
  app.use('/api/v1/fulfillment', fulfillmentRouter);
  app.use('/api/v1/shipments', shipmentsRouter);
  app.use('/api/v1/backorders', backordersRouter);
  app.use('/api/v1/subscription-plans', subscriptionPlansRouter);
  app.use('/api/v1/billing-cycles', billingCyclesRouter);
  app.use('/api/v1/proration-rules', prorationRulesRouter);
  app.use('/api/v1/subscriptions', subscriptionsRouter);
  app.use('/api/v1/invoices', invoicesRouter);
  app.use('/api/v1/payments', paymentsRouter);
  app.use('/api/v1/audit', auditRouter);
  app.use('/api/v1/deal-health', dealHealthRouter);
  app.use('/api/v1/insights', insightsRouter);
  app.use('/api/v1/risk', riskRouter);
  app.use('/api/v1/recommendations', recommendationsRouter);
  app.use('/api/v1/notifications', notificationsRouter);
  app.use('/api/v1/me', meRouter);
  app.use('/api/v1/search', searchRouter);
  app.use('/api/v1/portal', portalRouter);
  app.use('/api/v1/analytics', analyticsRouter);
  app.use('/api/v1/platform', platformRouter);

  // 404 + error handling LAST
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
