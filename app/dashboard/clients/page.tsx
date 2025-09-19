"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef, DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useDataTable } from "@/hooks/use-data-table";
import { useDebounce } from "@/hooks/use-debounce";
import { api, getRealTimeConnectionStatus } from "@/lib/api";
import { getPppoeProfiles, ServiceProfile } from "@/lib/packages";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Download, Package, Plus, Wifi } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useClientColumns } from "./components/ClientColumns";
import { ClientFilters } from "./components/ClientFilters";
import { ClientSearch } from "./components/ClientSearch";
import { ClientStats } from "./components/ClientStats";

interface ISPClient {
  id: string;
  trackCode: string;
  name: string;
  phone: string;
  address: string;
  mikrotikUsername: string;
  serviceProfile: string;
  monthlyFee: string;
  connectionDate: string;
  billCycleDate: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  connectionStatus: "CONNECTED" | "DISCONNECTED";
  lastSyncAt: string | null;
  mikrotikServer: {
    id: string;
    name: string;
    status?: "ACTIVE" | "INACTIVE" | "ERROR";
  };
  email?: string | null;
  nid?: string | null;
  districtId?: string | null;
  zoneId?: string | null;
  subzoneId?: string | null;
  connectionTypeId?: string | null;
  protocolTypeId?: string | null;
  outstandingBalance?: string;
  autoDisableEnabled?: boolean;
  gracePeriodDays?: number;
  mikrotikServerId?: string;
  mikrotikUserId?: string;
  resellerId?: string | null;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
  reseller?: any | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  district?: any | null;
  zone?: any | null;
  subzone?: any | null;
  connectionType?: any | null;
  protocolType?: any | null;
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
    service: string;
    "caller-id": string;
    address: string;
    uptime: string;
    encoding: string;
    "session-id": string;
    "limit-bytes-in": string;
    "limit-bytes-out": string;
    radius: string;
    serverId: string;
    serverName: string;
  }>;
  lastUpdated: string;
}

