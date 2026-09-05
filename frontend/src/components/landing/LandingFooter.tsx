import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Layers3,
  ArrowRight,
  ArrowUp,
  ShieldCheck,
  Lock,
  Cpu,
  Server,
  Activity,
  FileCheck2,
  Boxes,
  ReceiptText,
  UsersRound,
  Mail,
  ExternalLink,
  Sparkles,
  Globe,
  CheckCircle2,
  Terminal,
  Shield,
  Clock,
  Compass,
} from 'lucide-react'

interface LandingFooterProps {
  navItems: readonly (readonly [string, string])[]
  user?: unknown
  reducedMotion?: boolean
}

export function LandingFooter({ navItems, user, reducedMotion }: LandingFooterProps) {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      toast.error('Please enter a valid business email address')
      return
    }

    setIsSubscribing(true)
    setTimeout(() => {
      setIsSubscribing(false)
      setIsSubscribed(true)
      toast.success('Subscribed to DealFlow360 Architecture & System Dispatch!')
    }, 600)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getWorkspacePath = (path: string) => {
    return user ? path : `/login?returnTo=${encodeURIComponent(path)}`
  }

  return (
    <footer className="relative border-t border-border bg-card text-foreground overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-12 left-1/4 -z-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 -z-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
        {/* ─── 1. SYSTEMS DISPATCH & RADAR BANNER ─── */}
        <div className="mb-16 rounded-2xl border border-border/80 bg-surface-muted/60 p-6 backdrop-blur-md sm:p-8 lg:p-10 shadow-elevation-2">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            {/* Left: Dispatch Announcement & Telemetry */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>DealFlow360 Systems Dispatch</span>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-foreground font-mono">v2.4 Enterprise Release</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Engineered for deterministic Quote-to-Cash scale.
              </h3>

              <p className="text-sm leading-relaxed text-muted-foreground max-w-xl">
                Stay updated on algorithmic CPQ benchmarks, real-time inventory allocation architectures,
                and server-authoritative enterprise state patterns.
              </p>

              {/* Real-time Telemetry Metrics */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span>All Systems Operational (99.99% SLA)</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-3 py-1.5 text-muted-foreground">
                  <Activity className="h-3.5 w-3.5 text-sky-500" />
                  <span>API Telemetry: <strong className="text-foreground font-mono">&lt; 34ms</strong></span>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-3 py-1.5 text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>SOC-2 Type II Certified</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Subscription Box */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-elevation-1 sm:p-6">
              {isSubscribed ? (
                <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">You are subscribed!</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      You will receive our enterprise architectural updates and release changelogs.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsSubscribed(false)
                      setEmail('')
                    }}
                    className="text-xs mt-2"
                  >
                    Subscribe another email
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="footer-dispatch-email" className="text-xs font-semibold text-foreground">
                      Subscribe to Architecture Updates
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Monthly digest of ERP algorithms, zero spam, strictly technical.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="footer-dispatch-email"
                        type="email"
                        placeholder="engineering@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-9 text-xs h-10 bg-background"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubscribing}
                      className="h-10 px-5 text-xs font-semibold shrink-0 gap-1.5"
                    >
                      {isSubscribing ? 'Registering...' : 'Subscribe'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 pt-1">
                    <Lock className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span>Tenant-isolated communications. We respect enterprise data privacy.</span>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ─── 2. MAIN FIVE-COLUMN ENTERPRISE DIRECTORY ─── */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8 pb-14 border-b border-border">
          {/* Column 1: Brand & Enterprise Foundations */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group w-fit" aria-label="DealFlow360 Platform">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elevation-1 transition-transform group-hover:scale-105">
                <Layers3 className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
              </span>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground">
                  DealFlow<span className="text-primary">360</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground -mt-1">
                  Enterprise Platform
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-muted-foreground max-w-md">
              The server-authoritative enterprise platform harmonizing multi-tier CPQ, continuous margin floor controls,
              dynamic inventory allocations, and unified ledger reconciliation into one deterministic flow.
            </p>

            {/* Architectural Pillars / Trust Badges */}
            <div className="grid grid-cols-2 gap-2 pt-1 max-w-md">
              <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-surface-muted/40 p-2 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium text-foreground">Multi-Tenant RLS</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-surface-muted/40 p-2 text-xs">
                <Lock className="h-4 w-4 text-sky-500 shrink-0" />
                <span className="text-[11px] font-medium text-foreground">256-Bit TLS Cipher</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-surface-muted/40 p-2 text-xs">
                <Cpu className="h-4 w-4 text-indigo-500 shrink-0" />
                <span className="text-[11px] font-medium text-foreground">Authoritative State</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-surface-muted/40 p-2 text-xs">
                <Server className="h-4 w-4 text-purple-500 shrink-0" />
                <span className="text-[11px] font-medium text-foreground">Tamper-Proof Audit</span>
              </div>
            </div>

            {/* Social & Network Presence */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block">
                Network & Developer Hub
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to="/help"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  aria-label="Documentation"
                  title="Documentation & API"
                >
                  <Terminal className="h-4 w-4" />
                </Link>
                <Link
                  to="/help"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  aria-label="System Security"
                  title="Security Architecture"
                >
                  <Shield className="h-4 w-4" />
                </Link>
                <Link
                  to="/help"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  aria-label="Global Clusters"
                  title="Global Clusters & Status"
                >
                  <Globe className="h-4 w-4" />
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  aria-label="GitHub Repository"
                  title="Source & Integrations"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Platform Modules */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Platform Modules
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link to={getWorkspacePath('/sales/deals')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>CRM & Account Master</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </Link>
              </li>
              <li>
                <Link to={getWorkspacePath('/sales/quotations')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Algorithmic CPQ Engine</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </Link>
              </li>
              <li>
                <Link to={getWorkspacePath('/approvals')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Multi-Tier Approvals</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </Link>
              </li>
              <li>
                <Link to={getWorkspacePath('/operations')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Fulfillment & Allocation</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </Link>
              </li>
              <li>
                <Link to={getWorkspacePath('/operations')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Multi-Warehouse Stock</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </Link>
              </li>
              <li>
                <Link to={getWorkspacePath('/finance/dashboard')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Prorated Billing & Cash</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </Link>
              </li>
              <li>
                <Link to={getWorkspacePath('/intelligence')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>AI Deal Health & Risk</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </Link>
              </li>
              <li>
                <Link to={getWorkspacePath('/business-admin/audit')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Enterprise Audit Trail</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Role Workspaces */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Role Workspaces
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link to={getWorkspacePath('/sales/deals')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Sales Representative</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                </Link>
              </li>
              <li>
                <Link to={getWorkspacePath('/sales-manager/dashboard')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Sales Manager Console</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                </Link>
              </li>
              <li>
                <Link to={getWorkspacePath('/operations')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Operations & Logistics</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                </Link>
              </li>
              <li>
                <Link to={getWorkspacePath('/finance/dashboard')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Finance & Invoicing</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                </Link>
              </li>
              <li>
                <Link to={getWorkspacePath('/business-admin/dashboard')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Business Administrator</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                </Link>
              </li>
              <li>
                <Link to={getWorkspacePath('/customer-portal/dashboard')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Customer Experience Portal</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                </Link>
              </li>
              <li>
                <Link to={getWorkspacePath('/admin')} className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Platform Super Admin</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Page Navigation & Resources */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Landing Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              {navItems.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="hover:text-foreground transition-colors flex items-center justify-between group"
                  >
                    <span>{label}</span>
                    <Compass className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-500" />
                  </a>
                </li>
              ))}
              <li className="pt-2 border-t border-border/60">
                <Link to="/help" className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Documentation & API</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-foreground transition-colors flex items-center justify-between group">
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                </Link>
              </li>
              <li>
                <Link to="/register-company" className="hover:text-foreground transition-colors flex items-center justify-between group font-medium text-primary">
                  <span>Register New Tenant</span>
                  <Sparkles className="h-3 w-3 text-primary" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── 3. BOTTOM BAR: LEGAL, COPYRIGHT & BACK TO TOP ─── */}
        <div className="pt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between text-xs text-muted-foreground">
          {/* Left: Copyright & Operational Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="font-medium text-foreground">
              © {new Date().getFullYear()} DealFlow360 Platform Inc.
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="text-muted-foreground">
              Server-authoritative enterprise Quote-to-Cash & Supply Chain ERP.
            </span>
          </div>

          {/* Center: Legal & Security Links */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/help" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/help" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/help" className="hover:text-foreground transition-colors">
              Security Architecture
            </Link>
            <Link to="/help" className="hover:text-foreground transition-colors">
              SLA Commitment
            </Link>
            <Link to="/help" className="hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>

          {/* Right: Back to top & Health */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>99.99% Uptime</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={scrollToTop}
              className="h-8 px-3 text-xs gap-1.5 text-muted-foreground hover:text-foreground border-border/80"
              title="Scroll to top of page"
            >
              <span>Back to top</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
