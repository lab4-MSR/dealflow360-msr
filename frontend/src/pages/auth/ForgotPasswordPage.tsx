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
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState('')

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
      setSubmitError("We couldn't process your request. Please try again.")
    }
  }

  const handleResend = async () => {
    setSubmitError(null)
    try {
      await authService.forgotPassword({ email: submittedEmail })
    } catch {
      setSubmitError("We couldn't resend the link. Please try again.")
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle">
              <Mail className="h-6 w-6 text-success" />
            </div>
            <h1 className="text-h2 font-semibold text-foreground">Check your email</h1>
            <p className="mt-2 text-body-small text-muted-foreground">
              If an account exists for{' '}
              <span className="font-medium text-foreground">{submittedEmail}</span>,
              you&apos;ll receive a password reset link shortly.
            </p>
          </div>

          <AuthCard>
            <div className="space-y-4">
              {submitError && <AuthAlert type="error" message={submitError} />}

              <p className="text-small text-muted-foreground text-center">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isSubmitting}
                  className="font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  try again
                </button>
                .
              </p>

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

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-h2 font-semibold text-foreground">Reset your password</h1>
          <p className="mt-2 text-body-small text-muted-foreground">
            Enter the email associated with your DealFlow360 account and we&apos;ll
            send instructions to reset your password.
          </p>
        </div>

        <AuthCard>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {submitError && <AuthAlert type="error" message={submitError} />}

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

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
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
