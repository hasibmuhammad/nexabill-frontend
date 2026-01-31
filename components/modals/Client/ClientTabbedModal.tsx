import { TabbedModal } from "@/components/ui/tabbed-modal";
import { getActiveConnectionTypes } from "@/lib/api-connection-types";
import { getActiveDistricts } from "@/lib/api-districts";
import { getEmployees } from "@/lib/api-employees";
import { getMikrotikServers } from "@/lib/api-mikrotik";
import { getActiveProtocolTypes } from "@/lib/api-protocol-types";
import { getActiveUpazilas } from "@/lib/api-upazilas";
import { getZones } from "@/lib/api-zones";
import { getPackages } from "@/lib/packages";
import { clientSchema, type ClientFormValues } from "@/lib/schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Package, Phone, User, Wifi } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  BasicInfoTab,
  ContactInfoTab,
  NetworkInfoTab,
  ServiceInfoTab,
} from "./ClientFormTabs";

interface ClientTabbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormValues) => void;
  isLoading?: boolean;
}

const initialFormData: Partial<ClientFormValues> = {
  clientType: "HOME",
  joiningDate: new Date().toISOString().split("T")[0],
  isVipClient: false,
  trackCode: `CLI-${Date.now()}`,
};

export function ClientTabbedModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: ClientTabbedModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const methods = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialFormData as ClientFormValues,
    mode: "onChange",
  });

  const {
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = methods;

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
  const { data: upazilasRes } = useQuery({
    queryKey: ["upazilas", { isActive: true }],
    queryFn: () => getActiveUpazilas(),
    enabled: isOpen,
  });
  const upazilas = upazilasRes || [];

  const { data: serversRes } = useQuery({
    queryKey: ["mikrotik-servers"],
    queryFn: getMikrotikServers,
    enabled: isOpen,
  });
  const servers = serversRes || [];

  const { data: protocolTypesRes } = useQuery({
    queryKey: ["protocol-types"],
    queryFn: () => getActiveProtocolTypes(),
    enabled: isOpen,
  });
  const protocolTypes = protocolTypesRes?.data || [];

  const { data: zonesRes } = useQuery({
    queryKey: ["zones"],
    queryFn: () => getZones({ isActive: true, limit: 1000 }),
    enabled: isOpen,
  });
  const zones = zonesRes?.data || [];

  const { data: connectionTypesRes } = useQuery({
    queryKey: ["connection-types"],
    queryFn: () => getActiveConnectionTypes(),
    enabled: isOpen,
  });
  const connectionTypes = connectionTypesRes?.data || [];

  const { data: employeesRes } = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployees({ isActive: true, limit: 1000 }),
    enabled: isOpen,
  });
  const employees = employeesRes?.data || [];

  const tabs = [
    {
      id: "basic-info",
      label: "Basic Info",
      icon: <User className="h-4 w-4" />,
      fields: ["name", "nid"],
    },
    {
      id: "contact-info",
      label: "Contact Info",
      icon: <Phone className="h-4 w-4" />,
      fields: ["mobileNumber", "districtId", "upazilaId", "address"],
    },
    {
      id: "network-info",
      label: "Network/Product",
      icon: <Wifi className="h-4 w-4" />,
      fields: [
        "mikrotikServerId",
        "protocolTypeId",
        "zoneId",
        "connectionTypeId",
      ],
    },
    {
      id: "service-info",
      label: "Service Info",
      icon: <Package className="h-4 w-4" />,
      fields: [
        "serviceProfileId",
        "billingStatus",
        "mikrotikUsername",
        "password",
      ],
    },
  ];

  const validateCurrentTab = async (step: number) => {
    const fieldsToValidate = tabs[step].fields as any[];
    return await trigger(fieldsToValidate);
  };

  const handleNext = async () => {
    const isValid = await validateCurrentTab(currentStep);
    if (isValid && currentStep < tabs.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onFormSubmit = (data: ClientFormValues) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset(initialFormData as ClientFormValues);
    setCurrentStep(0);
    onClose();
  };

  const renderTabContent = (activeTabIndex: number) => {
    const commonProps = {
      packages,
      districts,
      upazilas,
      servers,
      protocolTypes,
      zones,
      connectionTypes,
      employees,
    };

    switch (tabs[activeTabIndex]?.id) {
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

  const handleTabChange = async (newStep: number) => {
    if (newStep < currentStep) {
      setCurrentStep(newStep);
      return;
    }

    // Validate all steps between current and new
    for (let i = currentStep; i < newStep; i++) {
      const isValid = await validateCurrentTab(i);
      if (!isValid) return;
    }
    setCurrentStep(newStep);
  };

  return (
    <FormProvider {...methods}>
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
          onConfirm: isLastStep ? handleSubmit(onFormSubmit) : handleNext,
          isLoading: isLoading,
          confirmVariant: "primary",
        }}
      >
        {(activeTabIndex) => renderTabContent(currentStep)}
      </TabbedModal>
    </FormProvider>
  );
}

export default ClientTabbedModal;
