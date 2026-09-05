import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { SIDEBAR_NAV } from '@/constants'
import { useAuth } from '@/providers/AuthProvider'
import {
  LayoutDashboard,
  FileText,
  Users,
  Truck,
  Warehouse,
  CreditCard,
  BarChart3,
  HeartPulse,
  UserCog,
  SlidersHorizontal,
  Settings,
  ChevronLeft,
  Building2,
  Sparkles,
  ShieldAlert,
  Bell,
  HelpCircle,
  User,
  Package,
  RefreshCw,
  Inbox,
  CheckCircle2,
  DollarSign,
  Percent,
  TrendingUp,
  Receipt,
  Shield,
  X,
} from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  FileText,
  Users,
  Truck,
  Warehouse,
  CreditCard,
  BarChart3,
  HeartPulse,
  UserCog,
  SlidersHorizontal,
  Settings,
  Sparkles,
  ShieldAlert,
  Bell,
  HelpCircle,
  User,
  Package,
  RefreshCw,
  Building2,
  Inbox,
  CheckCircle2,
  DollarSign,
  Percent,
  TrendingUp,
  Receipt,
  Shield,
}

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({
  collapsed = false,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const location = useLocation()
  const { user } = useAuth()
  const [localMobileOpen, setLocalMobileOpen] = useState(false)

  const isMobileOpen = mobileOpen !== undefined ? mobileOpen : localMobileOpen

  const handleClose = () => {
    setLocalMobileOpen(false)
    onMobileClose?.()
  }

  useEffect(() => {
    handleClose()
  }, [location.pathname])

  const role = user?.role

  const visibleSections = SIDEBAR_NAV.map((section) => {
    if (section.roles && role && !section.roles.includes(role)) {
      return null
    }
    const visibleItems = section.items.filter((item) => {
      if (item.roles && role && !item.roles.includes(role)) {
        return false
      }
      return true
    })
    if (visibleItems.length === 0) return null
    return { ...section, items: visibleItems }
  }).filter(Boolean) as typeof SIDEBAR_NAV

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-xs lg:hidden transition-opacity duration-200"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar-background border-r border-sidebar-border transition-all duration-200',
          collapsed ? 'w-[72px]' : 'w-[240px]',
          isMobileOpen ? 'translate-x-0 shadow-elevation-4' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo and Mobile Close */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-sidebar-border',
            collapsed ? 'justify-center px-2' : 'justify-between px-5'
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-caption font-bold text-primary-foreground">DF</span>
            </div>
            {!collapsed && (
              <span className="text-body font-semibold text-sidebar-foreground">DealFlow360</span>
            )}
          </div>
          {/* Mobile close button */}
          {!collapsed && (
            <button
              type="button"
              onClick={handleClose}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Workspace Switcher */}
        {!collapsed && (
          <div className="px-3 py-3 border-b border-sidebar-border">
            <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-small text-sidebar-foreground bg-sidebar-accent/50">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 truncate">
                <p className="truncate font-medium text-xs leading-none">
                  {user?.business_name || (user as any)?.businessName || 'DealFlow360'}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                  {user?.role?.replace('_', ' ') || 'Workspace'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {visibleSections.map((section) => (
            <div key={section.section} className="mb-4">
              {!collapsed && (
                <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {section.section}
                </span>
              )}
              <div className="mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = iconMap[item.icon] || FileText
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-small font-medium transition-all duration-150 ease-out',
                          collapsed && 'justify-center px-2',
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-xs font-semibold'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:scale-[0.99] motion-reduce:active:scale-100'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={cn('h-4 w-4 shrink-0 transition-transform duration-150', isActive && 'scale-105')} />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        {onToggle && (
          <div className="p-2 border-t border-sidebar-border">
            <button
              onClick={onToggle}
              className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
