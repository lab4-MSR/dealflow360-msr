import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateShippingRule } from '../hooks/use-business-admin'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useShippingRules } from '../hooks/use-business-admin'
import { useShippingRules as useShippingRulesHook } from '../hooks/use-business-admin'
import type { ShippingRule, ShippingDestination, ShippingProductFilter } from '../types'
import { Plus, Search, CheckCircle, AlertTriangle, X, } from 'lucide-react'

const createShippingRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  destinationCountry: z.string().min(1, 'Destination country is required'),
  destinationState: z.string().optional(),
  destinationPostalCode: z.string().optional(),
  warehouseId: z.string().optional(),
  allocationStrategy: z.enum(['stock_availability', 'shipping_cost', 'shipment_count', 'warehouse_priority']).default('stock_availability'),
  shippingMethod: z.enum(['standard', 'express', 'priority']).default('standard'),
  minOrderValue: z.number().min(0, 'Minimum order value must be positive').optional(),
  maxOrderValue: z.number().min(0, 'Maximum order value must be positive').optional(),
  minWeight: z.number().min(0, 'Minimum weight must be positive').optional(),
  maxWeight: z.number().min(0, 'Maximum weight must be positive').optional(),
})

export function CreateShippingRulePage() {
  const navigate = useNavigate()
  const [warehouses, setWarehouses] = useState<Array<{ id: string; name: string }>>([])
  const [destinations, setDestinations] = useState<ShippingDestination[]>([])
  const { data: rules, refetch } = useShippingRules({})

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<z.infer<typeof createShippingRuleSchema>>({
    resolver: undefined,
  })

  const { mutateAsync, isPending, isError, error: mutationError } = useCreateShippingRule()

  const onSubmit = async (data: z.infer<typeof createShippingRuleSchema>) => {
    try {
      await mutateAsync({
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        destination: {
          country: data.destinationCountry,
          state: data.destinationState,
          postalCode: data.destinationPostalCode,
        } as ShippingDestination,
        warehouse: data.warehouseId || null,
        minOrderValue: data.minOrderValue,
        maxOrderValue: data.maxOrderValue,
        minWeight: data.minWeight,
        maxWeight: data.maxWeight,
        allocationStrategy: data.allocationStrategy,
        shippingMethod: data.shippingMethod,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      toast.success('Shipping rule created successfully')
      navigate('/business-admin/shipping-rules')
      refetch()
    } catch {
      toast.error('Failed to create shipping rule')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Create Shipping Rule"
        description="Define a new shipping rule to control warehouse allocation and shipping method behavior"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Warehouses', path: '/business-admin/warehouses' },
          { label: 'Shipping Rules' },
          { label: 'Create Rule' },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 bg-card rounded-lg">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1">Rule Name</label>
            <Input
              {...register('name', { required: 'Rule name is required' })}
              placeholder="e.g., Domestic Standard Shipping"
              />
            {errors.name && <p className="text-sm text-danger">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1">Status</label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-danger">{errors.status.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1">Priority</label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            {errors.priority && <p className="text-sm text-danger">{errors.priority.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1">Shipping Method</label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
            {errors.shippingMethod && <p className="text-sm text-danger">{errors.shippingMethod.message}</p>}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1">Destination Country</label>
          <Input
            {...register('destinationCountry', { required: 'Destination country is required' })}
            placeholder="e.g., India"
            />
          {errors.destinationCountry && <p className="text-sm text-danger">{errors.destinationCountry.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1">State/Region</label>
            <Input
              {...register('destinationState', {})}
              placeholder="e.g., Maharashtra"
              />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1">Postal Code</label>
            <Input
              {...register('destinationPostalCode', {})}
              placeholder="e.g., 400001"
              />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1">Warehouse</label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">None (Global)</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1">Allocation Strategy</label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select strategy" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="stock_availability">Stock Availability</SelectItem>
                <SelectItem value="shipping_cost">Shipping Cost</SelectItem>
                <SelectItem value="shipment_count">Shipment Count</SelectItem>
                <SelectItem value="warehouse_priority">Warehouse Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1">Min Order Value</label>
            <Input
              type="number"
              {...register('minOrderValue', {})}
              placeholder="0"
              className="w-full"
              />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1">Max Order Value</label>
            <Input
              type="number"
              {...register('maxOrderValue', {})}
              placeholder="0"
              className="w-full"
              />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1">Min Weight</label>
            <Input
              type="number"
              {...register('minWeight', {})}
              placeholder="0"
              className="w-full"
              />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1">Max Weight</label>
            <Input
              type="number"
              {...register('maxWeight', {})}
              placeholder="0"
              className="w-full"
              />
          </div>
        </div>

        <Button type="submit" disabled={isPending || !isDirty}>
          {isPending ? 'Creating...' : 'Create Shipping Rule'}
        </Button>

        <Button
          type="button"
          onClick={() => navigate('/business-admin/shipping-rules')}
          variant="outline"
          disabled={isPending}
        >
          Cancel
        </Button>
      </form>
    </div>
  )
}
