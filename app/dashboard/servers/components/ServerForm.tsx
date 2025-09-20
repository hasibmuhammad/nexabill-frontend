"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";
import { type MikrotikServer } from "@/lib/api-mikrotik";
import { forwardRef, useImperativeHandle, useState } from "react";
import { toast } from "react-hot-toast";

interface ServerFormProps {
  server?: MikrotikServer | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  onTestConnection?: () => void;
  isTestingConnection?: boolean;
}

export interface ServerFormRef {
  submit: () => void;
}

export const ServerForm = forwardRef<ServerFormRef, ServerFormProps>(
  (
    {
      server,
      onSubmit,
      isLoading = false,
      onTestConnection,
      isTestingConnection = false,
    },
    ref
  ) => {
    const [formData, setFormData] = useState({
      name: server?.name || "",
      host: server?.host || "",
      port: server?.port?.toString() || "8728",
      username: server?.username || "",
      password: server?.password || "", // ⚠️ SECURITY RISK: Shows actual password
      description: server?.description || "",
      location: server?.location || "",
    });

    const [importUsers, setImportUsers] = useState(true);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateAndSubmit = () => {
      // Clear previous errors
      setErrors({});

      const newErrors: Record<string, string> = {};
      const isUpdate = !!server;

      // Validate required fields
      if (!formData.name.trim()) {
        newErrors.name = "Server name is required";
      }
      if (!formData.host.trim()) {
        newErrors.host = "Host/IP address is required";
      }
      if (!formData.port.trim()) {
        newErrors.port = "Port is required";
      }
      if (!formData.username.trim()) {
        newErrors.username = "Username is required";
      }
      // Only require password for new servers, not updates
      if (!isUpdate && !formData.password.trim()) {
        newErrors.password = "Password is required";
      }

      // If there are validation errors, set them and return
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Basic host validation
      if (
        !formData.host.match(/^[a-zA-Z0-9.-]+$/) &&
        !formData.host.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)
      ) {
        newErrors.host = "Please enter a valid hostname or IP address";
        setErrors(newErrors);
        return;
      }

      // Parse port and validate
      const port = parseInt(formData.port);
      if (isNaN(port)) {
        newErrors.port = "Port must be a valid number";
        setErrors(newErrors);
        return;
      }
      if (port < 1 || port > 65535) {
        newErrors.port = "Port must be between 1 and 65535";
        setErrors(newErrors);
        return;
      }

      const data = {
        ...(server && { id: server.id }),
        name: formData.name,
        host: formData.host,
        port: Number(port),
        username: formData.username,
        // For updates, only include password if it's not empty
        ...(formData.password && { password: formData.password }),
        description: formData.description || undefined,
        location: formData.location || undefined,
        // Only include importUsers for new servers
        ...(!server && { importUsers }),
      };

      onSubmit(data);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      validateAndSubmit();
    };

    // Clear error when user starts typing
    const clearError = (field: string) => {
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

    // Expose submit function to parent component
    useImperativeHandle(ref, () => ({
      submit: validateAndSubmit,
    }));

    const handleTestConnection = () => {
      // For test connection, we need password (use existing password for updates if not provided)
      const passwordToUse = formData.password || server?.password || "";

      if (
        !formData.host ||
        !formData.port ||
        !formData.username ||
        !passwordToUse
      ) {
        toast.error("Please fill in all required fields first");
        return;
      }

      // Parse port and validate
      const portNum = parseInt(formData.port);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        toast.error("Port must be a valid number between 1 and 65535");
        return;
      }

      if (onTestConnection) {
        onTestConnection();
      }
    };

    return (
      <div className="space-y-4">
        {isLoading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Creating Mikrotik server...
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  {importUsers
                    ? "This may take up to 60 seconds if importing users"
                    : "This should complete quickly"}
                </p>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Input
                label="Server Name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  clearError("name");
                }}
                required
                placeholder="e.g., Main Router"
                className="text-sm"
                error={errors.name}
              />
            </div>
            <div>
              <Input
                label="Host/IP Address"
                value={formData.host}
                onChange={(e) => {
                  setFormData({ ...formData, host: e.target.value });
                  clearError("host");
                }}
                required
                placeholder="192.168.1.1"
                className="text-sm"
                error={errors.host}
              />
            </div>
            <div>
              <Input
                label="Port"
                value={formData.port}
                onChange={(e) => {
                  setFormData({ ...formData, port: e.target.value });
                  clearError("port");
                }}
                type="number"
                min="1"
                max="65535"
                required
                className="text-sm"
                error={errors.port}
                helperText="Default: 8728 (API), 8729 (API-SSL)"
              />
            </div>
            <div>
              <Input
                label="Username"
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  clearError("username");
                }}
                required
                placeholder="admin"
                className="text-sm"
                error={errors.username}
                helperText="Mikrotik router username (usually admin)"
              />
            </div>
            <div>
              <PasswordInput
                label="Password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  clearError("password");
                }}
                required={!server}
                placeholder={
                  server ? "Enter new password to update" : "Password"
                }
                className="text-sm"
                error={errors.password}
                helperText={
                  server
                    ? "Leave blank to keep current password"
                    : "Mikrotik router password"
                }
              />
            </div>
            <div>
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Main Office, Branch 1"
                className="text-sm"
                helperText="Physical location of the server (optional)"
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label="Description (Optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Server description"
                className="text-sm"
                rows={3}
              />
            </div>
          </div>

          {/* Import Users Option - Only show for new servers */}
          {!server && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="importUsers"
                  checked={importUsers}
                  onCheckedChange={(checked) =>
                    setImportUsers(checked as boolean)
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="importUsers"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Automatically import users from Mikrotik
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {importUsers
                      ? "Users will be imported automatically after server creation (may take longer)"
                      : "Skip user import - you can import users manually later"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            {onTestConnection && (
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="w-full sm:w-auto"
              >
                {isTestingConnection ? "Testing..." : "Test Connection"}
              </Button>
            )}
          </div>
        </form>
      </div>
    );
  }
);

ServerForm.displayName = "ServerForm";
