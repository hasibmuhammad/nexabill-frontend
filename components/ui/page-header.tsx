"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: "primary" | "outline" | "secondary" | "ghost" | "danger";
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ActionButton[];
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-40 bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          {actions && actions.length > 0 && (
            <div className="flex space-x-3">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.variant || "outline"}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={cn(action.loading && "animate-pulse")}
                  >
                    {Icon && <Icon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
