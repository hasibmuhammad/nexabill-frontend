"use client";

import Modal from "@/components/ui/modal";
import { organizationsApi } from "@/lib/api-organizations";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { OrganizationForm } from "./OrganizationForm";

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateOrganizationModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateOrganizationModalProps) {
  // Mutation for creating organization
  const createMutation = useMutation({
    mutationFn: (data: any) => organizationsApi.create(data),
    onSuccess: () => {
      toast.success("Organization created successfully");
      onSuccess();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create organization";
      toast.error(message);
    },
  });

  const handleSubmit = (formData: any) => {
    createMutation.mutate(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Organization"
      size="xl"
      footer={{
        cancelText: "Cancel",
        confirmText: createMutation.isPending
          ? "Creating..."
          : "Create Organization",
        onConfirm: () => {
          const form = document.querySelector(
            "#organization-form"
          ) as HTMLFormElement;
          if (form) form.requestSubmit();
        },
        isLoading: createMutation.isPending,
      }}
    >
      <OrganizationForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={createMutation.isPending}
        submitText="Create Organization"
        cancelText="Cancel"
      />
    </Modal>
  );
}
