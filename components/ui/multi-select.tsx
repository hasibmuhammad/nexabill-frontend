import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  options: MultiSelectOption[];
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      label,
      required = false,
      error,
      helperText,
      options,
      placeholder = "Select options",
      value = [],
      onChange,
      disabled = false,
      containerClassName,
      labelClassName,
      triggerClassName,
      dropdownClassName,
      optionClassName,
      errorClassName,
      helperClassName,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          !triggerRef.current?.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (optionValue: string) => {
      if (disabled) return;

      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    };

    const removeOption = (optionValue: string) => {
      if (disabled) return;
      onChange(value.filter((v) => v !== optionValue));
    };

    const selectedLabels = options
      .filter((option) => value.includes(option.value))
      .map((option) => option.label);

    return (
      <div className={cn("space-y-1", containerClassName)} ref={ref}>
        {label && (
          <label
            className={cn(
              "block text-sm font-medium text-slate-700 dark:text-slate-300",
              labelClassName
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <button
            type="button"
            ref={triggerRef}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "bg-white dark:bg-slate-800 text-slate-900 dark:text-white",
              "border-slate-300 dark:border-slate-600",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500"
                : "hover:border-slate-400 dark:hover:border-slate-500",
              "flex items-center justify-between",
              triggerClassName
            )}
          >
            <div className="flex flex-wrap gap-1 min-h-[20px]">
              {selectedLabels.length > 0 ? (
                selectedLabels.map((label, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-md"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOption(
                          options.find((opt) => opt.label === label)?.value ||
                            ""
                        );
                      }}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-slate-400 dark:text-slate-500">
                  {placeholder}
                </span>
              )}
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-400 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>

          {isOpen && (
            <div
              ref={dropdownRef}
              className={cn(
                "absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto",
                dropdownClassName
              )}
            >
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                  No options available
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      value.includes(option.value)
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100"
                        : "text-slate-900 dark:text-white",
                      optionClassName
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {value.includes(option.value) && (
                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {error && (
          <p
            className={cn(
              "text-sm text-red-600 dark:text-red-400",
              errorClassName
            )}
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            className={cn(
              "text-sm text-slate-500 dark:text-slate-400",
              helperClassName
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
