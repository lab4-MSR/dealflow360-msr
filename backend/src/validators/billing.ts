import { z } from 'zod';

const jsonObject = z.record(z.string(), z.unknown());

export const subscriptionPlanSchema = z.object({
  name: z.string().min(1).max(160),
  type: z.string().max(40).optional().nullable(),
  price: z.number().min(0).optional(),
  currency: z.literal('INR').optional(),
  billing_cycle: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual']).optional(),
  features: z.array(z.unknown()).optional(),
  usage_limits: jsonObject.optional(),
  included_products: z.array(z.unknown()).optional(),
  trial_config: jsonObject.optional(),
  proration: jsonObject.optional(),
  cancellation_policy: jsonObject.optional(),
  refund_policy: jsonObject.optional(),
}).strict();

export const updateSubscriptionPlanSchema = subscriptionPlanSchema.partial();

export const billingCycleSchema = z.object({
  cycle: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual']),
  duration_days: z.number().int().positive().optional().nullable(),
  billing_date: z.number().int().min(1).max(31).optional().nullable(),
  renewal_behavior: z.string().max(80).optional().nullable(),
  auto_renewal: z.boolean().optional(),
  grace_period_days: z.number().int().min(0).optional(),
  failed_payment_behavior: z.string().max(80).optional().nullable(),
}).strict();

export const prorationRuleSchema = z.object({
  upgrade_behavior: z.string().max(80).optional().nullable(),
  downgrade_behavior: z.string().max(80).optional().nullable(),
  cancellation_rule: z.enum(['immediate', 'end_of_period']).optional(),
  notice_period_days: z.number().int().min(0).optional(),
  refund_rule: z.enum(['full', 'partial', 'none']).optional(),
  refund_basis: z.string().max(80).optional().nullable(),
}).strict();

export const prorationTestSchema = z.object({
  current_plan_id: z.string().uuid(),
  new_plan_id: z.string().uuid(),
  change_date: z.string(),
}).strict();

export const changePlanSchema = z.object({
  new_plan_id: z.string().uuid(),
  quantity: z.number().positive().optional(),
}).strict();

export const cancelSubscriptionSchema = z.object({
  effective: z.enum(['immediate', 'end_of_period']),
  reason: z.string().min(1).max(500),
}).strict();

export const paymentSchema = z.object({
  invoice_id: z.string().uuid().optional().nullable(),
  customer_id: z.string().uuid().optional().nullable(),
  amount: z.number().positive(),
  method: z.string().max(40).optional().nullable(),
  reference: z.string().max(160).optional().nullable(),
}).strict();

export const creditNoteSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(1).max(500),
}).strict();
