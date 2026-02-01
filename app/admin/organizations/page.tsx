"use client";

import { CreateOrganizationModal } from "@/components/modals/Organization/CreateOrganizationModal";
import { EditOrganizationModal } from "@/components/modals/Organization/EditOrganizationModal";
import { OrganizationDetailsModal } from "@/components/modals/Organization/OrganizationDetailsModal";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ColumnDef, DataTable } from "@/components/ui/data-table";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useDataTable } from "@/hooks/use-data-table";
import { useDebounce } from "@/hooks/use-debounce";
import { organizationsApi, type Organization } from "@/lib/api-organizations";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Building2,
    Edit,
    Eye,
    MoreHorizontal,
    Plus,
    Search,
    ToggleLeft,
    ToggleRight,
    Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

export default function OrganizationsPage() {
  const queryClient = useQueryClient();

  // DataTable hook
  const dataTable = useDataTable<Organization>({
    initialPageSize: 10,
    initialPageIndex: 0,
    initialSearch: "",
    initialSortBy: "name",
    initialSortOrder: "asc",
  });

  // Filter state
  const [filters, setFilters] = useState({
    status: "ALL",
    plan: "ALL",
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

  // Debounced search
  const debouncedSearch = useDebounce({ value: dataTable.search, delay: 500 });

  // Reset page when search or filters change
  useEffect(() => {
    dataTable.setPageIndex(0);
  }, [debouncedSearch, filters]);

  // Fetch organizations data
  const {
    data: organizationsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "organizations",
      dataTable.pageIndex,
      dataTable.pageSize,
      dataTable.sortBy,
      dataTable.sortOrder,
      debouncedSearch,
      filters,
    ],
    queryFn: async () => {
      const response = await organizationsApi.getAll({
        page: dataTable.pageIndex + 1,
        limit: dataTable.pageSize,
        search: debouncedSearch || undefined,
        status: filters.status !== "ALL" ? filters.status : undefined,
        plan: filters.plan !== "ALL" ? filters.plan : undefined,
      });

      // Handle standardized response structure
      // Backend returns: { success: true, data: [...], meta: {...} }
      if (response?.success && response?.data && Array.isArray(response.data)) {
        return {
          organizations: response.data,
          meta: response.meta || {
            total: response.data.length,
            totalPages: 1,
            currentPage: 1,
            limit: dataTable.pageSize,
          },
        };
      }

      return {
        organizations: response?.data || [],
        meta: {
          total: response?.data?.length || 0,
          totalPages: 1,
          currentPage: 1,
          limit: dataTable.pageSize,
        },
      };
    },
    enabled: true,
  });

  const organizations = useMemo(() => {
    if (!organizationsResponse?.organizations) return [] as Organization[];
    return organizationsResponse.organizations;
  }, [organizationsResponse?.organizations]);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: organizationsApi.delete,
    onSuccess: () => {
      toast.success("Organization deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to delete organization";
      toast.error(message);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: organizationsApi.toggleStatus,
    onSuccess: () => {
      toast.success("Organization status updated");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to update organization status";
      toast.error(message);
    },
  });

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm("Are you sure you want to delete this organization?"))
        return;
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const handleToggleStatus = useCallback(
    (id: string) => {
      toggleStatusMutation.mutate(id);
    },
    [toggleStatusMutation]
  );

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

  const columns: ColumnDef<Organization, any>[] = [
    {
      id: "organization",
      header: "Organization",
      accessorKey: "name",
      cell: ({ original }) => (
        <div className="flex items-center space-x-3">
          {original.logo ? (
            <img
              src={original.logo}
              alt={original.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-gray-500" />
            </div>
          )}
          <div>
            <div className="font-medium">{original.name}</div>
            <div className="text-sm text-gray-500">
              {original.domain || original.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "plan",
      header: "Plan",
      accessorKey: "plan",
      cell: ({ original }) => getPlanBadge(original.plan),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ original }) => getStatusBadge(original.status),
    },
    {
      id: "users",
      header: "Users",
      accessorKey: "_count",
      cell: ({ original }) => original._count.users,
      columnClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      id: "clients",
      header: "Clients",
      accessorKey: "_count",
      cell: ({ original }) => original._count.clients,
      columnClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      id: "created",
      header: "Created",
      accessorKey: "createdAt",
      cell: ({ original }) => new Date(original.createdAt).toLocaleDateString(),
      columnClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ original }) => (
        <div className="flex justify-center">
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="md">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
            items={[
              {
                label: "View Details",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => {
                  setSelectedOrganization(original);
                  setShowDetailsModal(true);
                },
              },
              {
                label: "Edit Organization",
                icon: <Edit className="h-4 w-4" />,
                onClick: () => {
                  setSelectedOrganization(original);
                  setShowEditModal(true);
                },
              },
              {
                label: original.status === "ACTIVE" ? "Deactivate" : "Activate",
                icon:
                  original.status === "ACTIVE" ? (
                    <ToggleLeft className="h-4 w-4" />
                  ) : (
                    <ToggleRight className="h-4 w-4" />
                  ),
                onClick: () => handleToggleStatus(original.id),
              },
              {
                label: "Delete Organization",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => handleDelete(original.id),
                variant: "destructive",
              },
            ]}
          />
        </div>
      ),
      columnClassName: "text-center",
      cellClassName: "text-center",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <PageHeader
        title="Organizations"
        subtitle={`Manage all organizations in the system - ${
          organizationsResponse?.meta?.total || 0
        } total`}
        actions={[
          {
            label: "Create Organization",
            icon: Plus,
            onClick: () => setShowCreateModal(true),
            variant: "primary",
          },
        ]}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="p-6 mb-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                <Input
                  placeholder="Search organizations..."
                  value={dataTable.search}
                  onChange={(e) => dataTable.setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
              options={[
                { value: "ALL", label: "All Status" },
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "TRIAL", label: "Trial" },
                { value: "SUSPENDED", label: "Suspended" },
              ]}
              placeholder="Status"
              className="w-40"
              showSearch={false}
            />
            <Select
              value={filters.plan}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, plan: value }))
              }
              options={[
                { value: "ALL", label: "All Plans" },
                { value: "TRIAL", label: "Trial" },
                { value: "BASIC", label: "Basic" },
                { value: "PREMIUM", label: "Premium" },
                { value: "ENTERPRISE", label: "Enterprise" },
              ]}
              placeholder="Plan"
              className="w-40"
              showSearch={false}
            />
          </div>
        </Card>

        {/* Organizations Table */}
        <DataTable
          columns={columns}
          data={organizations}
          loading={isLoading}
          pageIndex={dataTable.pageIndex}
          pageSize={dataTable.pageSize}
          pageCount={organizationsResponse?.meta?.totalPages || 1}
          total={organizationsResponse?.meta?.total || 0}
          onPageChange={dataTable.setPageIndex}
          onPageSizeChange={dataTable.setPageSize}
          sortBy={dataTable.sortBy}
          sortOrder={dataTable.sortOrder}
          onSortChange={(sortBy, sortOrder) => {
            dataTable.setSortBy(sortBy);
            dataTable.setSortOrder(sortOrder);
          }}
          emptyMessage="No organizations found"
        />
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateOrganizationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
          }}
        />
      )}

      {showEditModal && selectedOrganization && (
        <EditOrganizationModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedOrganization(null);
          }}
          organization={selectedOrganization}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedOrganization(null);
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
          }}
        />
      )}

      {showDetailsModal && selectedOrganization && (
        <OrganizationDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrganization(null);
          }}
          organization={selectedOrganization}
        />
      )}
    </div>
  );
}
