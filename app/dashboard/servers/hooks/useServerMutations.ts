"use client";

import {
  addMikrotikServer,
  checkServerStatus,
  importUsersFromMikrotik,
  syncClientsWithMikrotik,
  testServerConnection,
  toggleServerStatus,
  updateMikrotikServer,
} from "@/lib/api-mikrotik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export function useServerMutations() {
  const queryClient = useQueryClient();

  const addServerMutation = useMutation({
    mutationFn: addMikrotikServer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mikrotik-servers-list"] });
      queryClient.invalidateQueries({
        queryKey: ["mikrotik-servers-with-status"],
      });

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

  const bulkRefreshMutation = useMutation({
    mutationFn: async () => {
      const { getMikrotikServersWithStatus } = await import(
        "@/lib/api-mikrotik"
      );
      return getMikrotikServersWithStatus();
    },
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
        (server: any) => server.connectionStatus === "CONNECTED"
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

  return {
    addServerMutation,
    editServerMutation,
    testConnectionMutation,
    importUsersMutation,
    syncClientsMutation,
    refreshStatusMutation,
    toggleStatusMutation,
    bulkRefreshMutation,
  };
}
