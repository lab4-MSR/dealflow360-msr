import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "../components/BusinessAdminPageHeader"
import { useCreateSubscriptionPlan } from "../hooks/use-business-admin"
import { toast } from "sonner"
import { Plus, X, Save, ArrowLeft, AlertTriangle } from "lucide-react"

const createPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required").min(3, "Plan name must be at least 3 characters"),
  description: z.string().optional(),
  planType: z.enum(["monthly", "quarterly", "semi_annual", "annual", "trial"]),
  price: z.number().min(0.01, "Price must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  billingCycle: z.string().min(1, "Billing cycle is required"),
  billingFrequency: z.number().min(1, "Frequency must be at least 1"),
  trialEnabled: z.boolean().default(false),
  trialDuration: z.number().min(0).optional(),
  prorationUpgradeRule: z.enum(["prorate", "charge_full", "no_charge"]).default("prorate"),
  prorationDowngradeRule: z.enum(["prorate", "credit_full", "no_credit"]).default("prorate"),
  prorationBehavior: z.enum(["create_proration", "no_proration"]).default("create_proration"),
  cancellationPolicy: z.enum(["immediate", "end_of_period"]).default("end_of_period"),
  refundPolicy: z.enum(["full_refund", "partial_refund", "no_refund"]).default("no_refund"),
  effectiveDate: z.string().optional(),
})

type CreatePlanFormData = z.infer<typeof createPlanSchema>

