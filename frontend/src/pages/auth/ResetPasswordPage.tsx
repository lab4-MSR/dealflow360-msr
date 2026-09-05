import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authService } from '@/services/auth'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthAlert } from '@/components/auth/AuthAlert'
import { PasswordField } from '@/components/auth/PasswordField'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { Button } from '@/components/ui/button'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/schemas'
import { ArrowLeft, CheckCircle2, KeyRound, Clock, XCircle, Sparkles } from 'lucide-react'

type ResetStatus = 'idle' | 'invalid' | 'expired' | 'success'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<ResetStatus>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
    }
  }, [token])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const passwordValue = watch('password')

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return
    setSubmitError(null)
    try {
      await authService.resetPassword({ token, new_password: data.password })
      setStatus('success')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { code?: string } } } }
      const code = axiosErr?.response?.data?.error?.code
      if (code === 'TOKEN_EXPIRED') {
        setStatus('expired')
      } else if (code === 'INVALID_TOKEN') {
        setStatus('invalid')
      } else {
        setSubmitError("We couldn't reset your password. Please verify the link or try requesting a new one.")
      }
    }
  }

  if (status === 'invalid') {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-danger-subtle border border-danger/20 text-danger shadow-xl shadow-danger/10">
              <XCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Invalid or used link
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                This password reset link is invalid, malformed, or has already been used.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button asChild className="w-full font-semibold shadow-xs" size="lg">
                <Link to="/forgot-password">
                  Request a new reset link
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full font-semibold" size="lg">
                <Link to="/login" className="flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to sign in</span>
                </Link>
              </Button>
            </div>
          </div>
        </AuthCard>
      </AuthLayout>
    )
  }

  if (status === 'expired') {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-warning-subtle border border-warning/20 text-warning shadow-xl shadow-warning/10">
              <Clock className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Reset link expired
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                Password reset links expire after 15 minutes for your security. Please request a fresh reset link.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button asChild className="w-full font-semibold shadow-xs" size="lg">
                <Link to="/forgot-password">
                  Request fresh reset link
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full font-semibold" size="lg">
                <Link to="/login" className="flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to sign in</span>
                </Link>
              </Button>
            </div>
          </div>
        </AuthCard>
      </AuthLayout>
    )
  }

  if (status === 'success') {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-success-subtle border border-success/20 text-success shadow-xl shadow-success/10">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Password updated
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                Your password has been updated successfully. You can now sign in with your new credentials.
              </p>
            </div>

            <Button asChild className="w-full font-semibold shadow-xs" size="lg">
              <Link to="/login">
                Continue to sign in
              </Link>
            </Button>
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
              <span>Credential Setup</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Set new password
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
              Choose a strong, unique password for your DealFlow360 account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {submitError && <AuthAlert type="error" message={submitError} />}

            <div className="space-y-2">
              <PasswordField
                label="New password"
                placeholder="Enter new strong password"
                autoComplete="new-password"
                className="h-12 rounded-2xl text-sm"
                error={errors.password?.message}
                {...register('password')}
              />
              <PasswordStrength password={passwordValue || ''} />
            </div>

            <PasswordField
              label="Confirm new password"
              placeholder="Confirm your new password"
              autoComplete="new-password"
              className="h-12 rounded-2xl text-sm"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              className="w-full font-semibold shadow-xs"
              size="lg"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Updating credentials...' : 'Reset password & Sign in'}
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