export default function ClientsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    mikrotikUsername: "",
    serviceProfile: "",
    monthlyFee: "",
    selectedPackageId: "",
  });
  const queryClient = useQueryClient();

  // DataTable hook
  const dataTable = useDataTable<ISPClient>({
    initialPageSize: 10,
    initialPageIndex: 0,
    initialSearch: "",
    initialSortBy: "name",
    initialSortOrder: "asc",
  });

  // Consolidated filter state
  const [filters, setFilters] = useState({
    server: "",
    status: "",
    connection: "",
    zone: "",
    district: "",
  });

  // Use the debounce hook for search
  const debouncedSearch = useDebounce({ value: dataTable.search, delay: 500 });

  // Fetch real-time connection status
  const {
    data: realTimeStatus,
    isLoading: realTimeLoading,
    refetch: refetchRealTime,
    error: realTimeError,
  } = useQuery({
    queryKey: ["real-time-status"],
    queryFn: getRealTimeConnectionStatus,
    staleTime: 30 * 1000, // 30 seconds - don't refetch too frequently
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 2, // Retry up to 2 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });

  // Fetch clients data
  const {
    data: clients,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "clients",
      dataTable.pageIndex,
      dataTable.pageSize,
      dataTable.sortBy,
      dataTable.sortOrder,
      debouncedSearch,
      filters,
    ],
    queryFn: async () => {
      const response = await api.get("/clients", {
        params: {
          page: dataTable.pageIndex + 1,
          limit: dataTable.pageSize,
          sortBy: dataTable.sortBy,
          sortOrder: dataTable.sortOrder,
          search: debouncedSearch,
          mikrotikServerId: filters.server || undefined,
          status: filters.status || undefined,
          connectionStatus: filters.connection || undefined,
          // Note: Zone and District filters are not yet implemented in backend
          // zone: filters.zone || undefined,
          // district: filters.district || undefined,
        },
      });

      // Handle standardized response structure
      if (response.data?.data && Array.isArray(response.data.data)) {
        return {
          clients: response.data.data,
          meta: response.data.meta || {
            total: response.data.data.length,
            totalPages: 1,
            currentPage: 1,
            limit: dataTable.pageSize,
          },
        };
      }

      return {
        clients: response.data || [],
        meta: {
          total: response.data?.length || 0,
          totalPages: 1,
          currentPage: 1,
          limit: dataTable.pageSize,
        },
      };
    },
    enabled: !!debouncedSearch || dataTable.pageIndex >= 0,
  });

  // Fetch system total clients count (separate from search results)
  const { data: systemTotal } = useQuery({
    queryKey: ["clients-total"],
    queryFn: async () => {
      const response = await api.get("/clients", {
        params: {
          page: 1,
          limit: 1, // Just get 1 record to get the total count
        },
      });
      return response.data?.meta?.total || 0;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch packages for client creation
  const { data: packages } = useQuery({
    queryKey: ["profiles"],
    queryFn: getPppoeProfiles,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Auto-refresh every 30 seconds for clients, every 2 minutes for real-time status
  useEffect(() => {
    const clientInterval = setInterval(() => {
      if (!isLoading && clients) {
        refetch();
      }
    }, 30000);

    const realTimeInterval = setInterval(() => {
      if (!realTimeLoading) {
        refetchRealTime();
      }
    }, 120000); // 2 minutes for real-time status

    return () => {
      clearInterval(clientInterval);
      clearInterval(realTimeInterval);
    };
  }, [isLoading, clients, refetch, realTimeLoading, refetchRealTime]);

  // Reset page index when search or any filter changes
  useEffect(() => {
    dataTable.setPageIndex(0);
  }, [dataTable.search, dataTable.setPageIndex, filters]);

  // Helper function to update individual filters
  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Helper function to check if search is being processed
  const isSearching =
    dataTable.search !== debouncedSearch && dataTable.search.length > 0;

  // Debug logging
  console.log("Search state:", {
    search: dataTable.search,
    debouncedSearch,
    isSearching,
    searchLength: dataTable.search?.length || 0,
  });

  // Helper function to check if client is online
  const isClientOnline = useCallback(
    (client: ISPClient) => {
      if (!realTimeStatus?.individualSessions) return false;
      return realTimeStatus.individualSessions.some(
        (session: any) => session.name === client.mikrotikUsername
      );
    },
    [realTimeStatus?.individualSessions]
  );

  // Helper function to get client session data
  const getClientSession = useCallback(
    (client: ISPClient) => {
      if (!realTimeStatus?.individualSessions) return null;
      return (
        realTimeStatus.individualSessions.find(
          (session: any) => session.name === client.mikrotikUsername
        ) || null
      );
    },
    [realTimeStatus?.individualSessions]
  );

  // Define table columns
  const columns: ColumnDef<ISPClient, any>[] = useClientColumns({
    onEdit: (client: ISPClient) => {
      // Handle edit client
      console.log("Edit client:", client);
    },
    isClientOnline,
    getClientSession,
  });

  // Handle add client
  const handleAddClient = async () => {
    try {
      // TODO: Implement actual API call to add client
      toast.success(`Client "${newClient.name}" added successfully!`);
      setShowAddForm(false);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        address: "",
        mikrotikUsername: "",
        serviceProfile: "",
        monthlyFee: "",
        selectedPackageId: "",
      });
      // Refresh the client list
      refetch();
    } catch (error) {
      toast.error("Failed to add client. Please try again.");
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    const selectedCount = dataTable.selectedRows.size;
    try {
      switch (action) {
        case "delete":
          // TODO: Implement actual bulk delete API call
          toast.success(`Successfully deleted ${selectedCount} client(s)`);
          break;
        case "suspend":
          // TODO: Implement actual bulk suspend API call
          toast.success(`Successfully suspended ${selectedCount} client(s)`);
          break;
        case "activate":
          // TODO: Implement actual bulk activate API call
          toast.success(`Successfully activated ${selectedCount} client(s)`);
          break;
      }
      // Clear selection after action
      dataTable.clearSelection();
      // Refresh data
      refetch();
    } catch (error) {
      toast.error(`Failed to ${action} clients. Please try again.`);
    }
  };

  // Bulk actions
  const bulkActions = dataTable.hasSelection ? (
    <div className="flex space-x-2">
      <Button
        variant="danger"
        size="sm"
        onClick={() => handleBulkAction("delete")}
      >
        Delete {dataTable.selectedRows.size} Client(s)
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleBulkAction("suspend")}
      >
        Suspend {dataTable.selectedRows.size} Client(s)
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleBulkAction("activate")}
      >
        Activate {dataTable.selectedRows.size} Client(s)
      </Button>
    </div>
  ) : undefined;

  // Calculate total online clients from real-time status
  const totalOnlineClients = useMemo(() => {
    return realTimeStatus?.totalActiveUsers || 0;
  }, [realTimeStatus?.totalActiveUsers]);

  // Calculate total offline clients from real-time status
  const totalOfflineClients = useMemo(() => {
    const totalClients = systemTotal || 0;
    return totalClients - totalOnlineClients;
  }, [systemTotal, totalOnlineClients]);

  if (isLoading || realTimeLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            {realTimeLoading
              ? "Syncing with Mikrotik routers..."
              : "Loading clients..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <PageHeader
        title="Client Management"
        subtitle="Manage your ISP clients and their connections"
        actions={[
          {
            label: "Sync",
            icon: Wifi,
            onClick: () => refetchRealTime(),
            variant: "outline",
            disabled: realTimeLoading,
            loading: realTimeLoading,
          },
          {
            label: "Export",
            icon: Download,
            onClick: () => {
              toast.success("Exporting package data...");
              // TODO: Implement actual export functionality
              const csvContent =
                "data:text/csv;charset=utf-8," +
                "Name,Mikrotik Profile,Speed,Price,Status\n" +
                "Sample Package,sample_profile,10/5 Mbps,৳500,Active";
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "packages.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            },
          },
          {
            label: "Add Client",
            onClick: () => setShowAddForm(true),
            variant: "primary",
            icon: Plus,
          },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <ClientStats
          totalClients={systemTotal || 0}
          activeClients={
            clients?.clients?.filter(
              (client: ISPClient) => client.status === "ACTIVE"
            ).length || 0
          }
          onlineClients={totalOnlineClients}
          offlineClients={totalOfflineClients}
        />

        {/* Search and Filters - Side by Side */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg mb-6 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left Side - Filters */}
            <div className="flex-1">
              <ClientFilters
                isLoading={isLoading}
                filters={filters}
                onFilterChange={updateFilter}
              />
            </div>

            {/* Right Side - Search */}
            <div className="lg:ml-auto">
              <ClientSearch
                searchValue={dataTable.search}
                onSearchChange={dataTable.setSearch}
                isSearching={isSearching}
                debouncedSearch={debouncedSearch}
                resultsCount={clients?.meta?.total}
              />
            </div>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={clients?.clients || []}
          pageSize={dataTable.pageSize}
          pageIndex={dataTable.pageIndex}
          pageCount={clients?.meta?.totalPages || 1}
          total={clients?.meta?.total}
          onPageChange={dataTable.setPageIndex}
          onPageSizeChange={dataTable.setPageSize}
          sortBy={dataTable.sortBy}
          sortOrder={dataTable.sortOrder}
          onSortChange={dataTable.setSortBy}
          enableRowSelection={true}
          selectedRows={dataTable.selectedRows}
          onSelectionChange={dataTable.setSelectedRows}
          getRowId={(client) => client.id}
          actions={undefined}
          bulkActions={bulkActions}
          title=""
          subtitle=""
          emptyMessage="No clients found. Get started by adding your first client."
          loading={isLoading}
          error={realTimeError?.message || null}
          striped={true}
          hoverable={true}
        />

        {/* Add Client Modal */}
        <Modal
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          title="Add New Client"
          size="lg"
          footer={{
            cancelText: "Cancel",
            confirmText: "Add Client",
            onCancel: () => setShowAddForm(false),
            onConfirm: handleAddClient,
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Name *
                </label>
                <Input
                  placeholder="Client Name"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="client@example.com"
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone *
                </label>
                <Input
                  placeholder="+1234567890"
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Address
                </label>
                <Input
                  placeholder="123 Main Street"
                  value={newClient.address}
                  onChange={(e) =>
                    setNewClient({ ...newClient, address: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Mikrotik Username *
                </label>
                <Input
                  placeholder="client_username"
                  value={newClient.mikrotikUsername}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      mikrotikUsername: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Package Selection
                </label>
                <Select
                  options={[
                    { value: "", label: "Select a package..." },
                    ...(packages || []).map((pkg: ServiceProfile) => ({
                      value: pkg.id,
                      label: `${pkg.name} (${pkg.mikrotikProfile}) - ৳${Number(
                        pkg.monthlyPrice
                      ).toFixed(2)}`,
                    })),
                    { value: "custom", label: "Custom Package" },
                  ]}
                  value={newClient.selectedPackageId}
                  onChange={(value) => {
                    if (value === "custom") {
                      setNewClient({
                        ...newClient,
                        selectedPackageId: "custom",
                        serviceProfile: "",
                        monthlyFee: "",
                      });
                    } else if (value) {
                      const selectedPackage = packages?.find(
                        (pkg: any) => pkg.id === value
                      );
                      if (selectedPackage) {
                        setNewClient({
                          ...newClient,
                          selectedPackageId: value,
                          serviceProfile: selectedPackage.mikrotikProfile,
                          monthlyFee: selectedPackage.monthlyPrice,
                        });
                      }
                    } else {
                      setNewClient({
                        ...newClient,
                        selectedPackageId: "",
                        serviceProfile: "",
                        monthlyFee: "",
                      });
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Mikrotik Profile
                </label>
                <Input
                  placeholder="e.g., 5mb, 10mb"
                  value={newClient.serviceProfile}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      serviceProfile: e.target.value,
                    })
                  }
                  disabled={
                    !!(
                      newClient.selectedPackageId &&
                      newClient.selectedPackageId !== "custom"
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Monthly Fee (৳)
                </label>
                <Input
                  type="number"
                  placeholder="29.99"
                  value={newClient.monthlyFee}
                  onChange={(e) =>
                    setNewClient({ ...newClient, monthlyFee: e.target.value })
                  }
                  disabled={
                    !!(
                      newClient.selectedPackageId &&
                      newClient.selectedPackageId !== "custom"
                    )
                  }
                />
              </div>
            </div>

            {/* Package Selection Summary */}
            {newClient.selectedPackageId &&
              newClient.selectedPackageId !== "custom" && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          Selected Package:
                        </span>
                        <span className="font-semibold text-blue-800 dark:text-blue-200">
                          {
                            packages?.find(
                              (pkg: any) =>
                                pkg.id === newClient.selectedPackageId
                            )?.name
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-blue-700 dark:text-blue-300">
                        <span>
                          Profile:{" "}
                          <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                            {newClient.serviceProfile}
                          </code>
                        </span>
                        <span>
                          Price:{" "}
                          <strong>
                            ৳{Number(newClient.monthlyFee).toFixed(2)}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
