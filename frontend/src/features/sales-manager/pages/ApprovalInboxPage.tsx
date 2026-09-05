import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CheckSquare,
  History,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Undo2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { RiskBadge } from '@/components/ui/risk-badge'
import { SlaCountdown } from '../components/SlaCountdown'
import { CustomerTierBadge } from '../components/CustomerTierBadge'
import { ApproveModal, RejectModal, ReturnModal } from '../components/ApprovalActionModals'
import {
  getApprovalInbox,
  approveApproval,
  rejectApproval,
  returnApproval,
} from '@/services/salesManager'
import type { ApprovalQueueItem } from '@/types/salesManager'

export function ApprovalInboxPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [approvals, setApprovals] = useState<ApprovalQueueItem[]>([])
  const [selectedTab, setSelectedTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRep, setSelectedRep] = useState('all')
  const [selectedTier, setSelectedTier] = useState('all')
  const [selectedRisk, setSelectedRisk] = useState('all')

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkApproveOpen, setBulkApproveOpen] = useState(false)
  const [bulkActionSubmitting, setBulkActionSubmitting] = useState(false)

  // Single Action Modals
  const [activeItem, setActiveItem] = useState<ApprovalQueueItem | null>(null)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getApprovalInbox({
        tab: selectedTab,
        rep: selectedRep,
        tier: selectedTier,
        risk: selectedRisk,
        search: searchQuery,
      })
      setApprovals(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedTab, selectedRep, selectedTier, selectedRisk, searchQuery])

  // Select all handler
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(approvals.map(a => a.id))
    } else {
      setSelectedIds([])
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // Action handlers
  const handleSingleApprove = async (comment?: string) => {
    if (!activeItem) return
    setIsSubmitting(true)
    try {
      await approveApproval(activeItem.id, comment)
      await loadData()
      setSelectedIds(prev => prev.filter(id => id !== activeItem.id))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSingleReject = async (reason: string) => {
    if (!activeItem) return
    setIsSubmitting(true)
    try {
      await rejectApproval(activeItem.id, reason)
      await loadData()
      setSelectedIds(prev => prev.filter(id => id !== activeItem.id))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSingleReturn = async (instructions: string) => {
    if (!activeItem) return
    setIsSubmitting(true)
    try {
      await returnApproval(activeItem.id, instructions)
      await loadData()
      setSelectedIds(prev => prev.filter(id => id !== activeItem.id))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkApprove = async () => {
    setBulkActionSubmitting(true)
    try {
      await Promise.all(selectedIds.map(id => approveApproval(id, 'Bulk approved by Sales Manager')))
      setSelectedIds([])
      setBulkApproveOpen(false)
      await loadData()
    } finally {
      setBulkActionSubmitting(false)
    }
  }

  const tabs = [
    { id: 'all', label: 'All Pending' },
    { id: 'urgent', label: 'Urgent (SLA < 4h)' },
    { id: 'high_risk', label: 'High Risk (Score ≥ 60)' },
    { id: 'discount_violations', label: 'Discount Violations' },
    { id: 'margin_risk', label: 'Margin Risk (< 22%)' },
  ]

  const selectedApprovalsList = approvals.filter(a => selectedIds.includes(a.id))
  const selectedTotalValue = selectedApprovalsList.reduce((acc, curr) => acc + curr.deal_value, 0)
  const hasHighRiskInSelection = selectedApprovalsList.some(a => a.risk_level === 'high' || a.risk_level === 'critical')

  return (
    <div className="space-y-6">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Manager Approval Inbox</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {approvals.length} Pending
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review and govern customer discounts, blended contract risks, and margin exceptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link to="/sales-manager/approvals/history">
              <History className="h-4 w-4" />
              <span>Approval History</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── PRIORITY QUEUE TABS ─── */}
      <div className="flex border-b border-border gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedTab(tab.id)
              setSelectedIds([])
            }}
            className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              selectedTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── FILTER CONTROLS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quote, deal, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <select
          value={selectedRep}
          onChange={(e) => setSelectedRep(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Sales Representatives</option>
          <option value="Marcus Vance">Marcus Vance</option>
          <option value="Elena Rostova">Elena Rostova</option>
          <option value="Julian Thorne">Julian Thorne</option>
          <option value="Maya Lin">Maya Lin</option>
        </select>

        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Customer Tiers</option>
          <option value="platinum">Platinum Tier</option>
          <option value="gold">Gold Tier</option>
          <option value="silver">Silver Tier</option>
          <option value="bronze">Bronze Tier</option>
        </select>

        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Risk Levels</option>
          <option value="low">Low Risk (0-30)</option>
          <option value="medium">Medium Risk (31-60)</option>
          <option value="high">High Risk (61-80)</option>
          <option value="critical">Critical Risk (81-100)</option>
        </select>
      </div>

      {/* ─── BULK ACTION BAR ─── */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-foreground">
              {selectedIds.length} quotation{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">
              Combined Deal Value: <strong className="text-foreground">₹{selectedTotalValue.toLocaleString()}</strong>
            </span>
            {hasHighRiskInSelection && (
              <span className="inline-flex items-center gap-1 text-danger font-semibold bg-danger-subtle px-2 py-0.5 rounded">
                <AlertTriangle className="h-3 w-3" /> High Risk Deals Included
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds([])}
              className="h-8 text-xs"
            >
              Clear Selection
            </Button>
            <Button
              size="sm"
              onClick={() => setBulkApproveOpen(true)}
              className="h-8 text-xs bg-success hover:bg-success/90 text-white gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Bulk Approve ({selectedIds.length})</span>
            </Button>
          </div>
        </div>
      )}

      {/* ─── APPROVALS SCAN-PRIORITIZE TABLE ─── */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === approvals.length && approvals.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold">Quote & Deal</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Representative</th>
                  <th className="px-4 py-3 font-semibold">Value & Margin</th>
                  <th className="px-4 py-3 font-semibold">Discount Request</th>
                  <th className="px-4 py-3 font-semibold">Risk Score</th>
                  <th className="px-4 py-3 font-semibold">SLA Countdown</th>
                  <th className="px-4 py-3 font-semibold text-right">Decide</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {approvals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="font-semibold text-sm">No Pending Approvals</p>
                      <p className="text-xs mt-1">All team quotations have been reviewed and decided.</p>
                    </td>
                  </tr>
                ) : (
                  approvals.map((item) => {
                    const isSelected = selectedIds.includes(item.id)
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-muted/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(item.id)}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-semibold text-primary">{item.quote_number}</span>
                            <span className="text-[10px] px-1 py-0.2 rounded bg-muted text-muted-foreground">v{item.version}</span>
                          </div>
                          <Link
                            to={`/sales-manager/approvals/${item.id}`}
                            className="font-medium text-foreground hover:underline block max-w-[220px] truncate mt-0.5"
                          >
                            {item.deal_name}
                          </Link>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground block">{item.customer.name}</span>
                          <CustomerTierBadge tier={item.customer.tier} className="mt-0.5" />
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground block">{item.rep.name}</span>
                          <span className="text-[11px] text-muted-foreground">{item.rep.team}</span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-bold text-foreground block tabular-nums">
                            ₹{item.deal_value.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-muted-foreground">Margin:</span>
                            <span
                              className={`font-semibold tabular-nums ${
                                item.margin_percent < 22 ? 'text-danger' : 'text-foreground'
                              }`}
                            >
                              {item.margin_percent.toFixed(1)}%
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground tabular-nums">
                              {item.requested_discount_percent.toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground text-[11px]">
                              (max {item.allowed_discount_percent}%)
                            </span>
                          </div>
                          {item.excess_discount_percent > 0 ? (
                            <span className="inline-flex px-1.5 py-0.2 rounded text-[10px] font-semibold bg-danger-subtle text-danger mt-0.5">
                              +{item.excess_discount_percent.toFixed(1)}% excess
                            </span>
                          ) : (
                            <span className="text-success text-[11px] font-medium block mt-0.5">Within policy</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <RiskBadge risk={item.risk_level}>
                            Score {item.blended_risk_score}
                          </RiskBadge>
                        </td>

                        <td className="px-4 py-3">
                          <SlaCountdown expiresAt={item.sla_expires_at} />
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2"
                            >
                              <Link to={`/sales-manager/approvals/${item.id}`}>
                                Review
                              </Link>
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-success hover:bg-success-subtle hover:text-success"
                              title="Quick Approve"
                              onClick={() => {
                                setActiveItem(item)
                                setApproveModalOpen(true)
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-warning hover:bg-warning-subtle hover:text-warning"
                              title="Return for Revision"
                              onClick={() => {
                                setActiveItem(item)
                                setReturnModalOpen(true)
                              }}
                            >
                              <Undo2 className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-danger hover:bg-danger-subtle hover:text-danger"
                              title="Quick Reject"
                              onClick={() => {
                                setActiveItem(item)
                                setRejectModalOpen(true)
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── SINGLE ACTION MODALS ─── */}
      {activeItem && (
        <>
          <ApproveModal
            open={approveModalOpen}
            onOpenChange={setApproveModalOpen}
            quoteNumber={activeItem.quote_number}
            dealName={activeItem.deal_name}
            requestedDiscount={activeItem.requested_discount_percent}
            marginPercent={activeItem.margin_percent}
            onConfirm={handleSingleApprove}
            isSubmitting={isSubmitting}
          />

          <RejectModal
            open={rejectModalOpen}
            onOpenChange={setRejectModalOpen}
            quoteNumber={activeItem.quote_number}
            dealName={activeItem.deal_name}
            onConfirm={handleSingleReject}
            isSubmitting={isSubmitting}
          />

          <ReturnModal
            open={returnModalOpen}
            onOpenChange={setReturnModalOpen}
            quoteNumber={activeItem.quote_number}
            dealName={activeItem.deal_name}
            onConfirm={handleSingleReturn}
            isSubmitting={isSubmitting}
          />
        </>
      )}

      {/* ─── BULK APPROVE CONFIRMATION MODAL ─── */}
      {bulkApproveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-elevation-3 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-subtle text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Confirm Bulk Approval</h3>
                <p className="text-xs text-muted-foreground">Approve {selectedIds.length} pending quotations</p>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Approvals:</span>
                <span className="font-semibold text-foreground">{selectedIds.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cumulative Value:</span>
                <span className="font-bold text-foreground">₹{selectedTotalValue.toLocaleString()}</span>
              </div>
            </div>

            {hasHighRiskInSelection && (
              <div className="p-3 bg-danger-subtle/50 border border-danger/30 rounded-lg flex items-start gap-2 text-xs text-danger">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Warning:</strong> Some of the selected quotations carry high or critical blended risk scores. Ensure discount governance thresholds have been scrutinized.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkApproveOpen(false)}
                disabled={bulkActionSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleBulkApprove}
                disabled={bulkActionSubmitting}
                className="bg-success hover:bg-success/90 text-white"
              >
                {bulkActionSubmitting ? 'Approving...' : 'Confirm Bulk Approval'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
