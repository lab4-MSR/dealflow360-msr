import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import {
  Building2,
  Users,
  BarChart3,
  ClipboardList,
  Activity,
} from 'lucide-react'

const quickActions = [
  { label: 'Manage Businesses', path: '/platform/businesses', icon: Building2 },
  { label: 'View Users', path: '/platform/users', icon: Users },
  { label: 'Analytics', path: '/platform/analytics', icon: BarChart3 },
  { label: 'Audit Log', path: '/platform/audit', icon: ClipboardList },
  { label: 'System Health', path: '/platform/health', icon: Activity },
]

export function PlatformPageHeader() {
  const navigate = useNavigate()

  return (
    <PageHeader
      title="Platform Overview"
      description="Monitor businesses, users, deals, revenue, and platform health across all tenants."
      badge={
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          Super Admin
        </span>
      }
      actions={
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.path}
                variant="outline"
                size="sm"
                onClick={() => navigate(action.path)}
                className="gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            )
          })}
        </div>
      }
    />
  )
}

