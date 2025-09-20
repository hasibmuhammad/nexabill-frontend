"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  error: any;
  hasServers: boolean;
}

export function ErrorBoundary({ error, hasServers }: ErrorBoundaryProps) {
  // Handle null/undefined error
  if (!error) {
    return null;
  }

  const errorMessage = error.message || "";
  const isCompleteBackendFailure =
    errorMessage.includes("Network Error") ||
    errorMessage.includes("ERR_NETWORK") ||
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("ECONNREFUSED");

  // Only show full error screen if we have no servers to display and it's a complete backend failure
  if (isCompleteBackendFailure && !hasServers) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-6 mb-6">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Backend API Unavailable
            </h2>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              The backend server is not responding. Please check if the backend
              service is running.
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

  // Show connection warning if we have servers but there's an error
  if (error && hasServers) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-700 py-2">
        <div className="flex items-center justify-center space-x-2 text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            Backend connection issue detected. Some features may be unavailable.
          </span>
        </div>
      </div>
    );
  }

  return null;
}
