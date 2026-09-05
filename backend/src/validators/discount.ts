import { z } from 'zod';

export const createDiscountRuleSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['customer_tier','category','product','margin','global']),
  priority: z.number().int().optional(),
  scope: z.record(z.string(), z.unknown()).optional(),
  max_discount_percent: z.number().min(0).max(100).optional().nullable(),
  min_margin_percent: z.number().min(0).max(100).optional().nullable(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  approval_required: z.boolean().optional(),
  approval_level: z.enum(['none','sales_manager','finance','sales_manager_then_finance']).optional(),
}).strict();
export const updateDiscountRuleSchema = createDiscountRuleSchema.partial().strict();

export const customerTiersSchema = z.object({
  bronze: z.object({ max_discount_percent: z.number().optional(), min_margin_percent: z.number().optional(), default_price_list_id: z.string().uuid().optional().nullable(), approval_required: z.boolean().optional(), approval_level: z.string().optional() }).optional(),
  silver: z.object({ max_discount_percent: z.number().min(0).max(100).optional(), min_margin_percent: z.number().min(0).max(100).optional(), default_price_list_id: z.string().uuid().optional().nullable(), approval_required: z.boolean().optional(), approval_level: z.string().optional() }).optional(),
  gold: z.object({ max_discount_percent: z.number().min(0).max(100).optional(), min_margin_percent: z.number().min(0).max(100).optional(), default_price_list_id: z.string().uuid().optional().nullable(), approval_required: z.boolean().optional(), approval_level: z.string().optional() }).optional(),
  platinum: z.object({ max_discount_percent: z.number().min(0).max(100).optional(), min_margin_percent: z.number().min(0).max(100).optional(), default_price_list_id: z.string().uuid().optional().nullable(), approval_required: z.boolean().optional(), approval_level: z.string().optional() }).optional(),
}).strict();

export const discountSimulatorSchema = z.object({
  customer_id: z.string().uuid().optional(),
  lines: z.array(z.object({ product_id: z.string().uuid(), quantity: z.number().min(1), unit_price: z.number().min(0), discount_percent: z.number().min(0).max(100).optional() })),
}).strict();

export const createApprovalRuleSchema = z.object({ name: z.string().min(1), trigger_type: z.string().min(1), trigger_config: z.record(z.string(), z.unknown()).optional(), chain_id: z.string().uuid().optional().nullable() }).strict();
export const updateApprovalRuleSchema = createApprovalRuleSchema.partial().strict();

export const approvalStepSchema = z.object({ order_index: z.number().int(), approver_role: z.string().min(1), mode: z.enum(['sequential','parallel','conditional']).optional(), sla_hours: z.number().int().optional(), escalation: z.record(z.string(), z.unknown()).optional(), condition: z.record(z.string(), z.unknown()).optional() });
export const createApprovalChainSchema = z.object({ name: z.string().min(1), steps: z.array(approvalStepSchema) }).strict();
export const updateApprovalChainSchema = z.object({ name: z.string().min(1).optional(), steps: z.array(approvalStepSchema).optional() }).strict();

export const approvalThresholdsSchema = z.object({ metric: z.string().min(1), bands: z.array(z.object({ band_min: z.number().optional().nullable(), band_max: z.number().optional().nullable(), approver_role: z.string().optional(), chain_id: z.string().uuid().optional().nullable() })) }).strict();

export const approvalSimulatorSchema = z.object({ customer_id: z.string().uuid().optional(), deal_value: z.number().min(0), products: z.array(z.object({ product_id: z.string().uuid(), quantity: z.number().min(1) })), discount_percent: z.number().min(0).max(100).optional(), margin_percent: z.number().optional(), risk_score: z.number().int().optional() }).strict();