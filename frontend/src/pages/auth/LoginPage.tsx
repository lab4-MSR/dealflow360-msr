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
import {
  Mail,
  ArrowRight,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, clearError, getDashboardPath } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showDemoOptions, setShowDemoOptions] = useState(false)
  const [activeDemoEmail, setActiveDemoEmail] = useState<string | null>(null)

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
    setActiveDemoEmail(email)
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
      setSubmitError('Failed to sign in with demo account. Please try again.')
    } finally {
      setActiveDemoEmail(null)
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
        setSubmitError('Invalid email or password. Please verify your credentials.')
      } else {
        setSubmitError("We couldn't sign you in. Please verify your connection and try again.")
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
              <span>Workspace Authentication</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-xs sm:text-small text-muted-foreground max-w-xs mx-auto">
              Sign in to manage your deals, pricing approvals, and CPQ quotes
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            {submitError && <AuthAlert type="error" message={submitError} />}

            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-medium text-foreground block">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="name@company.com"
                  className={cn(
                    'flex h-10 w-full rounded-xl border bg-surface/90 pl-10 pr-3.5 text-xs sm:text-small text-foreground shadow-xs transition-all duration-200',
                    'placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.email
                      ? 'border-danger focus:ring-danger/20 focus:border-danger'
                      : 'border-input focus:ring-primary/20'
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

            {/* Password Field */}
            <div className="space-y-1">
              <PasswordField
                label="Password"
                placeholder="Enter your password"
                autoComplete="current-password"
                className="h-10 rounded-xl text-xs sm:text-small"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-input bg-surface text-primary focus:ring-primary/20 cursor-pointer"
                  {...register('rememberMe')}
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  Remember this device
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-10.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs sm:text-small shadow-md shadow-sky-500/20 rounded-xl cursor-pointer transition-all duration-200"
              size="lg"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? (
                'Authenticating...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Sign in to Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Clean Integrated 1-Click Demo Persona Drawer */}
          <div className="pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowDemoOptions(!showDemoOptions)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>One-Click Demo Personas (Testing)</span>
              </span>
              {showDemoOptions ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {showDemoOptions && (
              <div className="grid grid-cols-2 gap-1.5 pt-2 animate-in fade-in duration-200">
                {Object.entries(DEMO_USERS).map(([email, demo]) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => handleQuickLogin(email, demo.password)}
                    disabled={isSubmitting || !!activeDemoEmail}
                    className="flex flex-col text-left p-2 rounded-lg border border-border/70 bg-surface-muted/60 hover:bg-secondary hover:border-primary/50 transition-all text-xs cursor-pointer group"
                  >
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-[11px] truncate">
                      {demo.label}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-mono truncate">
                      {demo.user.role.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer Prompt */}
          <div className="pt-2 text-center text-xs text-muted-foreground space-y-1.5 border-t border-border/60">
            <p>
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                className="font-bold text-primary hover:text-primary-hover underline underline-offset-4 transition-colors"
              >
                Create Workspace
              </Link>
            </p>
            <p className="text-[11px]">
              Enterprise tenant onboarding?{' '}
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
