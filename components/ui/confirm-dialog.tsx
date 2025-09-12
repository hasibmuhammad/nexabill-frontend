"use client";

import { Modal } from "@/components/ui/modal";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useEffect, useState } from "react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  confirmVariant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  // Optional consent checkbox (e.g., "I understand this action is permanent")
  consentText?: string;
  icon?: React.ReactNode;
  tone?: "danger" | "warning" | "info" | "success";
}

export function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading,
  disabled,
  confirmVariant = "danger",
  consentText,
  icon,
  tone = "danger",
}: ConfirmDialogProps) {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setConsented(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={{
        cancelText,
        confirmText,
        onCancel,
        onConfirm,
        confirmVariant,
        isLoading,
        disabled: disabled || (!!consentText && !consented),
        fullWidth: true,
      }}
    >
      <div className="flex items-start space-x-4">
        <div
          className={
            "mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full " +
            (tone === "danger"
              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              : tone === "warning"
              ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
              : tone === "success"
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400")
          }
          aria-hidden="true"
        >
          {icon ||
            (tone === "danger" || tone === "warning" ? (
              <AlertTriangle className="h-5 w-5" />
            ) : tone === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Info className="h-5 w-5" />
            ))}
        </div>
        <div className="flex-1">
          {description && (
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {description}
            </p>
          )}

          {consentText && (
            <label className="mt-4 flex items-start space-x-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
              />
              <span>{consentText}</span>
            </label>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
