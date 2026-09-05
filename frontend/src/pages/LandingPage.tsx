import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Building2,
  Layers,
  Truck,
  CreditCard,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  Shield,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  Download,
  Users,
  Briefcase,
  FileText,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  Calendar,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// Monthly mock data matching the screenshot charts
const MONTHLY_UTILIZATION_DATA = [
  { month: 'Jan', value: 420 },
  { month: 'Feb', value: 460 },
  { month: 'Mar', value: 580 },
  { month: 'Apr', value: 510 },
  { month: 'May', value: 690 },
  { month: 'Jun', value: 740 },
  { month: 'Jul', value: 680 },
  { month: 'Aug', value: 810 },
  { month: 'Sep', value: 870 },
  { month: 'Oct', value: 920 },
  { month: 'Nov', value: 860 },
  { month: 'Dec', value: 980 },
]

const FREQUENCY_DATA = [
  { month: 'Jan', value: 68 },
  { month: 'Feb', value: 64 },
  { month: 'Mar', value: 59 },
  { month: 'Apr', value: 62 },
  { month: 'May', value: 54 },
  { month: 'Jun', value: 58 },
  { month: 'Jul', value: 48 },
  { month: 'Aug', value: 52 },
  { month: 'Sep', value: 45 },
  { month: 'Oct', value: 40 },
  { month: 'Nov', value: 38 },
  { month: 'Dec', value: 32 },
]

const RETIREMENT_DATA = [
  { name: 'Retain', value: 72, color: '#06b6d4' },
  { name: 'Replace', value: 18, color: '#f59e0b' },
  { name: 'Dispose', value: 10, color: '#ef4444' },
]

const RECENT_ACTIVITY_ITEMS = [
  { id: 'AST-8241', dept: 'Engineering', status: 'Active', custodian: 'S. Chen', lastAudit: 'Jul 10', nextDue: 'Oct 10' },
  { id: 'AST-8240', dept: 'Marketing', status: 'Maintenance', custodian: 'M. Webb', lastAudit: 'Jul 9', nextDue: 'Jul 20' },
  { id: 'AST-8239', dept: 'Finance', status: 'Active', custodian: 'P. Sharma', lastAudit: 'Jul 8', nextDue: 'Oct 8' },
  { id: 'AST-8238', dept: 'Operations', status: 'Transfer', custodian: 'A. Rivera', lastAudit: 'Jul 7', nextDue: 'Oct 7' },
  { id: 'AST-8237', dept: 'HR', status: 'Active', custodian: 'J. Lee', lastAudit: 'Jul 6', nextDue: 'Oct 6' },
]

const ARCHITECTURE_NODES = [
  { id: 'dept', label: 'Departments', icon: Building2 },
  { id: 'emp', label: 'Employees', icon: Users },
  { id: 'assets', label: 'Assets', icon: Layers },
  { id: 'alloc', label: 'Allocation Engine', icon: RotateCcw },
  { id: 'maint', label: 'Maintenance', icon: Zap },
  { id: 'audit', label: 'Audit Engine', icon: ShieldCheck },
  { id: 'analytics', label: 'Analytics', icon: Activity },
]

