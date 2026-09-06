import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { Button } from '@/components/ui/button'
import {
  ShieldAlert,
  ArrowLeft,
  Home,
  Mail,
  Layers3,
  Sun,
  Moon,
  Lock,
  UserCheck,
  Building2,
  LogOut,
} from 'lucide-react'

import { DealFlowLogo } from '@/components/common/DealFlowLogo'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const { user, logout, getDashboardPath } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Ambient background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <DealFlowLogo size="md" />

          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>
        </div>
      </header>

      {/* Center Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg text-center space-y-6 animate-page-enter">
          {/* Watermarked 403 & Shield */}
          <div className="relative flex flex-col items-center justify-center">
            <span className="text-7xl sm:text-8xl font-extrabold tracking-tighter text-rose-200/40 dark:text-rose-950/40 select-none leading-none font-mono">
              403
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-14 w-14 rounded-2xl bg-card border border-rose-500/30 shadow-elevation-2 flex items-center justify-center text-rose-500 backdrop-blur-md">
                <ShieldAlert className="h-7 w-7 text-rose-500" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold">
              <Lock className="h-3.5 w-3.5" />
              <span>Permission Boundary Enforced</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Access Restricted
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your account lacks the role privileges required to view or execute operations on this workspace resource.
            </p>
          </div>

          {/* Authenticated Context Card */}
          {user && (
            <div className="rounded-xl border border-border/80 bg-card/90 backdrop-blur-md p-4 text-left shadow-elevation-2 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Active Session Identity
                </span>
                <span className="text-[11px] text-muted-foreground">Tenant Context</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                    Authenticated As
                  </span>
                  <span className="font-semibold text-foreground">
                    {user.full_name} ({user.email})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Role</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                {user.business_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      Tenant Organization
                    </span>
                    <span className="font-medium text-foreground">{user.business_name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <Button
              className="w-full sm:w-auto h-10.5 rounded-xl font-semibold shadow-xs cursor-pointer"
              onClick={() => navigate(getDashboardPath())}
            >
              <Home className="h-4 w-4 mr-2" />
              <span>Go to Dashboard</span>
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto h-10.5 rounded-xl text-sm font-semibold cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Go Back</span>
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto h-10.5 rounded-xl text-sm font-semibold cursor-pointer"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Switch Account</span>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        <span>Need permissions upgraded? Contact your Organization Business Administrator.</span>
      </footer>
    </div>
  )
}
