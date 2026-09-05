import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { PageTransition } from '@/components/common/PageTransition'
import { useAuth } from '@/providers/AuthProvider'
import { useTheme } from '@/providers/ThemeProvider'
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
  Sun,
  Moon,
  Package,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/common/BrandMark'
import { cn } from '@/lib/utils'

export function CustomerPortalLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    setMobileMenuOpen(false)
    try {
      await logout()
    } catch (err) {
      console.warn('Sign out warning:', err)
    } finally {
      navigate('/login', { replace: true })
    }
  }

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Escape key closes mobile drawer
  useEffect(() => {
    if (!mobileMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Overview', path: '/customer-portal/dashboard', icon: LayoutDashboard },
        { label: 'Quotations', path: '/customer-portal/quotations', icon: FileText },
        { label: 'Orders', path: '/customer-portal/orders', icon: Package },
        { label: 'Shipments', path: '/customer-portal/shipments', icon: Truck },
        { label: 'Invoices & Billing', path: '/customer-portal/invoices', icon: CreditCard },
        { label: 'Subscriptions', path: '/customer-portal/subscriptions', icon: RefreshCw },
      ],
    },
    {
      title: 'ACCOUNT SETTINGS',
      items: [
        { label: 'Profile', path: '/customer-portal/account/profile', icon: User },
        { label: 'Company', path: '/customer-portal/account/company', icon: Building2 },
        { label: 'Preferences', path: '/customer-portal/account/preferences', icon: Sliders },
      ],
    },
  ]

  // Compute active page title for topbar breadcrumb
  const currentItem = navSections
    .flatMap((s) => s.items)
    .find((item) => location.pathname.startsWith(item.path))
  const pageTitle = currentItem?.label || 'Dashboard'

  const userInitials = (user?.full_name || 'Customer User')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CU'

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ─── MOBILE DRAWER OVERLAY ─── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity duration-200"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── CUSTOMER PORTAL SIDEBAR ─── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/80 bg-surface/95 backdrop-blur-md transition-all duration-200',
          sidebarCollapsed ? 'w-[72px]' : 'w-[260px]',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/70">
          <Link to="/customer-portal/dashboard" className="flex items-center gap-2.5 min-w-0">
            <BrandMark />
            {!sidebarCollapsed && (
              <div className="min-w-0 truncate">
                <span className="font-bold text-base text-foreground block leading-tight truncate">
                  DealFlow<span className="text-primary">360</span>
                </span>
                <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider block truncate">
                  Customer Portal
                </span>
              </div>
            )}
          </Link>

          {/* Close on Mobile / Collapse on Desktop */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!sidebarCollapsed && (
                <p className="px-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    item.path === '/customer-portal/dashboard'
                      ? location.pathname === '/customer-portal' || location.pathname === '/customer-portal/dashboard'
                      : location.pathname.startsWith(item.path)

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors group',
                        isActive
                          ? 'bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-surface-muted'
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-sky-400' : 'text-muted-foreground group-hover:text-foreground')} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border/70 space-y-2">
          {/* Internal Workspace Switcher for Admin/Staff */}
          {user && user.role !== 'customer' && !sidebarCollapsed && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full text-xs h-8 justify-start gap-2 border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
            >
              <Link to={user.role === 'super_admin' ? '/platform' : '/dashboard'}>
                <Shield className="h-3.5 w-3.5" />
                <span className="truncate">Internal Workspace</span>
              </Link>
            </Button>
          )}

          {/* User Profile Card */}
          <div className={cn('flex items-center gap-2.5 p-2 rounded-xl bg-secondary/30 border border-border/60', sidebarCollapsed && 'justify-center p-1.5')}>
            <div className="h-8 w-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-500/30">
              {userInitials}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1 truncate">
                <p className="text-xs font-semibold text-foreground truncate">{user?.full_name || 'Customer'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'Verified Account'}</p>
              </div>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA (Offset by Sidebar Width) ─── */}
      <div className={cn('transition-all duration-200 flex flex-col min-h-screen', sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]')}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
              aria-label="Open portal navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
              <span className="text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
                Customer Portal
              </span>
              <span className="text-muted-foreground/60 hidden sm:inline">/</span>
              <span className="font-semibold text-foreground truncate">{pageTitle}</span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Staff Switcher on Topbar for Mobile/Tablet */}
            {user && user.role !== 'customer' && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden sm:flex lg:hidden text-xs h-8 gap-1.5 border-sky-500/30 text-sky-400"
              >
                <Link to={user.role === 'super_admin' ? '/platform' : '/dashboard'}>
                  <Shield className="h-3 w-3" />
                  <span>Internal</span>
                </Link>
              </Button>
            )}

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              title="Toggle color theme"
              aria-label="Toggle color theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Direct Sign Out button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/70 py-5 text-center text-xs text-muted-foreground">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Protected by DealFlow360 Enterprise Tenant Security</span>
            <span>© {new Date().getFullYear()} DealFlow360 Platform. All rights reserved.</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
