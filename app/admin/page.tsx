"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import PageLoader from "@/components/ui/page-loader";
import { useAuth } from "@/lib/auth-context";
import {
  Building2,
  DollarSign,
  Plus,
  Settings,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalOrganizations: number;
  totalUsers: number;
  totalClients: number;
  totalRevenue: number;
  activeOrganizations: number;
  trialOrganizations: number;
  recentOrganizations: Array<{
    id: string;
    name: string;
    plan: string;
    status: string;
    createdAt: string;
  }>;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // For now, we'll create mock data since we don't have a dashboard API yet
      const mockStats: DashboardStats = {
        totalOrganizations: 12,
        totalUsers: 45,
        totalClients: 1200,
        totalRevenue: 45600,
        activeOrganizations: 8,
        trialOrganizations: 4,
        recentOrganizations: [
          {
            id: "1",
            name: "Acme ISP",
            plan: "PREMIUM",
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            name: "TechNet Solutions",
            plan: "BASIC",
            status: "TRIAL",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "3",
            name: "Digital Connect",
            plan: "ENTERPRISE",
            status: "ACTIVE",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
      };

      setStats(mockStats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader fullScreen message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <PageHeader
        title="Super Admin Dashboard"
        subtitle={`Welcome back, ${user?.name} (${user?.role})`}
        actions={[
          {
            label: "Create Organization",
            icon: Plus,
            onClick: () => {
              // TODO: Implement create organization functionality
              console.log("Create organization clicked");
            },
            variant: "primary",
          },
          {
            label: "System Settings",
            icon: Settings,
            onClick: () => {
              // TODO: Implement system settings functionality
              console.log("System settings clicked");
            },
            variant: "outline",
          },
        ]}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Total Organizations
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats?.totalOrganizations || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-2xl shadow-lg group-hover:shadow-blue-500/25 group-hover:scale-110 transition-all duration-300">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                All registered organizations
              </span>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-2xl shadow-lg group-hover:shadow-green-500/25 group-hover:scale-110 transition-all duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">
                All platform users
              </span>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Total Clients
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats?.totalClients || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-2xl shadow-lg group-hover:shadow-purple-500/25 group-hover:scale-110 transition-all duration-300">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                All organization clients
              </span>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  ${stats?.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-500 rounded-2xl shadow-lg group-hover:shadow-orange-500/25 group-hover:scale-110 transition-all duration-300">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                Platform-wide revenue
              </span>
            </div>
          </Card>
        </div>

        {/* Organization Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Organization Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-slate-700 dark:text-slate-300">
                    Active Organizations
                  </span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {stats?.activeOrganizations || 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-slate-700 dark:text-slate-300">
                    Trial Organizations
                  </span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {stats?.trialOrganizations || 0}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <Building2 className="h-4 w-4 mr-2" />
                Create New Organization
              </Button>
              <Button className="w-full" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Plans
              </Button>
              <Button className="w-full" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Organizations */}
        <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Recent Organizations
          </h3>
          <div className="space-y-4">
            {stats?.recentOrganizations &&
            stats.recentOrganizations.length > 0 ? (
              stats.recentOrganizations.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0"
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {org.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Created {new Date(org.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        org.plan === "PREMIUM"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          : org.plan === "BASIC"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : org.plan === "ENTERPRISE"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                      }`}
                    >
                      {org.plan}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        org.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : org.status === "TRIAL"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                      }`}
                    >
                      {org.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No organizations found
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
