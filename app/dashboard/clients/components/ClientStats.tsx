"use client";

import { Card } from "@/components/ui/card";
import { Users, Wifi, WifiOff } from "lucide-react";

interface ClientStatsProps {
  totalClients: number;
  activeClients: number;
  onlineClients: number;
  offlineClients: number;
}

export function ClientStats({
  totalClients,
  activeClients,
  onlineClients,
  offlineClients,
}: ClientStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card className="p-4">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Total Clients
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalClients}
            </p>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center">
          <Wifi className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Online Clients
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {onlineClients}
            </p>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center">
          <WifiOff className="h-8 w-8 text-red-600 mr-3" />
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Offline Clients
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {offlineClients}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
