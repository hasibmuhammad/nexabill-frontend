"use client";

import { Card } from "@/components/ui/card";
import { type MikrotikServer } from "@/lib/api-mikrotik";
import { getEffectiveConnectionStatus } from "./ServerStatusIndicator";

interface ServerStatusSummaryProps {
  servers: MikrotikServer[];
  autoRefreshEnabled: boolean;
  onAutoRefreshToggle: (enabled: boolean) => void;
}

export function ServerStatusSummary({
  servers,
  autoRefreshEnabled,
  onAutoRefreshToggle,
}: ServerStatusSummaryProps) {
  if (servers.length === 0) return null;

  const connectedCount = servers.filter(
    (s: MikrotikServer) =>
      getEffectiveConnectionStatus(s.status, s.connectionStatus) === "CONNECTED"
  ).length;

  const disconnectedCount = servers.filter(
    (s: MikrotikServer) =>
      getEffectiveConnectionStatus(s.status, s.connectionStatus) ===
      "DISCONNECTED"
  ).length;

  return (
    <Card className="p-3 sm:p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto justify-center sm:justify-start">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {servers.length}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Total Servers
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {connectedCount}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Connected
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
              {disconnectedCount}
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
              onChange={(e) => onAutoRefreshToggle(e.target.checked)}
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
            {servers[0]?.lastCheckedAt
              ? new Date(servers[0].lastCheckedAt).toLocaleString()
              : "Never"}
          </div>
        </div>
      </div>
    </Card>
  );
}
