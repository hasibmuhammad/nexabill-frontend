"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLoader from "@/components/ui/page-loader";
import { api, getRealTimeConnectionStatus } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Clock,
  DollarSign,
  RefreshCw,
  Server,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect } from "react";

interface DashboardStats {
  clientStats: {
    total: number;
    active: number;
    suspended: number;
    inactive: number;
  };
  serverStats: {
    total: number;
    active: number;
    inactive: number;
  };
  financialStats: {
    monthlyRevenue: number;
    pendingBills: number;
  };
  recentClients: Array<{
    id: string;
    trackCode: string;
    name: string;
    status: string;
    connectionStatus: string;
    createdAt: string;
  }>;
}

interface RealTimeStatus {
  totalActiveUsers: number;
  serverStatus: Array<{
    serverId: string;
    serverName: string;
    activeUsers: number;
    lastSync: string;
    error?: string;
  }>;
  individualSessions: Array<{
    ".id": string;
    name: string;
    address: string;
    uptime: string;
    serverId: string;
    serverName: string;
  }>;
  lastUpdated: string;
}

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch real-time connection status from Mikrotik routers
  const {
    data: realTimeStatus,
    isLoading: realTimeLoading,
    refetch: refetchRealTime,
  } = useQuery({
    queryKey: ["real-time-status"],
    queryFn: getRealTimeConnectionStatus,
    staleTime: 0, // Always fresh
    gcTime: 30 * 1000, // Keep for 30 seconds
    refetchOnMount: true,
    refetchOnReconnect: true,
  }) as {
    data: RealTimeStatus | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/dashboard/stats");
      return response.data?.data || response.data;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Fetch client growth data
  const { data: clientGrowth } = useQuery({
    queryKey: ["client-growth"],
    queryFn: async () => {
      const response = await api.get("/dashboard/client-growth");
      return response.data?.data || response.data;
    },
  });

  // Fetch revenue data
  const { data: revenueData } = useQuery({
    queryKey: ["revenue-data"],
    queryFn: async () => {
      const response = await api.get("/dashboard/revenue");
      return response.data?.data || response.data;
    },
  });

  // Auto-refresh real-time status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!realTimeLoading) {
        refetchRealTime();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [realTimeLoading, refetchRealTime]);

  // Function to get accurate online count from router
  const getRouterOnlineCount = () => {
    if (!realTimeStatus?.individualSessions) return 0;
    return realTimeStatus.individualSessions.length;
  };

  // Function to get server status summary
  const getServerStatusSummary = () => {
    if (!realTimeStatus?.serverStatus)
      return { online: 0, total: 0, errors: 0 };

    const total = realTimeStatus.serverStatus.length;
    const online = realTimeStatus.serverStatus.filter((s) => !s.error).length;
    const errors = realTimeStatus.serverStatus.filter((s) => s.error).length;

    return { online, total, errors };
  };

  if (statsLoading || realTimeLoading) {
    return <PageLoader fullScreen message="Loading dashboard..." />;
  }

  const serverStatus = getServerStatusSummary();
  const onlineCount = getRouterOnlineCount();
  const offlineCount = (stats?.clientStats?.total || 0) - onlineCount;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                ISP Billing Dashboard
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Welcome back, {user?.name} ({user?.role})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={refetchRealTime}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
              <Button>
                <Clock className="h-4 w-4 mr-2" />
                Sync All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Total Clients
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats?.clientStats?.total || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-2xl shadow-lg group-hover:shadow-blue-500/25 group-hover:scale-110 transition-all duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                All registered clients
              </span>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Online Now (Router)
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {realTimeLoading ? (
                    <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-8 w-16 rounded"></div>
                  ) : (
                    onlineCount
                  )}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-2xl shadow-lg group-hover:shadow-green-500/25 group-hover:scale-110 transition-all duration-300">
                <Wifi className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">
                {realTimeLoading
                  ? "Syncing..."
                  : `${Math.round(
                      (onlineCount / (stats?.clientStats?.total || 1)) * 100
                    )}% online`}
              </span>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Offline (Router)
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {realTimeLoading ? (
                    <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-8 w-16 rounded"></div>
                  ) : (
                    offlineCount
                  )}
                </p>
              </div>
              <div className="p-3 bg-red-500 rounded-2xl shadow-lg group-hover:shadow-red-500/25 group-hover:scale-110 transition-all duration-300">
                <WifiOff className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 dark:text-red-400 font-medium">
                {realTimeLoading
                  ? "Syncing..."
                  : `${Math.round(
                      (offlineCount / (stats?.clientStats?.total || 1)) * 100
                    )}% offline`}
              </span>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Mikrotik Servers
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {realTimeLoading ? (
                    <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-8 w-16 rounded"></div>
                  ) : (
                    serverStatus.total
                  )}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-2xl shadow-lg group-hover:shadow-purple-500/25 group-hover:scale-110 transition-all duration-300">
                <Server className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span
                className={`font-medium ${
                  serverStatus.errors > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {realTimeLoading
                  ? "Syncing..."
                  : serverStatus.errors > 0
                  ? `${serverStatus.errors} server(s) with issues`
                  : "All systems operational"}
              </span>
            </div>
          </Card>
        </div>

        {/* Real-time Status Summary */}
        {realTimeStatus && (
          <Card className="p-6 mb-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Real-time Status Summary
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-slate-500">
                  Last updated:{" "}
                  {realTimeStatus.lastUpdated
                    ? new Date(realTimeStatus.lastUpdated).toLocaleString()
                    : "Never"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {onlineCount}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Users Online (Router)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.clientStats?.total || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Total Clients (Database)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {serverStatus.online}/{serverStatus.total}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Servers Online
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Alert Cards */}
        {(stats?.financialStats?.pendingBills || 0) > 0 ||
        (stats?.clientStats?.inactive || 0) > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {(stats?.financialStats?.pendingBills || 0) > 0 && (
              <Card className="p-6 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                      Pending Bills
                    </h3>
                    <p className="text-orange-700 dark:text-orange-300">
                      {stats?.financialStats?.pendingBills} clients have pending
                      payments
                    </p>
                  </div>
                </div>
                <Button className="mt-4" variant="outline">
                  View Pending Bills
                </Button>
              </Card>
            )}

            {(stats?.clientStats?.inactive || 0) > 0 && (
              <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                      Expired Connections
                    </h3>
                    <p className="text-red-700 dark:text-red-300">
                      {stats?.clientStats?.inactive} clients need to be
                      disconnected
                    </p>
                  </div>
                </div>
                <Button className="mt-4" variant="outline">
                  Auto Disconnect
                </Button>
              </Card>
            )}
          </div>
        ) : null}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Mikrotik Management
            </h3>
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <Server className="h-4 w-4 mr-2" />
                Add New Server
              </Button>
              <Button className="w-full" variant="outline">
                <Wifi className="h-4 w-4 mr-2" />
                Import Users
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={refetchRealTime}
              >
                <Activity className="h-4 w-4 mr-2" />
                Sync All Servers
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Client Management
            </h3>
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
              <Button className="w-full" variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Bulk Update
              </Button>
              <Button className="w-full" variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Manage Expired
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Billing & Reports
            </h3>
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Generate Bills
              </Button>
              <Button className="w-full" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Revenue Report
              </Button>
              <Button className="w-full" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Usage Report
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Real-time status sync completed
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {realTimeStatus?.lastUpdated
                      ? new Date(realTimeStatus.lastUpdated).toLocaleString()
                      : "Never"}
                  </p>
                </div>
              </div>
              <span className="status-connected">Success</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {onlineCount} users currently online
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live from Mikrotik routers
                  </p>
                </div>
              </div>
              <span className="status-active">Live</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {serverStatus.total} Mikrotik servers monitored
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {serverStatus.online} online, {serverStatus.errors} with
                    issues
                  </p>
                </div>
              </div>
              <span
                className={`${
                  serverStatus.errors > 0 ? "status-pending" : "status-active"
                }`}
              >
                {serverStatus.errors > 0 ? "Issues" : "Healthy"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
