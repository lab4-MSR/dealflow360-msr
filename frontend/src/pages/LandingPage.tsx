import { Link } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { ROLE_LABELS } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  TrendingUp,
  Layers,
  Truck,
  CreditCard,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  BarChart3,
  Percent,
  RefreshCw,
  Users,
} from 'lucide-react'

export function LandingPage() {
  const { user, getDashboardPath } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* ─── TOP NAVBAR ─── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold font-mono text-base shadow-sm">
              DF
            </div>
            <div>
              <span className="text-h3 font-bold tracking-tight text-foreground block leading-none">
                DealFlow<span className="text-primary">360</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold">
                Enterprise CPQ & Governance
              </span>
            </div>
          </Link>

          {/* Navigation links (desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-small font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Platform Features</a>
            <a href="#governance" className="hover:text-foreground transition-colors">Discount Governance</a>
            <a href="#fulfillment" className="hover:text-foreground transition-colors">Fulfillment & Billing</a>
            <a href="#roles" className="hover:text-foreground transition-colors">Role Workspaces</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild size="sm" className="shadow-sm">
                <Link to={getDashboardPath()} className="flex items-center gap-1.5 font-semibold">
                  <span>Enter Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login" className="font-medium text-muted-foreground hover:text-foreground">
                    Sign In
                  </Link>
                </Button>
                <Button asChild size="sm" className="shadow-sm">
                  <Link to="/register-company" className="flex items-center gap-1.5 font-semibold">
                    <Building2 className="h-4 w-4" />
                    <span>Register Company</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── AUTHENTICATED USER BANNER ─── */}
      {user && (
        <div className="bg-primary/10 border-b border-primary/20 py-2.5 px-4 text-center text-small font-medium text-foreground">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
            <span>
              Signed in as <strong className="font-semibold">{user.full_name}</strong> ({ROLE_LABELS[user.role] || user.role}) — {user.business_name || 'Organization Workspace'}
            </span>
            <Button size="sm" variant="outline" asChild className="h-7 text-xs border-primary/40 hover:bg-primary/20">
              <Link to={getDashboardPath()}>
                Go to Your Dashboard <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-caption font-semibold shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Generation Enterprise CPQ & Fulfillment Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
            Close Complex B2B Deals Faster with{' '}
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              Zero Margin Leakage
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            DealFlow360 unifies configure-price-quote, real-time discount governance, multi-warehouse allocation, and automated hybrid subscription billing into one deterministic, audit-compliant platform.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold shadow-md">
              <Link to="/register-company" className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span>Register Your Company</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-semibold">
              <Link to="/login" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Access Workspace / Sign In</span>
              </Link>
            </Button>
          </div>

          <p className="text-caption text-muted-foreground">
            No credit card required • Instant workspace setup • Multi-tenant enterprise security
          </p>

          {/* Key KPI Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs text-center space-y-1">
              <span className="text-3xl font-extrabold font-mono text-primary tabular-nums">99.8%</span>
              <p className="text-caption font-medium text-muted-foreground">Pricing & Tax Accuracy</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs text-center space-y-1">
              <span className="text-3xl font-extrabold font-mono text-success tabular-nums">3.4 hrs</span>
              <p className="text-caption font-medium text-muted-foreground">Avg Approval Turnaround</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs text-center space-y-1">
              <span className="text-3xl font-extrabold font-mono text-foreground tabular-nums">28.4%</span>
              <p className="text-caption font-medium text-muted-foreground">Protected Gross Margin</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs text-center space-y-1">
              <span className="text-3xl font-extrabold font-mono text-info tabular-nums">100%</span>
              <p className="text-caption font-medium text-muted-foreground">Immutable Audit Trail</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS: ONBOARD YOUR COMPANY ─── */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="font-mono text-caption">Getting Started</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Launch Your Company Workspace in 3 Simple Steps
            </h2>
            <p className="text-small text-muted-foreground max-w-2xl mx-auto">
              Get your entire sales, finance, and operations teams synchronized under one unified governance framework.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-3 relative">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center font-mono">
                01
              </div>
              <h3 className="text-base font-semibold text-foreground">Register Company</h3>
              <p className="text-small text-muted-foreground leading-relaxed">
                Provide your legal company name, industry, operating currency (INR ₹, USD $, EUR €), and provision your dedicated admin credentials.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-3 relative">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center font-mono">
                02
              </div>
              <h3 className="text-base font-semibold text-foreground">Set Governance Rules</h3>
              <p className="text-small text-muted-foreground leading-relaxed">
                Configure customer tier price lists, category discount ceilings, minimum profit margin thresholds, and multi-level manager approval chains.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-3 relative">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center font-mono">
                03
              </div>
              <h3 className="text-base font-semibold text-foreground">Quote & Fulfill</h3>
              <p className="text-small text-muted-foreground leading-relaxed">
                Empower your sales reps to build compliant quotes, manage customer negotiations, split-ship across warehouses, and automate billing.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Button asChild size="lg">
              <Link to="/register-company" className="flex items-center gap-2">
                <span>Start Company Registration Now</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── PLATFORM PILLARS ─── */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="font-mono text-caption text-primary border-primary/30">
              Core Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Engineered for Enterprise Commercial Precision
            </h2>
            <p className="text-small text-muted-foreground max-w-2xl mx-auto">
              Replace fragile spreadsheets and disjointed tools with one connected state machine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3.5 hover:border-primary/50 transition-colors shadow-xs">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Dynamic CPQ & Price Lists</h3>
              <p className="text-small text-muted-foreground leading-relaxed">
                Automated price list resolution by customer tier (Platinum, Gold, Silver), volume break tiers, and real-time margin calculations.
              </p>
            </div>

            {/* Feature 2 */}
            <div id="governance" className="rounded-2xl border border-border bg-card p-6 space-y-3.5 hover:border-primary/50 transition-colors shadow-xs">
              <div className="h-11 w-11 rounded-xl bg-warning-subtle/40 text-warning flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Discount Governance & Guardrails</h3>
              <p className="text-small text-muted-foreground leading-relaxed">
                Strict discount ceilings by customer tier and category with automated approval escalation and anti-self-dealing protections.
              </p>
            </div>

            {/* Feature 3 */}
            <div id="fulfillment" className="rounded-2xl border border-border bg-card p-6 space-y-3.5 hover:border-primary/50 transition-colors shadow-xs">
              <div className="h-11 w-11 rounded-xl bg-info-subtle/40 text-info flex items-center justify-center">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Multi-Warehouse Fulfillment</h3>
              <p className="text-small text-muted-foreground leading-relaxed">
                Smart inventory allocation across regional hubs with automated multi-warehouse split dispatch and backorder tracking.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3.5 hover:border-primary/50 transition-colors shadow-xs">
              <div className="h-11 w-11 rounded-xl bg-success-subtle/40 text-success flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Hybrid Invoicing & Subscriptions</h3>
              <p className="text-small text-muted-foreground leading-relaxed">
                Seamlessly combine one-time equipment orders with recurring SaaS subscriptions, automated proration, and payment reconciliation.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3.5 hover:border-primary/50 transition-colors shadow-xs">
              <div className="h-11 w-11 rounded-xl bg-danger-subtle/40 text-danger flex items-center justify-center">
                <HeartPulse className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Signal-Driven Deal Health</h3>
              <p className="text-small text-muted-foreground leading-relaxed">
                Real-time anomaly monitoring for stalled negotiations, margin compression, customer inactivity, and approval turnaround slippage.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3.5 hover:border-primary/50 transition-colors shadow-xs">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Multi-Tenant Air-Gapped Security</h3>
              <p className="text-small text-muted-foreground leading-relaxed">
                Customer Portal completely air-gapped from internal supplier costs, raw margins, and risk scores with automatic session memory purging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ROLE-BASED WORKSPACES ─── */}
      <section id="roles" className="py-16 bg-muted/20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Dedicated Workspaces for Every Enterprise Role
            </h2>
            <p className="text-small text-muted-foreground max-w-2xl mx-auto">
              DealFlow360 segregates visibility and functionality by business role so every team member operates with clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Sales Representative</Badge>
              </div>
              <p className="text-small text-muted-foreground">
                Build quotes with intelligent recommendations, track negotiations, and monitor individual pipeline performance.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="warning">Sales Manager</Badge>
              </div>
              <p className="text-small text-muted-foreground">
                Triage pending approvals, review discount ceiling diffs with anti-self-dealing guards, and oversee team deal health.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="info">Business Admin</Badge>
              </div>
              <p className="text-small text-muted-foreground">
                Establish customer tiers, price lists, warehouse routing priorities, and subscription billing cycle terms.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="success">Finance & Billing</Badge>
              </div>
              <p className="text-small text-muted-foreground">
                Audit invoices, reconcile partial and recurring payments, manage proration adjustments, and protect corporate margins.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Operations & Fulfillment</Badge>
              </div>
              <p className="text-small text-muted-foreground">
                Optimize stock allocations across multi-depot warehouses, handle split shipments, and track backorder fulfillment.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Customer Portal</Badge>
              </div>
              <p className="text-small text-muted-foreground">
                Review and accept quotations, submit counter-discount requests, track order shipments, and pay invoices online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA BANNER ─── */}
      <section className="py-20 border-t border-border bg-gradient-to-b from-card to-background">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Ready to Streamline Your B2B Sales Operations?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Join enterprise teams that trust DealFlow360 for error-free pricing, margin protection, and automated fulfillment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold shadow-md">
              <Link to="/register-company" className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span>Register Your Company</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-semibold">
              <Link to="/login">Sign In with Existing Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-10 bg-background text-caption text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
              DF
            </div>
            <span className="font-semibold text-foreground">DealFlow360 Enterprise CPQ</span>
            <span>•</span>
            <span>All rights reserved © 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link to="/register-company" className="hover:text-foreground transition-colors">Register Company</Link>
            <Link to="/customer-portal" className="hover:text-foreground transition-colors">Customer Portal</Link>
            <Link to="/help" className="hover:text-foreground transition-colors">Documentation</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
