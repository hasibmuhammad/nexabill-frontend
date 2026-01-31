"use client";

import Modal from "@/components/ui/modal";
import { organizationsApi } from "@/lib/api-organizations";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { OrganizationForm } from "./OrganizationForm";

interface Organization {
  id: string;
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

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
  onSuccess: () => void;
}

export function EditOrganizationModal({
  isOpen,
  onClose,
  organization,
  onSuccess,
}: EditOrganizationModalProps) {
  // Mutation for updating organization
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      organizationsApi.update(id, data),
    onSuccess: () => {
      toast.success("Organization updated successfully");
      onSuccess();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update organization";
      toast.error(message);
    },
  });

  const handleSubmit = (formData: any) => {
    updateMutation.mutate({ id: organization.id, data: formData });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Organization"
      size="xl"
      footer={{
        cancelText: "Cancel",
        confirmText: updateMutation.isPending
          ? "Updating..."
          : "Update Organization",
        onConfirm: () => {
          const form = document.querySelector(
            "#organization-form"
          ) as HTMLFormElement;
          if (form) form.requestSubmit();
        },
        isLoading: updateMutation.isPending,
      }}
    >
      <OrganizationForm
        organization={organization}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={updateMutation.isPending}
        submitText="Update Organization"
        cancelText="Cancel"
      />
    </Modal>
  );
}
