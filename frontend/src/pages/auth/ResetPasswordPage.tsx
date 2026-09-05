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
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'

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
        setSubmitError("We couldn't reset your password. Please try again.")
      }
    }
  }

  if (status === 'invalid') {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle">
              <KeyRound className="h-6 w-6 text-danger" />
            </div>
            <h1 className="text-h2 font-semibold text-foreground">Invalid link</h1>
            <p className="mt-2 text-body-small text-muted-foreground">
              That password reset link is invalid.
            </p>
          </div>
          <AuthCard>
            <div className="space-y-4">
              <Link to="/forgot-password">
                <Button className="w-full" size="lg">
                  Request a new reset link
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" className="w-full" size="lg">
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          </AuthCard>
        </div>
      </AuthLayout>
    )
  }

  if (status === 'expired') {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning-subtle">
              <KeyRound className="h-6 w-6 text-warning" />
            </div>
            <h1 className="text-h2 font-semibold text-foreground">Link expired</h1>
            <p className="mt-2 text-body-small text-muted-foreground">
              That password reset link has expired.
            </p>
          </div>
          <AuthCard>
            <div className="space-y-4">
              <Link to="/forgot-password">
                <Button className="w-full" size="lg">
                  Request a new reset link
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" className="w-full" size="lg">
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          </AuthCard>
        </div>
      </AuthLayout>
    )
  }

  if (status === 'success') {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <h1 className="text-h2 font-semibold text-foreground">Password updated</h1>
            <p className="mt-2 text-body-small text-muted-foreground">
              Your password has been updated successfully.
            </p>
          </div>
          <AuthCard>
            <Link to="/login">
              <Button className="w-full" size="lg">
                Continue to sign in
              </Button>
            </Link>
          </AuthCard>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-h2 font-semibold text-foreground">Set new password</h1>
          <p className="mt-2 text-body-small text-muted-foreground">
            Choose a strong password for your account.
          </p>
        </div>

        <AuthCard>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {submitError && <AuthAlert type="error" message={submitError} />}

            <PasswordField
              label="New password"
              placeholder="Enter new password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <PasswordStrength password={passwordValue || ''} />

            <PasswordField
              label="Confirm password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Reset password'}
            </Button>
          </form>
        </AuthCard>

        <p className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-small font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
