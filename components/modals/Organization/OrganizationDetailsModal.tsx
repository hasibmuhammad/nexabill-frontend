"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabbedModal } from "@/components/ui/tabbed-modal";
import { organizationsApi, type Organization } from "@/lib/api-organizations";
import { useQuery } from "@tanstack/react-query";
import {
    BarChart3,
    Building2,
    Calendar,
    Globe,
    Mail,
    MapPin,
    Package,
    Phone,
    Server,
    Settings,
    UserCheck,
    Users,
} from "lucide-react";

interface OrganizationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
}

export function OrganizationDetailsModal({
  isOpen,
  onClose,
  organization,
}: OrganizationDetailsModalProps) {
  // Fetch analytics data
  const {
    data: analyticsResponse,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ["organization-analytics", organization.id],
    queryFn: () => organizationsApi.getAnalytics(organization.id),
    enabled: isOpen && !!organization.id,
  });

  const analytics = analyticsResponse?.data;

  // Define tabs for the modal
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      TRIAL: "outline",
      SUSPENDED: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const getPlanBadge = (plan: any) => {
    const planName = typeof plan === 'object' ? (plan?.name || "UNKNOWN") : plan;
    const planKey = planName.toUpperCase();

    const variants = {
      TRIAL: "outline",
      BASIC: "secondary",
      PREMIUM: "default",
      ENTERPRISE: "default",
    } as const;

    return (
      <Badge variant={variants[planKey as keyof typeof variants] || "secondary"}>
        {planName}
      </Badge>
    );
  };

  // Render content based on active tab
  const renderTabContent = (activeTabIndex: number) => {
    const tabId = tabs[activeTabIndex]?.id;

    switch (tabId) {
      case "overview":
        return (
          <OverviewContent
            organization={organization}
            getStatusBadge={getStatusBadge}
            getPlanBadge={getPlanBadge}
          />
        );
      case "analytics":
        return (
          <AnalyticsContent
            analytics={analytics}
            analyticsLoading={analyticsLoading}
            analyticsError={analyticsError}
          />
        );
      case "settings":
        return <SettingsContent organization={organization} />;
      default:
        return (
          <OverviewContent
            organization={organization}
            getStatusBadge={getStatusBadge}
            getPlanBadge={getPlanBadge}
          />
        );
    }
  };

  return (
    <TabbedModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${organization.name} - Organization Details`}
      tabs={tabs}
      size="xl"
      height="lg"
      allowTabNavigation={true}
    >
      {renderTabContent}
    </TabbedModal>
  );
}

// Overview Tab Content Component
function OverviewContent({
  organization,
  getStatusBadge,
  getPlanBadge,
}: {
  organization: any;
  getStatusBadge: (status: string) => JSX.Element;
  getPlanBadge: (plan: string) => JSX.Element;
}) {
  return (
    <div className="space-y-6">
      {/* Organization Header */}
      <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        {organization.logo ? (
          <img
            src={organization.logo}
            alt={organization.name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-gray-500" />
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold">{organization.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            {getPlanBadge(organization.plan)}
            {getStatusBadge(organization.status)}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Name:</span>
              <span>{organization.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Slug:</span>
              <span>{organization.slug}</span>
            </div>
            {organization.domain && (
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Domain:</span>
                <span>{organization.domain}</span>
              </div>
            )}
            {organization.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span>{organization.email}</span>
              </div>
            )}
            {organization.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Phone:</span>
                <span>{organization.phone}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Created:</span>
              <span>
                {new Date(organization.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          {organization.address && (
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
              <div>
                <span className="font-medium">Address:</span>
                <p className="text-gray-600">{organization.address}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {organization._count.users}
                </p>
                <p className="text-xs text-gray-500">Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {organization._count.clients}
                </p>
                <p className="text-xs text-gray-500">Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {organization._count.serviceProfiles}
                </p>
                <p className="text-xs text-gray-500">Packages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Server className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {organization._count.mikrotikServers}
                </p>
                <p className="text-xs text-gray-500">Servers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Plan:</span>
              <div className="mt-1">{getPlanBadge(organization.plan)}</div>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <div className="mt-1">{getStatusBadge(organization.status)}</div>
            </div>
            {organization.trialEndsAt && (
              <div>
                <span className="font-medium">Trial Ends:</span>
                <p className="text-gray-600">
                  {new Date(organization.trialEndsAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {organization.subscriptionEndsAt && (
              <div>
                <span className="font-medium">Subscription Ends:</span>
                <p className="text-gray-600">
                  {new Date(
                    organization.subscriptionEndsAt
                  ).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Analytics Tab Content Component
function AnalyticsContent({
  analytics,
  analyticsLoading,
  analyticsError,
}: {
  analytics: any;
  analyticsLoading: boolean;
  analyticsError: any;
}) {
  return (
    <div className="space-y-6">
      {analyticsLoading ? (
        <div className="text-center py-8">Loading analytics...</div>
      ) : analyticsError ? (
        <div className="text-center py-8 text-red-500">
          Error loading analytics data
        </div>
      ) : analytics ? (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ${analytics.summary.totalRevenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics.summary.activeUsers}
                  </p>
                  <p className="text-sm text-gray-500">Active Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {analytics.summary.connectedClients}
                  </p>
                  <p className="text-sm text-gray-500">Connected Clients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users */}
          {analytics.users && analytics.users.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Users ({analytics.users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.users.map((user: any) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Badge
                        variant={
                          user.status === "ACTIVE" ? "default" : "secondary"
                        }
                      >
                        {user.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clients */}
          {analytics.clients && analytics.clients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Clients ({analytics.clients.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.clients.slice(0, 10).map((client: any) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-gray-500">
                          ${client.monthlyFee || 0}/month
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge
                          variant={
                            client.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {client.status}
                        </Badge>
                        <Badge
                          variant={
                            client.connectionStatus === "CONNECTED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {client.connectionStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {analytics.clients.length > 10 && (
                    <p className="text-sm text-gray-500 text-center">
                      ... and {analytics.clients.length - 10} more clients
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No analytics data available
        </div>
      )}
    </div>
  );
}

// Settings Tab Content Component
function SettingsContent({ organization }: { organization: any }) {
  return (
    <div className="space-y-6">
      {/* Settings */}
      {organization.settings && (
        <Card>
          <CardHeader>
            <CardTitle>Limits & Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-medium">Max Clients:</span>
                <p className="text-gray-600">
                  {organization.settings.maxClients || "Unlimited"}
                </p>
              </div>
              <div>
                <span className="font-medium">Max Users:</span>
                <p className="text-gray-600">
                  {organization.settings.maxUsers || "Unlimited"}
                </p>
              </div>
              <div>
                <span className="font-medium">Max Mikrotik Servers:</span>
                <p className="text-gray-600">
                  {organization.settings.maxMikrotikServers || "Unlimited"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      {organization.features && (
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(organization.features).map(
                ([feature, enabled]) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        enabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span className="capitalize">
                      {feature.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
