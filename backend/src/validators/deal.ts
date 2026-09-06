import { z } from 'zod';

export const createDealSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(200).optional(),
  customer_id: z.string().uuid().optional().nullable(),
  stage: z.string().max(40).optional(),
  value: z.number().min(0).optional(),
  deal_value: z.number().min(0).optional(),
  expected_close_date: z.string().optional().nullable(),
}).passthrough().refine(data => Boolean(data.name || data.title), {
  message: "Either 'name' or 'title' is required.",
  path: ['name'],
});

export const updateDealSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(200).optional(),
  stage: z.string().max(40).optional(),
  expected_close_date: z.string().optional().nullable(),
  status: z.string().max(40).optional(),
  value: z.number().min(0).optional(),
  deal_value: z.number().min(0).optional(),
  customer_id: z.string().uuid().optional().nullable(),
}).passthrough();

export const createQuotationSchema = z.object({
  customer_id: z.string().uuid(),
  deal_id: z.string().uuid().optional().nullable(),
  deal_name: z.string().max(200).optional(),
  reference: z.string().max(80).optional().nullable(),
  expected_close_date: z.string().optional().nullable(),
}).strict();
export const updateQuotationSchema = z.object({
  reference: z.string().max(80).optional().nullable(),
  expected_close_date: z.string().optional().nullable(),
  expiry_date: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  customer_notes: z.string().max(2000).optional().nullable(),
}).strict();

export const lineItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().min(1).default(1),
  unit_price: z.number().min(0).optional(),
  discount_percent: z.number().min(0).max(100).optional().default(0),
}).strict();
export const updateLineItemSchema = z.object({
  quantity: z.number().min(1).optional(),
  unit_price: z.number().min(0).optional(),
  discount_percent: z.number().min(0).max(100).optional(),
}).strict();

export const approvalActionSchema = z.object({ comment: z.string().max(1000).optional().nullable() }).strict();
export const approvalRejectSchema = z.object({ reason: z.string().min(1).max(1000) }).strict();

export const counterOfferSchema = z.object({ counter_discount_percent: z.number().min(0).max(100), comment: z.string().max(1000).optional().nullable() }).strict();