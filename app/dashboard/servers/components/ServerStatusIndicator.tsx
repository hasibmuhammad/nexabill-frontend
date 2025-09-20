"use client";

import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

interface ServerStatusIndicatorProps {
  status: string;
  connectionStatus?: string;
  isRefreshing?: boolean;
  className?: string;
}

export function ServerStatusIndicator({
  status,
  connectionStatus,
  isRefreshing = false,
  className = "",
}: ServerStatusIndicatorProps) {
  const getStatusColor = (status: string, connectionStatus?: string) => {
    // If server is inactive, it should always show as inactive regardless of connection status
    if (status === "INACTIVE") {
      return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50";
    }

    // If we have real-time connection status, use that for more accurate colors
    if (connectionStatus === "DISCONNECTED") {
      return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
    }

    switch (status) {
      case "ACTIVE":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "ERROR":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50";
    }
  };

  const getStatusIcon = (status: string, connectionStatus?: string) => {
    // If server is inactive, it should always show as inactive regardless of connection status
    if (status === "INACTIVE") {
      return <AlertCircle className="h-4 w-4" />;
    }

    // If we have real-time connection status, use that for more accurate icons
    if (connectionStatus === "DISCONNECTED") {
      return <AlertCircle className="h-4 w-4" />;
    }

    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4" />;
      case "ERROR":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string, connectionStatus?: string) => {
    // If server is inactive, it should always show as inactive regardless of connection status
    if (status === "INACTIVE") {
      return "INACTIVE";
    }

    if (connectionStatus === "DISCONNECTED") {
      return "DISCONNECTED";
    }
    return status;
  };

  const getEffectiveConnectionStatus = (
    status: string,
    connectionStatus?: string
  ) => {
    // If server is inactive, it should always show as disconnected regardless of actual connection
    if (status === "INACTIVE") {
      return "DISCONNECTED";
    }

    // For active servers, use the actual connection status
    return connectionStatus || "UNKNOWN";
  };

  return (
    <div
      className={`inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(
        status,
        connectionStatus
      )} ${className}`}
    >
      {isRefreshing ? (
        <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
      ) : (
        getStatusIcon(status, connectionStatus)
      )}
      <span className="ml-1 hidden sm:inline">
        {isRefreshing ? "Checking..." : getStatusText(status, connectionStatus)}
      </span>
      <span className="ml-1 sm:hidden">
        {isRefreshing
          ? "..."
          : getStatusText(status, connectionStatus).substring(0, 3)}
      </span>
    </div>
  );
}

// Export utility functions for use in other components
export const getEffectiveConnectionStatus = (
  status: string,
  connectionStatus?: string
) => {
  // If server is inactive, it should always show as disconnected regardless of actual connection
  if (status === "INACTIVE") {
    return "DISCONNECTED";
  }

  // For active servers, use the actual connection status
  return connectionStatus || "UNKNOWN";
};

export const getConnectionStatusColor = (
  status: string,
  connectionStatus?: string
) => {
  const effectiveStatus = getEffectiveConnectionStatus(
    status,
    connectionStatus
  );
  return effectiveStatus === "CONNECTED"
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
};
