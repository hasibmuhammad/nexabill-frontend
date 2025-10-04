"use client";

import ClientTabbedModal from "@/components/modals/ClientTabbedModal";
import { Button } from "@/components/ui/button";
import { ColumnDef, DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { useDataTable } from "@/hooks/use-data-table";
import { useDebounce } from "@/hooks/use-debounce";
import { api, getRealTimeConnectionStatus } from "@/lib/api";
import { getPppoeProfiles } from "@/lib/packages";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Plus, Wifi } from "lucide-react";
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
  clientType: "HOME" | "CORPORATE";
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
    clientType: "",
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
          clientType: filters.clientType || undefined,
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
  const handleAddClient = async (clientData: any) => {
    try {
      // TODO: Implement actual API call to add client
      toast.success(`Client "${clientData.name}" added successfully!`);
      setShowAddForm(false);
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
    // Handle cases where online sessions exceed database clients
    // This can happen due to multiple sessions per client or orphaned sessions
    const offlineCount = Math.max(0, totalClients - totalOnlineClients);
    return offlineCount;
  }, [systemTotal, totalOnlineClients]);

  // Check for data discrepancy between database and Mikrotik sessions
  const hasDataDiscrepancy = useMemo(() => {
    const totalClients = systemTotal || 0;
    return totalOnlineClients > totalClients;
  }, [systemTotal, totalOnlineClients]);

  const discrepancyInfo = useMemo(() => {
    if (!hasDataDiscrepancy) return null;
    const totalClients = systemTotal || 0;
    const extraSessions = totalOnlineClients - totalClients;
    return {
      extraSessions,
      message: `${extraSessions} more active sessions than database clients. This may indicate multiple sessions per client or orphaned sessions.`,
    };
  }, [hasDataDiscrepancy, systemTotal, totalOnlineClients]);

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

        {/* Data Discrepancy Warning */}
        {hasDataDiscrepancy && discrepancyInfo && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-amber-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Data Discrepancy Detected
                </h3>
                <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                  <p>{discrepancyInfo.message}</p>
                  <p className="mt-1">
                    This is normal and can occur when clients have multiple
                    active sessions or when there are orphaned sessions on the
                    routers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
        <ClientTabbedModal
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddClient}
          isLoading={false}
        />
      </div>
    </div>
  );
}
