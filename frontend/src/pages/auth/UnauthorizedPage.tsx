import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { ShieldX, ArrowLeft, Home, Mail } from 'lucide-react'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const { user, getDashboardPath } = useAuth()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[480px] text-center space-y-8">
        {/* Illustration */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-danger-subtle">
          <ShieldX className="h-10 w-10 text-danger" />
        </div>

        {/* Error info */}
        <div className="space-y-3">
          <h1 className="text-display font-bold text-foreground">403</h1>
          <h2 className="text-h2 font-semibold text-foreground">Access Denied</h2>
          <p className="text-body text-muted-foreground max-w-sm mx-auto">
            You don&apos;t have permission to access this page. Please contact your
            administrator if you believe this is an error.
          </p>
        </div>

        {/* Context */}
        {user && (
          <div className="rounded-lg border border-border bg-card p-4 text-left">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-small">
                <span className="text-muted-foreground">Your role</span>
                <span className="font-medium text-foreground capitalize">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              {user.business_name && (
                <div className="flex items-center justify-between text-small">
                  <span className="text-muted-foreground">Organization</span>
                  <span className="font-medium text-foreground">{user.business_name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={() => navigate(getDashboardPath())}>
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <a href="mailto:support@dealflow360.app">
              <Mail className="h-4 w-4" />
              Contact Support
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
