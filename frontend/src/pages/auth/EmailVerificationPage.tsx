import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authService } from '@/services/auth'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthAlert } from '@/components/auth/AuthAlert'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react'

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'invalid' | 'expired' | 'failed'

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<VerificationStatus>(token ? 'verifying' : 'idle')
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (!token) return

    let cancelled = false
    async function verify() {
      try {
        await authService.verifyEmail({ token: token! })
        if (!cancelled) setStatus('success')
      } catch (err: unknown) {
        if (cancelled) return
        const axiosErr = err as { response?: { data?: { error?: { code?: string } } } }
        const code = axiosErr?.response?.data?.error?.code
        if (code === 'TOKEN_EXPIRED') setStatus('expired')
        else if (code === 'INVALID_TOKEN') setStatus('invalid')
        else setStatus('failed')
      }
    }
    verify()
    return () => { cancelled = true }
  }, [token])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleResend = async () => {
    setError(null)
    try {
      await authService.resendVerification()
      setResendCooldown(60)
    } catch {
      setError("We couldn't resend the verification email. Please try again.")
    }
  }

  if (status === 'verifying') {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle">
              <RefreshCw className="h-6 w-6 text-primary animate-spin" />
            </div>
            <h1 className="text-h2 font-semibold text-foreground">Verifying your email</h1>
            <p className="mt-2 text-body-small text-muted-foreground">
              Please wait while we verify your email address...
            </p>
          </div>
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
            <h1 className="text-h2 font-semibold text-foreground">Email verified</h1>
            <p className="mt-2 text-body-small text-muted-foreground">
              Your email has been verified successfully.
            </p>
          </div>
          <AuthCard>
            <Button asChild className="w-full" size="lg">
              <Link to="/login">
                Continue to sign in
              </Link>
            </Button>
          </AuthCard>
        </div>
      </AuthLayout>
    )
  }

  if (status === 'invalid') {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle">
              <XCircle className="h-6 w-6 text-danger" />
            </div>
            <h1 className="text-h2 font-semibold text-foreground">Invalid link</h1>
            <p className="mt-2 text-body-small text-muted-foreground">
              This verification link is invalid.
            </p>
          </div>
          <AuthCard>
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/login">
                  Go to sign in
                </Link>
              </Button>
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
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <h1 className="text-h2 font-semibold text-foreground">Link expired</h1>
            <p className="mt-2 text-body-small text-muted-foreground">
              This verification link has expired.
            </p>
          </div>
          <AuthCard>
            <div className="space-y-3">
              {error && <AuthAlert type="error" message={error} />}
              <Button
                className="w-full"
                size="lg"
                onClick={handleResend}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend verification email'}
              </Button>
              <Button asChild variant="secondary" className="w-full" size="lg">
                <Link to="/login">
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </Button>
            </div>
          </AuthCard>
        </div>
      </AuthLayout>
    )
  }

  if (status === 'failed') {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle">
              <XCircle className="h-6 w-6 text-danger" />
            </div>
            <h1 className="text-h2 font-semibold text-foreground">Verification failed</h1>
            <p className="mt-2 text-body-small text-muted-foreground">
              We couldn&apos;t verify your email. Please try again.
            </p>
          </div>
          <AuthCard>
            <div className="space-y-3">
              {error && <AuthAlert type="error" message={error} />}
              <Button
                className="w-full"
                size="lg"
                onClick={handleResend}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend verification email'}
              </Button>
              <Button asChild variant="secondary" className="w-full" size="lg">
                <Link to="/login">
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </Button>
            </div>
          </AuthCard>
        </div>
      </AuthLayout>
    )
  }

  // idle — no token provided, show check-email state
  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-h2 font-semibold text-foreground">Check your email</h1>
          <p className="mt-2 text-body-small text-muted-foreground">
            We&apos;ve sent a verification link to your email address. Click the link to
            verify your account.
          </p>
        </div>
        <AuthCard>
          <div className="space-y-3">
            {error && <AuthAlert type="error" message={error} />}
            <Button
              className="w-full"
              size="lg"
              onClick={handleResend}
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend verification email'}
            </Button>
            <Button asChild variant="secondary" className="w-full" size="lg">
              <Link to="/login">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </Button>
          </div>
        </AuthCard>
      </div>
    </AuthLayout>
  )
}
