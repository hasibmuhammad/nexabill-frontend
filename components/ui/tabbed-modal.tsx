"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

interface TabConfig {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface TabbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tabs: TabConfig[];
  children: ReactNode | ((activeTabIndex: number) => ReactNode);
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
  height?: "sm" | "md" | "lg" | "xl";
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  allowTabNavigation?: boolean;
}

export function TabbedModal({
  isOpen,
  onClose,
  title,
  tabs,
  children,
  footer,
  size = "lg",
  height = "lg",
  closeOnEscape = true,
  closeOnOverlayClick = true,
  allowTabNavigation = true,
}: TabbedModalProps) {
  const [activeTab, setActiveTab] = useState(0);

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

  // Handle tab navigation with keyboard
  useEffect(() => {
    if (!allowTabNavigation || !isOpen) return;

    const handleTabNavigation = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          const direction = e.key === "ArrowLeft" ? -1 : 1;
          const nextTab = (activeTab + direction + tabs.length) % tabs.length;
          if (!tabs[nextTab]?.disabled) {
            setActiveTab(nextTab);
          }
        }
      }
    };

    document.addEventListener("keydown", handleTabNavigation);
    return () => document.removeEventListener("keydown", handleTabNavigation);
  }, [isOpen, activeTab, tabs, allowTabNavigation]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw]",
  };

  const heightClasses = {
    sm: "h-[60vh]",
    md: "h-[70vh]",
    lg: "h-[80vh]",
    xl: "h-[90vh]",
  } as const;

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

  const handleTabClick = (tabIndex: number) => {
    if (!tabs[tabIndex]?.disabled) {
      setActiveTab(tabIndex);
    }
  };

  const nextTab = () => {
    const nextIndex = (activeTab + 1) % tabs.length;
    if (!tabs[nextIndex]?.disabled) {
      setActiveTab(nextIndex);
    }
  };

  const prevTab = () => {
    const prevIndex = (activeTab - 1 + tabs.length) % tabs.length;
    if (!tabs[prevIndex]?.disabled) {
      setActiveTab(prevIndex);
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
        className={`relative w-full ${sizeClasses[size]} ${heightClasses[height]} flex flex-col bg-white dark:bg-slate-800 shadow-2xl border-0`}
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

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-6">
            {/* Tab List */}
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(index)}
                  disabled={tab.disabled}
                  className={`
                    relative px-4 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${
                      activeTab === index
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800"
                        : tab.disabled
                        ? "text-slate-400 dark:text-slate-600 cursor-not-allowed"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    {tab.icon && (
                      <span className="flex-shrink-0">{tab.icon}</span>
                    )}
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Tab Navigation Controls */}
            {allowTabNavigation && tabs.length > 1 && (
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevTab}
                  disabled={tabs[activeTab - 1]?.disabled}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activeTab + 1} / {tabs.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextTab}
                  disabled={tabs[activeTab + 1]?.disabled}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          {typeof children === "function" ? children(activeTab) : children}
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

export default TabbedModal;
