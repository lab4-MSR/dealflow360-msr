import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useCreateProduct } from '../hooks/use-business-admin'
import type { ProductCreateInput } from '../types'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'

export function CreateProductPage() {
  const navigate = useNavigate()
  const createProduct = useCreateProduct()
  const [form, setForm] = useState<ProductCreateInput>({
    name: '',
    sku: '',
    description: '',
    category: 'Software',
    unitPrice: 0,
    currency: 'INR',
    unit: 'license',
    taxCategory: '',
    status: 'active',
    stock: 0,
    lowStockThreshold: 10,
    hasVariants: false,
    variantCount: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Product name is required'
    if (!form.sku.trim()) errs.sku = 'SKU is required'
    if (form.unitPrice != null && form.unitPrice <= 0) errs.unitPrice = 'Price must be greater than 0'
    if (!form.category?.trim()) errs.category = 'Category is required'
    if (!form.unit?.trim()) errs.unit = 'Unit is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      const { taxCategory: _taxCategory, ...rest } = form
      await createProduct.mutateAsync({
        ...rest,
        // Omit empty taxCategory instead of sending an empty string
        ...(form.taxCategory?.trim() ? { taxCategory: form.taxCategory.trim() } : {}),
      })
      toast.success('Product created')
      navigate('/business-admin/products')
    } catch {
      toast.error('Failed to create product')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Product"
        description="Create a new product in your catalog."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Products', path: '/business-admin/products' },
          { label: 'Add Product' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/business-admin/products')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Product Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Enterprise License"
                  error={!!errors.name}
                />
                {errors.name && <p className="text-[11px] text-danger">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>SKU *</Label>
                <Input
                  value={form.sku}
                  onChange={(e) => updateField('sku', e.target.value)}
                  placeholder="e.g. ENT-LIC-001"
                  error={!!errors.sku}
                />
                {errors.sku && <p className="text-[11px] text-danger">{errors.sku}</p>}
                <p className="text-[11px] text-muted-foreground">SKU must be unique across the catalog.</p>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Description</Label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Product description..."
                  className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Unit Price *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={(e) => updateField('unitPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  error={!!errors.unitPrice}
                />
                {errors.unitPrice && <p className="text-[11px] text-danger">{errors.unitPrice}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => updateField('currency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR - Indian Rupee (₹)</SelectItem>
                    <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Unit *</Label>
                <Select value={form.unit} onValueChange={(v) => updateField('unit', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="license">License</SelectItem>
                    <SelectItem value="package">Package</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="each">Each</SelectItem>
                  </SelectContent>
                </Select>
                {errors.unit && <p className="text-[11px] text-danger">{errors.unit}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categorization */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Categorization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => updateField('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Subscriptions">Subscriptions</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-[11px] text-danger">{errors.category}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Tax Category</Label>
                <Select value={form.taxCategory || 'none'} onValueChange={(v) => updateField('taxCategory', v === 'none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="No tax category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No tax category</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="reduced">Reduced</SelectItem>
                    <SelectItem value="exempt">Exempt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Low Stock Threshold</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.lowStockThreshold}
                  onChange={(e) => updateField('lowStockThreshold', parseInt(e.target.value) || 0)}
                  placeholder="10"
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label>Product Status</Label>
              <Select value={form.status} onValueChange={(v) => updateField('status', v)}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/business-admin/products')}>
            Cancel
          </Button>
          <Button type="submit" loading={createProduct.isPending}>
            <Save className="h-4 w-4 mr-1.5" />
            {createProduct.isPending ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  )
}
