import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useAuth } from '@/providers/AuthProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/common/BrandMark'
import {
  Activity, ArrowDown, ArrowRight, BarChart3, Boxes, BriefcaseBusiness, Check, ChevronRight,
  IndianRupee, ClipboardCheck, FileCheck2, Gauge, GitBranch, Layers3, LockKeyhole,
  Menu, Moon, PackageCheck, ReceiptText, RotateCcw, ShieldCheck, Sparkles, Sun, Truck,
  UsersRound, Warehouse, X, Zap, CheckCircle2, Clock, Sliders, AlertTriangle,
  Play, Pause, ChevronLeft, Compass, Workflow, RefreshCw,
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
  ['Finance', 'Review invoices, payments, margin and financial risk.', 'Quote → Billing → Cash', IndianRupee],
  ['Business Admin', 'Configure products, rules, pricing and tenant settings.', 'Rules → Controls → Governance', Gauge],
  ['Customer', 'Review quotes, orders, shipments and invoices.', 'Quote → Order → Service', UsersRound],
] as const

const lifecycle = ['Customer', 'Deal', 'Quotation', 'Approval', 'Order', 'Inventory', 'Fulfillment', 'Shipment', 'Delivery', 'Billing', 'Deal Health', 'Audit']
const navItems = [['architecture', '360° View'], ['modules', 'Platform'], ['roles', 'Teams'], ['operations', 'Operations'], ['governance', 'Trust']] as const

