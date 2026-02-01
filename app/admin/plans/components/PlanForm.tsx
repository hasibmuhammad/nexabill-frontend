"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlanFormValues, planSchema } from "@/lib/schemas/plan";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

interface PlanFormProps {
  initialData?: any;
  onSubmit: (values: PlanFormValues) => void;
  formId: string;
}

export function PlanForm({ initialData, onSubmit, formId }: PlanFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      maxClients: initialData?.maxClients || 100,
      maxMikrotikServers: initialData?.maxMikrotikServers || 1,
      basePrice: initialData?.basePrice ? Number(initialData.basePrice) : 0,
      setupFee: initialData?.setupFee ? Number(initialData.setupFee) : 0,
      pricePerExtraClient: initialData?.pricePerExtraClient ? Number(initialData.pricePerExtraClient) : 0,
      billingCycle: initialData?.billingCycle || "MONTHLY",
      isWhiteLabelEnabled: initialData?.isWhiteLabelEnabled || false,
      hasAdvancedAnalytics: initialData?.hasAdvancedAnalytics || false,
      hasAPI: initialData?.hasAPI || false,
      hasAutomatedReporting: initialData?.hasAutomatedReporting || false,
      hasRadiusSupport: initialData?.hasRadiusSupport || false,
      supportLevel: initialData?.supportLevel || "BASIC",
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  const onFormSubmit = (data: PlanFormValues) => {
    onSubmit(data);
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Plan Name"
              required
              {...register("name")}
              placeholder="Starter, Professional, etc."
              error={errors.name?.message}
            />
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm h-[72px] mt-6">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Active Status</p>
                <p className="text-xs text-slate-500">
                  Plan is available for new subscriptions
                </p>
              </div>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
          <Textarea
            label="Description"
            {...register("description")}
            placeholder="Brief description of the plan..."
            rows={3}
            error={errors.description?.message}
          />
        </div>

        {/* Limits */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-medium border-b pb-2">Physical Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Max Clients"
              required
              type="number"
              {...register("maxClients")}
              error={errors.maxClients?.message}
            />
            <Input
              label="Max Mikrotik Servers"
              required
              type="number"
              {...register("maxMikrotikServers")}
              error={errors.maxMikrotikServers?.message}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-medium border-b pb-2">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Base Price (BDT)"
              required
              type="number"
              {...register("basePrice")}
              error={errors.basePrice?.message}
            />
            <Input
              label="Setup Fee (One-time)"
              type="number"
              {...register("setupFee")}
              error={errors.setupFee?.message}
            />
            <Input
              label="Price Per Extra Client"
              type="number"
              {...register("pricePerExtraClient")}
              error={errors.pricePerExtraClient?.message}
            />
            <Controller
              control={control}
              name="billingCycle"
              render={({ field }) => (
                <Select
                  label="Billing Cycle"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "MONTHLY", label: "Monthly" },
                    { value: "YEARLY", label: "Yearly" },
                  ]}
                  showSearch={false}
                  error={errors.billingCycle?.message}
                />
              )}
            />
          </div>
        </div>

        {/* Feature Flags */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-medium border-b pb-2">Features & Support</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 rounded-md border p-4">
              <Controller
                control={control}
                name="isWhiteLabelEnabled"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <span className="text-sm font-medium">White Labeling</span>
            </div>
            <div className="flex items-center space-x-3 rounded-md border p-4">
              <Controller
                control={control}
                name="hasAdvancedAnalytics"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <span className="text-sm font-medium">Advanced Analytics</span>
            </div>
            <div className="flex items-center space-x-3 rounded-md border p-4">
              <Controller
                control={control}
                name="hasAPI"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <span className="text-sm font-medium">API Access</span>
            </div>
            <div className="flex items-center space-x-3 rounded-md border p-4">
              <Controller
                control={control}
                name="hasAutomatedReporting"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <span className="text-sm font-medium">Automated Reporting</span>
            </div>
            <div className="flex items-center space-x-3 rounded-md border p-4">
              <Controller
                control={control}
                name="hasRadiusSupport"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <span className="text-sm font-medium">Radius Support</span>
            </div>
            <Controller
              control={control}
              name="supportLevel"
              render={({ field }) => (
                <Select
                  label="Support Level"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "BASIC", label: "Basic (Email)" },
                    { value: "PRIORITY", label: "Priority (Support)" },
                    { value: "DEDICATED", label: "Dedicated Manager" },
                  ]}
                  showSearch={false}
                  error={errors.supportLevel?.message}
                />
              )}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
