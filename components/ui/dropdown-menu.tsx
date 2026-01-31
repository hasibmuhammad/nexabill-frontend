"use client";

import { Button } from "@/components/ui/button";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[];
  trigger?: React.ReactNode;
  align?: "left" | "right";
  side?: "top" | "bottom";
  className?: string;
}

export function DropdownMenu({
  items,
  trigger,
  align = "right",
  side = "bottom",
  className,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const triggerWrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useClickOutside(dropdownRef, () => setIsOpen(false));

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && triggerWrapperRef.current) {
      const triggerRect = triggerWrapperRef.current.getBoundingClientRect();
      const dropdownWidth = 200; // Approximate dropdown width
      const dropdownHeight = 150; // Approximate dropdown height

      let top = triggerRect.bottom + 4; // 4px gap
      let left = triggerRect.right - dropdownWidth; // Right align

      // Adjust if would go off screen
      if (left < 8) left = triggerRect.left;
      if (top + dropdownHeight > window.innerHeight - 8) {
        top = triggerRect.top - dropdownHeight - 4; // Show above
      }

      setDropdownPosition({ top, left });
    }
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleItemClick = (item: DropdownMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  const defaultTrigger = (
    <Button
      ref={triggerRef}
      variant="ghost"
      size="sm"
      onClick={() => setIsOpen(!isOpen)}
      className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">Open menu</span>
    </Button>
  );

  return (
    <div className={cn("relative", className)}>
      {trigger ? (
        <div ref={triggerWrapperRef} onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-[99999] min-w-[8rem] overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shadow-xl"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                "hover:bg-slate-100 dark:hover:bg-slate-700",
                "focus:bg-slate-100 dark:focus:bg-slate-700",
                item.disabled && "pointer-events-none opacity-50",
                item.variant === "destructive" &&
                  "text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300",
                item.variant === "destructive" &&
                  "focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-900/20 dark:focus:text-red-300"
              )}
            >
              {item.icon && (
                <span className="mr-2 flex h-4 w-4 items-center justify-center">
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;
