"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { organizationSchema, type OrganizationFormValues } from "@/lib/schemas/organization";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

interface Organization {
  id?: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  plan: string;
  status: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  settings?: any;
  features?: any;
}

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
      plan: "TRIAL",
      status: "TRIAL",
      trialEndsAt: "",
      subscriptionEndsAt: "",
      settings: {
        maxClients: 100,
        maxUsers: 5,
        maxMikrotikServers: 3,
      },
      features: {
        analytics: true,
        reports: true,
        billing: true,
        clientManagement: true,
      },
    },
  });

  const logo = watch("logo");
  const name = watch("name");
  const plan = watch("plan");
  const status = watch("status");

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
        plan: (organization.plan as any) || "TRIAL",
        status: (organization.status as any) || "TRIAL",
        trialEndsAt: organization.trialEndsAt
          ? new Date(organization.trialEndsAt).toISOString().slice(0, 10)
          : "",
        subscriptionEndsAt: organization.subscriptionEndsAt
          ? new Date(organization.subscriptionEndsAt).toISOString().slice(0, 10)
          : "",
        settings: organization.settings || {
          maxClients: 100,
          maxUsers: 5,
          maxMikrotikServers: 3,
        },
        features: organization.features || {
          analytics: true,
          reports: true,
          billing: true,
          clientManagement: true,
        },
      });
    }
  }, [organization, reset]);

  const onFormSubmit = (data: OrganizationFormValues) => {
    const payload = {
      ...data,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      trialEndsAt: data.trialEndsAt
        ? new Date(data.trialEndsAt).toISOString()
        : '',
      subscriptionEndsAt: data.subscriptionEndsAt
        ? new Date(data.subscriptionEndsAt).toISOString()
        : '',
      logo: data.logo || '',
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
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Logo
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg hover:border-slate-400 dark:hover:border-slate-500 transition-colors duration-200">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-slate-600 dark:text-slate-400">
                    <label
                      htmlFor="logo-upload"
                      className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="logo-upload"
                        name="logo-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setValue("logo", file);
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PNG, JPG, GIF up to 10MB
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
                options={[
                  { value: "TRIAL", label: "Trial" },
                  { value: "BASIC", label: "Basic" },
                  { value: "PREMIUM", label: "Premium" },
                  { value: "ENTERPRISE", label: "Enterprise" },
                ]}
                placeholder="Select plan"
                showSearch={false}
                error={errors.plan?.message}
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
                label="Max Users"
                type="number"
                {...register("settings.maxUsers")}
                error={errors.settings?.maxUsers?.message}
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
