"use client";

import { ConnectionTypeFilters } from "@/app/dashboard/connection-types/components/ConnectionTypeFilters";
import { ConnectionTypeSearch } from "@/app/dashboard/connection-types/components/ConnectionTypeSearch";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ColumnDef, DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ConnectionType,
  createConnectionType,
  deleteConnectionType,
  getConnectionTypes,
  updateConnectionType,
} from "@/lib/api-connection-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

// ConnectionType interface is now imported from API

export default function ConnectionTypesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ConnectionType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [connectionTypeToDelete, setConnectionTypeToDelete] =
    useState<ConnectionType | null>(null);

  // Use the debounce hook for search
  const debouncedSearch = useDebounce({ value: search, delay: 250 });

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const { data: connectionTypesResponse, isLoading } = useQuery({
    queryKey: ["connectionTypes", currentPage, entriesPerPage, debouncedSearch],
    queryFn: async () => {
      return await getConnectionTypes({
        page: currentPage,
        limit: entriesPerPage,
        search: debouncedSearch,
      });
    },
  });

  const connectionTypes = connectionTypesResponse?.data || [];

  const filtered = useMemo(() => {
    if (!connectionTypes) return [] as ConnectionType[];
    if (!debouncedSearch) return connectionTypes;
    const q = debouncedSearch.toLowerCase();
    return connectionTypes.filter(
      (ct) =>
        ct.name.toLowerCase().includes(q) ||
        (ct.description && ct.description.toLowerCase().includes(q))
    );
  }, [connectionTypes, debouncedSearch]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  const createMut = useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      isActive: boolean;
    }) => {
      return await createConnectionType(data);
    },
    onSuccess: () => {
      toast.success("Connection type created");
      queryClient.invalidateQueries({ queryKey: ["connectionTypes"] });
      setShowForm(false);
    },
    onError: () => toast.error("Failed to create connection type"),
  });

  const updateMut = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; description?: string; isActive: boolean };
    }) => {
      return await updateConnectionType(id, data);
    },
    onSuccess: () => {
      toast.success("Connection type updated");
      queryClient.invalidateQueries({ queryKey: ["connectionTypes"] });
      setShowForm(false);
      setEditing(null);
    },
    onError: () => toast.error("Failed to update connection type"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      return await deleteConnectionType(id);
    },
    onSuccess: () => {
      toast.success("Connection type deleted");
      queryClient.invalidateQueries({ queryKey: ["connectionTypes"] });
    },
    onError: () => toast.error("Failed to delete connection type"),
  });

  const startEdit = (ct: ConnectionType) => {
    setEditing(ct);
    setShowForm(true);
  };

  const handleDeleteClick = (ct: ConnectionType) => {
    setConnectionTypeToDelete(ct);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (connectionTypeToDelete) {
      deleteMut.mutate(connectionTypeToDelete.id);
      setShowDeleteConfirm(false);
      setConnectionTypeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setConnectionTypeToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEntriesPerPageChange = (value: number) => {
    setEntriesPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

  // Define table columns
  const columns: ColumnDef<ConnectionType, any>[] = [
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
      cell: ({ original: ct }) => (
        <div>
          <div className="text-xs font-medium text-slate-900 dark:text-white">
            {ct.name}
          </div>
          {ct.description && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {ct.description}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "isActive",
      enableSorting: true,
      cell: ({ original: ct }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            ct.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
          }`}
        >
          {ct.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      enableSorting: true,
      cell: ({ original: ct }) => (
        <div className="text-xs text-slate-900 dark:text-white">
          {new Date(ct.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ original: ct }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => startEdit(ct)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(ct)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 theme-transition">
      <PageHeader
        title="Connection Types"
        subtitle="Manage network connection types"
        actions={[
          {
            label: "New Connection Type",
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
        {/* Search and Filters - Side by Side */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg mb-6 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left Side - Filters */}
            <div className="flex-1">
              <ConnectionTypeFilters
                onRefresh={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["connectionTypes"],
                  })
                }
                onExport={() => {
                  toast.success("Exporting connection types data...");
                  // TODO: Implement actual export functionality
                  const csvContent =
                    "data:text/csv;charset=utf-8," +
                    "Name,Description,Status,Created\n" +
                    "Sample Connection Type,Sample description,Active,2024-01-01";
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "connection-types.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                isLoading={isLoading}
              />
            </div>

            {/* Right Side - Search */}
            <div className="lg:ml-auto">
              <ConnectionTypeSearch
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
          emptyMessage="No connection types found."
        />

        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          title={editing ? "Edit Connection Type" : "New Connection Type"}
          size="xl"
          footer={{
            cancelText: "Cancel",
            confirmText: editing
              ? "Update Connection Type"
              : "Create Connection Type",
            onCancel: () => {
              setShowForm(false);
              setEditing(null);
            },
            onConfirm: () => {
              const form = document.querySelector(
                "#connection-type-form"
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
          <ConnectionTypeForm
            initial={editing || undefined}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            onSubmit={(values) => {
              if (editing) {
                updateMut.mutate({ id: editing.id, data: values });
              } else {
                createMut.mutate(values);
              }
              setShowForm(false);
              setEditing(null);
            }}
            submitting={createMut.isPending || updateMut.isPending}
          />
        </Modal>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Connection Type"
          description={`Are you sure you want to delete "${connectionTypeToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete Connection Type"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={deleteMut.isPending}
          confirmVariant="danger"
          tone="danger"
        />
      </div>
    </div>
  );
}

function ConnectionTypeForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial?: ConnectionType;
  onCancel: () => void;
  onSubmit: (values: {
    name: string;
    description?: string;
    isActive: boolean;
  }) => void;
  submitting?: boolean;
}) {
  const isCreate = !initial;

  // Single form state object
  const [formState, setFormState] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    isActive: initial?.isActive ?? true,
  });

  // Validation state
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  // Reset form when initial prop changes (switching between create/edit modes)
  useEffect(() => {
    if (initial) {
      setFormState({
        name: initial.name || "",
        description: initial.description || "",
        isActive: initial.isActive ?? true,
      });
    } else {
      // Reset to defaults for create mode
      setFormState({
        name: "",
        description: "",
        isActive: true,
      });
    }
    // Clear errors when switching modes
    setErrors({});
  }, [initial]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formState.name.trim()) {
      newErrors.name = "Name is required";
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
      description: formState.description?.trim() || undefined,
      isActive: formState.isActive,
    });
  };

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ];

  // Simple error clearing function
  const clearError = (key: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <form
      id="connection-type-form"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
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
