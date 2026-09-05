import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { SIDEBAR_NAV } from '@/constants'
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
  Bell,
  HelpCircle,
  User,
  Package,
  RefreshCw,
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
  Bell,
  HelpCircle,
  User,
  Package,
  RefreshCw,
  Building2,
}


interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar-background border-r border-sidebar-border transition-all duration-200',
          collapsed ? 'w-[72px]' : 'w-[240px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex h-16 items-center border-b border-sidebar-border',
          collapsed ? 'justify-center px-2' : 'px-5'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-caption font-bold text-primary-foreground">DF</span>
              </div>
              <span className="text-body font-semibold text-sidebar-foreground">DealFlow360</span>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-caption font-bold text-primary-foreground">DF</span>
            </div>
          )}
        </div>

        {/* Workspace Switcher */}
        {!collapsed && (
          <div className="px-3 py-3 border-b border-sidebar-border">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-small text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-left truncate">Acme Corp</span>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {SIDEBAR_NAV.map((section) => (
            <div key={section.section} className="mb-4">
              {!collapsed && (
                <div className="px-3 mb-1.5">
                  <span className="text-caption font-medium text-muted-foreground uppercase tracking-wider">
                    {section.section}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = iconMap[item.icon] || LayoutDashboard
                  const isActive = location.pathname === item.path

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-small font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-primary'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                        collapsed && 'justify-center px-2'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', isActive && 'text-sidebar-primary')} />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-sidebar-border p-2 hidden lg:block">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-small text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>
      </aside>
    </>
  )
}
