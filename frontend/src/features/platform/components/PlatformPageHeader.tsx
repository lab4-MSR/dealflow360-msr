import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
  { label: 'System Health', path: '/platform/system-health', icon: Activity },
]

export function PlatformPageHeader() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-h1 text-foreground">Platform Overview</h1>
        <p className="text-body text-muted-foreground mt-1">
          Monitor businesses, users, deals, revenue, and platform health across all tenants.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.path}
              variant="secondary"
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
    </div>
  )
}
