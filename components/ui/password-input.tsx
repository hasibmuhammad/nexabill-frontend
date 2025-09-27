"use client";

import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Input, InputProps } from "./input";

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  showToggle?: boolean;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ showToggle = true, className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        ref={ref}
        type={showPassword ? "text" : "password"}
        className={`${className || ""} ${showToggle ? "pr-10" : ""}`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors duration-200"
          title={showPassword ? "Hide password" : "Show password"}
          style={{ top: props.label ? "calc(50% + 0.75rem)" : "50%" }}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";
