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
import {
  User,
  Mail,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
      <AuthCard>
        <div className="space-y-5">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
              <Sparkles className="h-3 w-3" />
              <span>Instant Workspace Setup</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Create your workspace
            </h1>
            <p className="text-xs sm:text-small text-muted-foreground max-w-xs mx-auto">
              Get started with enterprise deal governance and smart CPQ
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            {submitError && <AuthAlert type="error" message={submitError} />}

            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="fullName" className="text-xs font-medium text-foreground block">
                Full Name <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Sarah Jenkins"
                  className={cn(
                    'flex h-10 w-full rounded-xl border bg-surface/90 pl-10 pr-3.5 text-xs sm:text-small text-foreground shadow-xs transition-all duration-200',
                    'placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.fullName ? 'border-danger' : 'border-input focus:ring-primary/20'
                  )}
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
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-medium text-foreground block">
                Work Email Address <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="s.jenkins@company.com"
                  className={cn(
                    'flex h-10 w-full rounded-xl border bg-surface/90 pl-10 pr-3.5 text-xs sm:text-small text-foreground shadow-xs transition-all duration-200',
                    'placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.email ? 'border-danger' : 'border-input focus:ring-primary/20'
                  )}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-caption text-danger" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Company / Business Name */}
            <div className="space-y-1">
              <label htmlFor="businessName" className="text-xs font-medium text-foreground block">
                Company / Organization <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="businessName"
                  type="text"
                  autoComplete="organization"
                  placeholder="Acme Global Enterprises"
                  className={cn(
                    'flex h-10 w-full rounded-xl border bg-surface/90 pl-10 pr-3.5 text-xs sm:text-small text-foreground shadow-xs transition-all duration-200',
                    'placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.businessName ? 'border-danger' : 'border-input focus:ring-primary/20'
                  )}
                  aria-invalid={!!errors.businessName}
                  aria-describedby={errors.businessName ? 'businessName-error' : undefined}
                  {...register('businessName')}
                />
              </div>
              {errors.businessName && (
                <p id="businessName-error" className="text-caption text-danger" role="alert">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <PasswordField
                label="Workspace Password *"
                id="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="h-10 rounded-xl text-xs sm:text-small"
                error={errors.password?.message}
                {...register('password')}
              />
              {passwordValue && <PasswordStrength password={passwordValue} />}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <PasswordField
                label="Confirm Password *"
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm your password"
                className="h-10 rounded-xl text-xs sm:text-small"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-0.5 h-3.5 w-3.5 rounded border-input bg-surface text-primary focus:ring-primary/20 cursor-pointer"
                  {...register('agreeTerms')}
                />
                <span className="text-[11px] text-muted-foreground leading-snug">
                  I agree to DealFlow360&apos;s{' '}
                  <Link to="/help" className="text-foreground underline underline-offset-2 hover:text-primary font-medium">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link to="/help" className="text-foreground underline underline-offset-2 hover:text-primary font-medium">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-caption text-danger mt-0.5" role="alert">
                  {errors.agreeTerms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs sm:text-small shadow-md shadow-sky-500/20 rounded-xl cursor-pointer transition-all duration-200 mt-1"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Creating Workspace...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Create Workspace Account</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer Prompt */}
          <div className="pt-2 text-center text-xs text-muted-foreground space-y-1.5 border-t border-border/60">
            <p>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-primary hover:text-primary-hover underline underline-offset-4 transition-colors"
              >
                Sign in
              </Link>
            </p>
            <p className="text-[11px]">
              Organization tenant onboarding?{' '}
              <Link
                to="/register-company"
                className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-2"
              >
                Register Company
              </Link>
            </p>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