const vectors360 = [
  {
    id: 'crm',
    number: '01',
    category: 'Commercial & Accounts',
    title: 'Customer Master & Pipeline Health',
    shortTitle: 'CRM & Pipeline',
    tagline: 'Buying committees, multi-contact hierarchies & real-time pipeline velocity',
    description: 'Brings enterprise account hierarchies, stakeholder buying groups, and continuous stage health into one authoritative system, preventing disjointed sales communication.',
    icon: UsersRound,
    color: 'text-blue-500',
    borderColor: 'border-blue-500/30',
    bgBadge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    metrics: [
      { label: 'Active Pipeline', value: '$48.5M', delta: '+14% MoM' },
      { label: 'Account Health', value: '98.4%', delta: 'Prime Tier' },
      { label: 'Committee Reach', value: '6.2 avg', delta: 'Multi-threaded' },
    ],
    handshake: {
      inbound: 'Lead Intake & Account Mapping',
      core: 'Account Hierarchy & Stage Telemetry',
      outbound: 'Algorithmic CPQ & Quotations',
    },
    guardrail: 'Strict tenant isolation (business_id) with verified credit status check before deal progression.',
    tables: ['customers', 'deals', 'contacts', 'activities'],
    role: 'Account Executive / Sales Rep',
    path: '/sales/deals',
  },
  {
    id: 'cpq',
    number: '02',
    category: 'Algorithmic CPQ',
    title: 'Dynamic CPQ & Margin Floor Engine',
    shortTitle: 'CPQ & Pricing',
    tagline: 'Multi-tier price books, volume breaks & automated margin preservation',
    description: 'Instantly calculates line items across complex product matrices, volume tiers, and customer tier ceilings while strictly enforcing unit price floors in sub-second response times.',
    icon: FileCheck2,
    color: 'text-indigo-500',
    borderColor: 'border-indigo-500/30',
    bgBadge: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    metrics: [
      { label: 'Quote Speed', value: '< 1.2s', delta: 'Sub-second' },
      { label: 'Realized Margin', value: '38.4%', delta: 'Floor Guarded' },
      { label: 'Active Rules', value: '142 Rules', delta: 'Auto-applied' },
    ],
    handshake: {
      inbound: 'Deal Line Selection & Quantities',
      core: 'Tier Ceilings & Floor Price Engine',
      outbound: 'Multi-Tier Policy Approval Gate',
    },
    guardrail: 'Absolute unit cost floor protection. Any proposed discount exceeding tier ceiling triggers automatic governance.',
    tables: ['quotations', 'quotation_lines', 'price_lists', 'discount_rules'],
    role: 'Sales Rep / Pricing Specialist',
    path: '/sales/quotations',
  },
  {
    id: 'approvals',
    number: '03',
    category: 'Governance & Gate',
    title: 'Autonomous Policy & Escalation Gate',
    shortTitle: 'Multi-Tier Approvals',
    tagline: 'Sequential approval chains, threshold SLAs & non-bypassable controls',
    description: 'Evaluates quotation discounts, margin exceptions, and deal value thresholds. Routes token sequentially across Sales Manager, Director, and VP Finance without bypass risk.',
    icon: ClipboardCheck,
    color: 'text-amber-500',
    borderColor: 'border-amber-500/30',
    bgBadge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    metrics: [
      { label: 'Median Turnaround', value: '4.2 min', delta: '-68% faster' },
      { label: 'SLA Adherence', value: '99.4%', delta: 'Real-time timer' },
      { label: 'Unauthorized Bypass', value: '$0.00', delta: '100% Enforced' },
    ],
    handshake: {
      inbound: 'Simulated Discount & Quote Submission',
      core: 'Multi-Tier Progressive Role SLA Chain',
      outbound: 'Customer Negotiation Portal',
    },
    guardrail: 'Progressive level advancement: Sales Manager sign-off automatically advances token to Finance when discount > 15%.',
    tables: ['approval_rules', 'approval_chains', 'approval_instances'],
    role: 'Sales Manager / VP Finance',
    path: '/sales-manager/approvals',
  },
  {
    id: 'portal',
    number: '04',
    category: 'Customer Collaboration',
    title: 'Customer Digital Negotiation Portal',
    shortTitle: 'Customer Portal',
    tagline: 'Transparent quote reviews, counter-offers & bilateral acceptance',
    description: 'Empowers enterprise buyers with self-service quote inspection, structured counter-offer submissions, and real-time order and shipment tracking with cryptographic verification.',
    icon: Sparkles,
    color: 'text-violet-500',
    borderColor: 'border-violet-500/30',
    bgBadge: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    metrics: [
      { label: 'Closing Speed', value: '+2.8x', delta: 'Same-day close' },
      { label: 'Counter Acceptance', value: '74.2%', delta: 'High conversion' },
      { label: 'Buyer Satisfaction', value: '4.9 / 5.0', delta: 'Self-service' },
    ],
    handshake: {
      inbound: 'Approved Quotation Token',
      core: 'Bilateral Counter-Offer & e-Sign',
      outbound: 'Order Locking & Fulfillment',
    },
    guardrail: 'Customer modifications create versioned counter-offers and re-trigger margin checks without loss of prior states.',
    tables: ['portal_users', 'quotations', 'counter_offers', 'customer_sessions'],
    role: 'Enterprise Buyer / Procurement Lead',
    path: '/customer-portal/dashboard',
  },
  {
    id: 'fulfillment',
    number: '05',
    category: 'Operations & Stock',
    title: 'Split Fulfillment & Multi-Warehouse',
    shortTitle: 'Warehouse Split',
    tagline: 'Multi-hub inventory reservations, split shipping & zero backorders',
    description: 'Analyzes inventory across regional fulfillment centers, splits lines to optimize shipping distance and freight cost, and triggers backorder replenishment automatically.',
    icon: PackageCheck,
    color: 'text-emerald-500',
    borderColor: 'border-emerald-500/30',
    bgBadge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    metrics: [
      { label: 'Stock Truth Accuracy', value: '99.9%', delta: 'Real-time locks' },
      { label: 'Dispatch Speed', value: '< 4.5 hrs', delta: 'Same-day pick' },
      { label: 'Freight Savings', value: '18.6%', delta: 'Split optimization' },
    ],
    handshake: {
      inbound: 'Confirmed Order Event',
      core: 'Warehouse Allocation & Waybill Generation',
      outbound: 'Carrier Transit & Invoicing',
    },
    guardrail: 'Transactional stock reservations prevent phantom inventory allocation and concurrent race conditions.',
    tables: ['warehouses', 'inventory_items', 'fulfillment_orders', 'shipments'],
    role: 'Operations Director / Warehouse Mgr',
    path: '/operations',
  },
  {
    id: 'billing',
    number: '06',
    category: 'Finance & Ledger',
    title: 'Hybrid Invoicing & Proration Engine',
    shortTitle: 'Billing & Cash',
    tagline: 'Milestone invoicing, prorated renewals & automated ledger sync',
    description: 'Harmonizes one-time physical equipment sales with recurring subscription billing into a unified invoice ledger with mathematical proration precision down to the penny.',
    icon: ReceiptText,
    color: 'text-sky-500',
    borderColor: 'border-sky-500/30',
    bgBadge: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    glowColor: 'rgba(14, 165, 233, 0.35)',
    metrics: [
      { label: 'Reconciliation', value: '100%', delta: 'Automated' },
      { label: 'DSO Reduction', value: '-14 Days', delta: 'Faster collection' },
      { label: 'Proration Delta', value: '$0.00', delta: 'Exact penny math' },
    ],
    handshake: {
      inbound: 'Delivery Verification Event',
      core: 'Prorated Billing Schedule & Invoicing',
      outbound: 'General Ledger & Revenue BI',
    },
    guardrail: 'Invoices generated only upon delivery confirmation or automated recurring billing cycle execution.',
    tables: ['invoices', 'subscriptions', 'payments', 'proration_rules'],
    role: 'Finance Controller / Billing Analyst',
    path: '/finance/dashboard',
  },
  {
    id: 'intelligence',
    number: '07',
    category: 'AI & Intelligence',
    title: 'Deal Health & Predictive AI Radar',
    shortTitle: 'Deal Health AI',
    tagline: 'Predictive win probability, discount drift radar & expansion signals',
    description: 'Continuously synthesizes commercial velocity, margin compression, inventory latency, and buyer touchpoints into an authoritative 0-100 Deal Health score.',
    icon: Activity,
    color: 'text-pink-500',
    borderColor: 'border-pink-500/30',
    bgBadge: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    glowColor: 'rgba(236, 72, 153, 0.35)',
    metrics: [
      { label: 'Forecast Accuracy', value: '92.4%', delta: 'AI-Calibrated' },
      { label: 'At-Risk Deal Saves', value: '$3.8M', delta: 'Proactive alerts' },
      { label: 'Expansion Attached', value: '+22.4%', delta: 'Cross-sell AI' },
    ],
    handshake: {
      inbound: 'Full Operational Telemetry Stream',
      core: 'Composite Health Score & Risk Synthesis',
      outbound: 'Executive BI & Rep Action Alerts',
    },
    guardrail: 'Deals with Health score < 40 trigger automated manager notification and mitigation checklist.',
    tables: ['deal_health_scores', 'recommendations', 'risk_signals'],
    role: 'Chief Revenue Officer / VP Sales',
    path: '/sales/deals',
  },
  {
    id: 'governance',
    number: '08',
    category: 'Control & Trust',
    title: 'Enterprise Audit & Tenant Isolation',
    shortTitle: 'Immutable Audit',
    tagline: 'Cryptographic event logging, actor attribution & strict row-level security',
    description: 'Guarantees that every commercial mutation, discount override, warehouse split, and invoice mutation is permanently captured in an append-only audit trail.',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    borderColor: 'border-emerald-500/30',
    bgBadge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    metrics: [
      { label: 'Audit Immutability', value: '100%', delta: 'Tamper-proof' },
      { label: 'Tenant Isolation', value: 'Row-Level', delta: 'Multi-tenant RLS' },
      { label: 'Compliance Posture', value: 'SOC2 Ready', delta: 'Continuous' },
    ],
    handshake: {
      inbound: 'Every Backend Service Mutation',
      core: 'Append-Only Actor & Before/After Diff',
      outbound: 'Security SIEM & Compliance Hub',
    },
    guardrail: 'Immutable audit logs with user ID, IP address, timestamp, and json diff preserved indefinitely.',
    tables: ['audit_logs', 'tenants', 'roles', 'permissions'],
    role: 'Business Admin / Security Officer',
    path: '/business-admin/audit',
  },
] as const

