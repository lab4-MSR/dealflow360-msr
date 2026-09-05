import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/providers/AuthProvider'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthAlert } from '@/components/auth/AuthAlert'
import { PasswordField } from '@/components/auth/PasswordField'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { Button } from '@/components/ui/button'
import {
  Building2,
  User,
  Mail,
  Shield,
  CheckCircle2,
  Briefcase,
  Globe,
  Coins,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'

const companyRegistrationSchema = z
  .object({
    businessName: z.string().min(2, 'Company legal name must be at least 2 characters').max(100),
    industry: z.string().min(1, 'Please select your industry'),
    companySize: z.string().min(1, 'Please select company size'),
    operatingCurrency: z.string().min(1, 'Please select operating currency'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid work email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service and Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type CompanyRegistrationFormData = z.infer<typeof companyRegistrationSchema>

export default function CompanyRegistrationPage() {
  const navigate = useNavigate()
  const { signup, clearError, getDashboardPath } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyRegistrationFormData>({
    resolver: zodResolver(companyRegistrationSchema),
    defaultValues: {
      businessName: '',
      industry: 'Technology & SaaS',
      companySize: '11-50',
      operatingCurrency: 'INR',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  })

  const passwordValue = watch('password')

  const onSubmit = async (data: CompanyRegistrationFormData) => {
    setSubmitError(null)
    clearError()
    try {
      await signup({
        full_name: data.fullName,
        email: data.email,
        password: data.password,
        business_name: data.businessName,
      })
      toast.success('Company workspace registered!', {
        description: `Welcome ${data.fullName}! Your ${data.businessName} workspace is ready.`,
      })
      navigate('/business-admin/dashboard', { replace: true })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: { code?: string; message?: string } } } }
      const status = axiosErr?.response?.status
      const code = axiosErr?.response?.data?.error?.code
      const msg = axiosErr?.response?.data?.error?.message

      if (status === 409 || code === 'EMAIL_ALREADY_EXISTS') {
        setSubmitError('An account with this email address already exists. Please sign in instead.')
      } else if (msg) {
        setSubmitError(msg)
      } else {
        setSubmitError('Failed to register company. Please verify your details and try again.')
      }
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-6 max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-caption font-semibold">
            <Building2 className="h-3.5 w-3.5" />
            <span>Organization Onboarding</span>
          </div>
          <h1 className="text-h2 font-bold text-foreground">Register Your Company</h1>
          <p className="text-body-small text-muted-foreground">
            Set up your organization tenant, configure pricing governance, and provision business admin access.
          </p>
        </div>

        <AuthCard>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {submitError && <AuthAlert type="error" message={submitError} />}

            {/* ── Section 1: Company Profile ── */}
            <div className="space-y-3 border-b border-border pb-4">
              <h2 className="text-small font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>1. Company Profile</span>
              </h2>

              {/* Company Legal Name */}
              <div className="space-y-1">
                <label htmlFor="businessName" className="text-label font-medium text-foreground">
                  Company Legal Name <span className="text-danger">*</span>
                </label>
                <input
                  id="businessName"
                  type="text"
                  placeholder="e.g. Acme Enterprise Solutions Pvt Ltd"
                  className="flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-body-small text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border-input"
                  {...register('businessName')}
                />
                {errors.businessName && (
                  <p className="text-caption text-danger">{errors.businessName.message}</p>
                )}
              </div>

              {/* Industry & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="industry" className="text-label font-medium text-foreground">
                    Industry <span className="text-danger">*</span>
                  </label>
                  <select
                    id="industry"
                    className="flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-body-small text-foreground border-input focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register('industry')}
                  >
                    <option value="Technology & SaaS">Technology & SaaS</option>
                    <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                    <option value="Healthcare & Medical Devices">Healthcare & Medical Devices</option>
                    <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                    <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                    <option value="Professional & IT Services">Professional & IT Services</option>
                    <option value="Financial Services">Financial Services</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="companySize" className="text-label font-medium text-foreground">
                    Company Size <span className="text-danger">*</span>
                  </label>
                  <select
                    id="companySize"
                    className="flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-body-small text-foreground border-input focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register('companySize')}
                  >
                    <option value="1-10">1 - 10 employees</option>
                    <option value="11-50">11 - 50 employees</option>
                    <option value="51-200">51 - 200 employees</option>
                    <option value="201-1000">201 - 1,000 employees</option>
                    <option value="1000+">1,000+ employees</option>
                  </select>
                </div>
              </div>

              {/* Operating Currency */}
              <div className="space-y-1">
                <label htmlFor="operatingCurrency" className="text-label font-medium text-foreground">
                  Primary Operating Currency <span className="text-danger">*</span>
                </label>
                <select
                  id="operatingCurrency"
                  className="flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-body-small text-foreground border-input focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  {...register('operatingCurrency')}
                >
                  <option value="INR">INR (₹) — Indian Rupee (India Standard)</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                  <option value="AED">AED (د.إ) — UAE Dirham</option>
                </select>
                <p className="text-[11px] text-muted-foreground">
                  You can configure additional price lists and exchange rates after onboarding.
                </p>
              </div>
            </div>

            {/* ── Section 2: Business Admin Account ── */}
            <div className="space-y-3 border-b border-border pb-4">
              <h2 className="text-small font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>2. Business Administrator Credentials</span>
              </h2>

              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="fullName" className="text-label font-medium text-foreground">
                  Admin Full Name <span className="text-danger">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  className="flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-body-small text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border-input"
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <p className="text-caption text-danger">{errors.fullName.message}</p>
                )}
              </div>

              {/* Work Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-label font-medium text-foreground">
                  Business Work Email <span className="text-danger">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  className="flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-body-small text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border-input"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-caption text-danger">{errors.email.message}</p>
                )}
              </div>

              {/* Password & Confirm Password */}
              <div className="space-y-3">
                <PasswordField
                  label="Admin Password"
                  placeholder="Create strong password (min 8 characters)"
                  error={errors.password?.message}
                  {...register('password')}
                />
                {passwordValue && <PasswordStrength password={passwordValue} />}

                <PasswordField
                  label="Confirm Admin Password"
                  placeholder="Re-enter password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="space-y-1.5 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-small text-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input bg-surface text-primary focus:ring-primary mt-0.5"
                  {...register('agreeTerms')}
                />
                <span>
                  I agree to the{' '}
                  <Link to="/help" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/help" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  . I confirm that I am authorized to register this organization.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-caption text-danger">{errors.agreeTerms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Provisioning Workspace...</span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Register Company & Open Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </AuthCard>

        {/* Existing Account Footer */}
        <p className="text-center text-small text-muted-foreground">
          Already registered your company?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
