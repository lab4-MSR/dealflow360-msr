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

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Please enter your full name.')
      .min(2, 'Name must be at least 2 characters.'),
    email: z
      .string()
      .min(1, 'Please enter your work email.')
      .email('Please enter a valid email address.'),
    businessName: z
      .string()
      .min(1, 'Please enter your organization or company name.')
      .min(2, 'Company name must be at least 2 characters.'),
    password: z
      .string()
      .min(1, 'Please create a password.')
      .min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password.'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service and Privacy Policy.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type SignupFormData = z.infer<typeof signupSchema>
