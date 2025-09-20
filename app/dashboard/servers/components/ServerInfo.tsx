"use client";

import { type MikrotikServer } from "@/lib/api-mikrotik";
import {
  getConnectionStatusColor,
  getEffectiveConnectionStatus,
} from "./ServerStatusIndicator";

interface ServerInfoProps {
  server: MikrotikServer;
}

export function ServerInfo({ server }: ServerInfoProps) {
  const effectiveConnectionStatus = getEffectiveConnectionStatus(
    server.status,
    server.connectionStatus
  );
  const connectionStatusColor = getConnectionStatusColor(
    server.status,
    server.connectionStatus
  );

  return (
    <div className="space-y-2 sm:space-y-3 mb-4 flex-1">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Connection:
        </span>
        <span
          className={`text-xs sm:text-sm font-medium ${connectionStatusColor}`}
        >
          {effectiveConnectionStatus}
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
  );
}
