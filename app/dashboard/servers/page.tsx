"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";
import {
  addMikrotikServer,
  checkServerStatus,
  getMikrotikServers,
  getMikrotikServersWithStatus,
  importUsersFromMikrotik,
  syncClientsWithMikrotik,
  testServerConnection,
  toggleServerStatus,
  updateMikrotikServer,
  type MikrotikServer,
} from "@/lib/api-mikrotik";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Download,
  Plus,
  RefreshCw,
  Server,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function ServersPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedServer, setSelectedServer] = useState<MikrotikServer | null>(
    null
  );
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState<string | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const queryClient = useQueryClient();

  // Handle escape key to close forms
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showAddForm) setShowAddForm(false);
        if (showEditForm) setShowEditForm(false);
      }
    };

    if (showAddForm || showEditForm) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showAddForm, showEditForm]);

  const closeForm = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setIsTestingConnection(false);
    setSelectedServer(null);
    // Reset form if needed
    const form = document.querySelector("form") as HTMLFormElement;
    if (form) {
      form.reset();
    }
    // Clear any pending mutations
    addServerMutation.reset();
    editServerMutation.reset();
  };

  // First check if there are any servers at all
  const {
    data: serversList,
    isLoading: serversLoading,
    error: serversError,
  } = useQuery({
    queryKey: ["mikrotik-servers-list"],
    queryFn: getMikrotikServers,
    retry: 1,
    retryDelay: 2000,
  });

  // Only fetch with status if there are servers
  const {
    data: servers,
    isLoading: statusLoading,
    error: statusError,
  } = useQuery({
    queryKey: ["mikrotik-servers-with-status"],
    queryFn: getMikrotikServersWithStatus,
    enabled: !!serversList && serversList.length > 0, // Only run if servers exist
    retry: 1,
    retryDelay: 2000,
  });

  // Use servers with status if available, otherwise use basic servers list
  const finalServers = servers || serversList || [];
  const isLoading =
    serversLoading || (serversList && serversList.length > 0 && statusLoading);
  const error = serversError || statusError;

  // Ensure servers is always an array, even if API returns error or unexpected data
  // Handle both direct array and paginated response structure
  const serversArray: MikrotikServer[] = Array.isArray(finalServers)
    ? finalServers
    : finalServers && Array.isArray(finalServers)
    ? finalServers
    : [];

  // Show error if there's an API error
  if (error) {
    console.error("Servers query error:", error);
    // If it's an authentication error, show a message
    if ("response" in error && (error.response as any)?.status === 401) {
      console.error("Authentication error - user not logged in");
    }
  }

  // Add server mutation
  const addServerMutation = useMutation({
    mutationFn: addMikrotikServer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mikrotik-servers-list"] });
      queryClient.invalidateQueries({
        queryKey: ["mikrotik-servers-with-status"],
      });
      closeForm();

      // Show success message with import information
      if (data.importResult) {
        toast.success(
          `Mikrotik server added successfully! ${data.importResult.successfulRecords} users imported automatically.`
        );
      } else if (data.importError) {
        toast.success(
          `Mikrotik server added successfully! ${data.importError.message}`
        );
      } else {
        toast.success("Mikrotik server added successfully!");
      }
    },
    onError: (error: any) => {
      console.error("Add server error:", error);
      console.error("Error response:", error.response?.data);

      // Check if backend is down
      if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        toast.error(
          "Backend API is unavailable. Please check if the backend service is running."
        );
        return;
      }

      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add server. Please check your connection details.";

      // If it's a validation error, show more details
      if (
        error.response?.data?.message &&
        Array.isArray(error.response.data.message)
      ) {
        toast.error(
          `Validation errors: ${error.response.data.message.join(", ")}`
        );
      } else {
        // Provide more user-friendly error messages for connection issues
        if (errorMessage.includes("timeout")) {
          errorMessage =
            "Connection timeout - the router is not responding within 15 seconds. This may indicate the router is offline, unreachable, or there are network connectivity issues. Try checking if the router is online and accessible from this network.";
        } else if (errorMessage.includes("Connection refused")) {
          errorMessage =
            "Connection refused - the router is not accepting connections on this port. Check if the API service is enabled and the port number is correct.";
        } else if (
          errorMessage.includes("Router connection failed") ||
          errorMessage.includes("RosException")
        ) {
          errorMessage =
            "Router API error - the Mikrotik router is not responding to API requests. Check if the API service is enabled and the router is accessible.";
        } else if (errorMessage.includes("Authentication failed")) {
          errorMessage =
            "Authentication failed - the username or password is incorrect. Verify your router credentials.";
        } else if (errorMessage.includes("Host not found")) {
          errorMessage =
            "Host not found - the router IP address cannot be resolved. Check the IP address and network connectivity.";
        } else if (errorMessage.includes("Basic connectivity test failed")) {
          errorMessage =
            "Network connectivity failed - the router is not reachable at the specified IP and port. Check if the router is online and the port is correct.";
        }

        toast.error(errorMessage);
      }
    },
  });

  // Edit server mutation
  const editServerMutation = useMutation({
    mutationFn: (data: { id: string; [key: string]: any }) => {
      const { id, ...updateData } = data;
      return updateMikrotikServer(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mikrotik-servers-list"] });
      queryClient.invalidateQueries({
        queryKey: ["mikrotik-servers-with-status"],
      });
      closeForm();
      toast.success("Mikrotik server updated successfully!");
    },
    onError: (error: any) => {
      console.error("Edit server error:", error);

      // Check if backend is down
      if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        toast.error(
          "Backend API is unavailable. Please check if the backend service is running."
        );
        return;
      }

      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update server. Please check your connection details.";

      if (
        error.response?.data?.message &&
        Array.isArray(error.response.data.message)
      ) {
        toast.error(
          `Validation errors: ${error.response.data.message.join(", ")}`
        );
      } else {
        // Provide more user-friendly error messages for connection issues
        if (errorMessage.includes("timeout")) {
          errorMessage =
            "Connection timeout - the router is not responding within 15 seconds. This may indicate the router is offline, or there are network connectivity issues. Try checking if the router is online and accessible from this network.";
        } else if (errorMessage.includes("Connection refused")) {
          errorMessage =
            "Connection refused - the router is not accepting connections on this port. Check if the API service is enabled and the port number is correct.";
        } else if (
          errorMessage.includes("Router connection failed") ||
          errorMessage.includes("RosException")
        ) {
          errorMessage =
            "Router API error - the Mikrotik router is not responding to API requests. Check if the API service is enabled and the router is accessible.";
        } else if (errorMessage.includes("Authentication failed")) {
          errorMessage =
            "Authentication failed - the username or password is incorrect. Verify your router credentials.";
        } else if (errorMessage.includes("Host not found")) {
          errorMessage =
            "Host not found - the router IP address cannot be resolved. Check the IP address and network connectivity.";
        } else if (errorMessage.includes("Basic connectivity test failed")) {
          errorMessage =
            "Network connectivity failed - the router is not reachable at the specified IP and port. Check if the router is online and the port is correct.";
        }

        toast.error(errorMessage);
      }
    },
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: testServerConnection,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mikrotik-servers-list"] });
      queryClient.invalidateQueries({
        queryKey: ["mikrotik-servers-with-status"],
      });
      toast.success(
        `Connection test ${data.success ? "successful" : "failed"}: ${
          data.message
        }`
      );
    },
    onError: (error: any) => {
      console.error("Test connection error:", error);

      // Check if backend is down
      if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        toast.error(
          "Backend API is unavailable. Please check if the backend service is running."
        );
        return;
      }

      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to test connection";

      // Provide more user-friendly error messages based on error type
      if (errorMessage.includes("timeout")) {
        errorMessage =
          "Connection timeout - the router is not responding within 15 seconds. This may indicate the router is offline, unreachable, or there are network connectivity issues. Try checking if the router is online and accessible from this network.";
      } else if (errorMessage.includes("Connection refused")) {
        errorMessage =
          "Connection refused - the router is not accepting connections on this port. Check if the API service is enabled and the port number is correct.";
      } else if (
        errorMessage.includes("Router connection failed") ||
        errorMessage.includes("RosException")
      ) {
        errorMessage =
          "Router API error - the Mikrotik router is not responding to API requests. Check if the API service is enabled and the router is accessible.";
      } else if (errorMessage.includes("Authentication failed")) {
        errorMessage =
          "Authentication failed - the username or password is incorrect. Verify your router credentials.";
      } else if (errorMessage.includes("Host not found")) {
        errorMessage =
          "Host not found - the router IP address cannot be resolved. Check the IP address and network connectivity.";
      } else if (errorMessage.includes("Connection reset")) {
        errorMessage =
          "Connection reset - the router unexpectedly closed the connection. This may indicate network instability or router issues.";
      } else if (errorMessage.includes("Host unreachable")) {
        errorMessage =
          "Host unreachable - the router is not accessible from this network. Check network routing and firewall settings.";
      } else if (errorMessage.includes("Network unreachable")) {
        errorMessage =
          "Network unreachable - there is no route to the router. Check network configuration and routing tables.";
      } else if (errorMessage.includes("Basic connectivity test failed")) {
        errorMessage =
          "Network connectivity failed - the router is not reachable at the specified IP and port. Check if the router is online and the port is correct.";
      }

      toast.error(errorMessage);
    },
  });

  // Import users mutation
  const importUsersMutation = useMutation({
    mutationFn: importUsersFromMikrotik,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mikrotik-servers-list"] });
      queryClient.invalidateQueries({
        queryKey: ["mikrotik-servers-with-status"],
      });
      toast.success(
        `Imported ${data.successfulRecords || 0} users successfully!`
      );
    },
    onError: (error: any) => {
      console.error("Import users error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to import users from Mikrotik server.";
      toast.error(errorMessage);
    },
  });

  // Sync clients mutation
  const syncClientsMutation = useMutation({
    mutationFn: syncClientsWithMikrotik,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mikrotik-servers-list"] });
      queryClient.invalidateQueries({
        queryKey: ["mikrotik-servers-with-status"],
      });
      toast.success(
        `Synced ${data.successfulRecords || 0} clients successfully!`
      );
    },
    onError: (error: any) => {
      console.error("Sync clients error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to sync clients with Mikrotik server.";
      toast.error(errorMessage);
    },
  });

  // Refresh server status
  const refreshStatusMutation = useMutation({
    mutationFn: checkServerStatus,
    onSuccess: (data) => {
      console.log("Check status response:", data); // Debug log
      queryClient.invalidateQueries({ queryKey: ["mikrotik-servers-list"] });
      queryClient.invalidateQueries({
        queryKey: ["mikrotik-servers-with-status"],
      });

      // Check the connectionStatus from the response
      if (data.connectionStatus === "CONNECTED") {
        toast.success(`Server is connected`);
      } else if (data.connectionStatus === "DISCONNECTED") {
        toast.error(`Server is disconnected`);
      } else if (data.connectionStatus === "ERROR") {
        toast.error(
          `Server connection error: ${data.error || "Unknown error"}`
        );
      } else {
        toast.error(`Server status unknown`);
      }
    },
    onError: (error: any) => {
      console.error("Refresh status error:", error);

      // Always show "Server is disconnected" for any connection errors
      // This provides a consistent user experience regardless of the specific error
      toast.error("Server is disconnected");

      // Log the actual error for debugging purposes
      if (error.message?.includes("timeout")) {
        console.log("Connection timeout occurred");
      } else if (error.message?.includes("Network Error")) {
        console.log("Network error occurred");
      } else if (error.response?.data?.message) {
        console.log("Backend error:", error.response.data.message);
      }
    },
  });

  // Toggle server status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: toggleServerStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mikrotik-servers-list"] });
      queryClient.invalidateQueries({
        queryKey: ["mikrotik-servers-with-status"],
      });
      // Also invalidate clients query to refresh the client list
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients-total"] });
      toast.success(data.message || "Server status updated successfully!");
    },
    onError: (error: any) => {
      console.error("Toggle status error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to toggle server status";
      toast.error(errorMessage);
    },
  });

  // Refresh all server statuses (real-time check)
  const bulkRefreshMutation = useMutation({
    mutationFn: getMikrotikServersWithStatus,
    onSuccess: (data: any) => {
      // Handle new standardized response structure
      const serversData = Array.isArray(data)
        ? data
        : data?.data && Array.isArray(data.data)
        ? data.data
        : data?.items && Array.isArray(data.items)
        ? data.items
        : [];

      // Update both query caches with the new data
      queryClient.setQueryData(["mikrotik-servers-with-status"], serversData);
      queryClient.setQueryData(["mikrotik-servers-list"], serversData);

      const connectedCount = serversData.filter(
        (server: MikrotikServer) => server.connectionStatus === "CONNECTED"
      ).length;
      const totalCount = serversData.length;
      toast.success(
        `Status check completed: ${connectedCount}/${totalCount} servers connected`
      );
    },
    onError: (error: any) => {
      console.error("Bulk refresh error:", error);

      // Check if backend is down
      if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        toast.error(
          "Backend API is unavailable. Please check if the backend service is running."
        );
        return;
      }

      // Show a simple, user-friendly message
      toast.error(
        "Failed to refresh server statuses - some servers may be disconnected"
      );

      // Log the actual error for debugging purposes
      if (error.message?.includes("timeout")) {
        console.log("Bulk refresh timeout occurred");
      } else if (error.message?.includes("Network Error")) {
        console.log("Bulk refresh network error occurred");
      } else if (error.response?.data?.message) {
        console.log("Backend error:", error.response.data.message);
      }
    },
  });

  // Auto-refresh server statuses every 5 minutes
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      // Only auto-refresh if the page is visible and not already refreshing
      if (!bulkRefreshMutation.isPending && !isLoading) {
        bulkRefreshMutation.mutate();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [bulkRefreshMutation, isLoading, autoRefreshEnabled]);

  const handleRefreshStatus = (serverId: string) => {
    setRefreshingStatus(serverId);
    refreshStatusMutation.mutate(serverId, {
      onSettled: () => setRefreshingStatus(null),
    });
  };

  const handleAddServer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Validate and convert form data
    const name = formData.get("name") as string;
    const host = formData.get("host") as string;
    const portStr = formData.get("port") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;

    // Validate required fields
    if (!name || !host || !portStr || !username || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Basic host validation
    if (
      !host.match(/^[a-zA-Z0-9.-]+$/) &&
      !host.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)
    ) {
      toast.error("Please enter a valid hostname or IP address");
      return;
    }

    // Parse port and validate
    const port = parseInt(portStr);
    if (isNaN(port)) {
      toast.error("Port must be a valid number");
      return;
    }
    if (port < 1 || port > 65535) {
      toast.error("Port must be between 1 and 65535");
      return;
    }

    const data = {
      name,
      host,
      port: Number(port), // Ensure port is a proper number
      username,
      password,
      description: description || undefined,
      location: location || undefined,
    };

    console.log("Submitting data:", data); // Debug log
    console.log("Port type:", typeof data.port, "Port value:", data.port); // Debug port specifically
    addServerMutation.mutate(data);
  };

  const getStatusColor = (status: string, connectionStatus?: string) => {
    // If we have real-time connection status, use that for more accurate colors
    if (connectionStatus === "DISCONNECTED") {
      return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
    }

    switch (status) {
      case "ACTIVE":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "INACTIVE":
        return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50";
      case "ERROR":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50";
    }
  };

  const getStatusIcon = (status: string, connectionStatus?: string) => {
    // If we have real-time connection status, use that for more accurate icons
    if (connectionStatus === "DISCONNECTED") {
      return <AlertCircle className="h-4 w-4" />;
    }

    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4" />;
      case "INACTIVE":
        return <AlertCircle className="h-4 w-4" />;
      case "ERROR":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string, connectionStatus?: string) => {
    if (connectionStatus === "DISCONNECTED") {
      return "DISCONNECTED";
    }
    return status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Checking server connections...
          </p>
        </div>
      </div>
    );
  }

  // Handle API connection errors (backend down) - only show full error screen for complete failures
  if (error && serversArray.length === 0) {
    const errorMessage = error.message || "";
    const isCompleteBackendFailure =
      errorMessage.includes("Network Error") ||
      errorMessage.includes("ERR_NETWORK") ||
      errorMessage.includes("Failed to fetch") ||
      errorMessage.includes("ECONNREFUSED");

    // Only show full error screen if we have no servers to display and it's a complete backend failure
    if (isCompleteBackendFailure) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-6 mb-6">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Backend API Unavailable
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                The backend server is not responding. Please check if the
                backend service is running.
              </p>
              <div className="space-y-2 text-xs text-red-600 dark:text-red-400">
                <p>• Check if backend server is running</p>
                <p>• Verify backend port (usually 3001)</p>
                <p>• Check firewall settings</p>
                <p>• Ensure backend environment is properly configured</p>
              </div>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-3 sm:space-y-0">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Mikrotik Servers
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Manage your Mikrotik routers and network infrastructure
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => bulkRefreshMutation.mutate()}
                disabled={isLoading || bulkRefreshMutation.isPending}
                className="w-full sm:w-auto"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isLoading || bulkRefreshMutation.isPending
                      ? "animate-spin"
                      : ""
                  }`}
                />
                {bulkRefreshMutation.isPending ? "Checking..." : "Refresh All"}
              </Button>

              <Button
                onClick={() => setShowAddForm(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Server
              </Button>
            </div>
          </div>
          {/* Connection Status Warning */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-700 py-2">
              <div className="flex items-center justify-center space-x-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Backend connection issue detected. Some features may be
                  unavailable.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Server Modal */}
        <Modal
          isOpen={showAddForm}
          onClose={closeForm}
          title="Add New Mikrotik Server"
          size="lg"
          footer={{
            cancelText: "Cancel",
            confirmText: "Add Server",
            onCancel: closeForm,
            onConfirm: () => {
              const form = document.querySelector(
                "#add-server-form"
              ) as HTMLFormElement;
              if (form) {
                form.requestSubmit();
              }
            },
            confirmVariant: "primary",
            isLoading: addServerMutation.isPending,
            disabled: addServerMutation.isPending,
          }}
        >
          <form
            id="add-server-form"
            onSubmit={handleAddServer}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Server Name
                </label>
                <Input
                  name="name"
                  required
                  placeholder="e.g., Main Router"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Host/IP Address
                </label>
                <Input
                  name="host"
                  required
                  placeholder="192.168.1.1"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Port
                </label>
                <Input
                  name="port"
                  type="number"
                  defaultValue="8728"
                  min="1"
                  max="65535"
                  required
                  className="text-sm"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Default: 8728 (API), 8729 (API-SSL)
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <Input
                  name="username"
                  required
                  placeholder="admin"
                  className="text-sm"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mikrotik router username (usually "admin")
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <PasswordInput name="password" required className="text-sm" />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mikrotik router password
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Location
                </label>
                <Input
                  name="location"
                  placeholder="e.g., Main Office, Branch 1"
                  className="text-sm"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Physical location of the server (optional)
                </p>
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  label="Description (Optional)"
                  name="description"
                  placeholder="Server description"
                  className="text-sm"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  // Validate form before testing
                  const formData = new FormData(
                    document.querySelector(
                      "#add-server-form"
                    ) as HTMLFormElement
                  );
                  const host = formData.get("host") as string;
                  const port = formData.get("port") as string;
                  const username = formData.get("username") as string;
                  const password = formData.get("password") as string;

                  if (!host || !port || !username || !password) {
                    toast.error("Please fill in all required fields first");
                    return;
                  }

                  // Parse port and validate
                  const portNum = parseInt(port);
                  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
                    toast.error(
                      "Port must be a valid number between 1 and 65535"
                    );
                    return;
                  }

                  setIsTestingConnection(true);
                  try {
                    // For now, just show a success message since backend doesn't have standalone test endpoint
                    // The backend will test the connection when creating the server
                    setTimeout(() => {
                      setIsTestingConnection(false);
                      toast.success(
                        "Form validation successful! You can now add the server."
                      );
                    }, 1000);
                  } catch (error: any) {
                    const errorMessage =
                      error.response?.data?.message ||
                      error.message ||
                      "Validation failed";
                    toast.error(errorMessage);
                    setIsTestingConnection(false);
                  }
                }}
                disabled={isTestingConnection}
                className="w-full sm:w-auto"
              >
                {isTestingConnection ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Server Modal */}
        {selectedServer && (
          <Modal
            isOpen={showEditForm}
            onClose={closeForm}
            title="Edit Mikrotik Server"
            size="lg"
            footer={{
              cancelText: "Cancel",
              confirmText: "Update Server",
              onCancel: closeForm,
              onConfirm: () => {
                const form = document.querySelector(
                  "#edit-server-form"
                ) as HTMLFormElement;
                if (form) {
                  form.requestSubmit();
                }
              },
              confirmVariant: "primary",
              isLoading: editServerMutation.isPending,
              disabled: editServerMutation.isPending,
            }}
          >
            <form
              id="edit-server-form"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                const data = {
                  id: selectedServer.id,
                  name: formData.get("name") as string,
                  host: formData.get("host") as string,
                  port: Number(formData.get("port") as string),
                  username: formData.get("username") as string,
                  password: formData.get("password") as string,
                  description:
                    (formData.get("description") as string) || undefined,
                  location: (formData.get("location") as string) || undefined,
                };

                editServerMutation.mutate(data);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Server Name
                  </label>
                  <Input
                    name="name"
                    required
                    defaultValue={selectedServer.name}
                    placeholder="e.g., Main Router"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Host/IP Address
                  </label>
                  <Input
                    name="host"
                    required
                    defaultValue={selectedServer.host}
                    placeholder="192.168.1.1"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Port
                  </label>
                  <Input
                    name="port"
                    type="number"
                    defaultValue={selectedServer.port}
                    min="1"
                    max="65535"
                    required
                    className="text-sm"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Default: 8728 (API), 8729 (API-SSL)
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Username
                  </label>
                  <Input
                    name="username"
                    required
                    defaultValue={selectedServer.username}
                    placeholder="admin"
                    className="text-sm"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Mikrotik router username (usually "admin")
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <PasswordInput
                    name="password"
                    defaultValue={selectedServer.password || ""}
                    placeholder="Enter new password to update"
                    className="text-sm"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Leave blank to keep current password
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <Input
                    name="location"
                    defaultValue={selectedServer.location || ""}
                    placeholder="e.g., Main Office, Branch 1"
                    className="text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Textarea
                    label="Description (Optional)"
                    name="description"
                    defaultValue={selectedServer.description || ""}
                    placeholder="Server description"
                    className="text-sm"
                    rows={3}
                  />
                </div>
              </div>
            </form>
          </Modal>
        )}

        {/* Connection Help */}
        <Card className="p-3 sm:p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Connection Testing Tips
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                • Page loads with real-time connection status (may take a few
                seconds)
                <br />
                • If a server is unreachable, it will show as "Server is
                disconnected"
                <br />
                • Ensure the correct port is open (usually 8728 for API or 8729
                for API-SSL)
                <br />• Check firewall settings that might block the connection
              </p>
            </div>
          </div>
        </Card>

        {/* Status Summary */}
        {serversArray.length > 0 && (
          <Card className="p-3 sm:p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto justify-center sm:justify-start">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {serversArray.length}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Total Servers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    {
                      serversArray.filter(
                        (s: MikrotikServer) =>
                          s.connectionStatus === "CONNECTED"
                      ).length
                    }
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Connected
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                    {
                      serversArray.filter(
                        (s: MikrotikServer) =>
                          s.connectionStatus === "DISCONNECTED"
                      ).length
                    }
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Disconnected
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-refresh"
                    checked={autoRefreshEnabled}
                    onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="auto-refresh"
                    className="text-xs sm:text-sm text-slate-600 dark:text-slate-400"
                  >
                    Auto-refresh every 5 min
                  </label>
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center sm:text-left">
                  Last updated:{" "}
                  {serversArray[0]?.lastCheckedAt
                    ? new Date(serversArray[0].lastCheckedAt).toLocaleString()
                    : "Never"}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Servers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 relative">
          {bulkRefreshMutation.isPending && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10 rounded-lg">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-slate-600 dark:text-slate-400">
                  Checking all server statuses...
                </p>
              </div>
            </div>
          )}

          {serversArray?.map((server) => (
            <Card
              key={server.id}
              className="p-4 sm:p-6 min-h-[280px] sm:min-h-[320px] flex flex-col"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-start min-w-0 flex-1">
                  <Server className="h-6 w-6 sm:h-8 sm:w-8 text-slate-600 dark:text-slate-400 mr-2 sm:mr-3 flex-shrink-0 mt-1" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                      {server.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                      {server.host}:{server.port}
                    </p>
                  </div>
                </div>
                <div
                  className={`inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${getStatusColor(
                    server.status,
                    server.connectionStatus
                  )}`}
                >
                  {refreshingStatus === server.id ? (
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    getStatusIcon(server.status, server.connectionStatus)
                  )}
                  <span className="ml-1 hidden sm:inline">
                    {refreshingStatus === server.id
                      ? "Checking..."
                      : getStatusText(server.status, server.connectionStatus)}
                  </span>
                  <span className="ml-1 sm:hidden">
                    {refreshingStatus === server.id
                      ? "..."
                      : getStatusText(
                          server.status,
                          server.connectionStatus
                        ).substring(0, 3)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Connection:
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      server.connectionStatus === "CONNECTED"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {server.connectionStatus || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Clients:
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                    {server._count.clients}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Location:
                  </span>
                  <span
                    className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-[150px]"
                    title={server.location || "Not specified"}
                  >
                    {server.location || "Not specified"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Last Sync:
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                    {server.lastSyncAt
                      ? new Date(server.lastSyncAt).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
                {server.lastCheckedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Last Checked:
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                      {new Date(server.lastCheckedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {server.connectionError && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Error:
                    </span>
                    <div className="max-w-[100px] sm:max-w-[200px] text-right">
                      <span
                        className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 cursor-help"
                        title={server.connectionError}
                      >
                        {server.connectionError.length >
                        (window.innerWidth < 640 ? 15 : 25)
                          ? server.connectionError.substring(
                              0,
                              window.innerWidth < 640 ? 15 : 25
                            ) + "..."
                          : server.connectionError}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 mt-auto">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 sm:h-9"
                    onClick={() => handleRefreshStatus(server.id)}
                    disabled={refreshingStatus === server.id}
                  >
                    <RefreshCw
                      className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${
                        refreshingStatus === server.id ? "animate-spin" : ""
                      }`}
                    />
                    <span className="hidden sm:inline">Check Status</span>
                    <span className="sm:hidden">Check</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 sm:h-9"
                    onClick={() => testConnectionMutation.mutate(server.id)}
                    disabled={testConnectionMutation.isPending}
                    title="Test connection to this server (may take up to 15 seconds)"
                  >
                    <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Test</span>
                    <span className="sm:hidden">Test</span>
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 sm:h-9"
                    onClick={() => importUsersMutation.mutate(server.id)}
                    disabled={
                      importUsersMutation.isPending ||
                      server.connectionStatus === "DISCONNECTED"
                    }
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Import</span>
                    <span className="sm:hidden">Import</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 sm:h-9"
                    onClick={() => syncClientsMutation.mutate(server.id)}
                    disabled={
                      syncClientsMutation.isPending ||
                      server.connectionStatus === "DISCONNECTED"
                    }
                  >
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Sync</span>
                    <span className="sm:hidden">Sync</span>
                  </Button>
                </div>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant={server.status === "ACTIVE" ? "danger" : "primary"}
                    className={`w-full text-xs h-8 sm:h-9 ${
                      server.status === "ACTIVE"
                        ? "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                        : "bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                    }`}
                    onClick={() => toggleStatusMutation.mutate(server.id)}
                    disabled={toggleStatusMutation.isPending}
                    title={
                      server.status === "ACTIVE"
                        ? "Disable this server (clients will be hidden)"
                        : "Enable this server (clients will be visible)"
                    }
                  >
                    {toggleStatusMutation.isPending ? (
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-spin" />
                    ) : server.status === "ACTIVE" ? (
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : (
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    )}
                    <span className="hidden sm:inline">
                      {server.status === "ACTIVE"
                        ? "Disable Server"
                        : "Enable Server"}
                    </span>
                    <span className="sm:hidden">
                      {server.status === "ACTIVE" ? "Disable" : "Enable"}
                    </span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-8 sm:h-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 border-blue-300 dark:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-400 dark:disabled:text-slate-500"
                    onClick={() => {
                      setSelectedServer(server);
                      setShowEditForm(true);
                    }}
                    disabled={server.connectionStatus === "DISCONNECTED"}
                    title={
                      server.connectionStatus === "DISCONNECTED"
                        ? "Cannot edit disconnected server - check connection first"
                        : "Edit this server"
                    }
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>

                  {/* Show reason why edit is disabled */}
                  {server.connectionStatus === "DISCONNECTED" && (
                    <div className="text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Server disconnected - check connection first
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {serversArray?.length === 0 && (
          <Card className="p-8 sm:p-12 text-center">
            <Server className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No Mikrotik Servers
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
              Get started by adding your first Mikrotik server to manage your
              network infrastructure.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Server
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
