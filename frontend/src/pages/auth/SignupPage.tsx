import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/providers/AuthProvider'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthAlert } from '@/components/auth/AuthAlert'
import { PasswordField } from '@/components/auth/PasswordField'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { Button } from '@/components/ui/button'
import { signupSchema, type SignupFormData } from '@/lib/schemas'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup, clearError, getDashboardPath } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      businessName: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  })

  const passwordValue = watch('password')

  const onSubmit = async (data: SignupFormData) => {
    setSubmitError(null)
    clearError()
    try {
      await signup({
        full_name: data.fullName,
        email: data.email,
        password: data.password,
        business_name: data.businessName,
      })
      navigate(getDashboardPath(), { replace: true })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: { code?: string; message?: string } } } }
      const status = axiosErr?.response?.status
      const code = axiosErr?.response?.data?.error?.code
      const msg = axiosErr?.response?.data?.error?.message

      if (status === 409 || code === 'EMAIL_ALREADY_EXISTS') {
        setSubmitError('An account with this email address already exists. Please sign in instead.')
      } else if (msg) {
        setSubmitError(msg)
      } else {
        setSubmitError('Failed to create account. Please check your information and try again.')
      }
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-h2 font-semibold text-foreground">Create your workspace</h1>
          <p className="mt-2 text-body-small text-muted-foreground">
            Get started with enterprise deal governance and smart CPQ
          </p>
        </div>

        <AuthCard>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {submitError && <AuthAlert type="error" message={submitError} />}

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-label font-medium text-foreground">
                Full Name <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Sarah Jenkins"
                  className="flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-body-small text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 border-input"
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                  {...register('fullName')}
                />
              </div>
              {errors.fullName && (
                <p id="fullName-error" className="text-caption text-danger" role="alert">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Work Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-label font-medium text-foreground">
                Work Email <span className="text-danger">*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="s.jenkins@acmeglobal.com"
                className="flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-body-small text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 border-input"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p id="email-error" className="text-caption text-danger" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Company / Business Name */}
            <div className="space-y-1.5">
              <label htmlFor="businessName" className="text-label font-medium text-foreground">
                Company / Organization <span className="text-danger">*</span>
              </label>
              <input
                id="businessName"
                type="text"
                autoComplete="organization"
                placeholder="Acme Global Enterprises"
                className="flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-body-small text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 border-input"
                aria-invalid={!!errors.businessName}
                aria-describedby={errors.businessName ? 'businessName-error' : undefined}
                {...register('businessName')}
              />
              {errors.businessName && (
                <p id="businessName-error" className="text-caption text-danger" role="alert">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <PasswordField
                label="Password *"
                id="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                error={errors.password?.message}
                {...register('password')}
              />
              {passwordValue && <PasswordStrength password={passwordValue} />}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <PasswordField
                label="Confirm Password *"
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-1 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-input bg-surface text-primary focus:ring-primary focus:ring-offset-0"
                  {...register('agreeTerms')}
                />
                <span className="text-caption text-muted-foreground leading-snug">
                  I agree to DealFlow360&apos;s{' '}
                  <span className="text-foreground underline underline-offset-2">Terms of Service</span> and{' '}
                  <span className="text-foreground underline underline-offset-2">Privacy Policy</span>.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-caption text-danger" role="alert">
                  {errors.agreeTerms.message}
                </p>
              )}
            </div>

            {/* Submit CTA */}
            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Workspace...' : 'Create Workspace Account'}
            </Button>
          </form>
        </AuthCard>

        {/* Existing account prompt */}
        <p className="text-center text-small text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
