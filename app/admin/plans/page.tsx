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

interface Plan {
  id: string;
  name: string;
  description: string;
  maxClients: number;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock data for now - will be replaced with API calls
const mockPlans: Plan[] = [
  {
    id: "1",
    name: "Starter",
    description: "Perfect for small ISPs getting started",
    maxClients: 500,
    price: 1000,
    currency: "BDT",
    billingCycle: "monthly",
    features: [
      "Up to 500 clients",
      "Basic client management",
      "Email support",
      "Standard reports",
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Professional",
    description: "Ideal for growing ISPs",
    maxClients: 1000,
    price: 2000,
    currency: "BDT",
    billingCycle: "monthly",
    features: [
      "Up to 1000 clients",
      "Advanced client management",
      "Priority support",
      "Advanced reports",
      "API access",
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Enterprise",
    description: "For large ISPs with extensive needs",
    maxClients: 2000,
    price: 3000,
    currency: "BDT",
    billingCycle: "monthly",
    features: [
      "Up to 2000 clients",
      "Full client management suite",
      "24/7 phone support",
      "Custom reports",
      "Full API access",
      "White-label options",
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export default function PlansPage() {
  const queryClient = useQueryClient();
  const dataTable = useDataTable<Plan>({
    initialPageSize: 10,
    initialPageIndex: 0,
    initialSearch: "",
    initialSortBy: "name",
    initialSortOrder: "asc",
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let filteredPlans = mockPlans;

      // Apply search filter
      if (debouncedSearch) {
        filteredPlans = filteredPlans.filter(
          (plan) =>
            plan.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            plan.description
              .toLowerCase()
              .includes(debouncedSearch.toLowerCase())
        );
      }

      // Apply status filter
      if (filters.status) {
        const isActive = filters.status === "ACTIVE";
        filteredPlans = filteredPlans.filter(
          (plan) => plan.isActive === isActive
        );
      }

      // Apply plan type filter
      if (filters.plan) {
        filteredPlans = filteredPlans.filter(
          (plan) => plan.name === filters.plan
        );
      }

      // Apply pagination
      const start = dataTable.pageIndex * dataTable.pageSize;
      const end = start + dataTable.pageSize;
      const paginatedPlans = filteredPlans.slice(start, end);

      return {
        plans: paginatedPlans,
        meta: {
          total: filteredPlans.length,
          totalPages: Math.ceil(filteredPlans.length / dataTable.pageSize),
          currentPage: dataTable.pageIndex + 1,
          limit: dataTable.pageSize,
        },
      };
    },
    enabled: !!debouncedSearch || dataTable.pageIndex >= 0,
  });

  const filtered = useMemo(() => {
    if (!plansData?.plans) return [] as Plan[];
    return plansData.plans;
  }, [plansData?.plans]);

  const deleteMut = useMutation({
    mutationFn: (id: string) => {
      // Simulate API call
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast.success("Plan deleted");
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to delete plan";
      toast.error(message);
    },
  });

  const startEdit = (p: Plan) => {
    setEditing(p);
    setShowForm(true);
  };

  const handleDeleteClick = (p: Plan) => {
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
  const columns: ColumnDef<Plan, any>[] = [
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
      accessorKey: "price",
      enableSorting: true,
      cell: ({ original: p }) => (
        <div className="text-xs text-slate-900 dark:text-white">
          {p.currency} {p.price.toLocaleString()}/{p.billingCycle}
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
                  toast.success(editing ? "Plan updated" : "Plan created");
                  setShowForm(false);
                  setEditing(null);
                },
                confirmVariant: "primary",
                isLoading: false,
                disabled: false,
              }}
            >
              <div className="p-4">
                <p className="text-slate-600 dark:text-slate-400">
                  Plan form will be implemented here.
                </p>
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
        <PricingOverview plans={mockPlans} />
      </div>
    </div>
  );
}
