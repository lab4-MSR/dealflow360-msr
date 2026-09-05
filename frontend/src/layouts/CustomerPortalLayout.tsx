import React from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import {
  FileText,
  Truck,
  CreditCard,
  RefreshCw,
  User,
  Building2,
  Sliders,
  LogOut,
  LayoutDashboard,
  Shield,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CustomerPortalLayout() {
  const navigate = useNavigate()

  const navItems = [
    { label: 'Overview', path: '/customer-portal/dashboard', icon: LayoutDashboard },
    { label: 'Quotations', path: '/customer-portal/quotations', icon: FileText },
    { label: 'Shipments', path: '/customer-portal/shipments', icon: Truck },
    { label: 'Invoices', path: '/customer-portal/invoices', icon: CreditCard },
    { label: 'Subscriptions', path: '/customer-portal/subscriptions', icon: RefreshCw },
  ]

  const accountItems = [
    { label: 'Profile', path: '/customer-portal/account/profile', icon: User },
    { label: 'Company', path: '/customer-portal/account/company', icon: Building2 },
    { label: 'Preferences', path: '/customer-portal/account/preferences', icon: Sliders },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Portal Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                DF
              </div>
              <div>
                <span className="font-bold text-base text-foreground block leading-tight">DealFlow360</span>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                  Customer Portal
                </span>
              </div>
            </div>

            {/* Primary Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-surface-muted'
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>

            {/* Account & Quick Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-1 border-l border-border pl-3">
                {accountItems.map((acc) => {
                  const Icon = acc.icon
                  return (
                    <NavLink
                      key={acc.path}
                      to={acc.path}
                      title={acc.label}
                      className={({ isActive }) =>
                        cn(
                          'p-2 rounded-lg text-xs transition-colors flex items-center gap-1.5',
                          isActive
                            ? 'bg-surface-muted text-foreground font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-surface-muted'
                        )
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs hidden xl:inline">{acc.label}</span>
                    </NavLink>
                  )
                })}
              </div>

              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                  Internal App <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile subnav */}
          <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-border/50">
            {navItems.concat(accountItems).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'px-2.5 py-1 rounded text-xs whitespace-nowrap shrink-0',
                    isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Protected by DealFlow360 Enterprise Tenant Security</span>
          <span>© 2026 DealFlow360 Platform. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
