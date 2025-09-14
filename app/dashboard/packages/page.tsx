"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef, DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { usePackageAnalytics } from "@/hooks/use-package-analytics";
import {
  getMikrotikServers,
  getProfilesFromMikrotik,
  type MikrotikServer,
} from "@/lib/api-mikrotik";
import {
  ServiceProfile,
  createServiceProfile,
  deleteServiceProfile,
  getMonthlyPriceNumber,
  getPppoeProfiles,
  updateServiceProfile,
  type UpdateServiceProfileInput,
} from "@/lib/packages";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Download,
  Edit,
  Package,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { AssignButtonWithBadge } from "./components/AssignButtonWithBadge";
import { PackageAnalytics } from "./components/PackageAnalytics";
import { PackageAssignmentModal } from "./components/PackageAssignmentModal";
import { PackageFilters } from "./components/PackageFilters";
import { PackageSearch } from "./components/PackageSearch";

export default function PackagesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ServiceProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServiceProfile | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"packages" | "analytics">(
    "packages"
  );

  // Use the debounce hook for search
  const debouncedSearch = useDebounce({ value: search, delay: 250 });

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const {
    data: profiles,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["profiles"],
    queryFn: getPppoeProfiles,
  });

  // Fetch package analytics for client counts
  const { data: analyticsData } = usePackageAnalytics();

  const filtered = useMemo(() => {
    if (!profiles) return [] as ServiceProfile[];
    if (!debouncedSearch) return profiles;
    const q = debouncedSearch.toLowerCase();
    return profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.mikrotikProfile.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [profiles, debouncedSearch]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  const createMut = useMutation({
    mutationFn: createServiceProfile,
    onSuccess: () => {
      toast.success("Package created");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setShowForm(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create package";
      toast.error(message);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateServiceProfileInput;
    }) => updateServiceProfile(id, data),
    onSuccess: () => {
      toast.success("Package updated");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update package";
      toast.error(message);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteServiceProfile(id),
    onSuccess: () => {
      toast.success("Package deleted");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to delete package";
      toast.error(message);
    },
  });

  const startEdit = (p: ServiceProfile) => {
    setEditing(p);
    setShowForm(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEntriesPerPageChange = (value: number) => {
    setEntriesPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

  // Define table columns
  const columns: ColumnDef<ServiceProfile, any>[] = [
    {
      id: "index",
      header: "#",
      enableSorting: false,
      cell: ({ row }) => {
        // Calculate row number based on current page and row position
        const rowNumber =
          (currentPage - 1) * entriesPerPage +
          paginatedData.indexOf(row.original) +
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
      header: "Name",
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
      id: "mikrotikProfile",
      header: "Mikrotik Profile",
      accessorKey: "mikrotikProfile",
      enableSorting: true,
      cell: ({ original: p }) => (
        <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs text-slate-700 dark:text-slate-300">
          {p.mikrotikProfile}
        </span>
      ),
    },
    {
      id: "price",
      header: "Price",
      accessorKey: "monthlyPrice",
      enableSorting: true,
      cell: ({ original: p }) => (
        <div className="text-xs text-slate-900 dark:text-white">
          ৳{getMonthlyPriceNumber(p).toLocaleString()}
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
            <AssignButtonWithBadge
              package={p}
              onAssign={() => {
                setSelectedPackage(p);
                setShowAssignmentModal(true);
              }}
            />
            <Button variant="outline" size="sm" onClick={() => startEdit(p)}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to delete this package?")) {
                  deleteMut.mutate(p.id);
                }
              }}
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
        title="Packages"
        subtitle="Manage PPPoE service profiles"
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
            label: "New Package",
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
                onClick={() => setActiveTab("packages")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "packages"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Packages</span>
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
        {activeTab === "analytics" && <PackageAnalytics />}

        {/* Packages View */}
        {activeTab === "packages" && (
          <>
            {/* Search and Filters - Side by Side */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg mb-6 p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Left Side - Filters */}
                <div className="flex-1">
                  <PackageFilters
                    onRefresh={refetch}
                    onExport={() => {
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
                    }}
                    isLoading={isLoading}
                  />
                </div>

                {/* Right Side - Search */}
                <div className="lg:ml-auto">
                  <PackageSearch
                    searchValue={search}
                    onSearchChange={setSearch}
                  />
                </div>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={paginatedData}
              total={filtered.length}
              pageIndex={currentPage - 1}
              pageSize={entriesPerPage}
              pageCount={totalPages}
              onPageSizeChange={handleEntriesPerPageChange}
              onPageChange={handlePageChange}
              loading={isLoading}
              emptyMessage="No packages found."
            />

            <Modal
              isOpen={showForm}
              onClose={() => {
                setShowForm(false);
                setEditing(null);
              }}
              title={editing ? "Edit Package" : "New Package"}
              size="xl"
              footer={{
                cancelText: "Cancel",
                confirmText: editing ? "Update Package" : "Create Package",
                onCancel: () => {
                  setShowForm(false);
                  setEditing(null);
                },
                onConfirm: () => {
                  const form = document.querySelector(
                    "#package-form"
                  ) as HTMLFormElement;
                  if (form) {
                    form.requestSubmit();
                  }
                },
                confirmVariant: "primary",
                isLoading: createMut.isPending || updateMut.isPending,
                disabled: createMut.isPending || updateMut.isPending,
              }}
            >
              <ProfileForm
                initial={editing || undefined}
                onCancel={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                onSubmit={(values) => {
                  if (editing) {
                    updateMut.mutate({ id: editing.id, data: values });
                  } else {
                    createMut.mutate({
                      ...values,
                    });
                  }
                  setShowForm(false);
                  setEditing(null);
                }}
                submitting={createMut.isPending || updateMut.isPending}
              />
            </Modal>

            {/* Package Assignment Modal */}
            <PackageAssignmentModal
              isOpen={showAssignmentModal}
              onClose={() => {
                setShowAssignmentModal(false);
                setSelectedPackage(null);
              }}
              packageProfile={selectedPackage}
              onSuccess={() => {
                setShowAssignmentModal(false);
                setSelectedPackage(null);
                refetch(); // Refresh packages list
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ProfileForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial?: ServiceProfile;
  onCancel: () => void;
  onSubmit: (values: {
    name: string;
    mikrotikProfile: string;
    monthlyPrice: string;
    description?: string;
    isActive?: boolean;
  }) => void;
  submitting?: boolean;
}) {
  const isCreate = !initial;

  // Single form state object
  const [formState, setFormState] = useState({
    name: initial?.name || "",
    mikrotikProfile: initial?.mikrotikProfile || "",
    monthlyPrice: initial?.monthlyPrice || "",
    description: initial?.description || "",
    isActive: initial?.isActive ?? true,
    serverId: "",
    selectedMtProfile: "",
  });

  // Validation state
  const [errors, setErrors] = useState<{
    name?: string;
    mikrotikProfile?: string;
    monthlyPrice?: string;
    serverId?: string;
    selectedMtProfile?: string;
    description?: string;
  }>({});

  const { data: servers } = useQuery({
    queryKey: ["mt-servers"],
    queryFn: getMikrotikServers,
  }) as { data: MikrotikServer[] | undefined };

  const { data: mtProfilesResp } = useQuery({
    queryKey: ["mt-profiles", formState.serverId],
    queryFn: async () => {
      if (!formState.serverId) return null as any;
      const res = await getProfilesFromMikrotik(formState.serverId);
      return res;
    },
    enabled: !!formState.serverId,
  }) as {
    data:
      | { profiles?: Array<{ name: string; [key: string]: any }> }
      | null
      | undefined;
  };

  const mtProfiles: Array<{ name: string; [key: string]: any }> =
    mtProfilesResp?.profiles ?? [];

  // Reset form when initial prop changes (switching between create/edit modes)
  useEffect(() => {
    if (initial) {
      setFormState({
        name: initial.name || "",
        mikrotikProfile: initial.mikrotikProfile || "",
        monthlyPrice: initial.monthlyPrice || "",
        description: initial.description || "",
        isActive: initial.isActive ?? true,
        serverId: "", // Reset serverId when switching to edit mode
        selectedMtProfile: "", // Reset selectedMtProfile when switching to edit mode
      });

      // For editing, try to find the server that contains this profile
      if (initial.mikrotikProfile && servers) {
        // Find server that has this profile
        const findServerWithProfile = async () => {
          for (const server of servers) {
            try {
              const profiles = await getProfilesFromMikrotik(server.id);
              if (
                profiles?.profiles?.some(
                  (p: { name: string; [key: string]: any }) =>
                    p.name === initial.mikrotikProfile
                )
              ) {
                setFormState((prev) => ({ ...prev, serverId: server.id }));
                setFormState((prev) => ({
                  ...prev,
                  selectedMtProfile: initial.mikrotikProfile,
                }));
                break;
              }
            } catch (error) {
              // Continue to next server if this one fails
              continue;
            }
          }
        };
        findServerWithProfile();
      }
    } else {
      // Reset to defaults for create mode
      setFormState({
        name: "",
        mikrotikProfile: "",
        monthlyPrice: "",
        description: "",
        isActive: true,
        serverId: "",
        selectedMtProfile: "",
      });
    }
    // Clear errors when switching modes
    setErrors({});
  }, [initial, servers]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formState.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formState.mikrotikProfile.trim()) {
      newErrors.mikrotikProfile = "Mikrotik Profile is required";
    }

    if (!formState.monthlyPrice.trim()) {
      newErrors.monthlyPrice = "Monthly Price is required";
    } else if (
      isNaN(Number(formState.monthlyPrice)) ||
      Number(formState.monthlyPrice) < 0
    ) {
      newErrors.monthlyPrice = "Monthly Price must be a valid positive number";
    }

    if (isCreate) {
      if (!formState.serverId) {
        newErrors.serverId = "Server selection is required";
      }
      if (!formState.selectedMtProfile) {
        newErrors.selectedMtProfile = "Profile selection is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      name: formState.name.trim(),
      mikrotikProfile: formState.mikrotikProfile.trim(),
      monthlyPrice: formState.monthlyPrice.trim(),
      description: formState.description?.trim() || undefined,
      isActive: formState.isActive,
    });
  };

  const serverOptions =
    servers?.map((s) => ({
      value: s.id,
      label: s.name,
    })) || [];

  const profileOptions = mtProfiles.map((p) => ({
    value: p.name,
    label: p.name,
  }));

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ];

  // Simple error clearing function
  const clearError = (key: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleInputChange = (key: keyof typeof errors) => {
    // need to
  };

  return (
    <form id="package-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Build from Mikrotik profile (optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <Select
          label="Mikrotik Server"
          required={isCreate}
          options={serverOptions}
          placeholder="Select a server"
          value={formState.serverId}
          onChange={(value) => {
            setFormState((prev) => ({ ...prev, serverId: value }));
            setFormState((prev) => ({ ...prev, selectedMtProfile: "" }));
            clearError("serverId");
            clearError("selectedMtProfile");
          }}
          error={errors.serverId}
          disabled={submitting}
        />
        <Select
          label="PPPoE Profile"
          required={isCreate}
          options={profileOptions}
          placeholder="Select a profile"
          value={formState.selectedMtProfile}
          onChange={(value) => {
            setFormState((prev) => ({
              ...prev,
              selectedMtProfile: value,
              mikrotikProfile: value,
              name: prev.name || value,
            }));
            clearError("selectedMtProfile");
            clearError("mikrotikProfile");
            clearError("name");
          }}
          error={errors.selectedMtProfile}
          disabled={!formState.serverId || submitting}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Selecting a Mikrotik profile will prefill the profile name. You can
        adjust other fields before saving.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Name"
          required
          type="text"
          value={formState.name}
          onChange={(e) => {
            setFormState((prev) => ({ ...prev, name: e.target.value }));
            clearError("name");
          }}
          error={errors.name}
          disabled={submitting}
        />
        <Input
          label="Mikrotik Profile"
          required
          type="text"
          value={formState.mikrotikProfile}
          onChange={(e) => {
            setFormState((prev) => ({
              ...prev,
              mikrotikProfile: e.target.value,
            }));
            clearError("mikrotikProfile");
          }}
          error={errors.mikrotikProfile}
          disabled={submitting}
        />
      </div>

      <Input
        label="Monthly Price (৳)"
        required
        type="number"
        value={formState.monthlyPrice}
        onChange={(e) => {
          setFormState((prev) => ({ ...prev, monthlyPrice: e.target.value }));
          clearError("monthlyPrice");
        }}
        placeholder="e.g., 800.00"
        error={errors.monthlyPrice}
        disabled={submitting}
      />

      <Select
        label="Status"
        options={statusOptions}
        value={formState.isActive ? "ACTIVE" : "INACTIVE"}
        onChange={(value) =>
          setFormState((prev) => ({ ...prev, isActive: value === "ACTIVE" }))
        }
        disabled={submitting}
      />

      <Textarea
        label="Description"
        value={formState.description || ""}
        onChange={(e) => {
          setFormState((prev) => ({ ...prev, description: e.target.value }));
          clearError("description");
        }}
        placeholder="Optional description"
        disabled={submitting}
        rows={3}
      />
    </form>
  );
}
