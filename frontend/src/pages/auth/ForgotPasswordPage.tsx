import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authService } from '@/services/auth'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthAlert } from '@/components/auth/AuthAlert'
import { Button } from '@/components/ui/button'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/schemas'
import { ArrowLeft, Mail, KeyRound, CheckCircle2, RefreshCw, Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setSubmitError(null)
    try {
      await authService.forgotPassword({ email: data.email })
      setSubmittedEmail(data.email)
      setIsSuccess(true)
    } catch {
      setSubmitError("We couldn't process your request. Please verify the email address and try again.")
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setSubmitError(null)
    try {
      await authService.forgotPassword({ email: submittedEmail })
      setResendCooldown(60)
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch {
      setSubmitError("We couldn't resend the link. Please try again in a few moments.")
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-500/10 border border-sky-500/20 text-sky-500 shadow-xl shadow-sky-500/10">
              <Mail className="h-10 w-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Check your work email
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                We sent password reset instructions to{' '}
                <span className="font-semibold text-foreground px-2 py-0.5 rounded-lg bg-surface-muted border border-border">
                  {submittedEmail}
                </span>
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {submitError && <AuthAlert type="error" message={submitError} />}

              <div className="rounded-2xl bg-surface-muted/60 p-4 border border-border/70 text-xs text-muted-foreground text-left">
                <p className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Security Notice
                </p>
                <p>
                  Reset links remain valid for 15 minutes. If you don&apos;t see the email, please check your spam folder.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 rounded-2xl cursor-pointer text-sm font-semibold"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                >
                  <RefreshCw className={cn('h-4 w-4 mr-2', resendCooldown > 0 && 'animate-spin')} />
                  {resendCooldown > 0 ? `Resend link in ${resendCooldown}s` : 'Resend reset instructions'}
                </Button>

                <Button asChild variant="secondary" className="w-full h-12 rounded-2xl text-sm font-semibold" size="lg">
                  <Link to="/login" className="flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Return to sign in</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-7">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Password Recovery</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Reset your password
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
              Enter your work email address and we&apos;ll send you a secure link to reset your credentials
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {submitError && <AuthAlert type="error" message={submitError} />}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground block">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="name@company.com"
                  className={cn(
                    'flex h-12 w-full rounded-2xl border bg-surface/90 pl-11 pr-4 text-sm text-foreground shadow-xs transition-all duration-200',
                    'placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary',
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

            <Button
              type="submit"
              className="w-full font-semibold shadow-xs"
              size="lg"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? (
                'Processing Request...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Send Reset Instructions</span>
                  <Send className="h-5 w-5" />
                </span>
              )}
            </Button>
          </form>

          <div className="pt-2 text-center border-t border-border/60">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
