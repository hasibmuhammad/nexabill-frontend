"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type Organization } from "@/lib/api-organizations";
import { subscriptionPlansApi } from "@/lib/api-subscription-plans";
import { uploadApi } from "@/lib/api-upload";
import { organizationSchema, type OrganizationFormValues } from "@/lib/schemas/organization";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

interface OrganizationFormProps {
  organization?: Organization;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitText?: string;
  cancelText?: string;
}

export function OrganizationForm({
  organization,
  onSubmit,
  onCancel,
  isLoading = false,
  submitText = "Create Organization",
  cancelText = "Cancel",
}: OrganizationFormProps) {
  // Fetch available subscription plans
  const { data: plansResponse, isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => subscriptionPlansApi.getAll({ isActive: true }),
  });

  const plans = plansResponse?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      email: "",
      phone: "",
      address: "",
      logo: "",
      plan: "" as any,
      status: "" as any,
      trialEndsAt: "",
      subscriptionEndsAt: "",
      settings: {
        maxClients: "" as any,
        maxMikrotikServers: "" as any,
      },
      features: {
        analytics: false,
        reports: false,
        billing: false,
        clientManagement: false,
      },
      licenseNumber: "",
      binNumber: "",
      tinNumber: "",
      ispCategory: "",
      username: "",
      password: "",
    },
  });

  const [isUploading, setIsUploading] = useState(false);

  const logo = watch("logo");
  const name = watch("name");
  const plan = watch("plan");
  const status = watch("status");
  const ispCategory = watch("ispCategory");

  // Auto-generate slug from name
  useEffect(() => {
    // Only auto-generate if the slug field hasn't been manually touched
    if (!dirtyFields.slug && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [name, setValue, dirtyFields.slug]);

  // Auto-populate limits from selected plan
  useEffect(() => {
    if (plan && plans.length > 0) {
      const selectedPlan = plans.find((p: any) => p.id === plan);
      if (selectedPlan) {
        setValue("settings.maxClients", selectedPlan.maxClients, { shouldValidate: true });
        setValue("settings.maxMikrotikServers", selectedPlan.maxMikrotikServers, { shouldValidate: true });
      }
    }
  }, [plan, plans, setValue]);

  // Initialize form data when organization prop changes
  useEffect(() => {
    if (organization) {
      reset({
        name: organization.name || "",
        slug: organization.slug || "",
        email: organization.email || "",
        phone: organization.phone || "",
        address: organization.address || "",
        logo: organization.logo || "",
        plan: (typeof organization.plan === "object" ? organization.plan.id : (organization as any).planId || organization.plan) || "",
        status: (organization.status as any) || "",
        trialEndsAt: organization.trialEndsAt
          ? new Date(organization.trialEndsAt).toISOString().slice(0, 10)
          : "",
        subscriptionEndsAt: organization.subscriptionEndsAt
          ? new Date(organization.subscriptionEndsAt).toISOString().slice(0, 10)
          : "",
        settings: organization.settings || {
          maxClients: "" as any,
          maxMikrotikServers: "" as any,
        },
        features: organization.features || {
          analytics: false,
          reports: false,
          billing: false,
          clientManagement: false,
        },
        licenseNumber: organization.licenseNumber || "",
        binNumber: organization.binNumber || "",
        tinNumber: organization.tinNumber || "",
        ispCategory: organization.ispCategory || "",
        username: organization.username || "",
        password: "",
      });
    }
  }, [organization, reset]);

  const onFormSubmit = (data: OrganizationFormValues) => {
    const { plan, ...rest } = data;
    const payload = {
      ...rest,
      email: data.email || "",
      phone: data.phone || "",
      address: data.address || "",
      trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt).toISOString() : null,
      subscriptionEndsAt: data.subscriptionEndsAt
        ? new Date(data.subscriptionEndsAt).toISOString()
        : null,
      logo: data.logo || "",
      planId: plan,
    };
    onSubmit(payload);
  };

  return (
    <div className="space-y-6">
      <form id="organization-form" onSubmit={handleSubmit(onFormSubmit)}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Organization Name"
                required
                {...register("name")}
                placeholder="Enter organization name"
                error={errors.name?.message}
              />
              <Input
                label="Slug"
                required
                {...register("slug")}
                placeholder="organization-slug"
                error={errors.slug?.message}
              />
              <Input
                label="Email"
                type="email"
                {...register("email")}
                placeholder="contact@example.com"
                error={errors.email?.message}
              />
              <Input
                label="Phone"
                {...register("phone")}
                placeholder="+8801712345678"
                error={errors.phone?.message}
              />
              {!organization?.id && (
                <>
                  <Input
                    label="Username"
                    required
                    {...register("username")}
                    placeholder="Enter system username"
                    error={errors.username?.message}
                  />
                   <div>
                      <PasswordInput
                        id="password"
                        placeholder="Enter your password"
                        className="w-full"
                        {...register("password")}
                        error={errors.password?.message}
                        label="Password"
                      />
                    </div>
                </>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Logo
              </label>
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors duration-200 ${
                  !name 
                    ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60" 
                    : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer"
                }`}
              >
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-slate-600 dark:text-slate-400">
                    <label
                      htmlFor="logo-upload"
                      className={`relative rounded-md font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${
                        !name ? "cursor-not-allowed" : "cursor-pointer hover:text-blue-500"
                      }`}
                    >
                      {isUploading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        <span>Upload a file</span>
                      )}
                      <input
                        id="logo-upload"
                        name="logo-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        disabled={!name || isUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file && name) {
                            try {
                              setIsUploading(true);
                              const response = await uploadApi.uploadImage(file, name);
                              setValue("logo", response.src, { shouldDirty: true });
                              toast.success("Logo uploaded successfully");
                            } catch (error) {
                              toast.error("Failed to upload logo");
                              console.error(error);
                            } finally {
                              setIsUploading(false);
                            }
                          }
                        }}
                      />
                    </label>
                    {!isUploading && <p className="pl-1">or drag and drop</p>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {!name ? "Please enter organization name first" : "PNG, JPG, GIF up to 10MB"}
                  </p>
                </div>
              </div>
              {logo && (
                <div className="mt-2 flex items-center space-x-2">
                  {typeof logo === "string" ? (
                    <img
                      src={logo}
                      alt="Logo preview"
                      className="h-8 w-8 object-cover rounded"
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(logo)}
                      alt="Logo preview"
                      className="h-8 w-8 object-cover rounded"
                    />
                  )}
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {typeof logo === "string" ? "Current logo" : logo.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setValue("logo", "")}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <Textarea
              label="Address"
              {...register("address")}
              placeholder="Enter organization address"
              rows={3}
              error={errors.address?.message}
            />
          </CardContent>
        </Card>

        {/* Plan & Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Plan & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Plan"
                required
                value={plan}
                onChange={(value) => setValue("plan", value as any)}
                options={plans.map((p: any) => ({ value: p.id, label: p.name }))}
                placeholder={plansLoading ? "Loading plans..." : "Select plan"}
                showSearch={false}
                error={errors.plan?.message}
                disabled={plansLoading}
              />
              <Select
                label="Status"
                required
                value={status}
                onChange={(value) => setValue("status", value as any)}
                options={[
                  { value: "TRIAL", label: "Trial" },
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                  { value: "SUSPENDED", label: "Suspended" },
                ]}
                placeholder="Select status"
                showSearch={false}
                error={errors.status?.message}
              />
              <Controller
                name="trialEndsAt"
                control={control}
                render={({ field }) => (
                  <DateInput
                    label="Trial End Date"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select trial end date"
                    error={errors.trialEndsAt?.message}
                  />
                )}
              />
              <Controller
                name="subscriptionEndsAt"
                control={control}
                render={({ field }) => (
                  <DateInput
                    label="Subscription End Date"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select subscription end date"
                    error={errors.subscriptionEndsAt?.message}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ISP / Business Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="License Number"
                {...register("licenseNumber")}
                placeholder="ISP-12345"
                error={errors.licenseNumber?.message}
              />
              <Input
                label="BIN Number"
                {...register("binNumber")}
                placeholder="123456789"
                error={errors.binNumber?.message}
              />
              <Input
                label="TIN Number"
                {...register("tinNumber")}
                placeholder="987654321"
                error={errors.tinNumber?.message}
              />
              <Select
                label="ISP Category"
                value={ispCategory}
                onChange={(value) => setValue("ispCategory", value)}
                options={[
                  { value: "NATIONWIDE", label: "Nationwide" },
                  { value: "DIVISIONAL", label: "Divisional" },
                  { value: "ZONAL", label: "Zonal" },
                ]}
                placeholder="Select ISP Category"
                showSearch={false}
                error={errors.ispCategory?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Max Clients"
                type="number"
                {...register("settings.maxClients")}
                error={errors.settings?.maxClients?.message}
              />
              <Input
                label="Max Mikrotik Servers"
                type="number"
                {...register("settings.maxMikrotikServers")}
                error={errors.settings?.maxMikrotikServers?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="features.analytics"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Analytics
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  name="features.reports"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Reports
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  name="features.billing"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Billing
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  name="features.clientManagement"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Client Management
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
