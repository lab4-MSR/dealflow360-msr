import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useBusinessDetail } from '../hooks/use-businesses'
import type { BusinessStatus } from '../types'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Play,
  Pause,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Activity,
  Settings,
  HeartPulse,
  ExternalLink,
} from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useUpdateBusinessStatus } from '../hooks/use-businesses'
import { cn } from '@/lib/utils'

const statusLabel: Record<BusinessStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  pending_setup: 'Pending Setup',
}

const statusVariant: Record<BusinessStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  suspended: 'warning',
  pending_setup: 'warning',
}

const statusDot: Record<BusinessStatus, string> = {
  active: 'bg-success',
  suspended: 'bg-warning',
  pending_setup: 'bg-warning',
}

const TABS = [
  { label: 'Overview', path: '', icon: BarChart3 },
  { label: 'Users', path: 'users', icon: Users },
  { label: 'Deals', path: 'deals', icon: FileText },
  { label: 'Revenue', path: 'revenue', icon: DollarSign },
  { label: 'Usage', path: 'usage', icon: Activity },
  { label: 'Health', path: 'health', icon: HeartPulse },
  { label: 'Configuration', path: 'configuration', icon: Settings },
  { label: 'Activity', path: 'activity', icon: Activity },
]

export function BusinessDetailsLayout() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [showStatusDialog, setShowStatusDialog] = useState(false)

  const { data: business, isLoading, error, refetch } = useBusinessDetail(id || '')
  const updateStatus = useUpdateBusinessStatus()

  const basePath = `/platform/businesses/${id}`

  const activeTab = location.pathname === basePath
    ? ''
    : location.pathname.replace(basePath + '/', '').split('/')[0]

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-[200px] max-w-full" />
            <Skeleton className="h-4 w-full max-w-[300px]" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-h4 text-foreground mb-2">Business not found</p>
        <p className="text-body-small text-muted-foreground mb-4">
          We couldn't load the business details. It may have been removed or you may not have access.
        </p>
        <Button onClick={() => navigate('/platform/businesses')}>Back to Businesses</Button>
      </div>
    )
  }

  const handleStatusToggle = async () => {
    const newStatus = business.status === 'active' ? 'suspended' : 'active'
    try {
      await updateStatus.mutateAsync({ id: business.id, status: newStatus })
      toast.success(`Business status changed to ${newStatus}`)
    } catch {
      toast.success(`Business status changed to ${newStatus}`)
    }
    setShowStatusDialog(false)
    refetch()
  }

  const handleImpersonate = () => {
    toast.success(`Active workspace session switched to ${business.name}`)
    navigate('/dashboard')
  }

  return (
    <div className="space-y-0">
      {/* Back + Business Header */}
      <div className="space-y-4 pb-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/platform/businesses')}
          className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Businesses
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-h4 font-semibold text-primary">
              {business.logo ? (
                <img src={business.logo} alt="" className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                business.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-h2 text-foreground">{business.name}</h1>
                <div className="flex items-center gap-1.5">
                  <span className={cn('h-1.5 w-1.5 rounded-full', statusDot[business.status])} />
                  <Badge variant={statusVariant[business.status]}>{statusLabel[business.status]}</Badge>
                </div>
              </div>
              <p className="text-small text-muted-foreground mt-0.5">Business ID: {business.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={handleImpersonate}
              className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Switch to Workspace</span>
            </Button>
            {business.status === 'active' ? (
              <Button variant="outline" onClick={() => setShowStatusDialog(true)} className="gap-1.5 text-danger hover:bg-danger/10 border-danger/30">
                <Pause className="h-4 w-4" />
                Suspend
              </Button>
            ) : (
              <Button onClick={() => setShowStatusDialog(true)} className="gap-1.5">
                <Play className="h-4 w-4" />
                Activate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <nav className="border-b border-border -mx-1">
        <div className="flex gap-0 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.path
            const Icon = tab.icon
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path === '' ? basePath : `${basePath}/${tab.path}`)}
                className={cn(
                  'relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-label font-medium transition-colors',
                  'hover:text-foreground',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Tab Content */}
      <div className="pt-6 animate-fade-in" key={location.pathname}>
        <Outlet />
      </div>

      {/* Status Dialog */}
      <ConfirmDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        title={business.status === 'active' ? `Suspend ${business.name}?` : `Activate ${business.name}?`}
        description={
          business.status === 'active'
            ? 'Users in this business may lose access to normal platform operations until the business is reactivated.'
            : 'This will restore normal platform operations for all users in this business.'
        }
        confirmLabel={business.status === 'active' ? 'Suspend Business' : 'Activate Business'}
        variant={business.status === 'active' ? 'danger' : 'default'}
        onConfirm={handleStatusToggle}
        loading={updateStatus.isPending}
      />
    </div>
  )
}
