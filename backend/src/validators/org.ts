import { z } from 'zod';

export const profileSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    legal_name: z.string().max(300).optional().nullable(),
    industry: z.string().max(120).optional().nullable(),
    address: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const brandingSchema = z
  .object({
    logo_url: z.string().url().optional().nullable(),
    primary_color: z.string().max(20).optional().nullable(),
    favicon_url: z.string().url().optional().nullable(),
  })
  .strict();

export const localizationSchema = z
  .object({
    language: z.string().min(2).max(10).optional(),
    timezone: z.string().max(64).optional(),
    date_format: z.string().max(32).optional(),
  })
  .strict();

export const currencyTaxSchema = z
  .object({
    currency: z.literal('INR').optional(),
    tax_config: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const settingsSchema = z.object({ settings: z.record(z.string(), z.unknown()).optional() }).strict();

export const createTeamSchema = z
  .object({ name: z.string().min(1).max(200), description: z.string().max(500).optional().nullable() })
  .strict();

export const updateTeamSchema = createTeamSchema.partial();

export const createRoleSchema = z
  .object({
    name: z.string().min(1).max(120),
    permissions: z.array(z.string()).optional(),
  })
  .strict();

export const updateRolePermissionsSchema = z.object({ permissions: z.array(z.string()) }).strict();
