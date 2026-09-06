import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useCreateCustomer, useUsers, usePriceLists } from '../hooks/use-business-admin'
import type { CustomerCreateInput } from '../types'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'

export function CreateCustomerPage() {
  const navigate = useNavigate()
  const createCustomer = useCreateCustomer()
  const { data: usersData } = useUsers({})
  const { data: priceListsData } = usePriceLists({ perPage: 100 })

  const [form, setForm] = useState({
    name: '',
    tier: 'bronze' as CustomerCreateInput['tier'],
    status: 'active' as CustomerCreateInput['status'],
    ownerId: '',
    ownerName: '',
    defaultPriceListId: '',
    defaultPriceListName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactTitle: '',
    addressLine1: '',
    addressLine2: '',
    addressCity: '',
    addressState: '',
    addressCountry: '',
    addressPostalCode: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Customer name is required'
    if (!form.contactEmail.trim()) errs.contactEmail = 'Contact email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) errs.contactEmail = 'Invalid email'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const payload: CustomerCreateInput = {
      name: form.name.trim(),
      company: form.name.trim(),
      tier: form.tier,
      status: form.status,
      ownerId: form.ownerId || undefined,
      ownerName: form.ownerName || undefined,
      defaultPriceListId: form.defaultPriceListId || undefined,
      defaultPriceListName: form.defaultPriceListName || undefined,
      contacts: [
        {
          name: form.contactName.trim() || form.name.trim(),
          email: form.contactEmail.trim().toLowerCase(),
          phone: form.contactPhone || undefined,
          title: form.contactTitle || undefined,
          isPrimary: true,
        },
      ],
      billingAddress: [form.addressLine1, form.addressCity, form.addressState, form.addressCountry, form.addressPostalCode].some((v) => v.trim())
        ? {
            line1: form.addressLine1,
            line2: form.addressLine2 || undefined,
            city: form.addressCity,
            state: form.addressState,
            country: form.addressCountry,
            postalCode: form.addressPostalCode,
          }
        : undefined,
    }

    try {
      await createCustomer.mutateAsync(payload)
      toast.success('Customer created successfully')
      navigate('/business-admin/customers')
    } catch {
      toast.error('Failed to create customer')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Customer"
        description="Create a new customer account."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Customers', path: '/business-admin/customers' },
          { label: 'Add Customer' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/business-admin/customers')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Customers
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Customer Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Acme Corporation"
                  error={!!errors.name}
                />
                {errors.name && <p className="text-[11px] text-danger">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Tier</Label>
                <Select value={form.tier} onValueChange={(v) => updateField('tier', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => updateField('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sales Owner</Label>
                <Select value={form.ownerId || 'none'} onValueChange={(v) => {
                  const selected = usersData?.users?.find((u) => u.id === v)
                  updateField('ownerId', v === 'none' ? '' : v)
                  updateField('ownerName', v === 'none' ? '' : (selected?.name || ''))
                }}>
                  <SelectTrigger><SelectValue placeholder="No owner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No owner</SelectItem>
                    {(usersData?.users || []).map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary Contact */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Primary Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Contact Name</Label>
                <Input
                  value={form.contactName}
                  onChange={(e) => updateField('contactName', e.target.value)}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  placeholder="john@acme.com"
                  error={!!errors.contactEmail}
                />
                {errors.contactEmail && <p className="text-[11px] text-danger">{errors.contactEmail}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={form.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  placeholder="+1 555-0100"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  value={form.contactTitle}
                  onChange={(e) => updateField('contactTitle', e.target.value)}
                  placeholder="Procurement Manager"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Billing Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Address Line 1</Label>
                <Input
                  value={form.addressLine1}
                  onChange={(e) => updateField('addressLine1', e.target.value)}
                  placeholder="123 Business Ave"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Address Line 2</Label>
                <Input
                  value={form.addressLine2}
                  onChange={(e) => updateField('addressLine2', e.target.value)}
                  placeholder="Suite 100"
                />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input
                  value={form.addressCity}
                  onChange={(e) => updateField('addressCity', e.target.value)}
                  placeholder="San Francisco"
                />
              </div>
              <div className="space-y-1.5">
                <Label>State / Province</Label>
                <Input
                  value={form.addressState}
                  onChange={(e) => updateField('addressState', e.target.value)}
                  placeholder="CA"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input
                  value={form.addressCountry}
                  onChange={(e) => updateField('addressCountry', e.target.value)}
                  placeholder="United States"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Postal Code</Label>
                <Input
                  value={form.addressPostalCode}
                  onChange={(e) => updateField('addressPostalCode', e.target.value)}
                  placeholder="94105"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Default Price List</Label>
                <Select value={form.defaultPriceListId || 'none'} onValueChange={(v) => {
                  const selected = priceListsData?.priceLists?.find((p) => p.id === v)
                  updateField('defaultPriceListId', v === 'none' ? '' : v)
                  updateField('defaultPriceListName', v === 'none' ? '' : (selected?.name || ''))
                }}>
                  <SelectTrigger><SelectValue placeholder="No price list" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No price list</SelectItem>
                    {(priceListsData?.priceLists || []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/business-admin/customers')}>
            Cancel
          </Button>
          <Button type="submit" loading={createCustomer.isPending}>
            <Save className="h-4 w-4 mr-1.5" />
            Create Customer
          </Button>
        </div>
      </form>
    </div>
  )
}
