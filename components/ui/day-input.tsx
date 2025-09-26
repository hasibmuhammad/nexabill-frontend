"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface DayInputProps {
  value?: number | null;
  onChange: (day: number | null) => void;
  min?: number; // default 1
  max?: number; // default 31
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  placement?: "top" | "bottom";
}

export const DayInput: React.FC<DayInputProps> = ({
  value,
  onChange,
  min = 1,
  max = 31,
  placeholder = "1-31",
  disabled,
  className,
  inputClassName,
  placement = "bottom",
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!open) return;
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const days = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  const handleManualChange = (text: string) => {
    if (text.trim() === "") {
      onChange(null);
      return;
    }
    const n = parseInt(text, 10);
    if (!isNaN(n)) {
      const clamped = Math.min(max, Math.max(min, n));
      onChange(clamped);
    }
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => handleManualChange(e.target.value)}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          inputMode="numeric"
          className={cn("pr-10", inputClassName)}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open day picker"
        >
          <CalendarIcon className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div
          className={
            placement === "top"
              ? "absolute z-50 bottom-full mb-2 w-[20rem]"
              : "absolute z-50 top-full mt-2 w-[20rem]"
          }
        >
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-3">
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const isSelected = value === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      onChange(day);
                      setOpen(false);
                    }}
                    className={cn(
                      "h-9 rounded-md text-sm transition-colors border",
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                    aria-pressed={isSelected}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 text-right">
              <button
                type="button"
                className="text-xs px-2 py-1 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Clear
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DayInput;
