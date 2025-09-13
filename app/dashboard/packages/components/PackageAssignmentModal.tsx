"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { useDataTable } from "@/hooks/use-data-table";
import {
  assignClientsToPackage,
  getMatchingClients,
  getUnassignedClients,
  ServiceProfile,
} from "@/lib/packages";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Info,
  Package,
  RefreshCw,
  Search,
  Server,
  UserCheck,
  Users,
  UserX,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

interface MatchingClient {
  id: string;
  name: string;
  mikrotikUsername: string;
  serviceProfile: string;
  monthlyFee: string;
  status: "ACTIVE" | "SUSPENDED" | "TERMINATED";
  connectionStatus: "CONNECTED" | "DISCONNECTED";
  mikrotikServer: {
    id: string;
    name: string;
    host: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface PackageAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageProfile: ServiceProfile | null;
  onSuccess?: () => void;
}

export function PackageAssignmentModal({
  isOpen,
  onClose,
  packageProfile,
  onSuccess,
}: PackageAssignmentModalProps) {
  const [viewMode, setViewMode] = useState<"matching" | "unassigned">(
    "matching"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Use the same data table hook as the client page
  const dataTable = useDataTable();

  // Debug selection changes
  useEffect(() => {
    console.log(
      "Selected clients changed:",
      dataTable.selectedRows.size,
      Array.from(dataTable.selectedRows)
    );
  }, [dataTable.selectedRows]);

  // Fetch matching clients for the package
  const {
    data: matchingData,
    isLoading: matchingLoading,
    refetch: refetchMatching,
  } = useQuery({
    queryKey: ["matching-clients", packageProfile?.id],
    queryFn: () => getMatchingClients(packageProfile!.id),
    enabled: !!packageProfile && viewMode === "matching",
  });

  // Fetch unassigned clients
  const {
    data: unassignedData,
    isLoading: unassignedLoading,
    refetch: refetchUnassigned,
  } = useQuery({
    queryKey: ["unassigned-clients"],
    queryFn: getUnassignedClients,
    enabled: viewMode === "unassigned",
  });

  // Assignment mutation
  const assignMutation = useMutation({
    mutationFn: ({
      packageId,
      clientIds,
    }: {
      packageId: string;
      clientIds: string[];
    }) => assignClientsToPackage(packageId, clientIds),
    onSuccess: (data) => {
      toast.success(
        `Successfully assigned ${data.assignedCount} clients to "${data.packageName}"`
      );
      dataTable.clearSelection();
      refetchMatching();
      refetchUnassigned();
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to assign clients to package";
      toast.error(message);
    },
  });

  const handleAssignClients = () => {
    if (dataTable.selectedRows.size === 0) {
      toast.error("Please select at least one client");
      return;
    }

    assignMutation.mutate({
      packageId: packageProfile!.id,
      clientIds: Array.from(dataTable.selectedRows),
    });
  };

  // Get current clients based on view mode
  const currentClients = useMemo(() => {
    if (viewMode === "matching") {
      return matchingData?.matchingClients || [];
    } else {
      // Filter unassigned clients by Mikrotik profile
      const profileGroup =
        unassignedData?.groupedByProfile?.[
          packageProfile?.mikrotikProfile || ""
        ] || [];
      return profileGroup;
    }
  }, [viewMode, matchingData, unassignedData, packageProfile]);

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!searchTerm) return currentClients;

    const term = searchTerm.toLowerCase();
    return currentClients.filter(
      (client: any) =>
        client.name.toLowerCase().includes(term) ||
        client.mikrotikUsername.toLowerCase().includes(term) ||
        client.mikrotikServer.name.toLowerCase().includes(term)
    );
  }, [currentClients, searchTerm]);

  // No pagination - show all clients for easy bulk selection

  // Debug: Log the data structure
  useEffect(() => {
    if (filteredClients.length > 0) {
      console.log("Sample client data:", filteredClients[0]);
      console.log(
        "Client IDs:",
        filteredClients.map((c: any) => c.id)
      );
      console.log("Current selection:", Array.from(dataTable.selectedRows));
    }
  }, [filteredClients, dataTable.selectedRows]);

  const isLoading = matchingLoading || unassignedLoading;

  // Define table columns
  const columns = [
    {
      id: "name",
      accessorKey: "name",
      header: "Client Details",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {row.original.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {row.original.name}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
              @{row.original.mikrotikUsername}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "serviceProfile",
      accessorKey: "serviceProfile",
      header: "Profile",
      cell: ({ row }: any) => (
        <Badge
          variant="outline"
          className="font-mono text-xs bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
        >
          {row.original.serviceProfile}
        </Badge>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variant = status === "ACTIVE" ? "default" : "secondary";
        const icon = status === "ACTIVE" ? UserCheck : UserX;
        const Icon = icon;

        return (
          <Badge
            variant={variant}
            className={`flex items-center space-x-1 text-xs ${
              status === "ACTIVE"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            <Icon className="h-3 w-3" />
            <span>{status}</span>
          </Badge>
        );
      },
    },
    {
      id: "connectionStatus",
      accessorKey: "connectionStatus",
      header: "Connection",
      cell: ({ row }: any) => {
        const status = row.original.connectionStatus;
        const variant = status === "CONNECTED" ? "default" : "secondary";
        const icon = status === "CONNECTED" ? Wifi : WifiOff;
        const Icon = icon;

        return (
          <Badge
            variant={variant}
            className={`flex items-center space-x-1 text-xs ${
              status === "CONNECTED"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            <Icon className="h-3 w-3" />
            <span>{status}</span>
          </Badge>
        );
      },
    },
    {
      id: "mikrotikServer",
      accessorKey: "mikrotikServer.name",
      header: "Server",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Server className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium">
            {row.original.mikrotikServer.name}
          </span>
        </div>
      ),
    },
    {
      id: "monthlyFee",
      accessorKey: "monthlyFee",
      header: "Current Fee",
      cell: ({ row }: any) => (
        <div className="text-right">
          <span className="font-mono text-sm font-medium">
            ৳{Number(row.original.monthlyFee).toFixed(2)}
          </span>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            → ৳{Number(packageProfile?.monthlyPrice || 0).toFixed(2)}
          </div>
        </div>
      ),
    },
  ];

  if (!packageProfile) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Clients to Package"
      size="xl"
      footer={{
        cancelText: "Cancel",
        confirmText: `Assign ${dataTable.selectedRows.size} Client${
          dataTable.selectedRows.size !== 1 ? "s" : ""
        }`,
        onCancel: onClose,
        onConfirm: handleAssignClients,
        confirmVariant: "primary",
        isLoading: assignMutation.isPending,
        disabled: dataTable.selectedRows.size === 0 || assignMutation.isPending,
      }}
    >
      <div className="space-y-4 flex flex-col h-full min-h-0">
        {/* Package Info Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {packageProfile.name}
              </h3>
              <div className="flex items-center space-x-6 mt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Profile:
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {packageProfile.mikrotikProfile}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Price:
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    ৳{Number(packageProfile.monthlyPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant={viewMode === "matching" ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                setViewMode("matching");
                dataTable.clearSelection();
              }}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Matching Clients</span>
              <Badge variant="secondary" className="ml-1">
                {matchingData?.totalMatches || 0}
              </Badge>
            </Button>
            <Button
              variant={viewMode === "unassigned" ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                setViewMode("unassigned");
                dataTable.clearSelection();
              }}
              className="flex items-center space-x-2"
            >
              <AlertCircle className="h-4 w-4" />
              <span>Unassigned Clients</span>
              <Badge variant="secondary" className="ml-1">
                {unassignedData?.totalUnassigned || 0}
              </Badge>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (viewMode === "matching") refetchMatching();
              else refetchUnassigned();
            }}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients by name, username, or server..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Client List - Scrollable Area */}
        <div className="flex-1 min-h-0 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredClients}
            loading={isLoading}
            emptyMessage={
              viewMode === "matching"
                ? "No unassigned clients found with matching Mikrotik profile"
                : "No unassigned clients found with this Mikrotik profile"
            }
            striped={true}
            hoverable={true}
            enableRowSelection={true}
            selectedRows={dataTable.selectedRows}
            onSelectionChange={dataTable.setSelectedRows}
            getRowId={(row: any) => row.id}
            disablePagination={true}
          />
        </div>

        {/* Selection Summary */}
        {dataTable.selectedRows.size > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-green-900 dark:text-green-100">
                  {dataTable.selectedRows.size} client
                  {dataTable.selectedRows.size !== 1 ? "s" : ""} selected for
                  assignment
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                  These clients will be assigned to the "{packageProfile.name}"
                  package
                </div>
              </div>
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <ArrowRight className="h-4 w-4" />
                <span className="font-semibold">
                  ৳{Number(packageProfile.monthlyPrice).toFixed(2)}/month
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Smart Assignment</p>
              <p>
                Clients are automatically matched based on their Mikrotik
                profile. When assigned, their monthly fee will be updated to
                match the package price.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