export function CreateSubscriptionPlanPage() {
  const navigate = useNavigate()
  const createPlan = useCreateSubscriptionPlan()
  const [features, setFeatures] = useState<Array<{ name: string; enabled: boolean; description: string }>>([])
  const [usageLimits, setUsageLimits] = useState<Array<{ name: string; value: number; unit: string }>>([])
  const [newFeature, setNewFeature] = useState("")
  const [newLimitName, setNewLimitName] = useState("")
  const [newLimitValue, setNewLimitValue] = useState("")
  const [newLimitUnit, setNewLimitUnit] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      planType: "monthly",
      currency: "USD",
      billingCycle: "monthly",
      billingFrequency: 1,
      trialEnabled: false,
      prorationUpgradeRule: "prorate",
      prorationDowngradeRule: "prorate",
      prorationBehavior: "create_proration",
      cancellationPolicy: "end_of_period",
      refundPolicy: "no_refund",
    },
  })

  const trialEnabled = watch("trialEnabled")

  const addFeature = () => {
    if (!newFeature.trim()) return
    setFeatures([...features, { name: newFeature.trim(), enabled: true, description: "" }])
    setNewFeature("")
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const addUsageLimit = () => {
    if (!newLimitName.trim() || !newLimitValue) return
    setUsageLimits([...usageLimits, { name: newLimitName.trim(), value: Number(newLimitValue), unit: newLimitUnit || "units" }])
    setNewLimitName("")
    setNewLimitValue("")
    setNewLimitUnit("")
  }

  const removeUsageLimit = (index: number) => {
    setUsageLimits(usageLimits.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: CreatePlanFormData) => {
    try {
      await createPlan.mutateAsync({
        name: data.name,
        description: data.description,
        planType: data.planType,
        price: data.price,
        currency: data.currency,
        billingCycle: data.billingCycle,
        billingFrequency: data.billingFrequency,
        trialEnabled: data.trialEnabled,
        trialDuration: data.trialDuration,
        prorationUpgradeRule: data.prorationUpgradeRule,
        prorationDowngradeRule: data.prorationDowngradeRule,
        prorationBehavior: data.prorationBehavior,
        cancellationPolicy: data.cancellationPolicy,
        refundPolicy: data.refundPolicy,
        effectiveDate: data.effectiveDate,
        features: features.length > 0 ? features : undefined,
        usageLimits: usageLimits.length > 0 ? usageLimits : undefined,
      })
      toast.success("Subscription plan created successfully")
      navigate("/business-admin/subscription-plans")
    } catch {
      toast.error("Failed to create subscription plan")
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Create Subscription Plan"
        description="Configure a new subscription plan with pricing, features, and billing rules."
        breadcrumbs={[
          { label: "Business Admin", path: "/business-admin/dashboard" },
          { label: "Subscriptions", path: "/business-admin/subscription-plans" },
          { label: "Create Plan" },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate("/business-admin/subscription-plans")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />Back to Plans
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Plan Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Plan Name <span className="text-danger">*</span></Label>
                <Input id="name" {...register("name")} placeholder="e.g., Professional Plan" />
                {errors.name && <p className="text-[11px] text-danger">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="planType">Plan Type <span className="text-danger">*</span></Label>
                <Select onValueChange={(v) => setValue("planType", v as CreatePlanFormData["planType"])}>
                  <SelectTrigger><SelectValue placeholder="Select plan type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} placeholder="Describe what this plan includes..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing <span className="text-danger">*</span></CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price <span className="text-danger">*</span></Label>
                <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} placeholder="0.00" />
                {errors.price && <p className="text-[11px] text-danger">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currency">Currency <span className="text-danger">*</span></Label>
                <Select onValueChange={(v) => setValue("currency", v)} defaultValue="USD">
                  <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="billingCycle">Billing Cycle <span className="text-danger">*</span></Label>
                <Select onValueChange={(v) => setValue("billingCycle", v)} defaultValue="monthly">
                  <SelectTrigger><SelectValue placeholder="Select cycle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Plan Features</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Add a feature..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} />
              <Button type="button" variant="outline" onClick={addFeature}><Plus className="h-4 w-4" />Add</Button>
            </div>
            {features.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {features.map((f, i) => (
                  <Badge key={i} variant="secondary" className="gap-1.5">
                    {f.name}
                    <button type="button" onClick={() => removeFeature(i)} className="hover:text-danger"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-muted-foreground">No features added yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Trial Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="trialEnabled" {...register("trialEnabled")} className="h-4 w-4 rounded border-input" />
              <Label htmlFor="trialEnabled" className="cursor-pointer">Enable Trial Period</Label>
            </div>
            {trialEnabled && (
              <div className="space-y-1.5">
                <Label htmlFor="trialDuration">Trial Duration (days)</Label>
                <Input id="trialDuration" type="number" {...register("trialDuration", { valueAsNumber: true })} placeholder="14" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Proration Rules</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-info-subtle border border-info/20 p-3">
              <p className="text-[12px] text-info flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Proration rules determine how billing is adjusted when customers change plans mid-cycle.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Upgrade Rule</Label>
                <Select onValueChange={(v) => setValue("prorationUpgradeRule", v as CreatePlanFormData["prorationUpgradeRule"])} defaultValue="prorate">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prorate">Prorate (charge difference)</SelectItem>
                    <SelectItem value="charge_full">Charge full new price</SelectItem>
                    <SelectItem value="no_charge">No additional charge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Downgrade Rule</Label>
                <Select onValueChange={(v) => setValue("prorationDowngradeRule", v as CreatePlanFormData["prorationDowngradeRule"])} defaultValue="prorate">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prorate">Prorate (credit difference)</SelectItem>
                    <SelectItem value="credit_full">Full credit</SelectItem>
                    <SelectItem value="no_credit">No credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cancellation Policy</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Cancellation Policy</Label>
                <Select onValueChange={(v) => setValue("cancellationPolicy", v as CreatePlanFormData["cancellationPolicy"])} defaultValue="end_of_period">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="end_of_period">End of billing period</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Refund Policy</Label>
                <Select onValueChange={(v) => setValue("refundPolicy", v as CreatePlanFormData["refundPolicy"])} defaultValue="no_refund">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_refund">Full refund</SelectItem>
                    <SelectItem value="partial_refund">Partial refund (prorated)</SelectItem>
                    <SelectItem value="no_refund">No refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={() => navigate("/business-admin/subscription-plans")} disabled={isSubmitting}>
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting || createPlan.isPending}>
              {isSubmitting || createPlan.isPending ? "Creating..." : "Create Plan"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
