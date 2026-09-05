import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  is_primary: z.boolean().optional(),
});

export const createCustomerSchema = z
  .object({
    name: z.string().min(1).max(200),
    tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
    default_price_list_id: z.string().uuid().optional().nullable(),
    owner_id: z.string().uuid().optional().nullable(),
    status: z.string().max(40).optional(),
    contacts: z.array(contactSchema).optional().default([]),
    billing_address: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateCustomerSchema = createCustomerSchema.partial().strict();

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;