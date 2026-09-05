import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/providers/ThemeProvider'
import { DealFlowLogo } from '@/components/common/DealFlowLogo'
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  RefreshCw,
  Mail,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Layers3,
  Sun,
  Moon,
  ShieldAlert,
  Activity,
} from 'lucide-react'
import { useState, useMemo } from 'react'

interface SystemErrorPageProps {
  error?: Error | null
  resetError?: () => void
}

export default function SystemErrorPage({ error: propError, resetError }: SystemErrorPageProps) {
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()
  const [showDetails, setShowDetails] = useState(false)
  const [copied, setCopied] = useState(false)

  const error = propError || null

  const errorId = useMemo(() => {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase()
    return `DF360-ERR-${random}`
  }, [])

  const timestamp = useMemo(() => new Date().toISOString(), [])

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(errorId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleTryAgain = () => {
    if (resetError) {
      resetError()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Ambient background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 dark:bg-red-500/15 rounded-full blur-3xl" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <DealFlowLogo size="md" />

          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer border border-transparent hover:border-border"
            aria-label="Toggle theme"
            title="Toggle theme"
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
        <div className="w-full max-w-xl text-center space-y-8 animate-page-enter">
          {/* Watermarked 500 & Alert Icon */}
          <div className="relative flex flex-col items-center justify-center">
            <span className="text-[120px] sm:text-[160px] font-extrabold tracking-tighter text-red-200/40 dark:text-red-950/40 select-none leading-none font-mono">
              500
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 rounded-3xl bg-card border border-red-500/30 shadow-elevation-3 flex items-center justify-center text-red-500 backdrop-blur-md">
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>System Exception Captured</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Something Went Wrong
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              We encountered an unexpected condition while processing your request. Incident telemetry has been automatically dispatched to our reliability engineering team.
            </p>
          </div>

          {/* Diagnostic Box */}
          <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md p-4 text-left shadow-elevation-2 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Telemetry Reference
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Trace ID</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs font-mono bg-surface-muted/80 px-3 py-2 rounded-xl border border-border/60">
              <span className="text-foreground font-semibold">{errorId}</span>
              <span className="text-muted-foreground text-[10px]">{timestamp}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="w-full sm:w-auto font-semibold shadow-xs cursor-pointer"
              onClick={handleTryAgain}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>Try Again</span>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto h-11 rounded-xl text-sm cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="h-4 w-4 mr-2" />
              <span>Workspace Dashboard</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-11 rounded-xl text-sm cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Go Back</span>
            </Button>
          </div>

          {/* Technical Diagnostics Accordion */}
          <div className="pt-2 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto cursor-pointer p-2"
            >
              <span>{showDetails ? 'Hide' : 'View'} Technical Diagnostics</span>
              {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {showDetails && (
              <div className="mt-3 rounded-2xl border border-border/80 bg-surface-muted/90 p-4 space-y-2 text-xs font-mono shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-border/60 text-[11px] text-muted-foreground">
                  <span>ERROR_PAYLOAD</span>
                  <span>NODE_ENV: PRODUCTION</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <p className="text-danger font-semibold">
                    {error?.name || 'RuntimeError'}: {error?.message || 'An unexpected operational failure occurred.'}
                  </p>
                  {error?.stack && (
                    <pre className="text-[10px] text-muted-foreground overflow-x-auto p-2 bg-card rounded-lg border border-border/60 max-h-40 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/60 py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-4">
        <span>DealFlow360 Reliability Monitoring</span>
        <span>·</span>
        <a href="mailto:support@dealflow360.app" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
          <Mail className="h-3 w-3" />
          Contact Support
        </a>
      </footer>
    </div>
  )
}
