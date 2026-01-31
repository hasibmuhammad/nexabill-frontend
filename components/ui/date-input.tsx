"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon } from "lucide-react";
import moment, { Moment } from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";

export interface DateInputProps {
  value?: string; // ISO format YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string; // YYYY-MM-DD
  max?: string; // YYYY-MM-DD
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  label?: string;
  required?: boolean;
  placement?: "top" | "bottom";
  error?: string;
}

function isWithinBounds(day: Moment, min?: string, max?: string): boolean {
  const minOk = min
    ? day.isSameOrAfter(moment(min, "YYYY-MM-DD"), "day")
    : true;
  const maxOk = max
    ? day.isSameOrBefore(moment(max, "YYYY-MM-DD"), "day")
    : true;
  return minOk && maxOk;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  min,
  max,
  disabled,
  className,
  inputClassName,
  label,
  required,
  placement = "bottom",
  error,
}) => {
  const initialDate =
    value && moment(value, "YYYY-MM-DD", true).isValid()
      ? moment(value, "YYYY-MM-DD")
      : moment();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Moment>(
    initialDate.clone().startOf("month")
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // legacy grid removed in favor of shared Calendar

  const handleSelect = useCallback(
    (day: Moment) => {
      if (!isWithinBounds(day, min, max)) return;
      onChange(day.format("YYYY-MM-DD"));
      setOpen(false);
    },
    [onChange, min, max]
  );

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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Ensure default to today if no value provided
  useEffect(() => {
    if (!value) {
      onChange(initialDate.format("YYYY-MM-DD"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = value ? moment(value, "YYYY-MM-DD") : initialDate;

  // month/year selects removed in favor of shared Calendar header

  return (
    <div className={"relative " + (className || "")} ref={containerRef}>
      <div className="flex items-center">
        <div className="relative flex-1">
          <Input
            label={label}
            required={required}
            placeholder={placeholder}
            value={value || ""}
            onChange={(e) => {
              const v = e.target.value;
              if (moment(v, "YYYY-MM-DD", true).isValid()) {
                onChange(v);
              } else {
                onChange(v);
              }
            }}
            onFocus={() => setOpen(true)}
            disabled={disabled}
            inputMode="numeric"
            className={`${inputClassName || ""} pr-10`}
            error={error}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open calendar"
            style={{ top: label ? "calc(50% + 0.75rem)" : "50%" }}
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open && (
        <div
          className={
            placement === "top"
              ? "absolute z-50 bottom-full mb-2 w-[20rem]"
              : "absolute z-50 top-full mt-2 w-[20rem]"
          }
        >
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="p-2">
              <Calendar
                selected={selected ? selected.toDate() : moment().toDate()}
                initialMonth={selected ? selected.toDate() : undefined}
                onSelect={(date) => {
                  if (!date) return;
                  const m = moment(date);
                  if (min && m.isBefore(moment(min, "YYYY-MM-DD"), "day"))
                    return;
                  if (max && m.isAfter(moment(max, "YYYY-MM-DD"), "day"))
                    return;
                  onChange(m.format("YYYY-MM-DD"));
                  setOpen(false);
                }}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DateInput;
