import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuth } from '@/providers/AuthProvider'
import { toast } from 'sonner'
import {
  FileText,
  LayoutGrid,
  RefreshCw,
  SlidersHorizontal,
  LogOut,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

interface SalesWorkspaceTopMenuProps {
  onReload?: () => void
  isReloading?: boolean
}

export function SalesWorkspaceTopMenu({ onReload, isReloading = false }: SalesWorkspaceTopMenuProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [reloadingState, setReloadingState] = useState(false)

  const isQuotationsActive =
    location.pathname.startsWith('/sales/quotations') ||
    location.pathname === '/quotations'

  const isPipelineActive =
    location.pathname.startsWith('/sales/deals') ||
    location.pathname.startsWith('/sales/pipeline') ||
    location.search.includes('view=kanban')

  const handleReload = async () => {
    setReloadingState(true)
    if (onReload) {
      await Promise.resolve(onReload())
    }
    setTimeout(() => {
      setReloadingState(false)
      toast.success('Sales workspace data reloaded successfully')
    }, 400)
  }

  const handleGoToBackend = () => {
    toast.info('Switching to Sales Operations Configuration Back-end...')
    navigate('/business-admin/dashboard')
  }

  const handleConfirmClose = async () => {
    setCloseDialogOpen(false)
    try {
      await logout()
    } catch {
      // ignore
    } finally {
      toast.info('Sales workspace closed.')
      navigate('/login', { replace: true })
    }
  }

  return (
    <>
      <div className="rounded-xl border border-primary/20 bg-card/95 backdrop-blur shadow-xs p-2.5 sm:p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left: Section Indicator & Nav Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-border mr-1 hidden sm:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <span className="text-[11px] font-bold text-foreground block">Sales Workspace</span>
              <span className="text-[9px] text-muted-foreground block font-mono">Rep CPQ Experience</span>
            </div>
          </div>

          <Button
            variant={isQuotationsActive && !location.search.includes('view=kanban') ? 'default' : 'ghost'}
            size="sm"
            asChild
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <Link to="/sales/quotations">
              <FileText className="h-3.5 w-3.5" />
              <span>Quotations</span>
            </Link>
          </Button>

          <Button
            variant={isPipelineActive || location.search.includes('view=kanban') ? 'default' : 'ghost'}
            size="sm"
            asChild
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <Link to="/sales/deals?view=kanban">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Pipeline (Kanban)</span>
            </Link>
          </Button>
        </div>

        {/* Right: Actions (Reload, Go to Backend, Close Workspace) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReload}
            disabled={isReloading || reloadingState}
            className="h-8 text-xs gap-1.5 border-border hover:bg-muted"
            title="Reload live quotation, discount, and pipeline cache"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isReloading || reloadingState ? 'animate-spin text-primary' : ''}`} />
            <span>Reload Data</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToBackend}
            className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            title="Switch context to Business Admin & Operations Configuration"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Go to Back-end</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCloseDialogOpen(true)}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-danger hover:bg-danger/10"
            title="Exit rep workspace session"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Close Workspace</span>
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        title="Close Sales Workspace?"
        description="This will safely end your active sales rep session and redirect you to the authentication portal."
        confirmLabel="Close Workspace"
        variant="danger"
        onConfirm={handleConfirmClose}
      />
    </>
  )
}
