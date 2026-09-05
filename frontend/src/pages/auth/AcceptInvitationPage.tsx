import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authService } from '@/services/auth'
import { useAuth } from '@/providers/AuthProvider'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthAlert } from '@/components/auth/AuthAlert'
import { PasswordField } from '@/components/auth/PasswordField'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { Button } from '@/components/ui/button'
import { acceptInvitationSchema, type AcceptInvitationFormData } from '@/lib/schemas'
import { ROLE_LABELS, type AuthRole } from '@/types/auth'
import {
  Clock,
  XCircle,
  AlertTriangle,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type InvitationStatus = 'loading' | 'valid' | 'expired' | 'accepted' | 'invalid'

interface InvitationData {
  email: string
  role: string
  business_name: string
  invited_by: string
}

export default function AcceptInvitationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { login } = useAuth()

  const [status, setStatus] = useState<InvitationStatus>('loading')
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      return
    }

    const loadInvitation = async () => {
      try {
        const details = await authService.getInvitation(token)
        if (details.status === 'expired') {
          setStatus('expired')
        } else if (details.status === 'accepted') {
          setStatus('accepted')
        } else {
          setInvitation({
            email: details.email,
            role: details.role,
            business_name: details.business_name,
            invited_by: details.invited_by,
          })
          setStatus('valid')
        }
      } catch {
        setStatus('invalid')
      }
    }

    loadInvitation()
  }, [token])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<AcceptInvitationFormData>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: { fullName: '', password: '', confirmPassword: '' },
  })

  const passwordValue = watch('password')

  const onSubmit = async (data: AcceptInvitationFormData) => {
    if (!token) return
    setSubmitError(null)
    try {
      await authService.acceptInvitation({
        token,
        full_name: data.fullName,
        password: data.password,
      })
      // Auto-login after accepting
      if (invitation?.email) {
        try {
          await login(invitation.email, data.password)
          navigate('/dashboard', { replace: true })
        } catch {
          navigate('/login', { replace: true })
        }
      } else {
        navigate('/login', { replace: true })
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { code?: string } } } }
      const code = axiosErr?.response?.data?.error?.code
      if (code === 'INVITATION_EXPIRED') {
        setStatus('expired')
      } else if (code === 'INVITATION_ACCEPTED') {
        setStatus('accepted')
      } else if (code === 'INVALID_INVITATION') {
        setStatus('invalid')
      } else {
        setSubmitError("We couldn't accept this invitation. Please try again.")
      }
    }
  }

  if (status === 'loading') {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="animate-spin h-12 w-12 border-3 border-primary border-t-transparent rounded-full" />
            <p className="text-sm font-semibold text-muted-foreground">Verifying invitation credentials...</p>
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
                Invalid invitation link
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                This invitation link is invalid or has expired.
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
                Invitation expired
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                This invitation has expired. Please contact your organization administrator for a new invite.
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

  if (status === 'accepted') {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-info-subtle border border-info/20 text-info shadow-xl shadow-info/10">
              <AlertTriangle className="h-10 w-10 text-info" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Already accepted
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                This invitation has already been accepted. You can directly sign in to your workspace.
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
              <span>Team Invitation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Join your workspace
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
              You&apos;ve been invited to join{' '}
              <span className="font-bold text-foreground">{invitation?.business_name}</span>
            </p>
          </div>

          {/* Clean Integrated Info Pill */}
          <div className="rounded-2xl border border-border/70 bg-surface-muted/60 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Invited Email</span>
              <span className="font-semibold text-foreground font-mono">{invitation?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Assigned Role</span>
              <span className="px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                {ROLE_LABELS[(invitation?.role as AuthRole) || 'sales_rep']}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Invited by</span>
              <span className="font-medium text-foreground">{invitation?.invited_by}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {submitError && <AuthAlert type="error" message={submitError} />}

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-semibold text-foreground block">
                Full Name <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className={cn(
                    'flex h-12 w-full rounded-2xl border bg-surface/90 pl-11 pr-4 text-sm text-foreground shadow-xs transition-all duration-200',
                    'placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary',
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

            {/* Password */}
            <div className="space-y-2">
              <PasswordField
                label="Create Workspace Password *"
                placeholder="Create strong password"
                autoComplete="new-password"
                className="h-12 rounded-2xl text-sm"
                error={errors.password?.message}
                {...register('password')}
              />
              <PasswordStrength password={passwordValue || ''} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <PasswordField
                label="Confirm Workspace Password *"
                placeholder="Confirm your password"
                autoComplete="new-password"
                className="h-12 rounded-2xl text-sm"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2 font-semibold shadow-xs"
              size="lg"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? (
                'Joining Workspace...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Accept Invitation & Enter Workspace</span>
                  <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>
          </form>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
