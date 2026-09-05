import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useAuth } from '@/providers/AuthProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/common/BrandMark'
import {
  Activity, ArrowDown, ArrowRight, BarChart3, Boxes, BriefcaseBusiness, Check, ChevronRight,
  CircleDollarSign, ClipboardCheck, FileCheck2, Gauge, GitBranch, Layers3, LockKeyhole,
  Menu, Moon, PackageCheck, ReceiptText, RotateCcw, ShieldCheck, Sparkles, Sun, Truck,
  UsersRound, Warehouse, X, Zap, CheckCircle2, Clock, Sliders, AlertTriangle,
} from 'lucide-react'

const modules = [
  ['Customer & CRM', 'Customer records, contacts and account context', UsersRound],
  ['Deals', 'Pipeline, stages, owners and deal health', BriefcaseBusiness],
  ['Quotations', 'Line items, pricing, margin and versions', FileCheck2],
  ['Approvals', 'Rules, chains, decisions and escalation', ClipboardCheck],
  ['Fulfillment', 'Queue, allocation, processing and shipment readiness', PackageCheck],
  ['Inventory', 'On-hand, reserved, available and movements', Boxes],
  ['Warehouses', 'Capacity, stock health and fulfillment signals', Warehouse],
  ['Backorders', 'Exceptions, restock and re-fulfillment', RotateCcw],
  ['Billing', 'Invoices, payments and subscriptions', ReceiptText],
  ['Analytics', 'Revenue, margin, operations and executive insight', BarChart3],
  ['Deal Health', 'Risk signals, slippage and next actions', Activity],
  ['Audit & Governance', 'Permissions, tenant boundaries and traceability', ShieldCheck],
] as const

const roles = [
  ['Sales', 'Own the customer, deal and quotation journey.', 'Customer → Deal → Quote', BriefcaseBusiness],
  ['Sales Manager', 'Review approvals, team performance and deal health.', 'Approval → Decision → Coaching', ClipboardCheck],
  ['Operations', 'Execute inventory, allocation, fulfillment and shipping.', 'Order → Warehouse → Delivery', Truck],
  ['Finance', 'Review invoices, payments, margin and financial risk.', 'Quote → Billing → Cash', CircleDollarSign],
  ['Business Admin', 'Configure products, rules, pricing and tenant settings.', 'Rules → Controls → Governance', Gauge],
  ['Customer', 'Review quotes, orders, shipments and invoices.', 'Quote → Order → Service', UsersRound],
] as const

const lifecycle = ['Customer', 'Deal', 'Quotation', 'Approval', 'Order', 'Inventory', 'Fulfillment', 'Shipment', 'Delivery', 'Billing', 'Deal Health', 'Audit']
const navItems = [['architecture', 'Architecture'], ['modules', 'Platform'], ['roles', 'Teams'], ['operations', 'Operations'], ['governance', 'Trust']] as const

const reveal = (delay = 0) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.16 }, transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const } })

