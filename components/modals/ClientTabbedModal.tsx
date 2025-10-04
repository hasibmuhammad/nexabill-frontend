"use client";

import { TabbedModal } from "@/components/ui/tabbed-modal";
import { getActiveDistricts } from "@/lib/api-districts";
import { getActiveUpazilas } from "@/lib/api-upazilas";
import { getPackages } from "@/lib/packages";
import { useQuery } from "@tanstack/react-query";
import { Package, Phone, User, Wifi } from "lucide-react";
import { useState } from "react";
import {
  BasicInfoTab,
  ContactInfoTab,
  NetworkInfoTab,
  ServiceInfoTab,
} from "./ClientFormTabs";

interface ClientTabbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

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

const initialFormData: ClientFormData = {
  // Basic Info
  name: "",
  nid: "",
  nidPicture: null,
  registrationFormNo: "",
  registrationFormPicture: null,

  // Contact Info
  mobileNumber: "",
  email: "",
  districtId: "",
  upazilaId: "",
  address: "",
  latitude: "",
  longitude: "",

  // Network/Product Info
  mikrotikServerId: "",
  protocolTypeId: "",
  zoneId: "",
  subzoneId: "",
  connectionTypeId: "",
  cableRequirement: "",
  fiberCode: "",
  numberOfCore: "",
  coreColor: "",

  // Service Info
  trackCode: `CLI-${Date.now()}`, // Auto-generated
  serviceProfileId: "",
  clientType: "HOME",
  billingStatus: "",
  mikrotikUsername: "",
  password: "",
  joiningDate: new Date().toISOString().split("T")[0],
  billingCycle: null,
  referenceBy: "",
  isVipClient: false,
  connectedBy: "",
  assignTo: "",
};

export function ClientTabbedModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: ClientTabbedModalProps) {
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<ClientFormData>>({});
  const [currentStep, setCurrentStep] = useState(0);

  // Fetch packages for the dropdown
  const { data: packages = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: getPackages,
    enabled: isOpen,
  });

  // Fetch districts for the dropdown
  const { data: districts = [] } = useQuery({
    queryKey: ["districts"],
    queryFn: getActiveDistricts,
    enabled: isOpen,
  });

  // Fetch upazilas for the dropdown
  const { data: upazilas = [] } = useQuery({
    queryKey: ["upazilas"],
    queryFn: getActiveUpazilas,
    enabled: isOpen,
  });

  const tabs = [
    {
      id: "basic-info",
      label: "Basic Info",
      icon: <User className="h-4 w-4" />,
    },
    {
      id: "contact-info",
      label: "Contact Info",
      icon: <Phone className="h-4 w-4" />,
    },
    {
      id: "network-info",
      label: "Network/Product",
      icon: <Wifi className="h-4 w-4" />,
    },
    {
      id: "service-info",
      label: "Service Info",
      icon: <Package className="h-4 w-4" />,
    },
  ];

  const validateCurrentTab = (tabId: string, data: ClientFormData): boolean => {
    const newErrors: Partial<ClientFormData> = {};

    switch (tabId) {
      case "basic-info":
        if (!data.name.trim()) newErrors.name = "Name is required";
        if (!data.nid.trim()) newErrors.nid = "NID is required";
        break;

      case "contact-info":
        if (!data.mobileNumber.trim())
          newErrors.mobileNumber = "Mobile number is required";
        if (!data.districtId.trim())
          newErrors.districtId = "District is required";
        if (!data.upazilaId.trim()) newErrors.upazilaId = "Upazila is required";
        break;

      case "network-info":
        if (!data.mikrotikServerId.trim())
          newErrors.mikrotikServerId = "Server is required";
        if (!data.protocolTypeId.trim())
          newErrors.protocolTypeId = "Protocol type is required";
        if (!data.zoneId.trim()) newErrors.zoneId = "Zone is required";
        if (!data.connectionTypeId.trim())
          newErrors.connectionTypeId = "Connection type is required";
        break;

      case "service-info":
        if (!data.serviceProfileId.trim())
          newErrors.serviceProfileId = "Package is required";
        if (!data.billingStatus.trim())
          newErrors.billingStatus = "Billing status is required";
        if (!data.mikrotikUsername.trim())
          newErrors.mikrotikUsername = "Username/IP is required";
        if (!data.password.trim()) newErrors.password = "Password is required";
        break;
    }

    // Update errors state
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    const currentTabId = tabs[currentStep]?.id;
    if (validateCurrentTab(currentTabId, formData)) {
      if (currentStep < tabs.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Validate all tabs
    const allTabsValid = tabs.every((tab) =>
      validateCurrentTab(tab.id, formData)
    );

    if (allTabsValid) {
      onSubmit(formData);
    } else {
      // Show error message
      console.log("Please fill in all required fields");
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setCurrentStep(0);
    onClose();
  };

  const renderTabContent = (activeTabIndex: number) => {
    const commonProps = {
      formData,
      setFormData,
      errors,
      setErrors,
      packages,
      districts,
      upazilas,
    };

    const tabId = tabs[activeTabIndex]?.id;

    switch (tabId) {
      case "basic-info":
        return <BasicInfoTab {...commonProps} />;
      case "contact-info":
        return <ContactInfoTab {...commonProps} />;
      case "network-info":
        return <NetworkInfoTab {...commonProps} />;
      case "service-info":
        return <ServiceInfoTab {...commonProps} />;
      default:
        return <BasicInfoTab {...commonProps} />;
    }
  };

  const isLastStep = currentStep === tabs.length - 1;
  const isFirstStep = currentStep === 0;

  const handleTabChange = (newStep: number) => {
    // Allow going back to any previous step without validation
    if (newStep < currentStep) {
      setCurrentStep(newStep);
      return;
    }

    // For forward navigation, validate all previous steps
    let canNavigate = true;
    for (let i = 0; i < newStep; i++) {
      if (!validateCurrentTab(tabs[i].id, formData)) {
        canNavigate = false;
        break;
      }
    }

    if (canNavigate) {
      setCurrentStep(newStep);
    }
  };

  return (
    <TabbedModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Client"
      tabs={tabs}
      height="lg"
      size="xl"
      allowTabNavigation={true}
      activeTab={currentStep}
      onTabChange={handleTabChange}
      footer={{
        cancelText: isFirstStep ? "Cancel" : "Previous",
        confirmText: isLastStep ? "Create Client" : "Next",
        onCancel: isFirstStep ? handleClose : handlePrevious,
        onConfirm: isLastStep ? handleSubmit : handleNext,
        isLoading: isLoading,
        confirmVariant: "primary",
      }}
    >
      {(activeTabIndex) => renderTabContent(currentStep)}
    </TabbedModal>
  );
}

export default ClientTabbedModal;
