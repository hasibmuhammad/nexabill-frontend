"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ColumnDef, DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { useDataTable } from "@/hooks/use-data-table";
import { useDebounce } from "@/hooks/use-debounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  CreditCard,
  Download,
  Edit,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { PlanFilters } from "./components/PlanFilters";
import { PlanSearch } from "./components/PlanSearch";
import { PricingOverview } from "./components/PricingOverview";

import { api } from "@/lib/api";
import { type PlanFormValues, type SubscriptionPlan } from "@/lib/schemas/plan";
import { PlanForm } from "./components/PlanForm";



export default function PlansPage() {
  const queryClient = useQueryClient();
  const dataTable = useDataTable<SubscriptionPlan>({
    initialPageSize: 10,
    initialPageIndex: 0,
    initialSearch: "",
    initialSortBy: "name",
    initialSortOrder: "asc",
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "analytics">("plans");
  const [filters, setFilters] = useState({
    status: "",
    plan: "",
  });

  // Use the debounce hook for search
  const debouncedSearch = useDebounce({ value: dataTable.search, delay: 250 });

  // Reset to first page when search or filters change
  useEffect(() => {
    dataTable.setPageIndex(0);
  }, [debouncedSearch, filters]);

  const {
    data: plansData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "plans",
      filters,
      debouncedSearch,
      dataTable.pageIndex,
      dataTable.pageSize,
    ],
    queryFn: async () => {
      const response = await api.get("/subscription-plans", {
        params: {
          page: dataTable.pageIndex + 1,
          limit: dataTable.pageSize,
          search: debouncedSearch,
          isActive: filters.status === "ACTIVE" ? "true" : filters.status === "INACTIVE" ? "false" : undefined,
        },
      });
      return response.data.data || response.data;
    },
  });

  const filtered = useMemo(() => {
    if (Array.isArray(plansData)) return plansData;
    if (plansData?.data && Array.isArray(plansData.data)) return plansData.data;
    if (plansData?.items && Array.isArray(plansData.items)) return plansData.items;
    return [];
  }, [plansData]);

  const createMut = useMutation({
    mutationFn: (values: PlanFormValues) => api.post("/subscription-plans", values),
    onSuccess: () => {
      toast.success("Plan created successfully");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create plan");
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, values }: { id: string; values: PlanFormValues }) =>
      api.patch(`/subscription-plans/${id}`, values),
    onSuccess: () => {
      toast.success("Plan updated successfully");
      setShowForm(false);
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update plan");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/subscription-plans/${id}`),
    onSuccess: () => {
      toast.success("Plan deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete plan");
    },
  });

  const onFormSubmit = (values: PlanFormValues) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, values });
    } else {
      createMut.mutate(values);
    }
  };

  const startEdit = (p: SubscriptionPlan) => {
    setEditing(p);
    setShowForm(true);
  };

  const handleDeleteClick = (p: SubscriptionPlan) => {
    setPlanToDelete(p);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (planToDelete) {
      deleteMut.mutate(planToDelete.id);
      setShowDeleteConfirm(false);
      setPlanToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setPlanToDelete(null);
  };

  const handlePageChange = dataTable.setPageIndex;
  const handleEntriesPerPageChange = dataTable.setPageSize;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    dataTable.setPageIndex(0); // Reset to first page when filters change
  };

  // Define table columns
  const columns: ColumnDef<SubscriptionPlan, any>[] = [
    {
      id: "index",
      header: "#",
      enableSorting: false,
      cell: ({ row }) => {
        // Calculate row number based on current page and row position
        const rowNumber =
          dataTable.pageIndex * dataTable.pageSize +
          filtered.indexOf(row.original) +
          1;
        return (
          <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {rowNumber}
          </div>
        );
      },
    },
    {
      id: "name",
      header: "Plan Name",
      accessorKey: "name",
      enableSorting: true,
      cell: ({ original: p }) => (
        <div>
          <div className="text-xs font-medium text-slate-900 dark:text-white">
            {p.name}
          </div>
          {p.description && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {p.description}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "maxClients",
      header: "Max Clients",
      accessorKey: "maxClients",
      enableSorting: true,
      cell: ({ original: p }) => (
        <div className="text-xs text-slate-900 dark:text-white font-medium">
          {p.maxClients.toLocaleString()}
        </div>
      ),
    },
    {
      id: "price",
      header: "Price",
      accessorKey: "basePrice",
      enableSorting: true,
      cell: ({ original: p }) => (
        <div className="text-xs text-slate-900 dark:text-white">
          BDT {p.basePrice.toLocaleString()}/{p.billingCycle.toLowerCase()}
        </div>
      ),
    },
    {
      id: "servers",
      header: "Max Servers",
      accessorKey: "maxMikrotikServers",
      enableSorting: true,
      cell: ({ original: p }) => (
        <div className="text-xs text-slate-900 dark:text-white">
          {p.maxMikrotikServers}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "isActive",
      enableSorting: true,
      cell: ({ original: p }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            p.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
          }`}
        >
          {p.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ original: p }) => {
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => startEdit(p)}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteClick(p)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 theme-transition">
      <PageHeader
        title="Subscription Plans"
        subtitle="Manage pricing plans for organizations"
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            onClick: () => refetch(),
          },
          {
            label: "Export",
            icon: Download,
            onClick: () => {
              toast.success("Exporting plans data...");
              // TODO: Implement actual export functionality
              const csvContent =
                "data:text/csv;charset=utf-8," +
                "Name,Description,Max Clients,Price,Status\n" +
                "Starter,Perfect for small ISPs,500,BDT 1000,Active";
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "plans.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            },
          },
          {
            label: "New Plan",
            icon: Plus,
            variant: "primary",
            onClick: () => {
              setEditing(null);
              setShowForm(true);
            },
          },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("plans")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "plans"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Plans</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "analytics"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Analytics View */}
        {activeTab === "analytics" && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Plans Analytics
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Analytics for subscription plans will be implemented here.
            </p>
          </div>
        )}

        {/* Plans View */}
        {activeTab === "plans" && (
          <>
            {/* Search and Filters - Side by Side */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg mb-6 p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Left Side - Filters */}
                <div className="flex-1">
                  <PlanFilters
                    onRefresh={refetch}
                    onExport={() => {
                      toast.success("Exporting plans data...");
                      // TODO: Implement actual export functionality
                      const csvContent =
                        "data:text/csv;charset=utf-8," +
                        "Name,Description,Max Clients,Price,Status\n" +
                        "Starter,Perfect for small ISPs,500,BDT 1000,Active";
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", "plans.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    isLoading={isLoading}
                    onFilterChange={handleFilterChange}
                    filters={filters}
                  />
                </div>

                {/* Right Side - Search */}
                <div className="lg:ml-auto">
                  <PlanSearch
                    searchValue={dataTable.search}
                    onSearchChange={dataTable.setSearch}
                  />
                </div>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filtered}
              total={plansData?.meta?.total || 0}
              pageIndex={dataTable.pageIndex}
              pageSize={dataTable.pageSize}
              pageCount={plansData?.meta?.totalPages || 1}
              onPageSizeChange={handleEntriesPerPageChange}
              onPageChange={handlePageChange}
              loading={isLoading}
              emptyMessage="No plans found."
            />

            <Modal
              isOpen={showForm}
              onClose={() => {
                setShowForm(false);
                setEditing(null);
              }}
              title={editing ? "Edit Plan" : "New Plan"}
              size="xl"
              footer={{
                cancelText: "Cancel",
                confirmText: editing ? "Update Plan" : "Create Plan",
                onCancel: () => {
                  setShowForm(false);
                  setEditing(null);
                },
                onConfirm: () => {
                  // The form handles its own submit via button type submit
                  // But here we need to trigger it if the modal footer is used
                  const form = document.getElementById("plan-form") as HTMLFormElement;
                  if (form) form.requestSubmit();
                },
                confirmVariant: "primary",
                isLoading: createMut.isPending || updateMut.isPending,
                disabled: false,
              }}
            >
              <div className="p-6">
                <PlanForm 
                  initialData={editing || undefined} 
                  onSubmit={onFormSubmit} 
                  formId="plan-form" 
                />
              </div>
            </Modal>

            <ConfirmDialog
              isOpen={showDeleteConfirm}
              title="Delete Plan"
              description={`Are you sure you want to delete "${planToDelete?.name}"? This action cannot be undone.`}
              confirmText="Delete Plan"
              cancelText="Cancel"
              onConfirm={handleDeleteConfirm}
              onCancel={handleDeleteCancel}
              isLoading={deleteMut.isPending}
              confirmVariant="danger"
              tone="danger"
            />
          </>
        )}

        {/* Pricing Overview */}
        <PricingOverview plans={filtered as any} />
      </div>
    </div>
  );
}