export function LandingPage() {
  const { user, getDashboardPath } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('architecture')
  const [heroTab, setHeroTab] = useState<'quote' | 'approval' | 'fulfillment' | 'risk'>('quote')
  const [demoDiscount, setDemoDiscount] = useState<number>(12)
  const reducedMotion = useReducedMotion()
  const enter = user ? getDashboardPath() : '/login'

  const baseValue = 1850000
  const discountAmount = (baseValue * demoDiscount) / 100
  const finalValue = Math.round(baseValue - discountAmount)
  const marginPercent = Math.max(12, Number((38.4 - demoDiscount * 0.85).toFixed(1)))
  const marginTier = demoDiscount <= 10 ? 'healthy' : demoDiscount <= 15 ? 'warning' : 'danger'

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-[1440px] rounded-2xl border border-border/80 bg-background/90 shadow-elevation-2 backdrop-blur-xl">
          <div className="flex h-[68px] items-center justify-between gap-3 px-3 sm:px-5">
            <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="DealFlow360 home"><BrandMark /><span className="hidden text-h3 tracking-tight sm:block">DealFlow<span className="text-primary">360</span></span></Link>
            <nav className="hidden items-center rounded-xl border border-border bg-surface-muted p-1 lg:flex" aria-label="Primary navigation">{navItems.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setActiveNav(id)} className={`relative rounded-lg px-3.5 py-2 text-small font-medium transition-colors ${activeNav === id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{activeNav === id && <motion.span layoutId="active-landing-nav" className="absolute inset-0 -z-0 rounded-lg bg-card shadow-elevation-1" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}<span className="relative z-10">{label}</span></a>)}</nav>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2"><button type="button" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="Toggle theme">{resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button><div className="hidden sm:block">{user ? <Button asChild size="sm"><Link to={enter}>Open workspace <ArrowRight className="ml-1 h-4 w-4" /></Link></Button> : <div className="flex items-center gap-1.5"><Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button><Button asChild size="sm"><Link to="/register-company">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link></Button></div>}</div><button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>
          </div>
          {mobileOpen && <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-border px-3 pb-3 pt-2 lg:hidden" aria-label="Mobile navigation"><div className="grid gap-1">{navItems.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => { setActiveNav(id); setMobileOpen(false) }} className={`rounded-lg px-3 py-3 text-small ${activeNav === id ? 'bg-primary-subtle font-medium text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>{label}</a>)}</div><div className="mt-2 border-t border-border pt-3">{user ? <Button asChild className="w-full"><Link to={enter}>Open workspace</Link></Button> : <div className="grid grid-cols-2 gap-2"><Button asChild variant="outline"><Link to="/login">Sign in</Link></Button><Button asChild><Link to="/register-company">Get started</Link></Button></div>}</div></motion.nav>}
        </div>
      </header>

      <main>
        {/* ─── REBUILT ENTERPRISE HERO SECTION ─── */}
        <section className="relative isolate overflow-hidden border-b border-border/80 bg-surface-muted/60">
          {/* Subtle architectural background grids & ambient light */}
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-70 [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_10%,black,transparent)]" />
          <motion.div
            className="pointer-events-none absolute -right-20 -top-20 -z-10 h-[580px] w-[580px] rounded-full bg-primary/20 blur-[130px]"
            animate={reducedMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.4, 0.65, 0.4] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute -left-20 top-1/3 -z-10 h-[480px] w-[480px] rounded-full bg-sky-500/15 blur-[120px]"
            animate={reducedMotion ? undefined : { scale: [1.1, 1, 1.1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="mx-auto grid min-h-[760px] max-w-[1440px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.08fr] lg:gap-14 lg:px-10 lg:py-24">
            {/* ─── LEFT: VALUE PROPOSITION & ACTIONS ─── */}
            <motion.div {...reveal()} className="flex flex-col">
              {/* Product Engine Announcement Pill */}
              <div className="mb-6 inline-flex w-fit items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur-md transition-all hover:border-primary/50">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>DealFlow360 v2.4 Engine</span>
                <span className="text-muted-foreground/60">•</span>
                <span className="font-medium text-foreground">Autonomous Quote-to-Cash</span>
                <ChevronRight className="h-3.5 w-3.5 text-primary/70" />
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl font-black leading-[1.06] tracking-tight sm:text-6xl lg:text-[68px]">
                Stop deal slippage.{' '}
                <span className="mt-1 block bg-gradient-to-r from-sky-400 via-primary to-indigo-500 bg-clip-text text-transparent">
                  Govern every quote to cash.
                </span>
              </h1>

              {/* Subheading */}
              <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
                Unite pipeline CRM, algorithmic discount rules, multi-tier approval chains, and multi-warehouse split fulfillment into one authoritative system of record.
              </p>

              {/* Primary Call to Actions */}
              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-xl bg-gradient-to-r from-sky-500 via-primary to-blue-600 px-7 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/40"
                >
                  <Link to={enter}>
                    {user ? 'Open Your Workspace' : 'Explore Platform Live'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-border bg-card/60 px-6 backdrop-blur-sm hover:bg-surface-muted"
                >
                  <a href="#architecture">
                    View Architecture
                    <ArrowDown className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>

              {/* Role-based 1-Click Interactive Test Drive */}
              <div className="mt-9 border-t border-border/80 pt-6">
                <p className="mb-3 flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  Explore by team role (1-click preview):
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Sales Rep', role: 'sales_rep', path: '/dashboard', icon: BriefcaseBusiness },
                    { label: 'Sales Manager', role: 'sales_manager', path: '/sales-manager/dashboard', icon: ClipboardCheck },
                    { label: 'Finance & Billing', role: 'finance', path: '/finance/dashboard', icon: CircleDollarSign },
                    { label: 'Operations', role: 'operations', path: '/operations', icon: Truck },
                    { label: 'Customer Portal', role: 'customer', path: '/customer-portal/dashboard', icon: UsersRound },
                  ].map((persona) => {
                    const PIcon = persona.icon
                    return (
                      <Link
                        key={persona.role}
                        to={user ? persona.path : `/login?returnTo=${encodeURIComponent(persona.path)}`}
                        className="group inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/75 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary-subtle"
                      >
                        <PIcon className="h-3.5 w-3.5 text-primary transition-transform group-hover:scale-110" />
                        <span>{persona.label}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-caption text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-success" /> Multi-Tenant RLS
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-success" /> Sub-Second Margin Check
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-success" /> Split Warehouse Routing
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-success" /> Audit-Proof Governance
                </span>
              </div>
            </motion.div>

            {/* ─── RIGHT: INTERACTIVE CONSOLE PRODUCT PREVIEW ─── */}
            <motion.div {...reveal(0.15)} className="relative">
              {/* Outer decorative halo borders */}
              <div className="absolute -inset-4 rounded-[2.25rem] border border-primary/15" />
              <div className="absolute -inset-8 rounded-[2.75rem] border border-primary/5" />

              {/* Floating Live Indicator Badges */}
              <motion.div
                className="absolute -top-4 -left-4 z-20 hidden sm:flex items-center gap-2 rounded-xl border border-primary/30 bg-card/90 px-3.5 py-2 shadow-elevation-3 backdrop-blur-md text-xs font-medium text-foreground"
                animate={reducedMotion ? undefined : { y: [-3, 3, -3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span>AI Margin Guard: <strong className="text-success font-semibold">+$64,200</strong> saved</span>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -right-4 z-20 hidden sm:flex items-center gap-2 rounded-xl border border-border bg-card/90 px-3.5 py-2 shadow-elevation-3 backdrop-blur-md text-xs font-medium text-foreground"
                animate={reducedMotion ? undefined : { y: [3, -3, 3] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>RLS Tenant Boundary: <strong className="text-foreground font-semibold">100% Isolated</strong></span>
              </motion.div>

              {/* Main Console Window */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-4">
                {/* Window Titlebar */}
                <div className="flex items-center justify-between border-b border-border/80 bg-surface-muted/80 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-[11px] text-muted-foreground hidden sm:inline">
                      dealflow360://quote/QT-2026-00482/governance
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-500 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      18ms P99
                    </span>
                  </div>
                </div>

                {/* Interactive Console Tabs */}
                <div className="flex border-b border-border bg-surface-muted/40 p-1.5 gap-1 overflow-x-auto text-xs">
                  {[
                    { id: 'quote', label: 'Quote & Margin', icon: FileCheck2 },
                    { id: 'approval', label: 'Approval Chain', icon: ClipboardCheck },
                    { id: 'fulfillment', label: 'Warehouse Split', icon: Warehouse },
                    { id: 'risk', label: 'Risk Radar', icon: Activity },
                  ].map((tab) => {
                    const TIcon = tab.icon
                    const isActive = heroTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setHeroTab(tab.id as typeof heroTab)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-card text-foreground shadow-elevation-1 border border-border/80 font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                        }`}
                      >
                        <TIcon className={`h-3.5 w-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Tab 1: Live Interactive Quotation & Discount Simulator */}
                {heroTab === 'quote' && (
                  <div className="p-4 sm:p-6 space-y-4">
                    {/* Deal Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-foreground">Hyperion Cloud Infra Refresh</h4>
                          <span className="font-mono text-caption text-primary bg-primary/10 px-2 py-0.5 rounded">v3</span>
                        </div>
                        <p className="text-caption text-muted-foreground mt-0.5">Customer: Hyperion Systems • Gold Tier Partner</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-caption font-medium px-2 py-1 rounded bg-secondary text-foreground">
                          QT-2026-00482
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Real-time Metric Cards */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="rounded-xl border border-border/80 bg-surface-muted/50 p-3">
                        <p className="text-[11px] text-muted-foreground">Deal Value</p>
                        <p className="text-base sm:text-lg font-bold tabular-nums text-foreground mt-0.5">
                          ${finalValue.toLocaleString()}
                        </p>
                        <span className="text-[10px] text-muted-foreground line-through">${baseValue.toLocaleString()}</span>
                      </div>

                      <div className="rounded-xl border border-border/80 bg-surface-muted/50 p-3">
                        <p className="text-[11px] text-muted-foreground">Gross Margin</p>
                        <p className={`text-base sm:text-lg font-bold tabular-nums mt-0.5 ${
                          marginTier === 'healthy' ? 'text-emerald-500' : marginTier === 'warning' ? 'text-amber-500' : 'text-rose-500'
                        }`}>
                          {marginPercent}%
                        </p>
                        <span className="text-[10px] text-muted-foreground">Min floor: 25.0%</span>
                      </div>

                      <div className="rounded-xl border border-border/80 bg-surface-muted/50 p-3">
                        <p className="text-[11px] text-muted-foreground">Risk Index</p>
                        <p className="text-base sm:text-lg font-bold tabular-nums text-emerald-500 mt-0.5">
                          {demoDiscount > 15 ? '58/100' : '14/100'}
                        </p>
                        <span className="text-[10px] text-muted-foreground">{demoDiscount > 15 ? 'Medium' : 'Low Risk'}</span>
                      </div>
                    </div>

                    {/* Interactive Discount Slider */}
                    <div className="rounded-xl border border-primary/20 bg-primary-subtle/30 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5 text-primary" />
                          Interactive Discount Slider:
                        </span>
                        <span className="font-mono font-bold text-sm text-primary px-2 py-0.5 rounded bg-primary/10">
                          {demoDiscount}% discount
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        step="1"
                        value={demoDiscount}
                        onChange={(e) => setDemoDiscount(Number(e.target.value))}
                        className="w-full h-1.5 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                        <span>0% (Full Price)</span>
                        <span>10% (Tier Ceiling)</span>
                        <span>15% (Manager Cap)</span>
                        <span>24% (VP Override)</span>
                      </div>

                      {/* Policy Enforcement Feedback */}
                      <div className={`mt-2 flex items-center gap-2 rounded-lg p-2 text-xs font-medium ${
                        marginTier === 'healthy'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : marginTier === 'warning'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}>
                        {marginTier === 'healthy' && (
                          <>
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span>Auto-Approved: Within Gold Tier 10% ceiling. No manual sign-off required.</span>
                          </>
                        )}
                        {marginTier === 'warning' && (
                          <>
                            <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                            <span>Policy Exception: Exceeds 10% Gold floor. Routed to Sales Manager Approval Inbox.</span>
                          </>
                        )}
                        {marginTier === 'danger' && (
                          <>
                            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                            <span>Executive Gate: Discount exceeds 15%. Dual VP Finance + Operations sign-off required.</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Sample Line Items */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Governed Line Items</p>
                      <div className="rounded-lg border border-border/80 divide-y divide-border/60 text-xs">
                        <div className="flex items-center justify-between p-2.5">
                          <div>
                            <p className="font-semibold text-foreground">Edge Compute Node Blade v4 (×20)</p>
                            <p className="text-[10px] text-muted-foreground">Category: Hardware • Floor Price $45,000</p>
                          </div>
                          <span className="font-mono font-medium tabular-nums text-foreground">$900,000</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5">
                          <div>
                            <p className="font-semibold text-foreground">High-Throughput NVMe SAN Array (×10)</p>
                            <p className="text-[10px] text-muted-foreground">Category: Storage • Floor Price $95,000</p>
                          </div>
                          <span className="font-mono font-medium tabular-nums text-foreground">$950,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Smart Multi-Tier Approval Chain */}
                {heroTab === 'approval' && (
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-border/70 pb-3">
                      <div>
                        <h4 className="font-bold text-base text-foreground">Sequential Approval Chain</h4>
                        <p className="text-caption text-muted-foreground">Rule: "Gold Tier &gt;10% Discount or Deal Value &gt;$1M"</p>
                      </div>
                      <span className="rounded-full bg-amber-500/10 text-amber-500 px-2.5 py-1 text-xs font-semibold border border-amber-500/20">
                        In Review (2/3)
                      </span>
                    </div>

                    <div className="space-y-3 pt-2">
                      {[
                        { step: 1, title: 'Commercial Policy Engine', status: 'Passed', actor: 'Automated Rule #R-104', time: 'Instant', state: 'done' },
                        { step: 2, title: 'Sales Director Sign-off', status: 'Approved', actor: 'Marcus Vance (Sales Director)', time: '14 min ago', state: 'done' },
                        { step: 3, title: 'VP Finance Commercial Review', status: 'Awaiting Decision', actor: 'Elena Rostova (Finance VP)', time: 'SLA: 1.2 hrs remaining', state: 'active' },
                        { step: 4, title: 'Order & Audit Immutability', status: 'Pending Prior', actor: 'Postgres Audit Chain', time: 'Queued', state: 'queued' },
                      ].map((s) => (
                        <div
                          key={s.step}
                          className={`flex items-start gap-3 rounded-xl border p-3 text-xs transition-all ${
                            s.state === 'active'
                              ? 'border-primary/50 bg-primary-subtle/30 shadow-sm'
                              : s.state === 'done'
                              ? 'border-border/80 bg-surface-muted/30'
                              : 'border-border/40 opacity-60'
                          }`}
                        >
                          <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-caption font-bold ${
                            s.state === 'done'
                              ? 'bg-emerald-500 text-white'
                              : s.state === 'active'
                              ? 'bg-primary text-primary-foreground animate-pulse'
                              : 'border border-border text-muted-foreground'
                          }`}>
                            {s.state === 'done' ? <Check className="h-3.5 w-3.5" /> : s.step}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-foreground truncate">{s.title}</p>
                              <span className={`text-[11px] font-medium ${
                                s.state === 'done' ? 'text-emerald-500' : s.state === 'active' ? 'text-amber-500' : 'text-muted-foreground'
                              }`}>
                                {s.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{s.actor} • {s.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 3: Split Warehouse Allocation */}
                {heroTab === 'fulfillment' && (
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-border/70 pb-3">
                      <div>
                        <h4 className="font-bold text-base text-foreground">Multi-Warehouse Allocation Engine</h4>
                        <p className="text-caption text-muted-foreground">Order split calculated to prevent backorders & minimize freight</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 text-emerald-500 px-2.5 py-1 text-xs font-semibold border border-emerald-500/20">
                        100% In-Stock
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="rounded-xl border border-border/80 bg-surface-muted/50 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                            <Warehouse className="h-3.5 w-3.5 text-primary" /> Chicago Hub (IL)
                          </span>
                          <span className="text-[11px] font-bold text-emerald-500">65% Allocated</span>
                        </div>
                        <p className="text-caption text-muted-foreground">13 Nodes • 7 SAN Units</p>
                        <div className="w-full bg-border rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full w-[65%]" />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Transit: 1 Business Day • Carrier: FedEx Freight</p>
                      </div>

                      <div className="rounded-xl border border-border/80 bg-surface-muted/50 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                            <Warehouse className="h-3.5 w-3.5 text-primary" /> Dallas Depot (TX)
                          </span>
                          <span className="text-[11px] font-bold text-emerald-500">35% Allocated</span>
                        </div>
                        <p className="text-caption text-muted-foreground">7 Nodes • 3 SAN Units</p>
                        <div className="w-full bg-border rounded-full h-1.5">
                          <div className="bg-sky-500 h-1.5 rounded-full w-[35%]" />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Transit: 2 Business Days • Carrier: UPS Freight</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <PackageCheck className="h-4 w-4 text-emerald-500" />
                        <span>Fulfillment Optimization Result:</span>
                      </div>
                      <strong className="font-semibold text-emerald-500">$12,400 Freight Saved • 0 Backorders</strong>
                    </div>
                  </div>
                )}

                {/* Tab 4: Blended Risk Radar */}
                {heroTab === 'risk' && (
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-border/70 pb-3">
                      <div>
                        <h4 className="font-bold text-base text-foreground">Blended Risk Intelligence</h4>
                        <p className="text-caption text-muted-foreground">Composite score synthesized across 4 core risk vectors</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 text-emerald-500 px-2.5 py-1 text-xs font-semibold border border-emerald-500/20">
                        Score: 16/100 (Safe)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {[
                        { label: 'Customer Credit Health', val: '94/100', status: 'Prime', bar: 94, color: 'bg-emerald-500' },
                        { label: 'Margin Preservation', val: '86/100', status: 'Healthy', bar: 86, color: 'bg-emerald-500' },
                        { label: 'Delivery Feasibility', val: '98/100', status: 'Optimal', bar: 98, color: 'bg-emerald-500' },
                        { label: 'Discount Drift Risk', val: '12/100', status: 'Low Risk', bar: 12, color: 'bg-emerald-500' },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-border/80 bg-surface-muted/40 p-3 space-y-1.5 text-xs">
                          <p className="text-muted-foreground text-[11px] truncate">{item.label}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-foreground">{item.val}</span>
                            <span className="text-[10px] font-semibold text-emerald-500">{item.status}</span>
                          </div>
                          <div className="w-full bg-border rounded-full h-1">
                            <div className={`${item.color} h-1 rounded-full`} style={{ width: `${item.bar}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-intelligence/30 bg-intelligence-subtle/40 p-3 text-xs flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 text-intelligence shrink-0 mt-0.5" />
                      <p className="text-muted-foreground text-caption leading-relaxed">
                        <strong className="text-foreground font-semibold">Upsell Opportunity Detected:</strong> Customer purchase history matches Enterprise 3-Year Care bundle. Attaching bundle increases margin from 32% to 37.8%.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
        {/* ─── END REBUILT HERO SECTION ─── */}

        <motion.section {...reveal()} id="architecture" className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28"><div className="text-center"><p className="text-label uppercase tracking-[0.2em] text-primary">The product architecture</p><h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">A 360° view of the commercial and operational system.</h2><p className="mx-auto mt-5 max-w-2xl text-body leading-7 text-muted-foreground">Every domain has a focused workspace. Shared entities and authoritative state connect the work across teams.</p></div><div className="relative mx-auto mt-14 max-w-5xl"><div className="absolute left-1/2 top-1/2 hidden h-px w-[75%] -translate-x-1/2 bg-border lg:block" /><div className="absolute left-1/2 top-1/2 hidden h-[75%] w-px -translate-x-1/2 -translate-y-1/2 bg-border lg:block" /><motion.div animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute left-1/2 top-1/2 hidden h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/20 lg:block" /><div className="relative z-10 mx-auto flex h-36 w-36 flex-col items-center justify-center rounded-full border-2 border-primary/40 bg-card text-center shadow-elevation-3"><Layers3 className="h-7 w-7 text-primary" /><span className="mt-2 text-small font-bold">DealFlow360</span><span className="text-[10px] text-muted-foreground">system of record</span></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:absolute lg:inset-0 lg:mt-0">{[['Commercial', 'Customers · Deals · Quotes', BriefcaseBusiness, 'lg:-translate-x-8 lg:-translate-y-24'], ['Decisioning', 'Approvals · Margin · Health', GitBranch, 'lg:translate-x-8 lg:-translate-y-24'], ['Execution', 'Inventory · Fulfillment · Shipping', Truck, 'lg:-translate-x-8 lg:translate-y-24'], ['Control', 'Billing · Analytics · Audit', ShieldCheck, 'lg:translate-x-8 lg:translate-y-24']].map(([title, text, Icon, position]) => <motion.div key={String(title)} whileHover={reducedMotion ? undefined : { y: -5 }} className={`rounded-xl border border-border bg-card p-4 shadow-elevation-1 lg:absolute lg:w-64 ${position}`}><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary"><Icon className="h-4 w-4" /></span><div><p className="text-small font-semibold">{String(title)}</p><p className="mt-0.5 text-caption text-muted-foreground">{String(text)}</p></div></div></motion.div>)}</div></div></motion.section>

        <section id="modules" className="border-y border-border bg-surface-muted"><div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28"><motion.div {...reveal()} className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-label uppercase tracking-[0.2em] text-primary">Complete product structure</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">The workspaces behind every outcome.</h2></div><p className="max-w-md text-body leading-7 text-muted-foreground">Explore the full platform surface—from the first customer interaction to the last audit event.</p></motion.div><div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{modules.map(([title, text, Icon], index) => <motion.article {...reveal(index * 0.035)} key={title} whileHover={reducedMotion ? undefined : { y: -4 }} className="group rounded-xl border border-border bg-card p-5 shadow-elevation-1 transition-shadow hover:border-primary/40 hover:shadow-elevation-2"><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle text-primary"><Icon className="h-5 w-5" /></span><span className="font-mono text-caption text-muted-foreground">{String(index + 1).padStart(2, '0')}</span></div><h3 className="mt-5 text-h3">{title}</h3><p className="mt-2 min-h-10 text-body-small leading-6 text-muted-foreground">{text}</p><div className="mt-5 flex items-center text-small font-medium text-primary">Open domain <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></div></motion.article>)}</div></div></section>

        <section id="roles" className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28"><motion.div {...reveal()}><p className="text-label uppercase tracking-[0.2em] text-primary">Role-based workspaces</p><h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">One platform. Different teams. Shared truth.</h2><p className="mt-5 max-w-2xl text-body leading-7 text-muted-foreground">Each role gets the right queue, decision context and action surface without losing the connected record.</p></motion.div><div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{roles.map(([title, text, flow, Icon], index) => <motion.div {...reveal(index * 0.05)} whileHover={reducedMotion ? undefined : { scale: 1.015 }} key={title} className="flex gap-4 rounded-xl border border-border bg-card p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary"><Icon className="h-5 w-5" /></span><div><h3 className="text-h3">{title}</h3><p className="mt-1 text-body-small leading-6 text-muted-foreground">{text}</p><p className="mt-4 flex items-center gap-1 font-mono text-caption text-primary">{flow} <ChevronRight className="h-3 w-3" /></p></div></motion.div>)}</div></section>

        <section id="operations" className="border-y border-border bg-slate-950 text-slate-50"><div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:px-10 lg:py-28"><motion.div {...reveal()}><p className="text-label uppercase tracking-[0.2em] text-sky-400">Operations execution layer</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">From confirmed order to delivered promise.</h2><p className="mt-5 max-w-xl text-body leading-7 text-slate-300">Inventory validation, warehouse allocation, partial fulfillment, backorders, shipment tracking and delivery status live in one operational chain.</p><Button asChild variant="secondary" className="mt-8"><Link to={user ? '/operations' : '/login'}>Explore Operations <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></motion.div><motion.div {...reveal(0.15)} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-2xl sm:p-8"><div className="mb-7 flex items-center justify-between"><span className="text-small font-semibold">Operational lifecycle</span><span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-caption text-emerald-300">server-authoritative</span></div><div className="flex flex-wrap gap-2">{lifecycle.map((item, index) => <motion.div key={item} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="flex items-center gap-2"><span className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-small text-slate-200">{item}</span>{index < lifecycle.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-sky-400" />}</motion.div>)}</div><div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-slate-700 bg-slate-800/70 p-4"><Boxes className="h-4 w-4 text-sky-400" /><p className="mt-3 text-small font-semibold">Inventory truth</p><p className="mt-1 text-caption text-slate-400">On hand · reserved · available</p></div><div className="rounded-lg border border-slate-700 bg-slate-800/70 p-4"><Truck className="h-4 w-4 text-amber-400" /><p className="mt-3 text-small font-semibold">Execution state</p><p className="mt-1 text-caption text-slate-400">Allocation · shipment · delivery</p></div><div className="rounded-lg border border-slate-700 bg-slate-800/70 p-4"><Activity className="h-4 w-4 text-emerald-400" /><p className="mt-3 text-small font-semibold">Exception control</p><p className="mt-1 text-caption text-slate-400">Backorder · delay · audit</p></div></div></motion.div></div></section>

        <section id="governance" className="mx-auto grid max-w-[1440px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-28"><motion.div {...reveal()}><p className="text-label uppercase tracking-[0.2em] text-primary">Control plane</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Built to be trusted with the important parts.</h2><p className="mt-5 max-w-xl text-body leading-7 text-muted-foreground">DealFlow360 treats authorization, tenant context, calculated state and audit history as product foundations—not afterthoughts.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{[['Tenant isolation', 'Every operational query is scoped to authenticated business context.', LockKeyhole], ['RBAC', 'Permissions shape actions while backend authorization remains authoritative.', UsersRound], ['Audit trail', 'Mutations preserve actor, timestamp, reason and before/after context.', ShieldCheck], ['Analytics integrity', 'Aggregate metrics distinguish orders, quantities, shipments and revenue.', BarChart3]].map(([title, text, Icon]) => <div key={String(title)} className="rounded-xl border border-border bg-card p-4"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-small font-semibold">{String(title)}</p><p className="mt-1 text-caption leading-5 text-muted-foreground">{String(text)}</p></div>)}</div></motion.div><motion.div {...reveal(0.15)} className="relative rounded-2xl border border-border bg-card p-7 shadow-elevation-3"><div className="absolute right-7 top-7 flex h-12 w-12 items-center justify-center rounded-xl bg-success-subtle text-success"><ShieldCheck className="h-6 w-6" /></div><p className="font-mono text-caption text-primary">SYSTEM PRINCIPLES</p><h3 className="mt-4 max-w-sm text-2xl font-bold">A clear boundary between what the UI shows and what the domain decides.</h3><div className="mt-8 space-y-4">{['The backend validates every state transition.', 'The frontend exposes current state and next valid action.', 'Unavailable integrations remain visible as explicit boundaries.', 'Every operational mutation is designed to be traceable.'].map((item, index) => <div key={item} className="flex gap-3 border-t border-border pt-4 text-body-small"><span className="font-mono text-caption text-muted-foreground">0{index + 1}</span><span>{item}</span></div>)}</div></motion.div></section>

        <section className="border-t border-primary/20 bg-primary text-primary-foreground"><div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-24"><div><p className="text-label uppercase tracking-[0.2em] text-primary-foreground/70">See the whole system</p><h2 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Turn disconnected work into one confident flow.</h2><p className="mt-4 max-w-2xl text-body leading-7 text-primary-foreground/75">Start with the workspace that matters most, then connect the rest of the lifecycle as your operating model grows.</p></div><Button asChild size="lg" variant="secondary" className="shrink-0"><Link to={user ? enter : '/register-company'}>{user ? 'Open workspace' : 'Create your workspace'} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div></section>
      </main>

      <footer className="border-t border-border bg-card"><div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-8 text-caption text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10"><div className="flex items-center gap-2"><BrandMark /><span>DealFlow360</span></div><div className="flex flex-wrap gap-x-5 gap-y-2"><a href="#architecture" className="hover:text-foreground">Architecture</a><a href="#modules" className="hover:text-foreground">Modules</a><a href="#operations" className="hover:text-foreground">Operations</a><a href="#governance" className="hover:text-foreground">Governance</a></div><span>© {new Date().getFullYear()} DealFlow360</span></div></footer>
    </div>
  )
}
