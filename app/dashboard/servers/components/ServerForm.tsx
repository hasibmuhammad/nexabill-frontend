"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";
import { type MikrotikServer } from "@/lib/api-mikrotik";
import { serverSchema, type ServerFormValues } from "@/lib/schemas/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";

interface ServerFormProps {
  server?: MikrotikServer | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export interface ServerFormRef {
  submit: () => void;
}

export const ServerForm = forwardRef<ServerFormRef, ServerFormProps>(
  ({ server, onSubmit, isLoading = false }, ref) => {
    const {
      register,
      handleSubmit: hookHandleSubmit,
      reset,
      setValue,
      watch,
      formState: { errors },
    } = useForm<ServerFormValues>({
      resolver: zodResolver(serverSchema),
      defaultValues: {
        name: server?.name || "",
        host: server?.host || "",
        port: server?.port || 8728,
        username: server?.username || "",
        password: server?.password || "",
        description: server?.description || "",
        location: server?.location || "",
        importUsers: true,
      },
    });

    const importUsers = watch("importUsers");

    useEffect(() => {
      if (server) {
        reset({
          name: server.name || "",
          host: server.host || "",
          port: server.port || 8728,
          username: server.username || "",
          password: "", // Don't pre-fill password on update
          description: server.description || "",
          location: server.location || "",
          importUsers: false,
        });
      } else {
        reset({
          name: "",
          host: "",
          port: 8728,
          username: "",
          password: "",
          description: "",
          location: "",
          importUsers: true,
        });
      }
    }, [server, reset]);

    const onFormSubmit = (values: ServerFormValues) => {
      const data = {
        ...(server && { id: server.id }),
        ...values,
        // For updates, remove password if empty
        ...(server && !values.password && { password: undefined }),
        // Only include importUsers for new servers
        ...(!server && { importUsers: values.importUsers }),
      };
      if (server && !values.password) {
        delete (data as any).password;
      }
      onSubmit(data);
    };

    // Expose submit function to parent component
    useImperativeHandle(ref, () => ({
      submit: () => hookHandleSubmit(onFormSubmit)(),
    }));

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
        <form onSubmit={hookHandleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Input
                label="Server Name"
                {...register("name")}
                required
                placeholder="e.g., Main Router"
                className="text-sm"
                error={errors.name?.message}
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                label="Host/IP Address"
                {...register("host")}
                required
                placeholder="192.168.1.1"
                className="text-sm"
                error={errors.host?.message}
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                label="Port"
                {...register("port")}
                type="number"
                min="1"
                max="65535"
                required
                className="text-sm"
                error={errors.port?.message}
                helperText="Default: 8728 (API), 8729 (API-SSL)"
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                label="Username"
                {...register("username")}
                required
                placeholder="admin"
                className="text-sm"
                error={errors.username?.message}
                helperText="Mikrotik router username (usually admin)"
                disabled={isLoading}
              />
            </div>
            <div>
              <PasswordInput
                label="Password"
                {...register("password")}
                required={!server}
                placeholder={
                  server ? "Enter new password to update" : "Password"
                }
                className="text-sm"
                error={errors.password?.message}
                helperText={
                  server
                    ? "Leave blank to keep current password"
                    : "Mikrotik router password"
                }
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                label="Location"
                {...register("location")}
                placeholder="e.g., Main Office, Branch 1"
                className="text-sm"
                helperText="Physical location of the server (optional)"
                disabled={isLoading}
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label="Description (Optional)"
                {...register("description")}
                placeholder="Server description"
                className="text-sm"
                rows={3}
                disabled={isLoading}
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
                    setValue("importUsers", checked as boolean)
                  }
                  className="mt-1"
                  disabled={isLoading}
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
        </form>
      </div>
    );
  }
);

ServerForm.displayName = "ServerForm";
