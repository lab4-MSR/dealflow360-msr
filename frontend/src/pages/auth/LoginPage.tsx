import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/providers/AuthProvider'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthAlert } from '@/components/auth/AuthAlert'
import { PasswordField } from '@/components/auth/PasswordField'
import { Button } from '@/components/ui/button'
import { loginSchema, type LoginFormData } from '@/lib/schemas'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, clearError } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const returnTo = searchParams.get('returnTo') || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null)
    clearError()
    try {
      await login(data.email, data.password)
      navigate(returnTo, { replace: true })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: { code?: string; message?: string } } } }
      const status = axiosErr?.response?.status
      const code = axiosErr?.response?.data?.error?.code

      if (status === 429) {
        setSubmitError('Too many attempts. Please wait a moment and try again.')
      } else if (code === 'EMAIL_NOT_VERIFIED') {
        setSubmitError('Please verify your email address before signing in.')
      } else if (code === 'ACCOUNT_DISABLED' || code === 'ACCOUNT_SUSPENDED') {
        setSubmitError('Your account is currently unavailable. Contact your administrator.')
      } else if (status === 401 || code === 'INVALID_CREDENTIALS') {
        setSubmitError('Email or password is incorrect.')
      } else {
        setSubmitError("We couldn't sign you in. Please try again.")
      }
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-h2 font-semibold text-foreground">Welcome back</h1>
          <p className="mt-2 text-body-small text-muted-foreground">
            Sign in to your DealFlow360 workspace
          </p>
        </div>

        <AuthCard>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {submitError && <AuthAlert type="error" message={submitError} />}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-label font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@company.com"
                className="flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-body-small text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 border-input focus:ring-primary"
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

            {/* Password */}
            <PasswordField
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Remember Me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input bg-surface text-primary focus:ring-primary focus:ring-offset-0"
                  {...register('rememberMe')}
                />
                <span className="text-small text-muted-foreground">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-small font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </AuthCard>

        {/* Sign up link */}
        <p className="text-center text-small text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            to="/"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Get started
          </Link>
        </p>

        {/* Demo credentials */}
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-2">
          <p className="text-caption font-medium text-muted-foreground text-center">Demo Credentials</p>
          <div className="space-y-1 text-caption text-muted-foreground">
            <p className="flex justify-between"><span className="font-medium">Super Admin:</span> <span className="font-mono">admin@dealflow360.com</span></p>
            <p className="flex justify-between"><span className="font-medium">Business Admin:</span> <span className="font-mono">admin@acme.com</span></p>
            <p className="flex justify-between"><span className="font-medium">Password:</span> <span className="font-mono">admin123</span></p>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
