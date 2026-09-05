import { z } from 'zod';

export const inviteUserSchema = z
  .object({
    full_name: z.string().min(1).max(200),
    email: z.string().email(),
    role: z.string().min(1).max(40),
    team_id: z.string().uuid().optional().nullable(),
  })
  .strict();

export const updateUserSchema = z
  .object({
    role: z.string().min(1).max(40).optional(),
    status: z.enum(['invited', 'active', 'suspended']).optional(),
    team_id: z.string().uuid().optional().nullable(),
    phone: z.string().max(40).optional().nullable(),
    job_title: z.string().max(120).optional().nullable(),
    full_name: z.string().max(200).optional(),
  })
  .strict();