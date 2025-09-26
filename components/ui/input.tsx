import { cn } from "@/lib/utils";
import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      required = false,
      error,
      helperText,
      containerClassName,
      labelClassName,
      inputClassName,
      errorClassName,
      helperClassName,
      className,
      type = "text",
      ...props
    },
    ref
  ) => {
    // Hide number input spinners and prevent wheel increment
    const inputStyle: React.CSSProperties =
      type === "number"
        ? {
            appearance: "textfield",
            WebkitAppearance: "textfield",
            MozAppearance: "textfield",
          }
        : {};

    const handleWheel: React.WheelEventHandler<HTMLInputElement> = (e) => {
      if (type === "number") {
        // Avoid passive event warning by not calling preventDefault.
        // Instead, temporarily blur to stop wheel from changing the value.
        const target = e.currentTarget;
        target.blur();
        setTimeout(() => target.focus({ preventScroll: true }), 0);
      }
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (type === "number") {
        if (
          e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "PageUp" ||
          e.key === "PageDown"
        ) {
          e.preventDefault();
        }
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
        <input
          type={type}
          className={cn(
            "w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "bg-white dark:bg-slate-800 text-slate-900 dark:text-white",
            "border-slate-300 dark:border-slate-600",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500"
              : "hover:border-slate-400 dark:hover:border-slate-500",
            inputClassName,
            className
          )}
          style={inputStyle}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
          ref={ref}
          {...props}
        />
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

Input.displayName = "Input";
