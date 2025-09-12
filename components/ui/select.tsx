import { cn } from "@/lib/utils";
import React from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
  onChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      required = false,
      error,
      helperText,
      options,
      placeholder = "Select an option",
      containerClassName,
      labelClassName,
      selectClassName,
      errorClassName,
      helperClassName,
      className,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className={cn("space-y-1", containerClassName)}>
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
        <select
          className={cn(
            "w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "bg-white dark:bg-slate-800 text-slate-900 dark:text-white",
            "border-slate-300 dark:border-slate-600",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500"
              : "hover:border-slate-400 dark:hover:border-slate-500",
            selectClassName,
            className
          )}
          value={value}
          onChange={handleChange}
          ref={ref}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = "Select";
