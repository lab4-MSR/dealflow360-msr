import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import {
  FileQuestion,
  ArrowLeft,
  Home,
  LayoutDashboard,
  FileText,
  Users,
  HelpCircle,
} from 'lucide-react'

const SUGGESTIONS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Quotations', path: '/dashboard/quotations', icon: FileText },
  { label: 'Customers', path: '/dashboard/customers', icon: Users },
  { label: 'Help Center', path: '#', icon: HelpCircle },
]

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { getDashboardPath } = useAuth()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[480px] text-center space-y-8">
        {/* Illustration */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>

        {/* Error info */}
        <div className="space-y-3">
          <h1 className="text-display font-bold text-foreground">404</h1>
          <h2 className="text-h2 font-semibold text-foreground">Page Not Found</h2>
          <p className="text-body text-muted-foreground max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Suggested navigation */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-small font-medium text-foreground mb-3">Suggested pages</h3>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTIONS.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-small text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

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
        </div>
      </div>
    </div>
  )
}
