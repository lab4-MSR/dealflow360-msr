import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { SIDEBAR_NAV } from '@/constants'
import { useAuth } from '@/providers/AuthProvider'
import { BrandMark } from '@/components/common/BrandMark'
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
  Layers3,
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
  LogOut,
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
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [localMobileOpen, setLocalMobileOpen] = useState(false)

  const isMobileOpen = mobileOpen !== undefined ? mobileOpen : localMobileOpen

  const handleClose = () => {
    setLocalMobileOpen(false)
    onMobileClose?.()
  }

  const handleSignOut = async () => {
    handleClose()
    try {
      await logout()
    } catch (err) {
      console.warn('Sign out warning:', err)
    } finally {
      navigate('/login', { replace: true })
    }
  }

  useEffect(() => {
    handleClose()
  }, [location.pathname])

  // Escape key handler to close mobile drawer
  useEffect(() => {
    if (!isMobileOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileOpen])

  const role = user?.role

  const visibleSections = SIDEBAR_NAV.map((section) => {
    if (role === 'business_admin' && (section.section === 'SALES' || section.section === 'INTELLIGENCE' || section.section === 'ANALYTICS & BI')) {
      return section
    }
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
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar-background border-r border-sidebar-border transition-all duration-200 max-w-[85vw]',
          collapsed ? 'w-[260px] lg:w-[72px]' : 'w-[260px] lg:w-[240px]',
          isMobileOpen ? 'translate-x-0 shadow-elevation-4' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo and Mobile Close */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-sidebar-border',
            collapsed ? 'justify-between px-5 lg:justify-center lg:px-2' : 'justify-between px-5'
          )}
        >
          <div className="flex items-center gap-2.5">
            <BrandMark />
            {(!collapsed || isMobileOpen) && (
              <span className={cn('text-body font-bold tracking-tight text-sidebar-foreground', collapsed && 'lg:hidden')}>
                DealFlow<span className="text-primary">360</span>
              </span>
            )}
          </div>
          {/* Mobile close button */}
          <button
            type="button"
            onClick={handleClose}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
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
                  const isItemActive = (active: boolean) => {
                    if (active) return true
                    if (item.path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) return true
                    if (item.path === '/platform/dashboard' && (location.pathname === '/platform' || location.pathname === '/platform/dashboard')) return true
                    if (item.path === '/platform/health' && location.pathname === '/platform/system-health') return true
                    if (item.path !== '/dashboard' && item.path !== '/platform/dashboard' && location.pathname.startsWith(item.path + '/')) return true
                    return false
                  }
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) => {
                        const active = isItemActive(isActive)
                        return cn(
                          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-small font-medium transition-all duration-150 ease-out',
                          collapsed && 'justify-center px-2',
                          active
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-xs font-semibold'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:scale-[0.99] motion-reduce:active:scale-100'
                        )
                      }}
                    >
                      {({ isActive }) => {
                        const active = isItemActive(isActive)
                        return (
                          <>
                            <Icon className={cn('h-4 w-4 shrink-0 transition-transform duration-150', active && 'scale-105')} />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                          </>
                        )
                      }}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sign Out button */}
        <div className="p-2 border-t border-sidebar-border">
          <button
            type="button"
            onClick={handleSignOut}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-small font-medium text-danger hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer',
              collapsed && 'justify-center px-2'
            )}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="h-4 w-4 shrink-0 text-danger" />
            {(!collapsed || isMobileOpen) && <span className={cn('truncate', collapsed && 'lg:hidden')}>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        {onToggle && (
          <div className="p-2 border-t border-sidebar-border hidden lg:block">
            <button
              type="button"
              onClick={onToggle}
              className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

