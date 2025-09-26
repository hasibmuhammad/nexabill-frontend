"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: {
    cancelText?: string;
    confirmText: string;
    onCancel?: () => void;
    onConfirm: () => void;
    confirmVariant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    isLoading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
  };
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnEscape = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw]",
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (footer?.onCancel) {
      footer.onCancel();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleOverlayClick}
      />

      {/* Modal */}
      <Card
        className={`relative w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col bg-white dark:bg-slate-800 shadow-2xl border-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={
              `p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex-shrink-0 rounded-b-xl ` +
              (footer.fullWidth
                ? "grid grid-cols-2 gap-4"
                : "flex items-center justify-end space-x-4")
            }
          >
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleCancel}
              disabled={false}
              className={`${
                footer.fullWidth ? "w-full" : ""
              } font-medium transition-all duration-200 hover:scale-105`}
            >
              {footer.cancelText || "Cancel"}
            </Button>
            <Button
              type="button"
              variant={footer.confirmVariant || "primary"}
              size="md"
              onClick={footer.onConfirm}
              disabled={footer.disabled || footer.isLoading}
              className={`${
                footer.fullWidth ? "w-full" : ""
              } font-medium transition-all duration-200 hover:scale-105 ${
                footer.confirmVariant === "primary"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
                  : ""
              }`}
            >
              {footer.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </>
              ) : (
                footer.confirmText
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Modal;
