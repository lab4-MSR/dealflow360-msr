import { z } from 'zod';

export const productVariantSchema = z.object({
  attribute: z.string().min(1),
  values: z.array(z.string()),
  extra_price: z.number().optional(),
});

export const createProductSchema = z
  .object({
    name: z.string().min(1).max(200),
    sku: z.string().max(80).optional().nullable(),
    category_id: z.string().uuid().optional().nullable(),
    price: z.number().min(0),
    currency: z.string().length(3).optional(),
    unit: z.string().max(40).optional().nullable(),
    tax_percent: z.number().min(0).max(100).optional(),
    description: z.string().max(2000).optional().nullable(),
    image_url: z.string().url().optional().nullable(),
    status: z.string().max(40).optional(),
    variants: z.array(productVariantSchema).optional(),
  })
  .strict();

export const updateProductSchema = createProductSchema.partial().strict();

export const createCategorySchema = z.object({ name: z.string().min(1), parent_id: z.string().uuid().optional().nullable() }).strict();
export const updateCategorySchema = z.object({ name: z.string().min(1).optional(), parent_id: z.string().uuid().optional().nullable() }).strict();

export const createPriceListSchema = z.object({ name: z.string().min(1), currency: z.string().length(3).optional(), tier_scope: z.enum(['bronze','silver','gold','platinum']).optional().nullable() }).strict();
export const updatePriceListSchema = createPriceListSchema.partial().strict();
export const priceListItemSchema = z.object({ items: z.array(z.object({ product_id: z.string().uuid(), unit_price: z.number().min(0) })) }).strict();

export const createCustomerPricingSchema = z.object({ customer_id: z.string().uuid(), product_id: z.string().uuid(), unit_price: z.number().min(0) }).strict();
export const createVolumePricingSchema = z.object({ product_id: z.string().uuid(), min_qty: z.number().int().min(1), price: z.number().min(0) }).strict();