"use client";

import Modal from "@/components/ui/modal";
import { type MikrotikServer } from "@/lib/api-mikrotik";
import { useRef } from "react";
import { ServerForm, type ServerFormRef } from "./ServerForm";

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  server?: MikrotikServer | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  onTestConnection?: () => void;
  isTestingConnection?: boolean;
}

export function ServerModal({
  isOpen,
  onClose,
  server,
  onSubmit,
  isLoading = false,
}: ServerModalProps) {
  const formRef = useRef<ServerFormRef>(null);
  const isEdit = !!server;
  const title = isEdit ? "Edit Mikrotik Server" : "Add New Mikrotik Server";
  const confirmText = isEdit ? "Update Server" : "Add Server";

  const handleConfirm = () => {
    formRef.current?.submit();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={{
        cancelText: "Cancel",
        confirmText: isLoading ? "Creating Server..." : confirmText,
        onCancel: onClose,
        onConfirm: handleConfirm,
        confirmVariant: "primary",
        isLoading,
        disabled: isLoading,
      }}
    >
      <ServerForm
        ref={formRef}
        server={server}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
}
