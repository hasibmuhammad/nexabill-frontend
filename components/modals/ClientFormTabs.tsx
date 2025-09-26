"use client";

import { Card } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import { DayInput } from "@/components/ui/day-input";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  FileImage,
  MapPin,
  Package,
  Phone,
  Settings,
  Star,
  User,
  Wifi,
} from "lucide-react";

interface ClientFormData {
  // Basic Info
  name: string;
  nid: string;
  nidPicture?: File | null;
  registrationFormNo: string;
  registrationFormPicture?: File | null;

  // Contact Info
  mobileNumber: string;
  email: string;
  districtId: string;
  address: string;
  latitude?: number;
  longitude?: number;

  // Network/Product Info
  mikrotikServerId: string;
  protocolTypeId: string;
  zoneId: string;
  subzoneId: string;
  connectionTypeId: string;
  cableRequirement: string;
  fiberCode: string;
  numberOfCore: string;
  coreColor: string;

  // Service Info
  trackCode: string;
  serviceProfileId: string;
  clientType: string;
  billingStatus: string;
  mikrotikUsername: string;
  password: string;
  joiningDate: string;
  billingCycle: number | null;
  referenceBy: string;
  isVipClient: boolean;
  connectedBy: string;
  assignTo: string;
}

interface ClientFormTabsProps {
  formData: ClientFormData;
  setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>;
  errors: Partial<ClientFormData>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<ClientFormData>>>;
}

