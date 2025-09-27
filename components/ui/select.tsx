"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  helperText?: string;
  helperClassName?: string;
  errorClassName?: string;
  selectClassName?: string;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      required = false,
      placeholder = "Select an option",
      value,
      onChange,
      options,
      error,
      disabled = false,
      className,
      containerClassName,
      labelClassName,
      helperText,
      helperClassName,
      errorClassName,
      selectClassName,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter options based on search term
    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get the selected option label
    const selectedOption = options.find((option) => option.value === value);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle option selection
    const handleOptionSelect = (optionValue: string) => {
      if (onChange) {
        onChange(optionValue);
      }
      setIsOpen(false);
      setSearchTerm("");
    };

    // Handle input click
    const handleInputClick = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
        if (!isOpen) {
          // Focus the search input when opening
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }
    };

    // Handle key events
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

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

        <div className="relative" ref={dropdownRef}>
          {/* Input/Button */}
          <div
            className={cn(
              "relative w-full px-3 py-2 border rounded-md text-sm transition-colors cursor-pointer",
              "bg-white dark:bg-slate-800 text-slate-900 dark:text-white",
              "border-slate-300 dark:border-slate-600",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              error
                ? "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500"
                : "hover:border-slate-400 dark:hover:border-slate-500",
              disabled &&
                "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-700",
              isOpen && "ring-2 ring-blue-500 border-blue-500",
              className
            )}
            onClick={handleInputClick}
            onKeyDown={handleKeyDown}
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "block truncate",
                  !selectedOption && "text-slate-500 dark:text-slate-400"
                )}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </div>

          {/* Dropdown */}
          {isOpen && !disabled && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-hidden">
              {/* Search input */}
              <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Options list */}
              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        "px-3 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between",
                        "hover:bg-slate-100 dark:hover:bg-slate-700",
                        value === option.value &&
                          (selectClassName ||
                            "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"),
                        option.disabled && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() =>
                        !option.disabled && handleOptionSelect(option.value)
                      }
                    >
                      <span className="truncate">{option.label}</span>
                      {value === option.value && (
                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                    No options found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
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

        {/* Helper text */}
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

Select.displayName = "Select";
