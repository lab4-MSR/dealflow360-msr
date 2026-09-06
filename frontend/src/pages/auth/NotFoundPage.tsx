import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { Button } from '@/components/ui/button'
import {
  FileQuestion,
  ArrowLeft,
  Home,
  LayoutDashboard,
  FileText,
  Users,
  HelpCircle,
  Layers3,
  Sun,
  Moon,
  TrendingUp,
  Search,
  Compass,
} from 'lucide-react'

import { DealFlowLogo } from '@/components/common/DealFlowLogo'

const SUGGESTIONS = [
  { label: 'Workspace Dashboard', path: '/dashboard', icon: LayoutDashboard, desc: 'Central KPI metrics & alerts' },
  { label: 'Quotations & CPQ', path: '/sales/quotations', icon: FileText, desc: 'Active quotes & approval status' },
  { label: 'Enterprise Customers', path: '/sales/customers', icon: Users, desc: 'Client profiles & discount rules' },
  { label: 'Deal Health & Pipeline', path: '/sales/pipeline', icon: TrendingUp, desc: 'Margin health & stalled deals' },
  { label: 'Help & Knowledge Base', path: '/help', icon: HelpCircle, desc: 'Guides, API docs & tutorials' },
]

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { getDashboardPath } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Ambient background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-3xl" />
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
        <div className="w-full max-w-xl text-center space-y-6 animate-page-enter">
          {/* Watermarked Visual Code & Icon */}
          <div className="relative flex flex-col items-center justify-center">
            <span className="text-7xl sm:text-8xl font-extrabold tracking-tighter text-slate-200/50 dark:text-slate-800/40 select-none leading-none font-mono">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-14 w-14 rounded-2xl bg-card border border-border/80 shadow-elevation-2 flex items-center justify-center text-primary backdrop-blur-md">
                <FileQuestion className="h-7 w-7 text-sky-500" />
              </div>
            </div>
          </div>

          {/* Heading & Information */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-500/10 text-sky-500 text-xs font-semibold">
              <Compass className="h-3.5 w-3.5" />
              <span>HTTP 404 · Destination Not Found</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Page or Deal Record Not Found
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              The quotation, deal record, or workspace screen you are seeking has been relocated, archived, or does not exist.
            </p>
          </div>

          {/* Suggested Destinations Grid */}
          <div className="rounded-xl border border-border/80 bg-card/90 backdrop-blur-md p-4 text-left shadow-elevation-2 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recommended Destinations
              </span>
              <span className="text-[11px] text-muted-foreground">Quick Jump</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTIONS.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="flex items-start gap-2.5 rounded-lg border border-border/70 p-2.5 hover:border-primary/50 hover:bg-surface-muted/80 transition-all group cursor-pointer"
                >
                  <div className="p-1.5 rounded-md bg-secondary/80 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <Button
              className="w-full sm:w-auto h-10.5 rounded-xl font-semibold shadow-xs cursor-pointer"
              onClick={() => navigate(getDashboardPath())}
            >
              <Home className="h-4 w-4 mr-2" />
              <span>Go to Workspace Dashboard</span>
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto h-10.5 rounded-xl text-sm font-semibold cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Return to Previous Page</span>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        <span>DealFlow360 Enterprise CPQ & Deal Governance System</span>
      </footer>
    </div>
  )
}
