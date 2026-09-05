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
  Users,
} from 'lucide-react'

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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
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
            <h1 className="text-h2 font-semibold text-foreground">Invalid invitation</h1>
            <p className="mt-2 text-body-small text-muted-foreground">
              This invitation link is invalid.
            </p>
          </div>
          <AuthCard>
            <Link to="/login">
              <Button className="w-full" size="lg">
                Go to sign in
              </Button>
            </Link>
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
            <h1 className="text-h2 font-semibold text-foreground">Invitation expired</h1>
            <p className="mt-2 text-body-small text-muted-foreground">
              This invitation has expired. Please request a new one from your administrator.
            </p>
          </div>
          <AuthCard>
            <Link to="/login">
              <Button className="w-full" size="lg">
                Go to sign in
              </Button>
            </Link>
          </AuthCard>
        </div>
      </AuthLayout>
    )
  }

  if (status === 'accepted') {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-info-subtle">
              <AlertTriangle className="h-6 w-6 text-info" />
            </div>
            <h1 className="text-h2 font-semibold text-foreground">Already accepted</h1>
            <p className="mt-2 text-body-small text-muted-foreground">
              This invitation has already been accepted.
            </p>
          </div>
          <AuthCard>
            <Link to="/login">
              <Button className="w-full" size="lg">
                Go to sign in
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
        {/* Invitation info */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-h2 font-semibold text-foreground">Join your team</h1>
          <p className="mt-2 text-body-small text-muted-foreground">
            You&apos;ve been invited to join{' '}
            <span className="font-medium text-foreground">{invitation?.business_name}</span>
          </p>
        </div>

        {/* Invitation details */}
        <AuthCard>
          <div className="mb-6 space-y-2 rounded-lg bg-surface-muted p-3">
            <div className="flex items-center justify-between text-small">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-foreground">{invitation?.email}</span>
            </div>
            <div className="flex items-center justify-between text-small">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium text-foreground">
                {ROLE_LABELS[(invitation?.role as AuthRole) || 'sales_rep']}
              </span>
            </div>
            <div className="flex items-center justify-between text-small">
              <span className="text-muted-foreground">Invited by</span>
              <span className="font-medium text-foreground">{invitation?.invited_by}</span>
            </div>
          </div>

          {/* Setup form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {submitError && <AuthAlert type="error" message={submitError} />}

            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-label font-medium text-foreground">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                className="flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-body-small text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 border-input focus:ring-primary"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                {...register('fullName')}
              />
              {errors.fullName && (
                <p id="fullName-error" className="text-caption text-danger" role="alert">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <PasswordField
              label="Password"
              placeholder="Create a password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <PasswordStrength password={passwordValue || ''} />

            <PasswordField
              label="Confirm password"
              placeholder="Confirm your password"
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
              {isSubmitting ? 'Accepting...' : 'Accept invitation'}
            </Button>
          </form>
        </AuthCard>
      </div>
    </AuthLayout>
  )
}
