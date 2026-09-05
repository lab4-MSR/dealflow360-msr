import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Grid3X3,
  FolderTree,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Layers3,
  ShieldCheck,
  Building2,
  UsersRound,
  FileCheck2,
  BriefcaseBusiness,
  ClipboardCheck,
  ReceiptText,
  PackageCheck,
  Sparkles,
  BarChart3,
  Sliders,
  ExternalLink,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Lock,
  Cpu,
  RefreshCw,
  Warehouse,
  Truck,
  DollarSign,
  HeartPulse,
  Scale,
} from 'lucide-react'

export interface PillarSubCategory {
  title: string
  items: string[]
}

export interface ProductPillar {
  code: string
  title: string
  subtitle: string
  category: 'Commercial' | 'Operations' | 'Finance' | 'Intelligence' | 'Governance' | 'Core'
  badge: string
  role: string
  icon: any
  accent: {
    text: string
    border: string
    bg: string
    badge: string
    indicator: string
  }
  description: string
  route: string
  metrics: { label: string; value: string }[]
  subCategories: PillarSubCategory[]
  keyFeatures: string[]
}

export const PRODUCT_PILLARS: ProductPillar[] = [
  {
    code: '00',
    title: 'Public & Authentication',
    subtitle: 'Zero-Trust Identity, Onboarding & Resilient Routing',
    category: 'Core',
    badge: 'Security Perimeter',
    role: 'Public / Guest & Invited Users',
    icon: Lock,
    accent: {
      text: 'text-slate-600 dark:text-slate-300',
      border: 'border-slate-300 dark:border-slate-700',
      bg: 'bg-slate-500/10',
      badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
      indicator: 'bg-slate-500',
    },
    description: 'Enterprise entry gate supporting secure authentication, invite-based onboarding, company registrations, password lifecycle management, and graceful error containment.',
    route: '/login',
    metrics: [
      { label: 'Auth Handshake', value: 'JWT & Cookies' },
      { label: 'Role Pre-Routing', value: 'Instant' },
      { label: 'Resilience', value: '403/404/500 Guarded' },
    ],
    subCategories: [
      {
        title: 'Authentication & Recovery',
        items: ['Landing Experience', 'Secure Sign-In', 'Forgot Password', 'Password Reset Token'],
      },
      {
        title: 'Tenant Onboarding',
        items: ['Accept Invitation Flow', 'Email Verification Handshake', 'Company Self-Registration'],
      },
      {
        title: 'Error Boundaries',
        items: ['403 Unauthorized Interceptor', '404 Dynamic Route Catch', 'System Error Boundary'],
      },
    ],
    keyFeatures: ['Demo Account Quick-Switcher', 'Scoped Cookie Storage', 'Multi-tenant Route Gate'],
  },
  {
    code: '01',
    title: 'Super Admin / Platform',
    subtitle: 'Multi-Tenant Orchestration & Global Infrastructure',
    category: 'Governance',
    badge: 'Multi-Tenant Control',
    role: 'Super Admin',
    icon: Building2,
    accent: {
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
      badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      indicator: 'bg-purple-500',
    },
    description: 'Global control plane for multi-business provisioning, 8-dimensional tenant diagnostics, cross-business revenue rollups, and system-wide health and audit logging.',
    route: '/platform/dashboard',
    metrics: [
      { label: 'Tenant Deep Dive', value: '8 Sub-Tabs' },
      { label: 'Isolation', value: 'Row-Level RLS' },
      { label: 'Platform Scope', value: 'Global Cross-Tenant' },
    ],
    subCategories: [
      {
        title: 'Business Management',
        items: ['All Businesses Directory', 'Create New Tenant', 'Tenant Provisioning Engine'],
      },
      {
        title: '8-Tab Business Dossier',
        items: ['Overview KPI', 'Tenant Users', 'Deal Pipeline', 'Revenue Ledger', 'Usage Telemetry', 'Health Scorecard', 'Feature Config', 'Audit Activity'],
      },
      {
        title: 'Platform Infrastructure',
        items: ['Platform User Directory', 'Invite Global User', 'Platform Analytics', 'Global Audit Trail', 'System Health Telemetry', 'Platform Global Settings'],
      },
    ],
    keyFeatures: ['Cross-tenant Revenue Aggregates', 'Tenant Health Monitor', 'Runtime Feature Toggles'],
  },
  {
    code: '02',
    title: 'Business Admin & Master Data',
    subtitle: 'Enterprise Governance, Master Catalogs & Policy Engines',
    category: 'Governance',
    badge: 'Command Engine',
    role: 'Business Admin',
    icon: ShieldCheck,
    accent: {
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-500/10',
      badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      indicator: 'bg-indigo-500',
    },
    description: 'The operational command backbone. Governs organizational profile, custom RBAC permissions, product & price lists, discount simulator, approval chain thresholds, multi-warehouse shipping rules, and subscriptions.',
    route: '/business-admin/dashboard',
    metrics: [
      { label: 'Policy Engines', value: 'Discounts & Approvals' },
      { label: 'Master Catalogs', value: 'Price Lists & Warehouses' },
      { label: 'Simulation', value: 'Rule Sandbox' },
    ],
    subCategories: [
      {
        title: 'Organization & Identity',
        items: ['Company Profile', 'White-Label Branding', 'Localization Matrix', 'Currency & Tax Rules', 'Business Settings'],
      },
      {
        title: 'Users & Permissions',
        items: ['Users List', 'User Details', 'Invite User', 'Teams Management', 'Role Directory', 'Granular Permissions Grid'],
      },
      {
        title: 'Customer Master 360',
        items: ['Customer List', 'Create Customer', '7-Tab Customer Dossier (Overview, Contacts, Deals, Orders, Billing, Purchase History, Activity)'],
      },
      {
        title: 'Product & Pricing Catalogs',
        items: ['Product Directory', 'Create Product', '5-Tab Product Details', 'Category Management', 'Price Lists', 'Customer Pricing Tiers', 'Volume Tier Rules', 'Pricing History'],
      },
      {
        title: 'Governance & Logic Engines',
        items: ['Discount Rules Matrix', 'Discount Simulator Sandbox', 'Approval Chains & Thresholds', 'Approval Simulator', 'Warehouse Network & Shipping Rules', 'Subscription Plans & Proration Rules'],
      },
    ],
    keyFeatures: ['Interactive Discount Simulator', 'Visual Approval Hierarchy', 'Automated Proration Logic'],
  },
  {
    code: '03',
    title: 'Commercial CPQ & Sales',
    subtitle: 'Velocity Pipeline, Algorithmic CPQ & 12-Section Quote Dossier',
    category: 'Commercial',
    badge: 'Revenue Engine',
    role: 'Sales Rep / Account Executive',
    icon: FileCheck2,
    accent: {
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      indicator: 'bg-blue-500',
    },
    description: 'Empowers sales teams with an algorithmic quotation builder that enforces margin floors in real time, generates versioned quotes, and presents a complete 12-section commercial dossier.',
    route: '/sales/quotations',
    metrics: [
      { label: 'Quote Dossier', value: '12 Deep Sections' },
      { label: 'Floor Guard', value: 'Margin Protected' },
      { label: 'Quote Speed', value: '< 1.2s' },
    ],
    subCategories: [
      {
        title: 'CRM & Pipeline',
        items: ['Sales Dashboard', 'My Accounts & Customers', 'My Active Deals', 'Deal Milestone Timeline', 'Deal Health Telemetry'],
      },
      {
        title: 'Algorithmic Quotation Engine',
        items: ['All Quotations Directory', 'Create Quotation Wizard', 'Interactive Quotation Builder', 'Version Comparison (v1-v3)'],
      },
      {
        title: '12-Section Quotation Dossier',
        items: [
          '1. Overview Summary',
          '2. Line Items & SKUs',
          '3. Pricing Breakdown',
          '4. Discount Analysis',
          '5. Gross Margin Guard',
          '6. Multivariate Risk Radar',
          '7. AI Recommendations',
          '8. Approval Escalation',
          '9. Customer Negotiation',
          '10. Warehouse Fulfillment',
          '11. Billing Ledger',
          '12. Cryptographic Audit',
        ],
      },
    ],
    keyFeatures: ['12-Section Comprehensive Dossier', 'Automatic Price Floor Checks', 'Real-Time Margin Drift Alerts'],
  },
  {
    code: '04',
    title: 'Sales Manager Command',
    subtitle: 'Delegated Approval Center, SLA Enforcement & Team Quotas',
    category: 'Commercial',
    badge: 'Supervision & SLAs',
    role: 'Sales Manager / Regional Director',
    icon: ClipboardCheck,
    accent: {
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      indicator: 'bg-amber-500',
    },
    description: 'Supervisory cockpit for sequential quote approvals, SLA countdown trackers, team-wide deal oversight, quota progress, and performance intelligence.',
    route: '/sales-manager/dashboard',
    metrics: [
      { label: 'SLA Tracking', value: 'Active Countdowns' },
      { label: 'Decisions', value: 'Approve / Return / Reject' },
      { label: 'Team Insights', value: 'Rep Leaderboard' },
    ],
    subCategories: [
      {
        title: 'Approval Center',
        items: ['Approval Priority Inbox', 'Sequential Approval Details View', 'Decision Modals (Approve / Return / Reject)', 'Approval History Log'],
      },
      {
        title: 'Team Pipeline Oversight',
        items: ['Team Deals Directory', 'Team Deal Details Inspection', 'Cross-Rep Deal Timelines', 'Team Performance Analytics'],
      },
      {
        title: 'Health & Reporting',
        items: ['Manager Deal Health Monitor', 'Stalled Deal Interventions', 'Executive Sales Reports Hub'],
      },
    ],
    keyFeatures: ['SLA Breach Countdown Timers', 'Multi-Tier Escalation Support', 'Discount Override Reason Tracking'],
  },
  {
    code: '05',
    title: 'Finance & Billing Ledger',
    subtitle: 'Milestone Invoicing, Exact Proration & Revenue Assurance',
    category: 'Finance',
    badge: 'Revenue Ledger',
    role: 'Finance Controller / Billing Specialist',
    icon: ReceiptText,
    accent: {
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      indicator: 'bg-emerald-500',
    },
    description: 'Unifies one-time physical order billing and recurring subscription invoicing. Enforces CFO margin reviews, manages dunning on failed payments, and delivers penny-exact proration math.',
    route: '/finance/dashboard',
    metrics: [
      { label: 'Proration Math', value: 'Exact to the Penny' },
      { label: 'Invoicing', value: 'Tax Compliant GST/VAT' },
      { label: 'Risk Control', value: 'High-Risk Deal Queue' },
    ],
    subCategories: [
      {
        title: 'Financial Approval Queue',
        items: ['High Risk Commercial Deals', 'Margin Threshold Reviews', 'CFO Override Authorization'],
      },
      {
        title: 'Billing & Invoicing',
        items: ['Billing Overview & KPIs', 'Tax Invoices Directory', 'Dedicated Invoice Details & PDF Engine', 'Payment Processing Ledger', 'Failed Payment Dunning Queue'],
      },
      {
        title: 'Subscription Ledgers',
        items: ['Active Subscriptions Master', 'Subscription Details & Seat Allocation', 'Proration & Mid-Term Adjustments', 'Renewal Calendars'],
      },
      {
        title: 'Intelligence & Audit',
        items: ['Revenue Analytics (MRR/ARR/DSO)', 'Financial Audit Trail Events'],
      },
    ],
    keyFeatures: ['Automated Tax Invoicing', 'Failed Payment Auto-Retry Schedules', 'Real-time MRR/ARR Telemetry'],
  },
  {
    code: '06',
    title: 'Operations & Smart Fulfillment',
    subtitle: 'Zero-Backorder Split Allocation & Multi-Warehouse Control',
    category: 'Operations',
    badge: 'Logistics Core',
    role: 'Operations Lead / Warehouse Director',
    icon: PackageCheck,
    accent: {
      text: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-500/30',
      bg: 'bg-sky-500/10',
      badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      indicator: 'bg-sky-500',
    },
    description: 'Server-authoritative operations hub. Calculates optimal split shipments across regional warehouses to eliminate stockouts, manage backorder queues, and track carrier logistics.',
    route: '/operations',
    metrics: [
      { label: 'Allocation Engine', value: 'Smart Multi-Hub Split' },
      { label: 'Inventory Truth', value: 'On-Hand & Reserved' },
      { label: 'Carrier Feeds', value: 'Live Milestone Sync' },
    ],
    subCategories: [
      {
        title: 'Fulfillment Execution',
        items: ['Priority Fulfillment Queue', 'Fulfillment Order Details', 'Shipment Packing Details', 'Line Reconciliation'],
      },
      {
        title: 'Warehouse & Stock',
        items: ['Warehouse Network Overview', 'Inventory Levels & Reorder Triggers', 'Immutable Stock Movements Ledger', 'Order Split Allocation Workspace'],
      },
      {
        title: 'Exceptions & Logistics',
        items: ['Backorder Priority Queue', 'Backorder Restock Details & Consolidation', 'Shipment Live Tracking', 'Operations Throughput Analytics'],
      },
    ],
    keyFeatures: ['Algorithmic Warehouse Split Recommendations', 'Transaction-Safe Stock Locks', 'Consolidated Restock Triggers'],
  },
  {
    code: '07',
    title: 'Intelligence & Decision AI',
    subtitle: 'Predictive Deal Health, Anomaly Radar & Recommendation Engine',
    category: 'Intelligence',
    badge: 'Predictive AI',
    role: 'Chief Revenue Officer / Strategy Director',
    icon: Sparkles,
    accent: {
      text: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-500/30',
      bg: 'bg-pink-500/10',
      badge: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
      indicator: 'bg-pink-500',
    },
    description: 'Synthesizes commercial velocity, margin erosion, delivery feasibility, and customer creditworthiness into continuous 0–100 Deal Health scores, proactive upsell bundles, and risk signals.',
    route: '/intelligence',
    metrics: [
      { label: 'Deal Health Index', value: '0–100 Composite' },
      { label: 'Anomaly Radar', value: 'Discount & Delivery' },
      { label: 'Attach AI', value: '+22% Bundle Uplift' },
    ],
    subCategories: [
      {
        title: 'AI Command Center',
        items: ['Intelligence Dashboard', 'Decision Insights Feed', 'Executive Risk Overview'],
      },
      {
        title: 'Multivariate Risk Center',
        items: ['Risk Score Overview', 'High-Risk Deals Filter', 'Risk Vector Details & Mitigations'],
      },
      {
        title: 'Growth & Recommendations',
        items: ['AI Upsell Recommendations', 'Cross-Sell Bundles', 'Recommendation Details & Attach Engine'],
      },
      {
        title: 'Deal Health Telemetry',
        items: ['Health Score Overview', 'Stalled Deals Radar', 'Discount Anomaly Detection', 'Delivery Slippage Warnings'],
      },
    ],
    keyFeatures: ['Early Warning Slippage Radar', 'Discount Drift Anomaly Alerts', 'Automated Bundle Prescriptions'],
  },
  {
    code: '08',
    title: 'Customer Negotiation Portal',
    subtitle: 'Bilateral Quote Review, Counter-Offers & Order Tracking',
    category: 'Commercial',
    badge: 'Buyer Self-Service',
    role: 'Enterprise Buyer / Customer Procurement',
    icon: UsersRound,
    accent: {
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-500/30',
      bg: 'bg-violet-500/10',
      badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      indicator: 'bg-violet-500',
    },
    description: 'A modern, dedicated self-service portal giving enterprise buyers complete transparency: review quotes, propose structured counter-offers, e-accept agreements, and track orders.',
    route: '/customer-portal/dashboard',
    metrics: [
      { label: 'Negotiation', value: 'Bilateral Counter-Offers' },
      { label: 'Buyer Autonomy', value: 'Self-Service Tracking' },
      { label: 'Closing Speed', value: '2.8x Faster' },
    ],
    subCategories: [
      {
        title: 'Buyer Command',
        items: ['Customer Dashboard', 'Active Quotations Overview', 'Quotation Deep Details View'],
      },
      {
        title: 'Digital Negotiation',
        items: ['Interactive Review Quote', 'Structured Request Changes Form', 'Dynamic Counter-Offer Builder with Instant Delta'],
      },
      {
        title: 'Orders & Logistics',
        items: ['My Orders List', 'Order Details with Milestones', 'Shipments List', 'Live Shipment Carrier Tracking'],
      },
      {
        title: 'Billing & Account',
        items: ['Customer Invoices & Receipt Details', 'My Active Subscriptions', 'Customer Profile', 'Company Details & Tax IDs', 'Commercial Preferences'],
      },
    ],
    keyFeatures: ['Instant Counter-Offer Math', 'Live Carrier Tracking Map', 'Dedicated Customer Layout'],
  },
  {
    code: '09',
    title: 'Analytics & Business Intelligence',
    subtitle: '9 Executive Dashboards, Margin Diagnostics & Custom Reports',
    category: 'Intelligence',
    badge: 'Enterprise BI',
    role: 'Executive Leadership / BI Analyst',
    icon: BarChart3,
    accent: {
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/10',
      badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      indicator: 'bg-cyan-500',
    },
    description: 'Comprehensive business intelligence across 9 specialized dashboards: track realized margin, discount drift, approval cycle velocity, warehouse throughput, and custom report builders.',
    route: '/analytics/executive',
    metrics: [
      { label: 'Specialized BI', value: '9 Executive Views' },
      { label: 'Reporting', value: 'Custom Report Hub' },
      { label: 'Telemetry', value: 'Time-Series Analysis' },
    ],
    subCategories: [
      {
        title: 'Executive & Commercial BI',
        items: ['Executive Command Dashboard', 'Sales Pipeline & Velocity Analytics', 'Revenue Growth (MRR/ARR/Cohort)'],
      },
      {
        title: 'Margin & Policy Analytics',
        items: ['Discount Drift Analytics', 'Realized Gross Margin Analytics', 'Approval Velocity & SLA Analytics'],
      },
      {
        title: 'Fulfillment & Subscription BI',
        items: ['Fulfillment & Warehouse Throughput', 'Subscription Retention & LTV', 'Custom Reports Hub Builder'],
      },
    ],
    keyFeatures: ['Interactive Chart Drilldowns', 'Cohort Retention Graphs', 'CSV & JSON Data Exports'],
  },
  {
    code: '10',
    title: 'Shared Platform & Core Utilities',
    subtitle: 'Omni-Search Ctrl+K, Central Notification Hub & User State',
    category: 'Core',
    badge: 'Shared Infrastructure',
    role: 'All Authenticated Users',
    icon: Sliders,
    accent: {
      text: 'text-teal-600 dark:text-teal-400',
      border: 'border-teal-500/30',
      bg: 'bg-teal-500/10',
      badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      indicator: 'bg-teal-500',
    },
    description: 'The glue tying the platform together: instant global search accessible anywhere via Ctrl+K, notification dispatch center, personalized preference engines, and contextual help desk.',
    route: '/search',
    metrics: [
      { label: 'Omni-Search', value: 'Ctrl+K Activated' },
      { label: 'Notifications', value: 'Real-Time Dispatch' },
      { label: 'Theme Support', value: 'Dark / Light / System' },
    ],
    subCategories: [
      {
        title: 'Discovery & Telemetry',
        items: ['Global Omni-Search (Ctrl+K)', 'Notification Bell Popover', 'Notification Center Hub'],
      },
      {
        title: 'Identity & Preferences',
        items: ['User Profile Management', 'Localization & Currency Preferences', 'Theme Engine (Dark/Light)'],
      },
      {
        title: 'Support & Settings',
        items: ['Interactive Help Center & FAQ Guide', 'Enterprise Workspace Settings', 'Demo Persona Switcher'],
      },
    ],
    keyFeatures: ['Universal Keyboard Shortcuts', 'Real-time Alert Bell Badge', 'Role Switcher in Header'],
  },
]

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Pillars', count: 11 },
  { id: 'Commercial', label: 'Commercial & CPQ', count: 3 },
  { id: 'Operations', label: 'Operations & Stock', count: 1 },
  { id: 'Finance', label: 'Finance & Billing', count: 1 },
  { id: 'Intelligence', label: 'AI & Analytics', count: 2 },
  { id: 'Governance', label: 'Governance & Platform', count: 4 },
]

