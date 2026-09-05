import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useCreateWarehouse } from '../hooks/use-business-admin'
import { toast } from 'sonner'
import { Plus, ArrowLeft, MapPin, Mail, Phone, HardDrive, Truck, Settings, Package, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_OPTIONS = [
  { value: 'distribution', label: 'Distribution Center' },
  { value: 'fulfillment', label: 'Fulfillment Center' },
  { value: 'returns', label: 'Returns Processing' },
  { value: 'cross_dock', label: 'Cross-Dock' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
]

function CreateWarehousePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'distribution',
    status: 'active',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    managerName: '',
    managerEmail: '',
    managerPhone: '',
    storageCapacity: 0,
    capacityThreshold: 0,
    isDefault: false,
    allocationPriority: 1,
    shippingCost: 0,
    shipmentPriority: 'normal',
  })
  const createWarehouse = useCreateWarehouse()

  const handleChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createWarehouse.mutateAsync(formData as any)
      toast.success('Warehouse created')
      navigate('/business-admin/warehouses')
    } catch { toast.error('Failed to create warehouse') }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Warehouse"
        description="Configure a new warehouse location with capacity, fulfillment settings, and allocation rules"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Warehouses', path: '/business-admin/warehouses' },
          { label: 'Create Warehouse' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-1.5" />Cancel</Button>
            <Button onClick={handleSubmit} disabled={createWarehouse.isPending}><Plus className="h-4 w-4 mr-1.5" />Create Warehouse</Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Warehouse Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Warehouse Name *</Label><Input value={formData.name} onChange={e => handleChange('name', e.target.value)} required placeholder="e.g., Main Distribution Center" /></div>
                <div className="space-y-2"><Label>Warehouse Code *</Label><Input value={formData.code} onChange={e => handleChange('code', e.target.value)} required placeholder="e.g., MDC-001" maxLength={20} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Type *</Label><Select value={formData.type} onValueChange={v => handleChange('type', v)}><SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{TYPE_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Status *</Label><Select value={formData.status} onValueChange={v => handleChange('status', v)}><SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem></SelectContent></Select></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Location</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Address Line 1 *</Label><Input value={formData.addressLine1} onChange={e => handleChange('addressLine1', e.target.value)} required placeholder="100 Industrial Park" /></div>
              <div className="space-y-2"><Label>Address Line 2</Label><Input value={formData.addressLine2} onChange={e => handleChange('addressLine2', e.target.value)} placeholder="Optional" /></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>City *</Label><Input value={formData.city} onChange={e => handleChange('city', e.target.value)} required placeholder="Mumbai" /></div>
                <div className="space-y-2"><Label>State/Province *</Label><Input value={formData.state} onChange={e => handleChange('state', e.target.value)} required placeholder="Maharashtra" /></div>
                <div className="space-y-2"><Label>Country *</Label><Input value={formData.country} onChange={e => handleChange('country', e.target.value)} required placeholder="India" /></div>
              </div>
              <div className="space-y-2"><Label>Postal Code *</Label><Input value={formData.postalCode} onChange={e => handleChange('postalCode', e.target.value)} required placeholder="400001" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Contact</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Manager Name</Label><Input value={formData.managerName} onChange={e => handleChange('managerName', e.target.value)} placeholder="Tom Wilson" /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.managerEmail} onChange={e => handleChange('managerEmail', e.target.value)} placeholder="tom@acme.com" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={formData.managerPhone} onChange={e => handleChange('managerPhone', e.target.value)} placeholder="+91 98765 43210" /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><HardDrive className="h-5 w-5" />Capacity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Storage Capacity *</Label><Input type="number" min="1" value={formData.storageCapacity} onChange={e => handleChange('storageCapacity', parseInt(e.target.value) || 0)} required placeholder="50000" /></div>
                <div className="space-y-2"><Label>Capacity Threshold (Alert Level)</Label><Input type="number" min="0" value={formData.capacityThreshold} onChange={e => handleChange('capacityThreshold', parseInt(e.target.value) || 0)} placeholder="45000" /></div>
              </div>
              <div className="space-y-2">
                <Label>Current Capacity</Label>
                <Input value="0 (computed from inventory)" disabled />
                <p className="text-xs text-muted-foreground">Read-only — automatically calculated from inventory levels</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" />Fulfillment Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Default Warehouse</Label><Select value={formData.isDefault ? 'true' : 'false'} onValueChange={v => handleChange('isDefault', v === 'true')}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="false">No</SelectItem><SelectItem value="true">Yes</SelectItem></SelectContent>
              </Select><p className="text-xs text-muted-foreground">Only one warehouse can be default. Setting this will unset the current default.</p></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Allocation Priority *</Label><Input type="number" min="1" value={formData.allocationPriority} onChange={e => handleChange('allocationPriority', parseInt(e.target.value) || 1)} required placeholder="1" /><p className="text-xs text-muted-foreground">Lower = higher priority for allocation</p></div>
                <div className="space-y-2"><Label>Shipping Cost</Label><Input type="number" min="0" step="0.01" value={formData.shippingCost} onChange={e => handleChange('shippingCost', parseFloat(e.target.value) || 0)} placeholder="50" /></div>
                <div className="space-y-2"><Label>Shipment Priority</Label><Select value={formData.shipmentPriority} onValueChange={v => handleChange('shipmentPriority', v)}><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{PRIORITY_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={createWarehouse.isPending}>
            {createWarehouse.isPending ? 'Creating...' : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export { CreateWarehousePage }