"use client";

import { type MikrotikServer } from "@/lib/api-mikrotik";
import { RefreshCw } from "lucide-react";
import { ServerCard } from "./ServerCard";

interface ServerGridProps {
  servers: MikrotikServer[];
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
  isBulkRefreshPending?: boolean;
}

export function ServerGrid({
  servers,
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
  isBulkRefreshPending = false,
}: ServerGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 relative">
      {isBulkRefreshPending && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-slate-600 dark:text-slate-400">
              Checking all server statuses...
            </p>
          </div>
        </div>
      )}

      {servers?.map((server) => (
        <ServerCard
          key={server.id}
          server={server}
          onRefreshStatus={onRefreshStatus}
          onTestConnection={onTestConnection}
          onImportUsers={onImportUsers}
          onSyncClients={onSyncClients}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          refreshingStatus={refreshingStatus}
          isTestConnectionPending={isTestConnectionPending}
          isImportUsersPending={isImportUsersPending}
          isSyncClientsPending={isSyncClientsPending}
          isToggleStatusPending={isToggleStatusPending}
        />
      ))}
    </div>
  );
}
