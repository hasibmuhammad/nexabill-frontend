"use client";

import { Card } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import { DayInput } from "@/components/ui/day-input";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type ConnectionType
} from "@/lib/api-connection-types";
import { type District } from "@/lib/api-districts";
import { type Employee } from "@/lib/api-employees";
import { type MikrotikServer } from "@/lib/api-mikrotik";
import { type ProtocolType } from "@/lib/api-protocol-types";
import { getSubzones } from "@/lib/api-subzones";
import { type Upazila } from "@/lib/api-upazilas";
import { type Zone } from "@/lib/api-zones";
import { type ServiceProfile } from "@/lib/packages";
import { type ClientFormValues } from "@/lib/schemas/client";
import { useQuery } from "@tanstack/react-query";
import {
  Camera,
  FileImage,
  MapPin,
  Package,
  Phone,
  Settings,
  User,
  Wifi,
} from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

interface ClientFormTabsProps {
  packages?: ServiceProfile[];
  districts?: District[];
  upazilas?: Upazila[];
  servers?: MikrotikServer[];
  protocolTypes?: ProtocolType[];
  zones?: Zone[];
  connectionTypes?: ConnectionType[];
  employees?: Employee[];
}

export function BasicInfoTab({}: ClientFormTabsProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ClientFormValues>();

  const nidPicture = watch("nidPicture");
  const registrationFormPicture = watch("registrationFormPicture");

  const handleFileChange = (
    field: "nidPicture" | "registrationFormPicture",
    file: File | null
  ) => {
    setValue(field, file);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
          <User className="h-5 w-5 text-slate-500" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Basic Information
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Personal details and identification information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              required
              label="Full Name"
              placeholder="Enter client's full name"
              {...register("name")}
              error={errors.name?.message}
            />
          </div>

          <div>
            <Input
              required
              label="NID/Birth Certificate No"
              placeholder="Enter NID or Birth Certificate number"
              {...register("nid")}
              error={errors.nid?.message}
            />
          </div>

          <div>
            <Input
              label="Registration Form No"
              placeholder="Enter registration form number"
              {...register("registrationFormNo")}
              error={errors.registrationFormNo?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              NID/Birth Certificate Picture
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileChange("nidPicture", e.target.files?.[0] || null)
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                  <Camera className="h-4 w-4" />
                  <span className="text-sm">
                    {nidPicture instanceof File
                      ? nidPicture.name
                      : "Upload NID Picture"}
                  </span>
                </div>
              </div>
            </div>
            {errors.nidPicture && (
              <p className="mt-1 text-xs text-red-500">
                {errors.nidPicture.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Registration Form Picture
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileChange(
                    "registrationFormPicture",
                    e.target.files?.[0] || null
                  )
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                  <FileImage className="h-4 w-4" />
                  <span className="text-sm">
                    {registrationFormPicture instanceof File
                      ? registrationFormPicture.name
                      : "Upload Registration Form"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ContactInfoTab({
  districts = [],
  upazilas = [],
}: ClientFormTabsProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ClientFormValues>();

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
          <Phone className="h-5 w-5 text-slate-500" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Contact Information
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Communication and location details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              required
              label="Mobile Number"
              placeholder="+880 1XXX XXXXXX"
              {...register("mobileNumber")}
              error={errors.mobileNumber?.message}
            />
          </div>

          <div>
            <Input
              label="Email Address"
              type="email"
              placeholder="client@example.com"
              {...register("email")}
              error={errors.email?.message}
            />
          </div>

          <div>
            <Controller
              name="districtId"
              control={control}
              render={({ field }) => (
                <Select
                  required
                  label="District"
                  placeholder="Select district"
                  value={field.value}
                  onChange={field.onChange}
                  options={districts.map((district) => ({
                    value: district.id,
                    label: district.name,
                  }))}
                  error={errors.districtId?.message}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="upazilaId"
              control={control}
              render={({ field }) => (
                <Select
                  required
                  label="Upazila"
                  placeholder="Select upazila"
                  value={field.value}
                  onChange={field.onChange}
                  options={upazilas.map((upazila) => ({
                    value: upazila.id,
                    label: upazila.name,
                  }))}
                  error={errors.upazilaId?.message}
                />
              )}
            />
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Latitude"
                  placeholder="e.g., 23.8103"
                  {...register("latitude")}
                  error={errors.latitude?.message}
                />
              </div>
              <div>
                <Input
                  label="Longitude"
                  placeholder="e.g., 90.4125"
                  {...register("longitude")}
                  error={errors.longitude?.message}
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">
               <MapPin className="h-3 w-3 inline mr-1" />
               Location coordinates
            </p>
          </div>

          <div className="md:col-span-2">
            <Textarea
              label="Address"
              placeholder="Road number, house number, area details"
              {...register("address")}
              error={errors.address?.message}
              rows={3}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

export function NetworkInfoTab({
  servers = [],
  protocolTypes = [],
  zones = [],
  connectionTypes = [],
}: ClientFormTabsProps) {
  const {
    control,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useFormContext<ClientFormValues>();
  const zoneId = watch("zoneId");

  const { data: subzonesRes, isLoading: loadingSubzones } = useQuery({
    queryKey: ["subzones", { zoneId }],
    queryFn: () => getSubzones({ zoneId, isActive: true, limit: 1000 }),
    enabled: !!zoneId,
  });
  const subzones = subzonesRes?.data || [];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
          <Wifi className="h-5 w-5 text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Network Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Controller
              name="mikrotikServerId"
              control={control}
              render={({ field }) => (
                <Select
                  required
                  label="Server"
                  placeholder="Select server"
                  value={field.value}
                  onChange={field.onChange}
                  options={servers.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  error={errors.mikrotikServerId?.message}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="protocolTypeId"
              control={control}
              render={({ field }) => (
                <Select
                  required
                  label="Protocol"
                  placeholder="Select protocol"
                  value={field.value}
                  onChange={field.onChange}
                  options={protocolTypes.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  error={errors.protocolTypeId?.message}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="zoneId"
              control={control}
              render={({ field }) => (
                <Select
                  required
                  label="Zone"
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    setValue("subzoneId", "");
                  }}
                  options={zones.map((z) => ({ value: z.id, label: z.name }))}
                  error={errors.zoneId?.message}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="subzoneId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Subzone"
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={subzones.map((s) => ({ value: s.id, label: s.name }))}
                  disabled={!zoneId || loadingSubzones}
                  placeholder={loadingSubzones ? "Loading..." : "Select subzone"}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="connectionTypeId"
              control={control}
              render={({ field }) => (
                <Select
                  required
                  label="Connection Type"
                  value={field.value}
                  onChange={field.onChange}
                  options={connectionTypes.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  error={errors.connectionTypeId?.message}
                />
              )}
            />
          </div>

          <div>
            <Input
              type="number"
              label="Cable (m)"
              {...register("cableRequirement")}
            />
          </div>
          <div>
            <Input label="Fiber Code" {...register("fiberCode")} />
          </div>
          <div>
            <Input
              type="number"
              label="Cores"
              {...register("numberOfCore")}
            />
          </div>
          <div>
            <Input label="Core Color" {...register("coreColor")} />
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ServiceInfoTab({
  packages = [],
  employees = [],
}: ClientFormTabsProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ClientFormValues>();

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
          <Package className="h-5 w-5 text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Service Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Controller
              name="serviceProfileId"
              control={control}
              render={({ field }) => (
                <Select
                  required
                  label="Package"
                  value={field.value}
                  onChange={field.onChange}
                  options={packages.map((p) => ({
                    value: p.id,
                    label: `${p.name} - ৳${p.monthlyPrice}`,
                  }))}
                  error={errors.serviceProfileId?.message}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="clientType"
              control={control}
              render={({ field }) => (
                <Select
                  required
                  label="Client Type"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "HOME", label: "Home" },
                    { value: "CORPORATE", label: "Corporate" },
                  ]}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="billingStatus"
              control={control}
              render={({ field }) => (
                <Select
                  required
                  label="Billing Status"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                  ]}
                  error={errors.billingStatus?.message}
                />
              )}
            />
          </div>

          <div>
            <Input
              required
              label="Username"
              {...register("mikrotikUsername")}
              error={errors.mikrotikUsername?.message}
            />
          </div>

          <div>
            <PasswordInput
              required
              label="Password"
              {...register("password")}
              error={errors.password?.message}
            />
          </div>

          <div>
            <Controller
              name="joiningDate"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="Joining Date"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="billingCycle"
              control={control}
              render={({ field }) => (
                <DayInput
                  label="Cycle Day"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div>
             <Input label="Reference" {...register("referenceBy")} />
          </div>

          <div>
            <Controller
              name="assignTo"
              control={control}
              render={({ field }) => (
                <Select
                  label="Assign To"
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={employees.map((e) => ({
                    value: e.id,
                    label: e.name,
                  }))}
                />
              )}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="h-5 w-5 text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Additional Information
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("isVipClient")}
                className="rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Mark as VIP Client
              </span>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}
