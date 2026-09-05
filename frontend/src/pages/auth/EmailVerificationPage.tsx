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
        <AuthCard>
          <div className="text-center space-y-6 py-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-sky-500/10 border border-sky-500/20 text-sky-500 shadow-xl shadow-sky-500/10 relative">
              <span className="absolute inset-0 rounded-3xl animate-ping bg-sky-500/10 opacity-75" />
              <RefreshCw className="h-12 w-12 text-sky-500 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Verifying your email
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                Please wait a moment while we validate your security token and authorize workspace access...
              </p>
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
                Email verified successfully
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                Your email has been verified. You can now access your workspace and manage deals.
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
                Invalid verification link
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                This verification link is invalid, corrupted, or has already been used.
              </p>
            </div>

            <Button asChild className="w-full font-semibold shadow-xs" size="lg">
              <Link to="/login">
                Go to sign in
              </Link>
            </Button>
          </div>
        </AuthCard>
      </AuthLayout>
    )
  }

  if (status === 'expired' || status === 'failed') {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-warning-subtle border border-warning/20 text-warning shadow-xl shadow-warning/10">
              <Clock className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Verification link expired
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                This verification link has expired. You can easily request a new link below.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {error && <AuthAlert type="error" message={error} />}
              <Button
                className="w-full font-semibold shadow-xs"
                size="lg"
                onClick={handleResend}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : 'Resend verification email'}
              </Button>
              <Button asChild variant="secondary" className="w-full font-semibold" size="lg">
                <Link to="/login" className="flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Return to sign in</span>
                </Link>
              </Button>
            </div>
          </div>
        </AuthCard>
      </AuthLayout>
    )
  }

  // idle state
  return (
    <AuthLayout>
      <AuthCard>
        <div className="text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-xl shadow-primary/10">
            <Mail className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Check your work email
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
              We&apos;ve sent a verification link to your email address. Click the link to verify your workspace.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {error && <AuthAlert type="error" message={error} />}
            <Button
              className="w-full font-semibold shadow-xs"
              size="lg"
              onClick={handleResend}
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0
                ? `Resend available in ${resendCooldown}s`
                : 'Resend verification email'}
            </Button>
            <Button asChild variant="secondary" className="w-full font-semibold" size="lg">
              <Link to="/login" className="flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Return to sign in</span>
              </Link>
            </Button>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
