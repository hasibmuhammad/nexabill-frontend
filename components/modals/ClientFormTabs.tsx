"use client";

import { Card } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import { DayInput } from "@/components/ui/day-input";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getActiveConnectionTypes,
  type ConnectionType,
} from "@/lib/api-connection-types";
import { type District } from "@/lib/api-districts";
import { getEmployees, type Employee } from "@/lib/api-employees";
import { getMikrotikServers, type MikrotikServer } from "@/lib/api-mikrotik";
import {
  getActiveProtocolTypes,
  type ProtocolType,
} from "@/lib/api-protocol-types";
import { getSubzones, type Subzone } from "@/lib/api-subzones";
import { type Upazila } from "@/lib/api-upazilas";
import { getZones, type Zone } from "@/lib/api-zones";
import { type ServiceProfile } from "@/lib/packages";
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
import { useEffect, useState } from "react";

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
  upazilaId: string;
  address: string;
  latitude?: string;
  longitude?: string;

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
  packages?: ServiceProfile[];
  districts?: District[];
  upazilas?: Upazila[];
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
            <Input
              required
              label="Full Name"
              placeholder="Enter client's full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={errors.name}
            />
          </div>

          {/* NID/Birth Certificate No */}
          <div>
            <Input
              required
              label="NID/Birth Certificate No"
              placeholder="Enter NID or Birth Certificate number"
              value={formData.nid}
              onChange={(e) => handleInputChange("nid", e.target.value)}
              error={errors.nid}
            />
          </div>

          {/* Registration Form No */}
          <div>
            <Input
              label="Registration Form No"
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
  districts = [],
  upazilas = [],
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
            <Input
              required
              label="Mobile Number"
              placeholder="+880 1XXX XXXXXX"
              value={formData.mobileNumber}
              onChange={(e) =>
                handleInputChange("mobileNumber", e.target.value)
              }
              error={errors.mobileNumber}
            />
          </div>

          {/* Email */}
          <div>
            <Input
              label="Email Address"
              type="email"
              placeholder="client@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>

          {/* District */}
          <div>
            <Select
              required
              label="District"
              placeholder="Select district"
              value={formData.districtId}
              onChange={(value) => handleInputChange("districtId", value)}
              options={districts.map((district) => ({
                value: district.id,
                label: district.name,
              }))}
              error={errors.districtId}
            />
          </div>

          {/* Upazila */}
          <div>
            <Select
              required
              label="Upazila"
              placeholder="Select upazila"
              value={formData.upazilaId}
              onChange={(value) => handleInputChange("upazilaId", value)}
              options={upazilas.map((upazila) => ({
                value: upazila.id,
                label: upazila.name,
              }))}
              error={errors.upazilaId}
            />
          </div>
          {/* Map Coordinates */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Latitude"
                  type="text"
                  placeholder="Latitude (e.g., 10.30.30.40)"
                  value={formData.latitude || ""}
                  onChange={(e) =>
                    handleInputChange("latitude", e.target.value)
                  }
                />
              </div>
              <div>
                <Input
                  label="Longitude"
                  type="text"
                  placeholder="Longitude (e.g., 10.30.30.40)"
                  value={formData.longitude || ""}
                  onChange={(e) =>
                    handleInputChange("longitude", e.target.value)
                  }
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3 inline mr-1" />
              Location coordinates in IP-like format (e.g., 10.30.30.40)
            </p>
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <Textarea
              label="Address"
              placeholder="Road number, house number, area details"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              rows={3}
            />
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
  // State for dropdown options
  const [servers, setServers] = useState<MikrotikServer[]>([]);
  const [protocolTypes, setProtocolTypes] = useState<ProtocolType[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [subzones, setSubzones] = useState<Subzone[]>([]);
  const [connectionTypes, setConnectionTypes] = useState<ConnectionType[]>([]);

  // Loading states
  const [loadingServers, setLoadingServers] = useState(true);
  const [loadingProtocolTypes, setLoadingProtocolTypes] = useState(true);
  const [loadingZones, setLoadingZones] = useState(true);
  const [loadingSubzones, setLoadingSubzones] = useState(false);
  const [loadingConnectionTypes, setLoadingConnectionTypes] = useState(true);

  const handleInputChange = (
    field: keyof ClientFormData,
    value: string | number | boolean | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Handle cascading dropdowns
    if (field === "zoneId") {
      // Clear subzone when zone changes
      setFormData((prev) => ({ ...prev, subzoneId: "" }));
      setSubzones([]);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load servers
        const serversData = await getMikrotikServers();
        setServers(serversData);
        setLoadingServers(false);

        // Load protocol types
        const protocolResponse = await getActiveProtocolTypes();
        setProtocolTypes(protocolResponse.data);
        setLoadingProtocolTypes(false);

        // Load zones
        const zonesResponse = await getZones({ isActive: true, limit: 1000 });
        setZones(zonesResponse.data);
        setLoadingZones(false);

        // Load connection types
        const connectionResponse = await getActiveConnectionTypes();
        setConnectionTypes(connectionResponse.data);
        setLoadingConnectionTypes(false);
      } catch (error) {
        console.error("Error loading network data:", error);
        setLoadingServers(false);
        setLoadingProtocolTypes(false);
        setLoadingZones(false);
        setLoadingConnectionTypes(false);
      }
    };

    loadInitialData();
  }, []);

  // Load subzones when zone changes
  useEffect(() => {
    const loadSubzones = async () => {
      if (formData.zoneId) {
        setLoadingSubzones(true);
        try {
          const response = await getSubzones({
            zoneId: formData.zoneId,
            isActive: true,
            limit: 1000,
          });
          setSubzones(response.data);
        } catch (error) {
          console.error("Error loading subzones:", error);
          setSubzones([]);
        } finally {
          setLoadingSubzones(false);
        }
      } else {
        setSubzones([]);
      }
    };

    loadSubzones();
  }, [formData.zoneId]);

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
            <Select
              required
              label="Server"
              placeholder={
                loadingServers ? "Loading servers..." : "Select Mikrotik server"
              }
              value={formData.mikrotikServerId}
              onChange={(value) => handleInputChange("mikrotikServerId", value)}
              options={servers.map((server) => ({
                value: server.id,
                label: `${server.name} (${server.host})`,
              }))}
              error={errors.mikrotikServerId}
              disabled={loadingServers}
            />
          </div>

          {/* Protocol Type */}
          <div>
            <Select
              required
              label="Protocol Type"
              placeholder={
                loadingProtocolTypes
                  ? "Loading protocol types..."
                  : "Select protocol type"
              }
              value={formData.protocolTypeId}
              onChange={(value) => handleInputChange("protocolTypeId", value)}
              options={protocolTypes.map((type) => ({
                value: type.id,
                label: type.name,
              }))}
              error={errors.protocolTypeId}
              disabled={loadingProtocolTypes}
            />
          </div>

          {/* Zone */}
          <div>
            <Select
              required
              label="Zone"
              placeholder={loadingZones ? "Loading zones..." : "Select zone"}
              value={formData.zoneId}
              onChange={(value) => handleInputChange("zoneId", value)}
              options={zones.map((zone) => ({
                value: zone.id,
                label: zone.name,
              }))}
              error={errors.zoneId}
              disabled={loadingZones}
            />
          </div>

          {/* Subzone */}
          <div>
            <Select
              label="Subzone"
              placeholder={
                !formData.zoneId
                  ? "Select zone first"
                  : loadingSubzones
                  ? "Loading subzones..."
                  : "Select subzone"
              }
              value={formData.subzoneId}
              onChange={(value) => handleInputChange("subzoneId", value)}
              options={subzones.map((subzone) => ({
                value: subzone.id,
                label: subzone.name,
              }))}
              disabled={!formData.zoneId || loadingSubzones}
            />
          </div>

          {/* Connection Type */}
          <div>
            <Select
              required
              label="Connection Type"
              placeholder={
                loadingConnectionTypes
                  ? "Loading connection types..."
                  : "Select connection type"
              }
              value={formData.connectionTypeId}
              onChange={(value) => handleInputChange("connectionTypeId", value)}
              options={connectionTypes.map((type) => ({
                value: type.id,
                label: type.name,
              }))}
              error={errors.connectionTypeId}
              disabled={loadingConnectionTypes}
            />
          </div>

          {/* Cable Requirement */}
          <div>
            <Input
              type="number"
              label="Cable Requirement (Metres)"
              placeholder="Enter cable length in metres"
              value={formData.cableRequirement}
              onChange={(e) =>
                handleInputChange("cableRequirement", e.target.value)
              }
            />
          </div>

          {/* Fiber Code */}
          <div>
            <Input
              label="Fiber Code"
              placeholder="Enter fiber code"
              value={formData.fiberCode}
              onChange={(e) => handleInputChange("fiberCode", e.target.value)}
            />
          </div>

          {/* Number of Core */}
          <div>
            <Input
              type="number"
              label="Number of Core"
              placeholder="Enter number of cores"
              value={formData.numberOfCore}
              onChange={(e) =>
                handleInputChange("numberOfCore", e.target.value)
              }
            />
          </div>

          {/* Core Color */}
          <div>
            <Input
              label="Core Color"
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
  packages = [],
}: ClientFormTabsProps) {
  // State for employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

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

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await getEmployees({ isActive: true, limit: 1000 });
        setEmployees(response.data);
        setLoadingEmployees(false);
      } catch (error) {
        console.error("Error loading employees:", error);
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

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
            <Select
              placeholder="Select package"
              required
              label="Package"
              value={formData.serviceProfileId}
              onChange={(v) => handleInputChange("serviceProfileId", v)}
              options={packages.map((pkg) => ({
                value: pkg.id,
                label: `${pkg.name} - ৳${pkg.monthlyPrice}`,
              }))}
              error={errors.serviceProfileId}
            />
          </div>

          {/* Client Type */}
          <div>
            <Input
              label="Client Type"
              placeholder="Select client type"
              value={formData.clientType}
              onChange={(e) => handleInputChange("clientType", e.target.value)}
            />
          </div>

          {/* Billing Status */}
          <div>
            <Select
              placeholder="Billing Status"
              required
              label="Billing Status"
              value={formData.billingStatus}
              onChange={(v) => handleInputChange("billingStatus", v)}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "FREE", label: "Free" },
                { value: "LEFT", label: "Left" },
              ]}
              error={errors.billingStatus as any}
            />
          </div>

          {/* Username/IP */}
          <div>
            <Input
              required
              label="Username/IP"
              placeholder="Enter Mikrotik username"
              value={formData.mikrotikUsername}
              onChange={(e) =>
                handleInputChange("mikrotikUsername", e.target.value)
              }
              error={errors.mikrotikUsername}
            />
          </div>

          {/* Password */}
          <div>
            <PasswordInput
              label="Password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
          </div>

          {/* Joining Date */}
          <div>
            <DateInput
              label="Joining Date"
              value={formData.joiningDate}
              onChange={(v) => handleInputChange("joiningDate", v)}
            />
          </div>

          {/* Billing Cycle */}
          <div>
            <DayInput
              label="Billing Cycle (Day: 1-31)"
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
            <Input
              label="Reference By"
              placeholder="Who referred this client"
              value={formData.referenceBy}
              onChange={(e) => handleInputChange("referenceBy", e.target.value)}
            />
          </div>

          {/* Connected By */}
          <div>
            <Select
              label="Connected By (Connector)"
              placeholder={
                loadingEmployees ? "Loading employees..." : "Select connector"
              }
              value={formData.connectedBy}
              onChange={(value) => handleInputChange("connectedBy", value)}
              options={employees.map((employee) => ({
                value: employee.id,
                label: `${employee.name} (${employee.designation})`,
              }))}
              disabled={loadingEmployees}
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