export function LandingPage() {
  const { user, getDashboardPath } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const [selectedAIStage, setSelectedAIStage] = useState(3) // default to 'Recommendation'

  const aiStages = [
    { label: 'Asset Data', desc: 'Normalized multi-tenant pipeline ingestion' },
    { label: 'AI Engine', desc: 'Predictive anomaly & margin modeling' },
    { label: 'Prediction', desc: 'Failure and discount slippage forecast' },
    { label: 'Recommendation', desc: 'Actionable preventative workflows' },
    { label: 'Decision Support', desc: 'Automated executive approval gates' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary font-sans transition-colors duration-200">
      {/* ─── TOP NAVBAR ─── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="h-4 w-4 fill-slate-950" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-h3 font-bold tracking-tight text-foreground">
                DealFlow<span className="text-primary">360</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-small font-medium text-muted-foreground">
            <a href="#platform" className="hover:text-foreground transition-colors">Platform</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#ai-intelligence" className="hover:text-foreground transition-colors">AI Intelligence</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">Workflow</a>
            <a href="#insights" className="hover:text-foreground transition-colors">Insights</a>
          </nav>

          {/* Actions: Theme Toggle + Sign In / Register */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {user ? (
              <Button asChild size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-xs">
                <Link to={getDashboardPath()} className="flex items-center gap-1.5">
                  <span>Enter Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login" className="font-medium text-foreground hover:text-primary">
                    Sign in
                  </Link>
                </Button>
                <Button asChild size="sm" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold shadow-md shadow-sky-500/20">
                  <Link to="/register-company">
                    Create Account
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section id="platform" className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
        {/* Glow ambient background behind hero */}
        <div className="absolute top-12 left-1/4 -translate-x-1/2 w-[550px] h-[350px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-6 space-y-7">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/5 text-foreground text-caption font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-muted-foreground font-normal">
                  Trusted by hospitals, universities & enterprises
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-foreground leading-[1.12]">
                Enterprise Asset & Resource Management Platform
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Track assets, eliminate allocation conflicts, automate maintenance workflows and manage resource bookings from a single operational platform.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold h-11 px-6 rounded-lg shadow-lg shadow-sky-500/25">
                  <Link to="/login" className="flex items-center gap-2">
                    <span>Explore Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 px-6 rounded-lg font-medium border-border/80 hover:bg-secondary/60">
                  <Link to="/register-company">
                    Request Demo
                  </Link>
                </Button>
              </div>

              {/* 4 Hero Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/60">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">24,580+</p>
                  <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Assets Managed</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">3,200+</p>
                  <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Active Bookings</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">1,847</p>
                  <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Maintenance Requests</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">99.8%</p>
                  <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Audit Accuracy</p>
                </div>
              </div>
            </div>

            {/* Right Hero Column: macOS Window Frame Preview */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-elevation-3 transition-all duration-300 hover:border-sky-500/40">
                {/* macOS Window Header Bar */}
                <div className="flex items-center gap-2 pb-4 border-b border-border/60">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-500/90 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/90 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/90 inline-block" />
                  </div>
                  <div className="mx-auto text-[11px] font-mono text-muted-foreground truncate px-4 py-0.5 rounded-md bg-secondary/50 border border-border/40">
                    dealflow360.app/dashboard
                  </div>
                </div>

                {/* Internal Mini Mockup */}
                <div className="pt-4 space-y-4">
                  {/* Top 2 KPI rows */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-border/70 bg-secondary/30">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>12,450 Available</span>
                        <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                      </div>
                      <p className="text-xl font-bold text-foreground mt-1">12,450</p>
                      <span className="text-[10px] font-semibold text-emerald-400">+2.4%</span>
                    </div>

                    <div className="p-3 rounded-xl border border-border/70 bg-secondary/30 relative">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Bookings</span>
                        <Layers className="h-3 w-3 text-sky-400" />
                      </div>
                      <p className="text-xl font-bold text-foreground mt-1">3,200</p>
                      <span className="text-[10px] font-semibold text-sky-400">Active</span>
                      {/* Floating pill */}
                      <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        🔑 8 Under Maintenance
                      </span>
                    </div>
                  </div>

                  {/* Secondary 2 Mini Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-border/70 bg-secondary/30">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Maintenance</span>
                        <Zap className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold text-foreground mt-1">1,847</p>
                      <span className="text-[10px] text-muted-foreground">98% rate</span>
                    </div>

                    <div className="p-3 rounded-xl border border-border/70 bg-secondary/30">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Audit Score</span>
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      </div>
                      <p className="text-xl font-bold text-foreground mt-1">99.8%</p>
                      <span className="text-[10px] font-semibold text-emerald-400">Pass</span>
                    </div>
                  </div>

                  {/* Bar Chart Utilization Mockup */}
                  <div className="p-3.5 rounded-xl border border-border/70 bg-secondary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">Asset Utilization</span>
                      <span className="text-[10px] text-muted-foreground font-mono">Last 12 months</span>
                    </div>
                    <div className="h-28 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MONTHLY_UTILIZATION_DATA}>
                          <Bar
                            dataKey="value"
                            fill="var(--color-primary)"
                            radius={[3, 3, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Bottom Split: Transfers & Conflicts */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-xl border border-border/60 bg-secondary/20 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground">15 Transfers</p>
                        <p className="text-xs font-bold text-foreground">This Week</p>
                      </div>
                      <RotateCcw className="h-4 w-4 text-sky-400" />
                    </div>

                    <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-medium text-rose-300">3 Conflicts</p>
                        <p className="text-xs font-bold text-rose-400">Prevented</p>
                      </div>
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ARCHITECTURE SECTION ─── */}
      <section id="how-it-works" className="py-20 border-t border-border/60 bg-secondary/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-bold font-mono tracking-widest text-sky-400 uppercase">
              ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              ERP architecture built for enterprise
            </h2>
            <p className="text-small sm:text-body text-muted-foreground max-w-2xl mx-auto">
              A layered architecture that ensures data flows cleanly from department registration to analytics and compliance reporting.
            </p>
          </div>

          {/* Interactive Horizontal Pipeline Nodes */}
          <div className="relative pt-4">
            {/* Desktop horizontal track line */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-border/80 -z-0" />

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 relative z-10">
              {ARCHITECTURE_NODES.map((node) => {
                const Icon = node.icon
                return (
                  <div key={node.id} className="flex flex-col items-center group cursor-pointer">
                    <div className="h-16 w-16 rounded-2xl border border-border/80 bg-card flex items-center justify-center text-muted-foreground group-hover:text-sky-400 group-hover:border-sky-500/40 group-hover:scale-105 shadow-sm transition-all duration-200">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="mt-3 text-xs font-semibold text-foreground group-hover:text-sky-400 transition-colors">
                      {node.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI OPERATIONAL INTELLIGENCE SECTION ─── */}
      <section id="ai-intelligence" className="py-20 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & Stage selector */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-bold font-mono tracking-widest text-sky-400 uppercase">
                  AI OPERATIONAL INTELLIGENCE
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-2">
                  Decisions powered by intelligence
                </h2>
                <p className="text-small text-muted-foreground mt-3 leading-relaxed">
                  Our AI layer processes your asset and operational data through a multi-stage pipeline to deliver actionable recommendations with measurable confidence scores.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                {aiStages.map((stage, idx) => (
                  <button
                    key={stage.label}
                    type="button"
                    onClick={() => setSelectedAIStage(idx)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedAIStage === idx
                        ? 'border-sky-500/50 bg-sky-500/10 text-foreground'
                        : 'border-border/60 bg-card hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${selectedAIStage === idx ? 'bg-sky-400' : 'bg-muted-foreground/40'}`} />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{stage.label}</p>
                        <p className="text-[11px] text-muted-foreground">{stage.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className={`h-4 w-4 ${selectedAIStage === idx ? 'text-sky-400' : 'text-muted-foreground/60'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Sleek AI Recommendation Card */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-sky-500/30 bg-card p-6 sm:p-8 shadow-elevation-3 relative overflow-hidden">
                <div className="flex items-center gap-2.5 pb-5 border-b border-border/60">
                  <div className="h-8 w-8 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">AI Recommendation</h3>
                    <p className="text-[11px] text-muted-foreground">Maintenance Prediction Analysis</p>
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  {/* Recommendation title */}
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Recommendation
                    </span>
                    <p className="text-lg sm:text-xl font-bold text-foreground mt-1">
                      Schedule preventive maintenance for Server Rack B3
                    </p>
                  </div>

                  {/* Confidence & Risk Score row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border/70 bg-secondary/30 space-y-2">
                      <span className="text-[11px] font-medium text-muted-foreground">Confidence</span>
                      <p className="text-2xl font-extrabold text-foreground tabular-nums">87%</p>
                      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '87%' }} />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-border/70 bg-secondary/30 space-y-2">
                      <span className="text-[11px] font-medium text-muted-foreground">Risk Score</span>
                      <p className="text-2xl font-extrabold text-amber-400">Medium</p>
                      <span className="inline-block text-[10px] text-muted-foreground">Threshold triggered</span>
                    </div>
                  </div>

                  {/* Reasoning list */}
                  <div className="p-4 rounded-xl border border-border/60 bg-secondary/20 space-y-2">
                    <p className="text-xs font-semibold text-foreground">Reasoning</p>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-sky-400 font-bold">•</span>
                        <span>Predicted failure within 14 days based on usage patterns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-sky-400 font-bold">•</span>
                        <span>High utilization assets require priority maintenance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-sky-400 font-bold">•</span>
                        <span>Historical data shows similar models failed at 8,200 hours</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DASHBOARD COMMAND CENTER SECTION ─── */}
      <section id="workflow" className="py-20 border-t border-border/60 bg-secondary/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold font-mono tracking-widest text-sky-400 uppercase">
              DASHBOARD
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              A command center for your assets
            </h2>
            <p className="text-small sm:text-body text-muted-foreground max-w-2xl mx-auto">
              Monitor every asset from allocation to retirement from a unified, real-time dashboard designed for operations managers.
            </p>
          </div>

          {/* Full-width macOS Window Frame */}
          <div className="rounded-2xl border border-border/80 bg-card shadow-elevation-4 overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/60 bg-secondary/20">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500/90 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-500/90 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/90 inline-block" />
              </div>
              <div className="mx-auto text-[11px] font-mono text-muted-foreground px-4 py-0.5 rounded-md bg-secondary/60 border border-border/40">
                assetrix.app/dashboard
              </div>
            </div>

            {/* Dashboard Content Container */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-border/70 bg-secondary/30 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Assets Available</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">12,450</p>
                  <span className="text-[11px] font-semibold text-emerald-400">+2.4%</span>
                </div>

                <div className="p-4 rounded-xl border border-border/70 bg-secondary/30 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Active Bookings</span>
                    <Layers className="h-3.5 w-3.5 text-sky-400" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">3,200</p>
                  <span className="text-[11px] font-semibold text-sky-400">+12%</span>
                </div>

                <div className="p-4 rounded-xl border border-border/70 bg-secondary/30 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Maintenance Today</span>
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">24</p>
                  <span className="text-[11px] font-semibold text-amber-400">On Track</span>
                </div>

                <div className="p-4 rounded-xl border border-border/70 bg-secondary/30 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Pending Transfers</span>
                    <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">18</p>
                  <span className="text-[11px] text-muted-foreground">Awaiting</span>
                </div>
              </div>

              {/* Middle Row: Area Chart + Stacked Side Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Monthly Utilization Area Chart */}
                <div className="lg:col-span-8 p-5 rounded-xl border border-border/70 bg-secondary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Asset Utilization</h4>
                      <p className="text-[11px] text-muted-foreground">Monthly allocation vs available</p>
                    </div>
                  </div>
                  <div className="h-56 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MONTHLY_UTILIZATION_DATA}>
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#areaGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right: Upcoming Returns & Maintenance Queue */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Upcoming Returns */}
                  <div className="p-4 rounded-xl border border-border/70 bg-secondary/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Upcoming Returns</span>
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Laptop #4821</p>
                          <span className="text-[10px] text-muted-foreground">Engineering · Due in 2 days</span>
                        </div>
                      </li>
                      <li className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Projector #127</p>
                          <span className="text-[10px] text-muted-foreground">Marketing · Due tomorrow</span>
                        </div>
                      </li>
                      <li className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Camera #89</p>
                          <span className="text-[10px] text-muted-foreground">Media · Overdue 1 day</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Maintenance Queue */}
                  <div className="p-4 rounded-xl border border-border/70 bg-secondary/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Maintenance Queue</span>
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">AC Unit #203</p>
                          <span className="text-[10px] text-muted-foreground">Floor 2</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400">
                          Scheduled
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Printer #156</p>
                          <span className="text-[10px] text-muted-foreground">Admin Wing</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400">
                          Scheduled
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Server Rack B3</p>
                          <span className="text-[10px] text-muted-foreground">Data Center</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400">
                          Scheduled
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom: Recent Asset Activity Table */}
              <div className="rounded-xl border border-border/70 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 bg-secondary/30 border-b border-border/60">
                  <span className="text-xs font-semibold text-foreground">Recent Asset Activity</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-sky-400 hover:text-sky-300">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Export CSV
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-secondary/20 border-b border-border/60">
                      <tr>
                        <th className="px-5 py-3">Asset ID</th>
                        <th className="px-5 py-3">Department</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Custodian</th>
                        <th className="px-5 py-3">Last Audit</th>
                        <th className="px-5 py-3 text-right">Next Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {RECENT_ACTIVITY_ITEMS.map((row) => (
                        <tr key={row.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-5 py-3 font-mono font-semibold text-foreground">{row.id}</td>
                          <td className="px-5 py-3 text-muted-foreground">{row.dept}</td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                row.status === 'Active'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                  : row.status === 'Maintenance'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                  : 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{row.custodian}</td>
                          <td className="px-5 py-3 text-muted-foreground">{row.lastAudit}</td>
                          <td className="px-5 py-3 text-right text-muted-foreground">{row.nextDue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ANALYTICS SECTION ─── */}
      <section id="insights" className="py-20 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold font-mono tracking-widest text-sky-400 uppercase">
              ANALYTICS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Measure what matters
            </h2>
            <p className="text-small sm:text-body text-muted-foreground max-w-2xl mx-auto">
              Real-time analytics dashboards with drillable charts, exportable reports, and automated insights for asset operations.
            </p>
          </div>

          {/* 5 Stat KPI Cards in a row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl border border-border/80 bg-card text-center space-y-1.5 shadow-xs">
              <TrendingUp className="h-4 w-4 mx-auto text-emerald-400" />
              <p className="text-2xl font-extrabold text-foreground tabular-nums">+24%</p>
              <p className="text-[11px] text-muted-foreground">Asset Utilization</p>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-card text-center space-y-1.5 shadow-xs">
              <Clock className="h-4 w-4 mx-auto text-sky-400" />
              <p className="text-2xl font-extrabold text-foreground tabular-nums">-40%</p>
              <p className="text-[11px] text-muted-foreground">Maintenance Time</p>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-card text-center space-y-1.5 shadow-xs">
              <Activity className="h-4 w-4 mx-auto text-indigo-400" />
              <p className="text-2xl font-extrabold text-foreground tabular-nums">+35%</p>
              <p className="text-[11px] text-muted-foreground">Allocation Success</p>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-card text-center space-y-1.5 shadow-xs">
              <ShieldCheck className="h-4 w-4 mx-auto text-amber-400" />
              <p className="text-2xl font-extrabold text-foreground tabular-nums">99.8%</p>
              <p className="text-[11px] text-muted-foreground">Audit Compliance</p>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-card text-center space-y-1.5 shadow-xs col-span-2 sm:col-span-1">
              <Calendar className="h-4 w-4 mx-auto text-rose-400" />
              <p className="text-2xl font-extrabold text-foreground tabular-nums">+28%</p>
              <p className="text-[11px] text-muted-foreground">Booking Efficiency</p>
            </div>
          </div>

          {/* Dual Line Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Asset Utilization Year-over-Year */}
            <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Asset Utilization</h4>
                  <p className="text-[11px] text-muted-foreground">Year over year</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +24%
                </span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY_UTILIZATION_DATA}>
                    <defs>
                      <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fill="url(#cyanArea)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Maintenance Frequency */}
            <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Maintenance Frequency</h4>
                  <p className="text-[11px] text-muted-foreground">Monthly average</p>
                </div>
                <span className="text-xs font-semibold text-sky-400 flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5" />
                  -40%
                </span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={FREQUENCY_DATA}>
                    <defs>
                      <linearGradient id="skyArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      fill="url(#skyArea)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row: Department Allocation Bars + Donut Retirement Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Allocation Progress Bars */}
            <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Department Allocation</h4>
                  <p className="text-[11px] text-muted-foreground">Asset distribution</p>
                </div>
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                  +35%
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-foreground">Engineering</span>
                    <span className="text-muted-foreground">78%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-foreground">Operations</span>
                    <span className="text-muted-foreground">65%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div className="bg-teal-500 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-foreground">Marketing</span>
                    <span className="text-muted-foreground">52%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '52%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-foreground">HR</span>
                    <span className="text-muted-foreground">40%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Donut Chart: Retirement Forecast */}
            <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Retirement Forecast</h4>
                  <p className="text-[11px] text-muted-foreground">Next 12 months</p>
                </div>
                <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  Planning
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
                <div className="relative h-40 w-40 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={RETIREMENT_DATA}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {RETIREMENT_DATA.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <p className="text-xl font-bold text-foreground">2,450</p>
                    <p className="text-[10px] text-muted-foreground">Assets</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    <span className="text-muted-foreground min-w-[70px]">Retain</span>
                    <span className="font-bold text-foreground">72%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-muted-foreground min-w-[70px]">Replace</span>
                    <span className="font-bold text-foreground">18%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span className="text-muted-foreground min-w-[70px]">Dispose</span>
                    <span className="font-bold text-foreground">10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border/60 py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="h-6 w-6 rounded bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold">
                <Sparkles className="h-3.5 w-3.5 fill-slate-950" />
              </div>
              <span className="font-bold text-foreground">DealFlow360</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm">
              Enterprise asset & resource management platform. Track assets, automate maintenance, and manage bookings from one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-muted-foreground">
            <Link to="/help" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/help" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <span className="hidden sm:inline">·</span>
            <span>© 2026 DealFlow360, Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
