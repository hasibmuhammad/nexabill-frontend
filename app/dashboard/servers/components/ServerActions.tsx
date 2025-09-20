"use client";

import { Button } from "@/components/ui/button";
import { type MikrotikServer } from "@/lib/api-mikrotik";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Download,
  RefreshCw,
  Settings,
} from "lucide-react";
import { getEffectiveConnectionStatus } from "./ServerStatusIndicator";

interface ServerActionsProps {
  server: MikrotikServer;
  onRefreshStatus: (serverId: string) => void;
  onTestConnection: (serverId: string) => void;
  onImportUsers: (serverId: string) => void;
  onSyncClients: (serverId: string) => void;
  onToggleStatus: (serverId: string) => void;
  onEdit: (server: MikrotikServer) => void;
  refreshingStatus?: string | null;
  isTestConnectionPending?: boolean;
  isImportUsersPending?: boolean;
  isSyncClientsPending?: boolean;
  isToggleStatusPending?: boolean;
}

export function ServerActions({
  server,
  onRefreshStatus,
  onTestConnection,
  onImportUsers,
  onSyncClients,
  onToggleStatus,
  onEdit,
  refreshingStatus,
  isTestConnectionPending = false,
  isImportUsersPending = false,
  isSyncClientsPending = false,
  isToggleStatusPending = false,
}: ServerActionsProps) {
  const isConnected =
    getEffectiveConnectionStatus(server.status, server.connectionStatus) ===
    "CONNECTED";

  return (
    <div className="space-y-2 mt-auto">
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8 sm:h-9"
          onClick={() => onRefreshStatus(server.id)}
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
          onClick={() => onTestConnection(server.id)}
          disabled={isTestConnectionPending}
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
          onClick={() => onImportUsers(server.id)}
          disabled={isImportUsersPending || !isConnected}
        >
          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="hidden sm:inline">Import</span>
          <span className="sm:hidden">Import</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8 sm:h-9"
          onClick={() => onSyncClients(server.id)}
          disabled={isSyncClientsPending || !isConnected}
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
          onClick={() => onToggleStatus(server.id)}
          disabled={isToggleStatusPending}
          title={
            server.status === "ACTIVE"
              ? "Disable this server (clients will be hidden)"
              : "Enable this server (clients will be visible)"
          }
        >
          {isToggleStatusPending ? (
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-spin" />
          ) : server.status === "ACTIVE" ? (
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          ) : (
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          )}
          <span className="hidden sm:inline">
            {server.status === "ACTIVE" ? "Disable Server" : "Enable Server"}
          </span>
          <span className="sm:hidden">
            {server.status === "ACTIVE" ? "Disable" : "Enable"}
          </span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs h-8 sm:h-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 border-blue-300 dark:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-400 dark:disabled:text-slate-500"
          onClick={() => onEdit(server)}
          disabled={!isConnected}
          title={
            !isConnected
              ? "Cannot edit disconnected server - check connection first"
              : "Edit this server"
          }
        >
          <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="hidden sm:inline">Edit</span>
          <span className="sm:hidden">Edit</span>
        </Button>
      </div>
    </div>
  );
}
