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

import { DEMO_USERS } from '@/services/auth'
import { ROLE_DASHBOARD_MAP } from '@/types/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, clearError, getDashboardPath } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const rawReturnTo = searchParams.get('returnTo')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const handleQuickLogin = async (email: string, pass: string) => {
    setValue('email', email)
    setValue('password', pass)
    setSubmitError(null)
    clearError()
    try {
      await login(email, pass)
      const demoAccount = DEMO_USERS[email]
      const target = rawReturnTo || (demoAccount ? ROLE_DASHBOARD_MAP[demoAccount.user.role] : getDashboardPath())
      navigate(target, { replace: true })
    } catch {
      setSubmitError('Failed to sign in with demo account.')
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null)
    clearError()
    try {
      await login(data.email, data.password)
      const target = rawReturnTo && rawReturnTo !== '/dashboard' ? rawReturnTo : getDashboardPath()
      navigate(target, { replace: true })
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
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold shadow-md shadow-sky-500/20"
              size="lg"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </AuthCard>

        {/* Sign up & Company registration link */}
        <div className="text-center space-y-1.5 text-small text-muted-foreground">
          <p>
            Need an enterprise workspace?{' '}
            <Link
              to="/register-company"
              className="font-semibold text-primary hover:text-primary-hover transition-colors underline-offset-4 hover:underline"
            >
              Register your company
            </Link>
          </p>
          <div className="flex items-center justify-center gap-3 text-caption text-muted-foreground/80">
            <Link to="/" className="hover:text-foreground transition-colors">
              ← Back to Homepage
            </Link>
            <span>·</span>
            <Link to="/signup" className="hover:text-foreground transition-colors">
              Direct Sign Up
            </Link>
          </div>
        </div>

        {/* Demo credentials switcher */}
        <div className="rounded-xl border border-border bg-surface-muted/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-caption font-semibold text-foreground">Select Demo Role (1-Click Login)</p>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">pass: admin123</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(DEMO_USERS).map(([email, demo]) => (
              <button
                key={email}
                type="button"
                onClick={() => handleQuickLogin(email, demo.password)}
                className="flex flex-col text-left p-2.5 rounded-lg border border-border/80 bg-surface hover:border-primary/60 hover:bg-surface-muted transition-all text-xs group cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{demo.label}</span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{demo.user.role.replace('_', ' ')}</span>
                </div>
                <span className="text-[11px] text-muted-foreground truncate mt-0.5">{email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