export function BasicInfoTab({
  formData,
  setFormData,
  errors,
  setErrors,
}: ClientFormTabsProps) {
  const handleInputChange = (
    field: keyof ClientFormData,
    value: string | number | boolean | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (
    field: "nidPicture" | "registrationFormPicture",
    file: File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
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
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Full Name *
            </label>
            <Input
              placeholder="Enter client's full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={
                errors.name ? "border-red-500 focus:border-red-500" : ""
              }
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* NID/Birth Certificate No */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              NID/Birth Certificate No *
            </label>
            <Input
              placeholder="Enter NID or Birth Certificate number"
              value={formData.nid}
              onChange={(e) => handleInputChange("nid", e.target.value)}
              className={
                errors.nid ? "border-red-500 focus:border-red-500" : ""
              }
            />
            {errors.nid && (
              <p className="mt-1 text-sm text-red-600">{errors.nid}</p>
            )}
          </div>

          {/* Registration Form No */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Registration Form No
            </label>
            <Input
              placeholder="Enter registration form number"
              value={formData.registrationFormNo}
              onChange={(e) =>
                handleInputChange("registrationFormNo", e.target.value)
              }
            />
          </div>

          {/* NID/Birth Certificate Picture */}
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
                    {formData.nidPicture
                      ? formData.nidPicture.name
                      : "Upload NID Picture"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form Picture */}
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
                    {formData.registrationFormPicture
                      ? formData.registrationFormPicture.name
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
  formData,
  setFormData,
  errors,
  setErrors,
}: ClientFormTabsProps) {
  const handleInputChange = (
    field: keyof ClientFormData,
    value: string | number | boolean | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

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
          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mobile Number *
            </label>
            <Input
              placeholder="+880 1XXX XXXXXX"
              value={formData.mobileNumber}
              onChange={(e) =>
                handleInputChange("mobileNumber", e.target.value)
              }
              className={
                errors.mobileNumber ? "border-red-500 focus:border-red-500" : ""
              }
            />
            {errors.mobileNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="client@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              District *
            </label>
            <Input
              placeholder="Select district"
              value={formData.districtId}
              onChange={(e) => handleInputChange("districtId", e.target.value)}
              className={
                errors.districtId ? "border-red-500 focus:border-red-500" : ""
              }
            />
            {/* TODO: Replace with proper district dropdown */}
            <p className="mt-1 text-xs text-slate-500">
              Dropdown will be implemented
            </p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Address
            </label>
            <Textarea
              placeholder="Road number, house number, area details"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              rows={3}
            />
          </div>

          {/* Map Coordinates */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Map Coordinates (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={formData.latitude || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "latitude",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={formData.longitude || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "longitude",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3 inline mr-1" />
              GPS coordinates for precise location mapping
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function NetworkInfoTab({
  formData,
  setFormData,
  errors,
  setErrors,
}: ClientFormTabsProps) {
  const handleInputChange = (
    field: keyof ClientFormData,
    value: string | number | boolean | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
          <Wifi className="h-5 w-5 text-slate-500" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Network & Product Information
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Server configuration and network details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Server */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Server *
            </label>
            <Input
              placeholder="Select Mikrotik server"
              value={formData.mikrotikServerId}
              onChange={(e) =>
                handleInputChange("mikrotikServerId", e.target.value)
              }
              className={
                errors.mikrotikServerId
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }
            />
            {/* TODO: Replace with server dropdown */}
            <p className="mt-1 text-xs text-slate-500">
              Server dropdown will be implemented
            </p>
          </div>

          {/* Protocol Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Protocol Type *
            </label>
            <Input
              placeholder="Select protocol type"
              value={formData.protocolTypeId}
              onChange={(e) =>
                handleInputChange("protocolTypeId", e.target.value)
              }
              className={
                errors.protocolTypeId
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }
            />
            {/* TODO: Replace with protocol dropdown */}
          </div>

          {/* Zone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Zone *
            </label>
            <Input
              placeholder="Select zone"
              value={formData.zoneId}
              onChange={(e) => handleInputChange("zoneId", e.target.value)}
              className={
                errors.zoneId ? "border-red-500 focus:border-red-500" : ""
              }
            />
            {/* TODO: Replace with zone dropdown */}
          </div>

          {/* Subzone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Subzone
            </label>
            <Input
              placeholder="Select subzone"
              value={formData.subzoneId}
              onChange={(e) => handleInputChange("subzoneId", e.target.value)}
            />
            {/* TODO: Replace with subzone dropdown */}
          </div>

          {/* Connection Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Connection Type *
            </label>
            <Input
              placeholder="Select connection type"
              value={formData.connectionTypeId}
              onChange={(e) =>
                handleInputChange("connectionTypeId", e.target.value)
              }
              className={
                errors.connectionTypeId
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }
            />
            {/* TODO: Replace with connection type dropdown */}
          </div>

          {/* Cable Requirement */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Cable Requirement (Metres)
            </label>
            <Input
              type="number"
              placeholder="Enter cable length in metres"
              value={formData.cableRequirement}
              onChange={(e) =>
                handleInputChange("cableRequirement", e.target.value)
              }
            />
          </div>

          {/* Fiber Code */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Fiber Code
            </label>
            <Input
              placeholder="Enter fiber code"
              value={formData.fiberCode}
              onChange={(e) => handleInputChange("fiberCode", e.target.value)}
            />
          </div>

          {/* Number of Core */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Number of Core
            </label>
            <Input
              type="number"
              placeholder="Enter number of cores"
              value={formData.numberOfCore}
              onChange={(e) =>
                handleInputChange("numberOfCore", e.target.value)
              }
            />
          </div>

          {/* Core Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Core Color
            </label>
            <Input
              placeholder="Enter core color"
              value={formData.coreColor}
              onChange={(e) => handleInputChange("coreColor", e.target.value)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ServiceInfoTab({
  formData,
  setFormData,
  errors,
  setErrors,
}: ClientFormTabsProps) {
  const handleInputChange = (
    field: keyof ClientFormData,
    value: string | number | boolean | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Configuration */}
      <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
          <Package className="h-5 w-5 text-slate-500" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Service Configuration
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Package and service details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Package */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Package *
            </label>
            <Input
              placeholder="Select package"
              value={formData.serviceProfileId}
              onChange={(e) =>
                handleInputChange("serviceProfileId", e.target.value)
              }
              className={
                errors.serviceProfileId
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }
            />
            {/* TODO: Replace with package dropdown */}
          </div>

          {/* Client Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Client Type
            </label>
            <Input
              placeholder="Select client type"
              value={formData.clientType}
              onChange={(e) => handleInputChange("clientType", e.target.value)}
            />
          </div>

          {/* Billing Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Billing Status
            </label>
            <Input
              placeholder="Select billing status"
              value={formData.billingStatus}
              onChange={(e) =>
                handleInputChange("billingStatus", e.target.value)
              }
            />
          </div>

          {/* Username/IP */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Username/IP *
            </label>
            <Input
              placeholder="Enter Mikrotik username"
              value={formData.mikrotikUsername}
              onChange={(e) =>
                handleInputChange("mikrotikUsername", e.target.value)
              }
              className={
                errors.mikrotikUsername
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <PasswordInput
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
          </div>

          {/* Joining Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Joining Date
            </label>
            <DateInput
              value={formData.joiningDate}
              onChange={(v) => handleInputChange("joiningDate", v)}
            />
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Billing Cycle (Day: 1-31)
            </label>
            <DayInput
              value={formData.billingCycle}
              onChange={(day) => handleInputChange("billingCycle", day)}
            />
          </div>
        </div>
      </Card>

      {/* Additional Information */}
      <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="h-5 w-5 text-slate-500" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Additional Information
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Reference and assignment details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 place-content-center gap-6">
          {/* Reference By */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Reference By
            </label>
            <Input
              placeholder="Who referred this client"
              value={formData.referenceBy}
              onChange={(e) => handleInputChange("referenceBy", e.target.value)}
            />
          </div>

          {/* Connected By */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Connected By (Connector)
            </label>
            <Input
              placeholder="Name of connector"
              value={formData.connectedBy}
              onChange={(e) => handleInputChange("connectedBy", e.target.value)}
            />
          </div>

          {/* Assign To */}
          <div className="w-full md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Assign To (Connector)
            </label>
            <Input
              placeholder="Assign to connector"
              value={formData.assignTo}
              onChange={(e) => handleInputChange("assignTo", e.target.value)}
            />
          </div>
        </div>

        {/* IS VIP Client */}
        <div className="mt-6 flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isVipClient}
              onChange={(e) =>
                handleInputChange("isVipClient", e.target.checked)
              }
              className="rounded border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              VIP Client
            </span>
          </label>
        </div>
      </Card>
    </div>
  );
}