export function ProductStructureSection() {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'bento' | 'tree'>('bento')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedPillar, setSelectedPillar] = useState<ProductPillar | null>(null)
  const [expandedTreeNodes, setExpandedTreeNodes] = useState<Record<string, boolean>>({
    '02': true,
    '03': true,
    '06': true,
  })

  const toggleTreeNode = (code: string) => {
    setExpandedTreeNodes((prev) => ({ ...prev, [code]: !prev[code] }))
  }

  // Filter logic
  const filteredPillars = useMemo(() => {
    return PRODUCT_PILLARS.filter((p) => {
      // Category match
      const categoryMatch =
        activeCategory === 'all' ||
        (activeCategory === 'Governance' ? p.category === 'Governance' || p.category === 'Core' : p.category === activeCategory)

      // Search match
      if (!searchQuery.trim()) return categoryMatch

      const q = searchQuery.toLowerCase()
      const titleMatch = p.title.toLowerCase().includes(q)
      const codeMatch = p.code.includes(q)
      const descMatch = p.description.toLowerCase().includes(q)
      const tagMatch = p.keyFeatures.some((f) => f.toLowerCase().includes(q))
      const subItemMatch = p.subCategories.some((sc) =>
        sc.items.some((it) => it.toLowerCase().includes(q))
      )

      return categoryMatch && (titleMatch || codeMatch || descMatch || tagMatch || subItemMatch)
    })
  }, [activeCategory, searchQuery])

  return (
    <section id="modules" className="relative isolate overflow-hidden border-y border-border bg-surface-muted/40 py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur-md mb-4 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span>ENTERPRISE 360° ARCHITECTURE</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-foreground font-medium">11 UNIFIED PILLARS</span>
          </div>

          <h2 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            The complete product structure,{' '}
            <span className="text-primary">
              visualized in detail.
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
            11 authoritative functional domains, 100+ production-grade workflows, and zero data drift.
            Explore every module, sub-feature, and authorized persona across the entire quote-to-cash lifecycle.
          </p>
        </div>

        {/* Global Statistics Counter Strip */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto text-center">
          <div className="rounded-xl border border-border/80 bg-card/80 p-3 shadow-xs backdrop-blur-sm">
            <p className="text-2xl font-black text-foreground font-mono">11</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Core Domains</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-card/80 p-3 shadow-xs backdrop-blur-sm">
            <p className="text-2xl font-black text-primary font-mono">100+</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Mapped Screens</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-card/80 p-3 shadow-xs backdrop-blur-sm">
            <p className="text-2xl font-black text-emerald-500 font-mono">12</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Quote Sections</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-card/80 p-3 shadow-xs backdrop-blur-sm">
            <p className="text-2xl font-black text-indigo-500 font-mono">6</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Governed Roles</p>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-xl border border-border/80 bg-card/80 p-3 shadow-xs backdrop-blur-sm">
            <p className="text-2xl font-black text-sky-500 font-mono">100%</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Single Truth</p>
          </div>
        </div>

        {/* Interactive Control & Search Bar */}
        <div className="mt-10 rounded-2xl border border-border bg-card/90 p-4 shadow-elevation-1 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {CATEGORY_FILTERS.map((cat) => {
                const isSelected = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* View Switcher & Live Search */}
            <div className="flex items-center gap-3">
              {/* Search Box */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules, features (e.g. CPQ, Warehouse)..."
                  className="pl-8.5 pr-8 h-9 text-xs rounded-xl bg-background/80"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center rounded-xl border border-border bg-surface-muted p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('bento')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    viewMode === 'bento' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Bento Grid Mode"
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('tree')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    viewMode === 'tree' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Architecture Tree Mode"
                >
                  <FolderTree className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Tree</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RENDER MODE 1: MODERN BENTO GRID VIEW ─── */}
        {viewMode === 'bento' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPillars.map((p) => {
                const IconComponent = p.icon
                return (
                  <motion.div
                    layout
                    key={p.code}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="group relative flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-elevation-1 hover:shadow-elevation-3 transition-all duration-300 hover:border-primary/50 overflow-hidden"
                  >
                    {/* Subtle top indicator accent */}
                    <div className={`absolute top-0 inset-x-0 h-1 ${p.accent.indicator}`} />

                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${p.accent.bg} ${p.accent.text} border ${p.accent.border}`}>
                          <IconComponent className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-foreground">
                              {p.code}.
                            </span>
                            <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                              {p.title}
                            </h3>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{p.subtitle}</p>
                        </div>
                      </div>

                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${p.accent.badge} shrink-0`}>
                        {p.badge}
                      </span>
                    </div>

                    {/* Role Target */}
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                      <span className="font-mono text-primary font-bold">Role:</span>
                      <span className="text-foreground">{p.role}</span>
                    </div>

                    {/* Description */}
                    <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed flex-1">
                      {p.description}
                    </p>

                    {/* Metrics Banner */}
                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-surface-muted/40 p-2.5">
                      {p.metrics.map((m) => (
                        <div key={m.label} className="text-center">
                          <p className="font-mono text-xs font-bold text-foreground truncate">{m.value}</p>
                          <p className="text-[9px] text-muted-foreground uppercase truncate mt-0.5">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Key Subsections Pill Preview */}
                    <div className="mt-4 space-y-2 pt-2 border-t border-border/70">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Core Capabilities:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.subCategories.flatMap((sc) => sc.items).slice(0, 5).map((item) => (
                          <span
                            key={item}
                            className="rounded-md border border-border bg-surface-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground/80"
                          >
                            {item}
                          </span>
                        ))}
                        {p.subCategories.flatMap((sc) => sc.items).length > 5 && (
                          <span className="rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            +{p.subCategories.flatMap((sc) => sc.items).length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-5 flex items-center justify-between pt-3 border-t border-border/70 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedPillar(p)}
                        className="font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Inspect Full Tree</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>

                      <Button asChild size="sm" variant="ghost" className="h-8 gap-1.5 font-semibold text-xs">
                        <Link to={user ? p.route : `/login?returnTo=${encodeURIComponent(p.route)}`}>
                          <span>Open</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* ─── RENDER MODE 2: HIERARCHICAL ARCHITECTURE TREE VIEW ─── */}
        {viewMode === 'tree' && (
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-elevation-2">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">
                  DealFlow360 Enterprise Route & Capability Directory
                </h3>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Showing {filteredPillars.length} of 11 Modules
              </span>
            </div>

            <div className="space-y-4">
              {filteredPillars.map((p) => {
                const isExpanded = expandedTreeNodes[p.code] ?? false
                const IconComp = p.icon
                return (
                  <div
                    key={p.code}
                    className="rounded-2xl border border-border/80 bg-surface-muted/20 overflow-hidden transition-all"
                  >
                    {/* Tree Node Header */}
                    <div
                      onClick={() => toggleTreeNode(p.code)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-surface-muted/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                          aria-label={isExpanded ? 'Collapse module' : 'Expand module'}
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${p.accent.bg} ${p.accent.text} border ${p.accent.border}`}>
                          <IconComp className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary">{p.code}.</span>
                            <span className="text-sm sm:text-base font-bold text-foreground">{p.title}</span>
                            <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                              {p.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{p.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="text-caption text-muted-foreground font-mono hidden md:inline">
                          Target: {p.role}
                        </span>
                        <Button asChild size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5">
                          <Link to={user ? p.route : `/login?returnTo=${encodeURIComponent(p.route)}`} onClick={(e) => e.stopPropagation()}>
                            <span>Launch</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Tree Branches */}
                    {isExpanded && (
                      <div className="px-6 pb-5 pt-2 border-t border-border/60 bg-card/60">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                          {p.subCategories.map((sc, i) => (
                            <div key={i} className="space-y-2">
                              <p className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {sc.title}
                              </p>
                              <ul className="space-y-1.5 pl-3 border-l-2 border-border/80 text-xs text-muted-foreground">
                                {sc.items.map((item) => (
                                  <li key={item} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                    <span className="text-muted-foreground/50 font-mono">›</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Guardrail & Highlights */}
                        <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap gap-2">
                            {p.keyFeatures.map((feat) => (
                              <span key={feat} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary border border-primary/20">
                                <CheckCircle2 className="h-3 w-3" /> {feat}
                              </span>
                            ))}
                          </div>
                          <span className="font-mono text-[11px] text-muted-foreground">Primary Route: {p.route}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── FULL ARCHITECTURE INSPECTOR MODAL ─── */}
        <AnimatePresence>
          {selectedPillar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-elevation-4"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedPillar(null)}
                  className="absolute right-4 top-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                  aria-label="Close inspector"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Modal Header */}
                <div className="flex items-start gap-4">
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${selectedPillar.accent.bg} ${selectedPillar.accent.text} border ${selectedPillar.accent.border}`}>
                    <selectedPillar.icon className="h-7 w-7" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                        PILLAR {selectedPillar.code}
                      </span>
                      <Badge variant="outline">{selectedPillar.category}</Badge>
                    </div>
                    <h3 className="text-2xl font-black text-foreground mt-1">
                      {selectedPillar.title}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground">{selectedPillar.subtitle}</p>
                  </div>
                </div>

                {/* Modal Description */}
                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-muted-foreground border-t border-border/70 pt-4">
                  {selectedPillar.description}
                </p>

                {/* Persona & Route Grid */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-border p-3 bg-surface-muted/30">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono">Authorized Persona</span>
                    <p className="font-semibold text-foreground mt-0.5">{selectedPillar.role}</p>
                  </div>
                  <div className="rounded-xl border border-border p-3 bg-surface-muted/30">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono">Default Route Target</span>
                    <p className="font-mono font-semibold text-primary mt-0.5">{selectedPillar.route}</p>
                  </div>
                </div>

                {/* Subsections & Mapped Workflows */}
                <div className="mt-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Complete Functional Sub-Tree:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPillar.subCategories.map((sub, idx) => (
                      <div key={idx} className="rounded-xl border border-border p-4 bg-surface-muted/20 space-y-2">
                        <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {sub.title}
                        </p>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {sub.items.map((it) => (
                            <li key={it} className="flex items-center gap-1.5">
                              <span className="text-primary font-mono">•</span>
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-4">
                  <Button variant="outline" onClick={() => setSelectedPillar(null)}>
                    Close Inspector
                  </Button>
                  <Button asChild>
                    <Link to={user ? selectedPillar.route : `/login?returnTo=${encodeURIComponent(selectedPillar.route)}`}>
                      <span>Open Workspace</span>
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
