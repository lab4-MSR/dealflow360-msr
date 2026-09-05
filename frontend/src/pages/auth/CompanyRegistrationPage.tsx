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
  Coins,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'INR (₹) — Indian Rupee (India Standard)' },
  { code: 'USD', symbol: '$', name: 'USD ($) — United States Dollar' },
  { code: 'EUR', symbol: '€', name: 'EUR (€) — Euro' },
  { code: 'GBP', symbol: '£', name: 'GBP (£) — British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'AED (د.إ) — UAE Dirham' },
]

export default function CompanyRegistrationPage() {
  const navigate = useNavigate()
  const { signup, clearError } = useAuth()
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
      operatingCurrency: 'USD',
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
      toast.success('Company workspace provisioned!', {
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
    <AuthLayout wideContent>
      <AuthCard>
        <div className="space-y-7">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Enterprise Organization Onboarding</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Register Your Company
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Set up your organization tenant, configure pricing governance, and provision business admin access
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {submitError && <AuthAlert type="error" message={submitError} />}

            {/* ── Section 1: Company Profile ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/80">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Company Profile
                </span>
              </div>

              {/* Company Legal Name */}
              <div className="space-y-1.5">
                <label htmlFor="businessName" className="text-sm font-semibold text-foreground block">
                  Company Legal Name <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <input
                    id="businessName"
                    type="text"
                    placeholder="e.g. Acme Enterprise Solutions Pvt Ltd"
                    className={cn(
                      'flex h-12 w-full rounded-2xl border bg-surface/90 pl-11 pr-4 text-sm text-foreground shadow-xs transition-all duration-200',
                      'placeholder:text-muted-foreground/60',
                      'focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary',
                      errors.businessName ? 'border-danger' : 'border-input focus:ring-primary/20'
                    )}
                    {...register('businessName')}
                  />
                </div>
                {errors.businessName && (
                  <p className="text-caption text-danger">{errors.businessName.message}</p>
                )}
              </div>

              {/* Industry & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="industry" className="text-sm font-semibold text-foreground block">
                    Industry <span className="text-danger">*</span>
                  </label>
                  <select
                    id="industry"
                    className="flex h-12 w-full rounded-2xl border bg-surface/90 px-4 text-sm text-foreground border-input focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary cursor-pointer"
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

                <div className="space-y-1.5">
                  <label htmlFor="companySize" className="text-sm font-semibold text-foreground block">
                    Company Size <span className="text-danger">*</span>
                  </label>
                  <select
                    id="companySize"
                    className="flex h-12 w-full rounded-2xl border bg-surface/90 px-4 text-sm text-foreground border-input focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary cursor-pointer"
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
              <div className="space-y-1.5">
                <label htmlFor="operatingCurrency" className="text-sm font-semibold text-foreground block">
                  Primary Operating Currency <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <select
                    id="operatingCurrency"
                    className="flex h-12 w-full rounded-2xl border bg-surface/90 pl-11 pr-4 text-sm text-foreground border-input focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary font-medium cursor-pointer"
                    {...register('operatingCurrency')}
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can configure additional price books and multi-currency exchange rates in settings.
                </p>
              </div>
            </div>

            {/* ── Section 2: Business Admin Account ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/80">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Administrator Credentials
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="text-sm font-semibold text-foreground block">
                    Admin Full Name <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <input
                      id="fullName"
                      type="text"
                      placeholder="e.g. Ramesh Sharma"
                      className={cn(
                        'flex h-12 w-full rounded-2xl border bg-surface/90 pl-11 pr-4 text-sm text-foreground shadow-xs',
                        'placeholder:text-muted-foreground/60',
                        'focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary',
                        errors.fullName ? 'border-danger' : 'border-input'
                      )}
                      {...register('fullName')}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-caption text-danger">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Work Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-foreground block">
                    Work Email <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      placeholder="admin@company.com"
                      className={cn(
                        'flex h-12 w-full rounded-2xl border bg-surface/90 pl-11 pr-4 text-sm text-foreground shadow-xs',
                        'placeholder:text-muted-foreground/60',
                        'focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary',
                        errors.email ? 'border-danger' : 'border-input'
                      )}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-caption text-danger">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="space-y-3">
                <PasswordField
                  label="Admin Password *"
                  placeholder="Create strong password (min 8 characters)"
                  className="h-12 rounded-2xl text-sm"
                  error={errors.password?.message}
                  {...register('password')}
                />
                {passwordValue && <PasswordStrength password={passwordValue} />}

                <PasswordField
                  label="Confirm Admin Password *"
                  placeholder="Re-enter password"
                  className="h-12 rounded-2xl text-sm"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="pt-2 border-t border-border/80">
              <label className="flex items-start gap-2.5 cursor-pointer text-sm text-foreground">
                <input
                  type="checkbox"
                  className="h-4.5 w-4.5 rounded border-input bg-surface text-primary focus:ring-primary/20 mt-0.5 cursor-pointer"
                  {...register('agreeTerms')}
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I agree to the{' '}
                  <Link to="/help" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/help" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  . I confirm that I am authorized to register this organization workspace.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-caption text-danger mt-1">{errors.agreeTerms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full font-semibold shadow-xs"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? (
                <span>Provisioning Workspace...</span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Register Company & Open Workspace</span>
                  <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t border-border/60 pt-3">
            Already registered your company?{' '}
            <Link
              to="/login"
              className="font-bold text-primary hover:text-primary-hover underline underline-offset-4 transition-colors"
            >
              Sign in to workspace
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
