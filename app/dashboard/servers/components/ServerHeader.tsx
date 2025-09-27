"use client";

import { type MikrotikServer } from "@/lib/api-mikrotik";
import { Server } from "lucide-react";
import { ServerStatusIndicator } from "./ServerStatusIndicator";

interface ServerHeaderProps {
  server: MikrotikServer;
  refreshingStatus?: string | null;
}

export function ServerHeader({ server, refreshingStatus }: ServerHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-3 sm:mb-4">
      <div className="flex items-start min-w-0 flex-1">
        <Server className="h-6 w-6 sm:h-8 sm:w-8 text-slate-600 dark:text-slate-400 mr-2 sm:mr-3 flex-shrink-0 mt-1" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
            {server.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate blur-md">
            {server.host}:{server.port}
          </p>
        </div>
      </div>
      <ServerStatusIndicator
        status={server.status}
        connectionStatus={server.connectionStatus}
        isRefreshing={refreshingStatus === server.id}
      />
    </div>
  );
}
