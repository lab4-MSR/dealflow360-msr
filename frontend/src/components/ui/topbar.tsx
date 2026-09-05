import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/providers/AuthProvider'
import { DEMO_USERS } from '@/services/auth'
import { ROLE_LABELS, ROLE_DASHBOARD_MAP } from '@/types/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
} from 'lucide-react'

export function Topbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const { user, logout, login } = useAuth()
  const navigate = useNavigate()
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

  const handleSwitchAccount = async (email: string, pass: string) => {
    try {
      await login(email, pass)
      setMenuOpen(false)
      const demoAccount = DEMO_USERS[email]
      if (demoAccount) {
        navigate(ROLE_DASHBOARD_MAP[demoAccount.user.role], { replace: true })
      }
    } catch {
      // ignore
    }
  }

  const handleSignOut = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const displayName = user?.full_name || 'Anonymous User'
  const displayRole = user?.role ? (ROLE_LABELS[user.role] || user.role) : 'Sales Rep'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DF'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 pl-20 pr-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:pr-6 lg:px-6">
      {/* Breadcrumb / Organization Title */}
      <div className="flex items-center gap-2 text-small text-muted-foreground">
        <span className="text-foreground font-medium">{user?.business_name || 'DealFlow360'}</span>
        <span className="text-muted-foreground/60">/</span>
        <span className="text-xs capitalize font-normal text-muted-foreground">{displayRole}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Global Search */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/search')}
          className="hidden md:inline-flex items-center gap-2 text-muted-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="text-small">Search...</span>
          <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-surface-muted px-1.5 text-caption font-medium text-muted-foreground md:flex">
            <span className="text-[10px]">Ctrl</span>
            <span className="text-[10px]">K</span>
          </kbd>
        </Button>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          onClick={() => navigate('/help')}
          title="Help Center"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground relative"
          onClick={() => navigate('/notifications')}
          title="Notification Center"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-background animate-pulse" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground relative overflow-hidden"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
        >
          <Sun className={cn("h-4 w-4 transition-all duration-200 ease-out", resolvedTheme === 'dark' ? "rotate-0 scale-100" : "-rotate-90 scale-0 absolute")} />
          <Moon className={cn("h-4 w-4 transition-all duration-200 ease-out", resolvedTheme === 'dark' ? "rotate-90 scale-0 absolute" : "rotate-0 scale-100")} />
        </Button>

        {/* User Profile & Account Switcher Dropdown */}
        <div className="relative ml-2" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent cursor-pointer transition-all duration-150 ease-out active:scale-[0.98] motion-reduce:active:scale-100 focus:outline-none"
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
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card shadow-elevation-3 py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150 ease-out origin-top-right motion-reduce:animate-none">
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
