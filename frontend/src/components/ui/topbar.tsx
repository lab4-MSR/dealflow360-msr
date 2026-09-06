import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/providers/AuthProvider'
import { DEMO_USERS } from '@/services/auth'
import { ROLE_LABELS, ROLE_DASHBOARD_MAP } from '@/types/auth'
import { SIDEBAR_NAV } from '@/constants'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { NavbarSearch } from '@/components/ui/NavbarSearch'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'
import { cn } from '@/lib/utils'
import {
  Search,
  Sun,
  Moon,
  Bell,
  HelpCircle,
  ChevronDown,
  LogOut,
  User,
  Sliders,
  Settings,
  Shield,
  ArrowRightLeft,
  Menu,
} from 'lucide-react'

interface TopbarProps {
  onOpenMobileMenu?: () => void
}

interface ActiveNavFeature {
  feature: string
  featurePath: string
  subFeature?: string
}

function getActiveSidebarFeature(pathname: string): ActiveNavFeature | null {
  // 1. Specific platform route overrides
  if (pathname === '/platform' || pathname === '/platform/dashboard') {
    return { feature: 'Platform Dashboard', featurePath: '/platform/dashboard' }
  }
  if (pathname === '/platform/health' || pathname === '/platform/system-health') {
    return { feature: 'System Health', featurePath: '/platform/health' }
  }
  if (pathname === '/platform/businesses/create') {
    return { feature: 'All Businesses', featurePath: '/platform/businesses', subFeature: 'Create Business' }
  }
  if (pathname.startsWith('/platform/businesses/') && pathname !== '/platform/businesses') {
    return { feature: 'All Businesses', featurePath: '/platform/businesses', subFeature: 'Business Details' }
  }
  if (pathname === '/platform/users/invite') {
    return { feature: 'Platform Users', featurePath: '/platform/users', subFeature: 'Invite User' }
  }
  if (pathname.startsWith('/platform/users/') && pathname !== '/platform/users') {
    return { feature: 'Platform Users', featurePath: '/platform/users', subFeature: 'User Details' }
  }
  if (pathname.startsWith('/platform/deals/')) {
    return { feature: 'Platform Dashboard', featurePath: '/platform/dashboard', subFeature: 'Deal Details' }
  }

  // Shared workspace routes
  if (pathname === '/profile') {
    return { feature: 'Profile Details', featurePath: '/profile' }
  }
  if (pathname === '/preferences') {
    return { feature: 'Preferences', featurePath: '/preferences' }
  }
  if (pathname === '/settings') {
    return { feature: 'Settings', featurePath: '/settings' }
  }
  if (pathname === '/notifications') {
    return { feature: 'Notification Center', featurePath: '/notifications' }
  }
  if (pathname === '/help') {
    return { feature: 'Help Center', featurePath: '/help' }
  }

  // 2. Generic SIDEBAR_NAV search
  const allNavItems = SIDEBAR_NAV.flatMap((section) => section.items)

  // Exact match
  const exactMatch = allNavItems.find((item) => item.path === pathname)
  if (exactMatch) {
    return { feature: exactMatch.label, featurePath: exactMatch.path }
  }

  // Prefix match (longest path first)
  const prefixMatches = allNavItems
    .filter((item) => item.path !== '/' && item.path !== '/dashboard' && pathname.startsWith(item.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)

  if (prefixMatches.length > 0) {
    return { feature: prefixMatches[0].label, featurePath: prefixMatches[0].path }
  }

  // Root or /dashboard
  if (pathname === '/' || pathname === '/dashboard') {
    return { feature: 'Sales Dashboard', featurePath: '/dashboard' }
  }

  if (pathname.startsWith('/platform')) {
    return { feature: 'Platform Dashboard', featurePath: '/platform/dashboard' }
  }

  return null
}

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const { user, logout, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const handleSwitchAccount = async (email: string, pass: string) => {
    setMenuOpen(false)
    try {
      await login(email, pass)
      const demoAccount = DEMO_USERS[email]
      if (demoAccount) {
        const dest = ROLE_DASHBOARD_MAP[demoAccount.user.role] || '/dashboard'
        navigate(dest, { replace: true })
      }
    } catch (err) {
      console.error('Account switch failed:', err)
    }
  }

  const handleSignOut = async () => {
    setMenuOpen(false)
    try {
      await logout()
    } catch (err) {
      console.warn('Sign out error:', err)
    } finally {
      navigate('/login', { replace: true })
    }
  }

  const displayName = user?.full_name || 'Anonymous User'
  const displayRole = user?.role ? (ROLE_LABELS[user.role] || user.role) : 'Sales Rep'
  const isSuperAdminPage = location.pathname.startsWith('/platform') || user?.role === 'super_admin'
  const effectiveRole = isSuperAdminPage ? 'Super Admin' : displayRole
  const activeFeature = getActiveSidebarFeature(location.pathname)
  const defaultFeature: ActiveNavFeature = isSuperAdminPage
    ? { feature: 'Platform Dashboard', featurePath: '/platform/dashboard' }
    : { feature: 'Sales Dashboard', featurePath: '/dashboard' }
  const resolvedFeature = activeFeature || defaultFeature
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DF'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 sm:gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6 lg:px-6">
      {/* Left: Mobile Trigger & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb: [Feature Name] / [Role] (e.g. Platform Dashboard / Super Admin) */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-small text-muted-foreground min-w-0">
          <Link
            to={resolvedFeature.featurePath}
            className="text-foreground font-semibold hover:text-primary transition-colors truncate text-xs sm:text-sm"
            title={resolvedFeature.feature}
          >
            {resolvedFeature.feature}
          </Link>
          {resolvedFeature.subFeature && (
            <>
              <span className="text-muted-foreground/60 shrink-0">/</span>
              <span
                className="text-xs font-medium text-foreground/80 truncate max-w-[90px] sm:max-w-[140px]"
                title={resolvedFeature.subFeature}
              >
                {resolvedFeature.subFeature}
              </span>
            </>
          )}
          <span className="text-muted-foreground/60 shrink-0">/</span>
          <span className="text-xs capitalize font-medium text-muted-foreground shrink-0 hidden sm:inline">
            {effectiveRole}
          </span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 flex items-center justify-center px-2 sm:px-4 max-w-xl mx-auto">
        <NavbarSearch />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          onClick={() => navigate('/help')}
          title="Help Center"
          aria-label="Help Center"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>

        {/* Notifications Pop-up */}
        <NotificationDropdown />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground relative overflow-hidden"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
          aria-label="Toggle color theme"
        >
          <Sun className={cn("h-4 w-4 transition-all duration-200 ease-out", resolvedTheme === 'dark' ? "rotate-0 scale-100" : "-rotate-90 scale-0 absolute")} />
          <Moon className={cn("h-4 w-4 transition-all duration-200 ease-out", resolvedTheme === 'dark' ? "rotate-90 scale-0 absolute" : "rotate-0 scale-100")} />
        </Button>

        {/* User Profile & Account Switcher Dropdown */}
        <div className="relative ml-2" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="User account and switcher"
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent cursor-pointer transition-all duration-150 ease-out active:scale-[0.98] motion-reduce:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="h-8 w-8 bg-primary/10 text-primary border border-primary/20">
              <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-small font-medium leading-none text-foreground">{displayName}</p>
              <p className="text-caption text-muted-foreground leading-none mt-1">{displayRole}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-xl border border-border bg-card shadow-elevation-3 py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150 ease-out origin-top-right motion-reduce:animate-none">
              {/* Account Header */}
              <div className="px-4 py-3 border-b border-border/70">
                <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'No email associated'}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary">
                    {displayRole}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate max-w-[130px]">
                    {user?.business_name || 'Acme Corp'}
                  </span>
                </div>
              </div>

              {/* Quick Account Switcher */}
              <div className="px-2 py-2 border-b border-border/70">
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <ArrowRightLeft className="h-3 w-3" />
                  <span>Switch Role / Account</span>
                </div>
                <div className="space-y-0.5 mt-1 max-h-48 overflow-y-auto">
                  {Object.entries(DEMO_USERS).map(([email, demo]) => {
                    const isCurrent = user?.email?.toLowerCase() === email.toLowerCase()
                    return (
                      <button
                        key={email}
                        type="button"
                        disabled={isCurrent}
                        onClick={() => handleSwitchAccount(email, demo.password)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
                          isCurrent
                            ? 'bg-muted text-foreground font-medium opacity-60 cursor-default'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer'
                        }`}
                      >
                        <span className="font-medium truncate">{demo.label}</span>
                        <span className="text-[10px] font-mono opacity-70 ml-2 shrink-0">{demo.user.role.replace('_', ' ')}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="px-2 py-1 border-b border-border/70 space-y-0.5 text-xs">
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-foreground hover:bg-muted transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Profile Details</span>
                </Link>
                <Link
                  to="/preferences"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-foreground hover:bg-muted transition-colors"
                >
                  <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Preferences</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-foreground hover:bg-muted transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Settings</span>
                </Link>
              </div>

              {/* Logout Button */}
              <div className="px-2 pt-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-danger hover:bg-danger/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
