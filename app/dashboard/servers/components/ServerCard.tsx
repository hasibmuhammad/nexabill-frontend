"use client";

import { Card } from "@/components/ui/card";
import { type MikrotikServer } from "@/lib/api-mikrotik";
import { ServerActions } from "./ServerActions";
import { ServerHeader } from "./ServerHeader";
import { ServerInfo } from "./ServerInfo";

interface ServerCardProps {
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

export function ServerCard({
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
}: ServerCardProps) {
  return (
    <Card className="p-4 sm:p-6 min-h-[280px] sm:min-h-[320px] flex flex-col">
      <ServerHeader server={server} refreshingStatus={refreshingStatus} />
      <ServerInfo server={server} />
      <ServerActions
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
    </Card>
  );
}
