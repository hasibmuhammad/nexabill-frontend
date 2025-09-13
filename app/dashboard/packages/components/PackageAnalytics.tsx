"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getPackageAnalytics } from "@/lib/packages";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CheckCircle,
  Package,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

interface PackageAnalyticsData {
  id: string;
  name: string;
  mikrotikProfile: string;
  monthlyPrice: string;
  isActive: boolean;
  totalClients: number;
  activeClients: number;
  connectedClients: number;
  clients: Array<{
    id: string;
    name: string;
    mikrotikUsername: string;
    status: string;
    connectionStatus: string;
    mikrotikServer: {
      name: string;
    };
  }>;
}

export function PackageAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["package-analytics"],
    queryFn: getPackageAnalytics,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-1"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const packages = analytics || [];

  // Calculate totals
  const totalClients = packages.reduce(
    (sum: number, pkg: any) => sum + pkg.totalClients,
    0
  );
  const totalActiveClients = packages.reduce(
    (sum: number, pkg: any) => sum + pkg.activeClients,
    0
  );
  const totalConnectedClients = packages.reduce(
    (sum: number, pkg: any) => sum + pkg.connectedClients,
    0
  );
  const activePackages = packages.filter((pkg: any) => pkg.isActive).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Total Packages
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {packages.length}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {activePackages} active
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Total Clients
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {totalClients}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                {totalActiveClients} active
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Connected
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {totalConnectedClients}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                {totalClients > 0
                  ? Math.round((totalConnectedClients / totalClients) * 100)
                  : 0}
                % online
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                Avg. Revenue
              </p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                ৳
                {packages.length > 0
                  ? Math.round(
                      packages.reduce(
                        (sum: number, pkg: any) =>
                          sum + Number(pkg.monthlyPrice),
                        0
                      ) / packages.length
                    )
                  : 0}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                per package
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Package Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {packages.map((pkg: any) => (
          <Card key={pkg.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {pkg.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {pkg.mikrotikProfile}
                    </Badge>
                    <Badge
                      variant={pkg.isActive ? "default" : "secondary"}
                      className={`text-xs ${
                        pkg.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {pkg.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  ৳{Number(pkg.monthlyPrice).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  per month
                </p>
              </div>
            </div>

            {/* Client Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Users className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total
                  </span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {pkg.totalClients}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Active
                  </span>
                </div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {pkg.activeClients}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Online
                  </span>
                </div>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {pkg.connectedClients}
                </p>
              </div>
            </div>

            {/* Client List Preview */}
            {pkg.clients.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Recent Clients
                </p>
                <div className="space-y-2">
                  {pkg.clients.slice(0, 3).map((client: any) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {client.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            client.status === "ACTIVE" ? "default" : "secondary"
                          }
                          className={`text-xs ${
                            client.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {client.status}
                        </Badge>
                        {client.connectionStatus === "CONNECTED" ? (
                          <Wifi className="h-3 w-3 text-green-500" />
                        ) : (
                          <WifiOff className="h-3 w-3 text-slate-400" />
                        )}
                      </div>
                    </div>
                  ))}
                  {pkg.clients.length > 3 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      +{pkg.clients.length - 3} more clients
                    </p>
                  )}
                </div>
              </div>
            )}

            {pkg.clients.length === 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="text-center py-4">
                  <Users className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No clients assigned
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No packages found
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Create your first package to start managing client assignments.
          </p>
        </Card>
      )}
    </div>
  );
}
