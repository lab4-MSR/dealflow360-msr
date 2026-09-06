import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCustomerDetail, useUpdateCustomer, useDeleteCustomer } from '../hooks/use-business-admin'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { toast } from 'sonner'
import { ArrowLeft, Trash2, Mail, Phone, DollarSign, Calendar, FileText, Activity, Building, User, Package } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const TIER_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  bronze: 'warning',
  silver: 'info',
  gold: 'success',
  platinum: 'default',
}

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'danger'> = {
  active: 'success',
  inactive: 'secondary',
  suspended: 'danger',
}

const STAGE_VARIANT: Record<string, 'info' | 'warning' | 'success' | 'default' | 'secondary' | 'danger'> = {
  prospecting: 'secondary',
  qualification: 'info',
  proposal: 'warning',
  negotiation: 'warning',
  closed_won: 'success',
  closed_lost: 'danger',
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

const safeFormatDate = (value: string | undefined | null, fmt = 'MMM d, yyyy') => {
  if (!value) return '—'
  try {
    return format(parseISO(value), fmt)
  } catch {
    return '—'
  }
}

export function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: customer, isLoading, error, refetch } = useCustomerDetail(id || '')
  const updateCustomer = useUpdateCustomer()
  const deleteCustomer = useDeleteCustomer()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)

  const handleToggleStatus = async () => {
    if (!customer) return
    // Only ever toggles between active/inactive; a 'suspended' account
    // re-activates to 'active' rather than being overwritten with 'inactive'.
    const newStatus = customer.status !== 'active' ? 'active' : 'inactive'
    try {
      await updateCustomer.mutateAsync({ id: customer.id, data: { status: newStatus } })
      toast.success(`Customer ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
      setShowStatusDialog(false)
    } catch {
      toast.error('Failed to update customer status')
    }
  }

  const handleDelete = async () => {
    if (!customer) return
    try {
      await deleteCustomer.mutateAsync(customer.id)
      toast.success('Customer deleted')
      navigate('/business-admin/customers')
    } catch {
      toast.error('Failed to delete customer')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error || !customer) {
    return <ErrorState title="Failed to load customer" onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description={customer.contacts?.[0]?.email || customer.email || ''}
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Customers', path: '/business-admin/customers' },
          { label: customer.name },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/business-admin/customers')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button variant="outline" onClick={() => setShowStatusDialog(true)}>
              {customer.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </>
        }
      />

      {/* Customer Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-[18px] font-bold">
                {customer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-h3 font-semibold text-foreground">{customer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={TIER_VARIANT[customer.tier] || 'secondary'}>{customer.tier}</Badge>
                <Badge variant={STATUS_VARIANT[customer.status] || 'secondary'}>{customer.status}</Badge>
                {customer.ownerName && <Badge variant="outline">{customer.ownerName}</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="purchase_history">Purchase History</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Customer Information</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">Customer Name</p>
                        <p className="text-[13px] text-foreground font-medium">{customer.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">Tier</p>
                        <p className="text-[13px] text-foreground">{customer.tier}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">Owner</p>
                        <p className="text-[13px] text-foreground">{customer.ownerName || '—'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">Created</p>
                        <p className="text-[13px] text-foreground">{safeFormatDate(customer.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">Last Activity</p>
                        <p className="text-[13px] text-foreground">{safeFormatDate(customer.lastActivity, 'MMM d, yyyy · h:mm a')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Revenue Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Total Revenue</p>
                    <p className="text-h3 font-bold text-foreground">{formatCurrency(customer.totalRevenue ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Total Deals</p>
                    <p className="text-h3 font-bold text-foreground">{customer.totalDeals ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Average Deal Size</p>
                    <p className="text-h3 font-bold text-foreground">
                      {(customer.totalDeals ?? 0) > 0 ? formatCurrency((customer.totalRevenue ?? 0) / (customer.totalDeals ?? 0)) : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader><CardTitle>Contacts</CardTitle></CardHeader>
            <CardContent>
              {(customer.contacts?.length ?? 0) === 0 ? (
                <p className="text-[13px] text-muted-foreground">No contacts found.</p>
              ) : (
                <div className="space-y-4">
                  {(customer.contacts || []).map((contact) => (
                    <div key={contact.id} className="flex items-start gap-4 p-4 rounded-lg border border-border">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-surface-muted text-foreground text-[12px] font-bold">
                          {contact.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold text-foreground">{contact.name}</p>
                          {contact.isPrimary && <Badge variant="success" className="text-[10px]">Primary</Badge>}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[12px] text-muted-foreground">{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[12px] text-muted-foreground">{contact.phone}</span>
                            </div>
                          )}
                        </div>
                        {contact.title && <p className="text-[12px] text-muted-foreground mt-1">{contact.title}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals">
          <Card>
            <CardHeader><CardTitle>Deals</CardTitle></CardHeader>
            <CardContent>
              {(customer.deals?.length ?? 0) === 0 ? (
                <p className="text-[13px] text-muted-foreground">No deals found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-[11px] font-medium text-muted-foreground pb-3 pr-4">Deal Name</th>
                        <th className="text-right text-[11px] font-medium text-muted-foreground pb-3 pr-4">Value</th>
                        <th className="text-left text-[11px] font-medium text-muted-foreground pb-3 pr-4">Stage</th>
                        <th className="text-left text-[11px] font-medium text-muted-foreground pb-3">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(customer.deals || []).map((deal) => (
                        <tr key={deal.id} className="border-b border-border last:border-0">
                          <td className="py-3 pr-4 text-[13px] font-medium text-foreground">{deal.name}</td>
                          <td className="py-3 pr-4 text-[13px] text-foreground text-right tabular-nums">{formatCurrency(deal.value ?? 0)}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={STAGE_VARIANT[deal.stage] || 'secondary'}>{deal.stage}</Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant={deal.risk === 'high' || deal.risk === 'critical' ? 'danger' : deal.risk === 'medium' ? 'warning' : 'secondary'}>
                              {deal.risk}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
            <CardContent>
              {(customer.orders?.length ?? 0) === 0 ? (
                <p className="text-[13px] text-muted-foreground">No orders found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-[11px] font-medium text-muted-foreground pb-3 pr-4">Order Number</th>
                        <th className="text-right text-[11px] font-medium text-muted-foreground pb-3 pr-4">Total</th>
                        <th className="text-left text-[11px] font-medium text-muted-foreground pb-3 pr-4">Status</th>
                        <th className="text-left text-[11px] font-medium text-muted-foreground pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(customer.orders || []).map((order) => (
                        <tr key={order.id} className="border-b border-border last:border-0">
                          <td className="py-3 pr-4 text-[13px] font-medium text-foreground">{order.number}</td>
                          <td className="py-3 pr-4 text-[13px] text-foreground text-right tabular-nums">{formatCurrency(order.total ?? 0)}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-[12px] text-muted-foreground">{safeFormatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader><CardTitle>Billing Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Outstanding Balance</p>
                      <p className="text-[13px] font-semibold text-foreground">{formatCurrency(customer.billing?.outstandingBalance ?? 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Total Invoiced</p>
                      <p className="text-[13px] text-foreground">{formatCurrency(customer.billing?.totalInvoiced ?? 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Total Paid</p>
                      <p className="text-[13px] text-foreground">{formatCurrency(customer.billing?.totalPaid ?? 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Payment Terms</p>
                      <p className="text-[13px] text-foreground">{customer.billing?.paymentTerms || '—'}</p>
                    </div>
                  </div>
                  {customer.billing?.lastInvoiceDate && (
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">Last Invoice</p>
                        <p className="text-[13px] text-foreground">{safeFormatDate(customer.billing.lastInvoiceDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase History Tab */}
        <TabsContent value="purchase_history">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historical Purchasing Behavior</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Cumulative Purchase Spend</p>
                    <p className="text-h3 font-bold text-foreground mt-1">{formatCurrency(customer.totalRevenue ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Total Completed Purchases</p>
                    <p className="text-h3 font-bold text-foreground mt-1">{customer.orders?.length ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Average Order Size</p>
                    <p className="text-h3 font-bold text-foreground mt-1">
                      {(customer.totalRevenue ?? 0) > 0 && (customer.orders?.length ?? 0) > 0 ? formatCurrency(Math.round((customer.totalRevenue ?? 0) / (customer.orders?.length ?? 1))) : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Purchased Products</CardTitle>
              </CardHeader>
              <CardContent>
                {(customer.topProducts?.length ?? 0) === 0 ? (
                  <EmptyState
                    icon={<Package className="h-8 w-8" />}
                    title="No product breakdown available"
                    description="Top purchased products will appear here once order line items are recorded for this customer."
                  />
                ) : (
                  <div className="space-y-3">
                    {(customer.topProducts || []).map((p) => (
                      <div key={p.id || p.sku} className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-muted/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-primary/10 text-primary">
                            <Package className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-foreground">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground">SKU: {p.sku} · Units: {p.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-semibold text-foreground">{formatCurrency(p.totalSpend ?? 0)}</p>
                          {p.lastPurchased && <p className="text-[11px] text-muted-foreground">Last: {safeFormatDate(p.lastPurchased)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
              {(customer.recentActivity?.length ?? 0) === 0 ? (
                <p className="text-[13px] text-muted-foreground">No recent activity.</p>
              ) : (
                <div className="space-y-4">
                  {(customer.recentActivity || []).map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                      <div className="mt-0.5">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] text-foreground">
                          <span className="font-medium">{item.actor}</span> {item.action} {item.resource}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {safeFormatDate(item.timestamp, 'MMM d, yyyy · h:mm a')}
                        </p>
                      </div>
                      {item.severity && (
                        <Badge variant={item.severity === 'critical' ? 'danger' : item.severity === 'warning' ? 'warning' : 'secondary'}>
                          {item.severity}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        title={customer.status === 'active' ? 'Deactivate customer?' : 'Activate customer?'}
        description={customer.status === 'active'
          ? 'This will deactivate the customer account. Existing records will remain unchanged.'
          : 'This will reactivate the customer account.'}
        confirmLabel={customer.status === 'active' ? 'Deactivate' : 'Activate'}
        variant={customer.status === 'active' ? 'danger' : 'default'}
        onConfirm={handleToggleStatus}
        loading={updateCustomer.isPending}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete customer?"
        description="This action cannot be undone. All customer data will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteCustomer.isPending}
      />
    </div>
  )
}
