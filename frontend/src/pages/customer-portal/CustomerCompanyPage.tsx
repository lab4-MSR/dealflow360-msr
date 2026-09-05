import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Mail, Phone, MapPin, Globe, CreditCard, Save, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getCustomerCompany, updateCustomerCompany, type CustomerCompanyData } from '@/lib/customer-portal-api'

export function CustomerCompanyPage() {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<Partial<CustomerCompanyData>>({})
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { data: company, isLoading, isError, error } = useQuery({
    queryKey: ['customer-company'],
    queryFn: getCustomerCompany,
  })

  useEffect(() => {
    if (company) {
      setFormData(company)
    }
  }, [company])

  const updateMutation = useMutation({
    mutationFn: (updated: Partial<CustomerCompanyData>) => updateCustomerCompany(updated),
    onSuccess: (data) => {
      setSuccessMsg('Company information updated successfully.')
      setErrorMsg(null)
      queryClient.setQueryData(['customer-company'], data)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || 'Failed to update company information.')
      setSuccessMsg(null)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg(null)
    setErrorMsg(null)
    updateMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !company) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-3" />
        <h2 className="text-xl font-semibold">Failed to Load Company Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">{error instanceof Error ? error.message : 'Unable to load company information'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your organization's business details, contacts, and billing terms</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSuccessMsg(null)} className="h-7 text-xs">
            Dismiss
          </Button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-md bg-rose-50 text-rose-900 border border-rose-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setErrorMsg(null)} className="h-7 text-xs">
            Dismiss
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Company Information
            </CardTitle>
            <CardDescription>General business identity and metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name || ''}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="website"
                    className="pl-9"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry || ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company_size">Company Size</Label>
                <Input
                  id="company_size"
                  value={formData.company_size || ''}
                  onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Contact Information
            </CardTitle>
            <CardDescription>Primary administrative contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="primary_contact">Primary Contact Name</Label>
                <Input
                  id="primary_contact"
                  value={formData.primary_contact || ''}
                  onChange={(e) => setFormData({ ...formData, primary_contact: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-9"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Contact Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    className="pl-9"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">HQ / Operating Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="address"
                    className="pl-9"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Billing Information
            </CardTitle>
            <CardDescription>Tax registration, invoice address, and payment terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="billing_address">Billing Address</Label>
                <Input
                  id="billing_address"
                  value={formData.billing_address || ''}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tax_information">Tax ID / VAT Registration</Label>
                <Input
                  id="tax_information"
                  value={formData.tax_information || ''}
                  onChange={(e) => setFormData({ ...formData, tax_information: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="payment_terms">Payment Terms (Assigned)</Label>
                <Input
                  id="payment_terms"
                  value={formData.payment_terms || ''}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions: Update Information */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Updating...' : 'Update Information'}
          </Button>
        </div>
      </form>
    </div>
  )
}
