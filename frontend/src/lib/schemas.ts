import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address.')
    .email('Please enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Please enter your password.'),
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address.')
    .email('Please enter a valid email address.'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Please enter a new password.')
      .min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const acceptInvitationSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Please enter your full name.')
      .min(2, 'Name must be at least 2 characters.'),
    password: z
      .string()
      .min(1, 'Please create a password.')
      .min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>
