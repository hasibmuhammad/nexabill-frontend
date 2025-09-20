"use client";

import { Button } from "@/components/ui/button";
import { type MikrotikServer } from "@/lib/api-mikrotik";
import { Edit3, Power, PowerOff, RefreshCw, Users } from "lucide-react";
import { getEffectiveConnectionStatus } from "./ServerStatusIndicator";

interface ServerActionsProps {
  server: MikrotikServer;
  onRefreshStatus: (serverId: string) => void;
  onImportUsers: (serverId: string) => void;
  onSyncClients: (serverId: string) => void;
  onToggleStatus: (serverId: string) => void;
  onEdit: (server: MikrotikServer) => void;
  refreshingStatus?: string | null;
  isImportUsersPending?: boolean;
  isSyncClientsPending?: boolean;
  isToggleStatusPending?: boolean;
}

export function ServerActions({
  server,
  onRefreshStatus,
  onImportUsers,
  onSyncClients,
  onToggleStatus,
  onEdit,
  refreshingStatus,
  isImportUsersPending = false,
  isSyncClientsPending = false,
  isToggleStatusPending = false,
}: ServerActionsProps) {
  const isConnected =
    getEffectiveConnectionStatus(server.status, server.connectionStatus) ===
    "CONNECTED";

  const isRefreshing = refreshingStatus === server.id;
  const isServerActive = server.status === "ACTIVE";

  return (
    <div className="mt-auto space-y-2">
      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-9"
          onClick={() => onImportUsers(server.id)}
          disabled={isImportUsersPending || !isConnected}
          title={
            !isConnected
              ? "Server must be connected to import users"
              : "Import users from Mikrotik router"
          }
        >
          <Users className="h-4 w-4 mr-1" />
          {isImportUsersPending ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            "Import Users"
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-9"
          onClick={() => onSyncClients(server.id)}
          disabled={isSyncClientsPending || !isConnected}
          title={
            !isConnected
              ? "Server must be connected to sync clients"
              : "Sync client data with Mikrotik router"
          }
        >
          <RefreshCw
            className={`h-4 w-4 mr-1 ${
              isSyncClientsPending ? "animate-spin" : ""
            }`}
          />
          {isSyncClientsPending ? "Syncing..." : "Sync Clients"}
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="space-y-2">
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs h-9"
          onClick={() => onRefreshStatus(server.id)}
          disabled={isRefreshing}
          title="Check server connection status"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Checking..." : "Check Connection"}
        </Button>

        <Button
          size="sm"
          variant={isServerActive ? "outline" : "primary"}
          className={`w-full text-xs h-9 ${
            isServerActive
              ? "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"
              : "bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
          }`}
          onClick={() => onToggleStatus(server.id)}
          disabled={isToggleStatusPending}
          title={
            isServerActive
              ? "Disable server - clients will be hidden from billing"
              : "Enable server - clients will be visible in billing"
          }
        >
          {isToggleStatusPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : isServerActive ? (
            <PowerOff className="h-4 w-4 mr-2" />
          ) : (
            <Power className="h-4 w-4 mr-2" />
          )}
          {isToggleStatusPending
            ? "Updating..."
            : isServerActive
            ? "Disable Server"
            : "Enable Server"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs h-9"
          onClick={() => onEdit(server)}
          disabled={!isConnected}
          title={
            !isConnected
              ? "Server must be connected to edit settings"
              : "Edit server configuration"
          }
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Server
        </Button>
      </div>
    </div>
  );
}
