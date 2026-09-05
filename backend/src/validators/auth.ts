import { z } from 'zod';

export const signupSchema = z
  .object({
    full_name: z.string().min(1).max(200),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    business_name: z.string().min(1).max(200),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1).max(128),
  })
  .strict();

export const portalLoginSchema = z
  .object({
    email: z.string().email().optional(),
    password: z.string().min(1).optional(),
    magic_link_token: z.string().optional(),
  })
  .strict()
  .refine((v) => v.magic_link_token || (v.email && v.password), {
    message: 'Provide (email + password) OR a magic_link_token.',
  });

export const logoutSchema = z
  .object({ refresh_token: z.string().optional() })
  .strict();

export const forgotPasswordSchema = z.object({ email: z.string().email() }).strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    email: z.string().email().optional(),
    new_password: z.string().min(8).max(128),
  })
  .strict();

export const verifyEmailSchema = z
  .object({
    token: z.string().min(1),
    email: z.string().email().optional(),
  })
  .strict();

export const acceptInvitationSchema = z
  .object({
    full_name: z.string().min(1).max(200),
    password: z.string().min(8).max(128),
  })
  .strict();

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PortalLoginInput = z.infer<typeof portalLoginSchema>;