const reveal = (delay = 0) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.16 }, transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const } })

export function LandingPage() {
  const { user, getDashboardPath } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('architecture')
  const [heroTab, setHeroTab] = useState<'quote' | 'approval' | 'fulfillment' | 'risk'>('quote')
  const [demoDiscount, setDemoDiscount] = useState<number>(12)
  const [activeVectorIndex, setActiveVectorIndex] = useState<number>(0)
  const [isTourPlaying, setIsTourPlaying] = useState<boolean>(false)

  useEffect(() => {
    if (!isTourPlaying) return
    const interval = setInterval(() => {
      setActiveVectorIndex((prev) => (prev + 1) % vectors360.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [isTourPlaying])
  const reducedMotion = useReducedMotion()
  const enter = user ? getDashboardPath() : '/login'
  const activeVector = vectors360[activeVectorIndex] ?? vectors360[0]

  const baseValue = 1850000
  const discountAmount = (baseValue * demoDiscount) / 100
  const finalValue = Math.round(baseValue - discountAmount)
  const marginPercent = Math.max(12, Number((38.4 - demoDiscount * 0.85).toFixed(1)))
  const marginTier = demoDiscount <= 10 ? 'healthy' : demoDiscount <= 15 ? 'warning' : 'danger'

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-[1440px] rounded-2xl border border-border/80 bg-background/90 shadow-elevation-2 backdrop-blur-xl">
          <div className="flex h-[68px] items-center justify-between gap-3 px-3 sm:px-5">
            <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="DealFlow360 home"><BrandMark /><span className="hidden text-h3 tracking-tight sm:block">DealFlow<span className="text-primary">360</span></span></Link>
            <nav className="hidden items-center rounded-xl border border-border bg-surface-muted p-1 lg:flex" aria-label="Primary navigation">{navItems.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setActiveNav(id)} className={`relative rounded-lg px-3.5 py-2 text-small font-medium transition-colors ${activeNav === id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{activeNav === id && <motion.span layoutId="active-landing-nav" className="absolute inset-0 -z-0 rounded-lg bg-card shadow-elevation-1" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}<span className="relative z-10">{label}</span></a>)}</nav>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2"><button type="button" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="Toggle theme">{resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button><div className="hidden sm:block">{user ? <Button asChild size="sm"><Link to={enter}>Open workspace <ArrowRight className="ml-1 h-4 w-4" /></Link></Button> : <div className="flex items-center gap-1.5"><Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button><Button asChild size="sm"><Link to="/register-company">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link></Button></div>}</div><button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>
          </div>
          {mobileOpen && <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-border px-3 pb-3 pt-2 lg:hidden" aria-label="Mobile navigation"><div className="grid gap-1">{navItems.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => { setActiveNav(id); setMobileOpen(false) }} className={`rounded-lg px-3 py-3 text-small ${activeNav === id ? 'bg-primary-subtle font-medium text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>{label}</a>)}</div><div className="mt-2 border-t border-border pt-3">{user ? <Button asChild className="w-full"><Link to={enter}>Open workspace</Link></Button> : <div className="grid grid-cols-2 gap-2"><Button asChild variant="outline"><Link to="/login">Sign in</Link></Button><Button asChild><Link to="/register-company">Get started</Link></Button></div>}</div></motion.nav>}
        </div>
      </header>

      <main className="pt-[84px]">
        {/* ─── REBUILT ENTERPRISE HERO SECTION ─── */}
        <section className="relative isolate overflow-hidden border-b border-border/80 bg-surface-muted/60">

          <div className="mx-auto grid min-h-[620px] max-w-[1440px] items-center gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:px-10 lg:py-12">
            {/* ─── LEFT: VALUE PROPOSITION & ACTIONS ─── */}
            <motion.div {...reveal()} className="flex flex-col">
              {/* Product Engine Announcement Pill */}
              <div className="mb-6 inline-flex w-fit items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur-md transition-all hover:border-primary/50">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>Connected quote-to-cash workspace</span>
                <span className="text-muted-foreground/60">•</span>
                <span className="font-medium text-foreground">Commercial + Operations</span>
                <ChevronRight className="h-3.5 w-3.5 text-primary/70" />
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl font-black leading-[1.06] tracking-tight sm:text-6xl lg:text-[68px]">
                Turn commercial decisions into{' '}
                <span className="mt-1 block text-primary">
                  controlled execution.
                </span>
              </h1>

              {/* Subheading */}
              <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
                Bring customers, deals, quotations, approvals, inventory, fulfillment, billing and analytics into one authoritative system of record.
              </p>

              {/* Primary Call to Actions */}
              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-xl bg-primary px-7 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:bg-primary-hover hover:shadow-primary/40"
                >
                  <Link to={enter}>
                    {user ? 'Open your workspace' : 'Explore the platform'}
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
                    See the product flow
                    <ArrowDown className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>

              {/* Role-based 1-Click Interactive Test Drive */}
              <div className="mt-9 border-t border-border/80 pt-6">
                <p className="mb-3 flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  Explore the platform by role:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Sales Rep', role: 'sales_rep', path: '/dashboard', icon: BriefcaseBusiness },
                    { label: 'Sales Manager', role: 'sales_manager', path: '/sales-manager/dashboard', icon: ClipboardCheck },
                    { label: 'Finance & Billing', role: 'finance', path: '/finance/dashboard', icon: IndianRupee },
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
                  <Check className="h-3.5 w-3.5 text-success" /> Tenant-scoped access
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-success" /> Backend-authoritative state
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-success" /> Role-aware actions
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-success" /> Traceable audit history
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
                <span>Live domain preview: <strong className="text-success font-semibold">quotation</strong></span>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -right-4 z-20 hidden sm:flex items-center gap-2 rounded-xl border border-border bg-card/90 px-3.5 py-2 shadow-elevation-3 backdrop-blur-md text-xs font-medium text-foreground"
                animate={reducedMotion ? undefined : { y: [3, -3, 3] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>State boundary: <strong className="text-foreground font-semibold">server validated</strong></span>
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
                      illustrative quote workspace / governance
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-500 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      product preview
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
                          ₹{finalValue.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] text-muted-foreground line-through">₹{baseValue.toLocaleString('en-IN')}</span>
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
                            <p className="text-[10px] text-muted-foreground">Category: Hardware • Floor Price ₹45,000</p>
                          </div>
                          <span className="font-mono font-medium tabular-nums text-foreground">₹9,00,000</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5">
                          <div>
                            <p className="font-semibold text-foreground">High-Throughput NVMe SAN Array (×10)</p>
                            <p className="text-[10px] text-muted-foreground">Category: Storage • Floor Price ₹95,000</p>
                          </div>
                          <span className="font-mono font-medium tabular-nums text-foreground">₹9,50,000</span>
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
                        <p className="text-caption text-muted-foreground">Rule: "Gold Tier &gt;10% Discount or Deal Value &gt;₹1 Cr"</p>
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
                      <strong className="font-semibold text-emerald-500">₹12,400 Freight Saved • 0 Backorders</strong>
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

        {/* ─── FLAGSHIP 360° OPERATIONAL ARCHITECTURE & RADAR ─── */}
        <section id="architecture" className="relative isolate overflow-hidden border-b border-border bg-surface-muted/30 py-20 sm:py-28 lg:py-32">
          {/* Subtle ambient gradient */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(59,130,246,0.06),transparent)]" />

          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            {/* Header */}
            <motion.div {...reveal()} className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur-md mb-4">
                <Compass className="h-3.5 w-3.5" />
                <span>DealFlow 360° Operational Engine</span>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-foreground">Continuous Flywheel</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                A true 360° view across your enterprise deal lifecycle.
              </h2>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
                Every department operates with targeted clarity, while every order, discount, stock reservation, and billing event remains locked to a single, server-authoritative source of truth.
              </p>
            </motion.div>

            {/* Quick Interactive 360 Flywheel Controls & Segment Bar */}
            <motion.div {...reveal(0.1)} className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-card/85 p-3.5 shadow-elevation-1 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant={isTourPlaying ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsTourPlaying(!isTourPlaying)}
                  className="rounded-xl font-semibold gap-2 transition-all cursor-pointer"
                >
                  {isTourPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5 text-primary-foreground" />
                      <span>Pause 360° Tour</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 text-primary" />
                      <span>Start 360° Deal Journey</span>
                    </>
                  )}
                </Button>
                <span className="hidden md:inline font-mono text-xs text-muted-foreground">
                  Active Domain: <strong className="text-foreground font-semibold">Sector {activeVector.number} · {activeVector.shortTitle}</strong>
                </span>
              </div>

              {/* Segmented Step Selector */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
                {vectors360.map((v, idx) => {
                  const isCur = activeVectorIndex === idx
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setActiveVectorIndex(idx)
                        setIsTourPlaying(false)
                      }}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        isCur
                          ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      <span className="font-mono text-[10px] opacity-80">{v.number}</span>
                      <span>{v.shortTitle}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>

            {/* Main Interactive 360° Arena */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left: The 360° Orbital Wheel Canvas */}
              <motion.div {...reveal(0.15)} className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative flex aspect-square w-full max-w-[460px] items-center justify-center p-3 sm:p-5">
                  {/* Outer ambient glow */}
                  <div
                    className="absolute inset-6 rounded-full blur-3xl opacity-25 transition-all duration-700 pointer-events-none"
                    style={{ backgroundColor: activeVector.glowColor }}
                  />

                  {/* Outer SVG Orbit Tracks & Connector Beams */}
                  <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 460 460">
                    {/* Outer orbit circle */}
                    <circle
                      cx="230"
                      cy="230"
                      r="175"
                      className="stroke-border/70 fill-none"
                      strokeWidth="1.5"
                      strokeDasharray="4 6"
                    />
                    {/* Secondary inner ring */}
                    <circle
                      cx="230"
                      cy="230"
                      r="115"
                      className="stroke-border/40 fill-none"
                      strokeWidth="1"
                    />

                    {/* Radiating tracks to all 8 nodes */}
                    {vectors360.map((v, i) => {
                      const angle = (i * 45 - 90) * (Math.PI / 180)
                      const x = 230 + 175 * Math.cos(angle)
                      const y = 230 + 175 * Math.sin(angle)
                      const isCur = activeVectorIndex === i
                      return (
                        <g key={v.id}>
                          <line
                            x1="230"
                            y1="230"
                            x2={x}
                            y2={y}
                            stroke={isCur ? 'currentColor' : 'currentColor'}
                            className={`transition-all duration-500 ${isCur ? 'text-primary stroke-2 opacity-90' : 'text-border/50 stroke-1 opacity-30'}`}
                            strokeDasharray={isCur ? undefined : '3 4'}
                          />
                          {isCur && (
                            <circle
                              cx={x}
                              cy={y}
                              r="22"
                              className="fill-primary/15 stroke-primary/50 animate-pulse"
                              strokeWidth="2"
                            />
                          )}
                        </g>
                      )
                    })}
                  </svg>

                  {/* Central System Hub */}
                  <div className="relative z-10 flex h-36 w-36 sm:h-40 sm:w-40 flex-col items-center justify-center rounded-full border-2 border-primary/40 bg-card/95 p-3 text-center shadow-elevation-4 backdrop-blur-xl">
                    <motion.div
                      animate={reducedMotion ? undefined : { rotate: 360 }}
                      transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                      className="absolute -inset-2 rounded-full border border-dashed border-primary/30 pointer-events-none"
                    />

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elevation-1">
                      <Layers3 className="h-4.5 w-4.5" />
                    </div>

                    <span className="mt-1.5 text-xs font-black tracking-tight text-foreground">DealFlow<span className="text-primary">360</span></span>

                    <div className="mt-1 flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-500 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>{isTourPlaying ? 'TOUR ACTIVE' : '360° SYNCED'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsTourPlaying(!isTourPlaying)}
                      className="mt-1.5 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {isTourPlaying ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5 text-primary" />}
                      <span>{isTourPlaying ? 'Pause' : 'Auto tour'}</span>
                    </button>
                  </div>

                  {/* 8 Radial Interactive Nodes */}
                  {vectors360.map((v, i) => {
                    const angle = (i * 45 - 90) * (Math.PI / 180)
                    const left = 50 + 38 * Math.cos(angle)
                    const top = 50 + 38 * Math.sin(angle)
                    const isCur = activeVectorIndex === i
                    const VIcon = v.icon

                    return (
                      <div
                        key={v.id}
                        style={{ left: `${left}%`, top: `${top}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveVectorIndex(i)
                            setIsTourPlaying(false)
                          }}
                          onMouseEnter={() => {
                            if (!isTourPlaying) setActiveVectorIndex(i)
                          }}
                          className={`group relative flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer ${
                            isCur
                              ? 'scale-120 bg-card border-primary text-primary shadow-elevation-4 ring-4 ring-primary/20'
                              : 'scale-100 bg-card/90 border-border text-muted-foreground hover:scale-110 hover:border-primary/50 hover:text-foreground shadow-elevation-1'
                          }`}
                          aria-label={v.title}
                        >
                          <VIcon className="h-5 w-5 transition-transform group-hover:scale-110" />

                          {/* Node Number Badge */}
                          <span className={`absolute -top-1.5 -right-1.5 flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center rounded-full font-mono text-[9px] font-bold ${
                            isCur ? 'bg-primary text-primary-foreground' : 'bg-surface-muted text-muted-foreground border border-border'
                          }`}>
                            {v.number}
                          </span>
                        </button>

                        {/* Compact Label */}
                        <div className={`mt-1 text-center transition-all ${isCur ? 'opacity-100 font-bold' : 'opacity-70 font-medium'}`}>
                          <span className={`rounded-md px-1.5 py-0.5 text-[9px] sm:text-[10px] whitespace-nowrap ${
                            isCur ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground'
                          }`}>
                            {v.shortTitle}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Right: The Deep Domain Inspector Console */}
              <motion.div {...reveal(0.2)} className="lg:col-span-7">
                <div className="rounded-3xl border border-border bg-card/95 p-6 sm:p-8 shadow-elevation-3 relative overflow-hidden backdrop-blur-md">
                  {/* Top Accent Bar */}
                  <div
                    className="absolute top-0 inset-x-0 h-1.5 transition-all duration-500"
                    style={{ backgroundColor: activeVector.glowColor }}
                  />

                  {/* Header: Sector ID & Navigation */}
                  <div className="flex items-center justify-between gap-3 border-b border-border/80 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                        SECTOR {activeVector.number} OF {vectors360.length}
                      </span>
                      <span className="font-mono text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {activeVector.category}
                      </span>
                    </div>

                    {/* Stepper Buttons */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg cursor-pointer"
                        aria-label="Previous domain"
                        onClick={() => {
                          setActiveVectorIndex((prev) => (prev - 1 + vectors360.length) % vectors360.length)
                          setIsTourPlaying(false)
                        }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg cursor-pointer"
                        aria-label="Next domain"
                        onClick={() => {
                          setActiveVectorIndex((prev) => (prev + 1) % vectors360.length)
                          setIsTourPlaying(false)
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activeVector.bgBadge}`}>
                        <activeVector.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                          {activeVector.title}
                        </h3>
                        <p className="text-caption font-medium text-primary">
                          {activeVector.tagline}
                        </p>
                      </div>
                    </div>
                    <p className="text-body-small leading-relaxed text-muted-foreground pt-1">
                      {activeVector.description}
                    </p>
                  </div>

                  {/* 3 Real-time KPI Metric Telemetry Cards */}
                  <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
                    {activeVector.metrics.map((m) => (
                      <div key={m.label} className="rounded-xl border border-border/80 bg-surface-muted/50 p-3 sm:p-3.5 space-y-1">
                        <p className="text-[11px] text-muted-foreground truncate">{m.label}</p>
                        <p className="text-base sm:text-xl font-bold text-foreground tabular-nums">{m.value}</p>
                        <span className="inline-block text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {m.delta}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Continuous 360° Data Handshake Bridge */}
                  <div className="mt-6 rounded-2xl border border-border/80 bg-surface-muted/30 p-4 space-y-2.5">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Workflow className="h-3.5 w-3.5 text-primary" />
                      Continuous 360° Data Handshake:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center text-xs">
                      <div className="rounded-lg border border-border/70 bg-card p-2.5">
                        <span className="block text-[10px] text-muted-foreground uppercase font-mono">Inbound Stream</span>
                        <span className="font-semibold text-foreground mt-0.5 block">{activeVector.handshake.inbound}</span>
                      </div>
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5 text-primary">
                        <span className="block text-[10px] uppercase font-mono">Core Processing</span>
                        <span className="font-semibold mt-0.5 block">{activeVector.handshake.core}</span>
                      </div>
                      <div className="rounded-lg border border-border/70 bg-card p-2.5">
                        <span className="block text-[10px] text-muted-foreground uppercase font-mono">Outbound Target</span>
                        <span className="font-semibold text-foreground mt-0.5 block">{activeVector.handshake.outbound}</span>
                      </div>
                    </div>
                  </div>

                  {/* Guaranteed Domain Guardrail */}
                  <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3.5 flex items-start gap-3 text-xs">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Enforced Domain Guardrail</span>
                      <p className="text-muted-foreground leading-relaxed mt-0.5 text-caption">
                        {activeVector.guardrail}
                      </p>
                    </div>
                  </div>

                  {/* Authoritative Entities & Role Action Footer */}
                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/80 pt-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[11px] text-muted-foreground mr-1">Tables:</span>
                      {activeVector.tables.map((t) => (
                        <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border/60">
                          {t}
                        </span>
                      ))}
                    </div>

                    <Button asChild size="sm" className="rounded-xl font-semibold gap-1.5 shrink-0">
                      <Link to={user ? activeVector.path : `/login?returnTo=${encodeURIComponent(activeVector.path)}`}>
                        <span>Explore {activeVector.shortTitle}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom 360° Continuous Flow Tape */}
            <motion.div {...reveal(0.25)} className="mt-12 rounded-2xl border border-border bg-card/75 p-4 sm:p-6 shadow-elevation-1 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <span className="text-small font-bold text-foreground">Continuous Flywheel Lifecycle Tape</span>
                </div>
                <span className="font-mono text-caption text-muted-foreground hidden sm:inline">Click any phase to inspect vector</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {vectors360.map((v, idx) => {
                  const isCur = activeVectorIndex === idx
                  const FIcon = v.icon
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setActiveVectorIndex(idx)
                        setIsTourPlaying(false)
                      }}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isCur
                          ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20'
                          : 'border-border/60 bg-surface-muted/30 hover:bg-surface-muted hover:border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono text-[10px] font-bold text-muted-foreground">{v.number}</span>
                        <FIcon className={`h-3.5 w-3.5 ${isCur ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <p className={`mt-2 text-xs font-semibold truncate w-full ${isCur ? 'text-primary' : 'text-foreground'}`}>
                        {v.shortTitle}
                      </p>
                      <span className="text-[10px] text-muted-foreground truncate w-full mt-0.5">
                        {v.category}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>

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
