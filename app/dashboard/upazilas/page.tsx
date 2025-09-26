"use client";

import { UpazilaFilters } from "@/app/dashboard/upazilas/components/UpazilaFilters";
import { UpazilaSearch } from "@/app/dashboard/upazilas/components/UpazilaSearch";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ColumnDef, DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDataTable } from "@/hooks/use-data-table";
import { useDebounce } from "@/hooks/use-debounce";
import {
  createUpazila,
  deleteUpazila,
  getUpazilas,
  updateUpazila,
  type Upazila,
  type UpdateUpazilaDto,
} from "@/lib/api-upazilas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

export default function UpazilasPage() {
  const queryClient = useQueryClient();
  const dataTable = useDataTable<Upazila>({
    initialPageSize: 10,
    initialPageIndex: 0,
    initialSearch: "",
    initialSortBy: "name",
    initialSortOrder: "asc",
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Upazila | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [upazilaToDelete, setUpazilaToDelete] = useState<Upazila | null>(null);
  const [filters, setFilters] = useState({
    status: "",
  });

  // Use the debounce hook for search
  const debouncedSearch = useDebounce({ value: dataTable.search, delay: 250 });

  // Reset to first page when search changes
  useEffect(() => {
    dataTable.setPageIndex(0);
  }, [debouncedSearch]);

  const {
    data: upazilas,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "upazilas",
      filters,
      debouncedSearch,
      dataTable.pageIndex,
      dataTable.pageSize,
    ],
    queryFn: () =>
      getUpazilas({
        search: debouncedSearch,
        isActive: filters.status ? filters.status === "true" : undefined,
      }),
  });

  const filtered = useMemo(() => {
    if (!upazilas?.data) return [] as Upazila[];
    return upazilas.data;
  }, [upazilas?.data]);

  const totalPages = Math.ceil(filtered.length / dataTable.pageSize) || 1;

  const createMut = useMutation({
    mutationFn: createUpazila,
    onSuccess: () => {
      toast.success("Upazila created");
      queryClient.invalidateQueries({ queryKey: ["upazilas"] });
      setShowForm(false);
    },
    onError: () => toast.error("Failed to create upazila"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUpazilaDto }) =>
      updateUpazila(id, data),
    onSuccess: () => {
      toast.success("Upazila updated");
      queryClient.invalidateQueries({ queryKey: ["upazilas"] });
      setShowForm(false);
      setEditing(null);
    },
    onError: () => toast.error("Failed to update upazila"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteUpazila(id),
    onSuccess: () => {
      toast.success("Upazila deleted");
      queryClient.invalidateQueries({ queryKey: ["upazilas"] });
    },
    onError: () => toast.error("Failed to delete upazila"),
  });

  const startEdit = (u: Upazila) => {
    setEditing(u);
    setShowForm(true);
  };

  const handleDeleteClick = (u: Upazila) => {
    setUpazilaToDelete(u);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (upazilaToDelete) {
      deleteMut.mutate(upazilaToDelete.id);
      setShowDeleteConfirm(false);
      setUpazilaToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setUpazilaToDelete(null);
  };

  const handlePageChange = dataTable.setPageIndex;
  const handleEntriesPerPageChange = dataTable.setPageSize;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    dataTable.setPageIndex(0); // Reset to first page when filters change
  };

  // Define table columns
  const columns: ColumnDef<Upazila, any>[] = [
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
      header: "Name",
      accessorKey: "name",
      enableSorting: true,
      cell: ({ original: u }) => (
        <div>
          <div className="text-xs font-medium text-slate-900 dark:text-white">
            {u.name}
          </div>
          {u.description && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {u.description}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "code",
      header: "Code",
      accessorKey: "code",
      enableSorting: true,
      cell: ({ original: u }) => (
        <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs text-slate-700 dark:text-slate-300">
          {u.code || "-"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "isActive",
      enableSorting: true,
      cell: ({ original: u }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            u.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
          }`}
        >
          {u.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      enableSorting: true,
      cell: ({ original: u }) => (
        <div className="text-xs text-slate-900 dark:text-white">
          {new Date(u.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ original: u }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => startEdit(u)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(u)}
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
        title="Upazilas"
        subtitle="Manage service upazilas"
        actions={[
          {
            label: "New Upazila",
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
              <UpazilaFilters
                onRefresh={refetch}
                onExport={() => {
                  toast.success("Exporting upazila data...");
                  // TODO: Implement actual export functionality
                  const csvContent =
                    "data:text/csv;charset=utf-8," +
                    "Name,District,Code,Description,Status,Created\n" +
                    "Sample Upazila,Sample District,UPA001,Sample upazila description,Active,2024-01-01";
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "upazilas.csv");
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
              <UpazilaSearch
                searchValue={dataTable.search}
                onSearchChange={dataTable.setSearch}
              />
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          total={filtered.length}
          pageIndex={dataTable.pageIndex}
          pageSize={dataTable.pageSize}
          pageCount={totalPages}
          onPageSizeChange={handleEntriesPerPageChange}
          onPageChange={handlePageChange}
          loading={isLoading}
          emptyMessage="No upazilas found."
        />

        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          title={editing ? "Edit Upazila" : "New Upazila"}
          size="xl"
          footer={{
            cancelText: "Cancel",
            confirmText: editing ? "Update Upazila" : "Create Upazila",
            onCancel: () => {
              setShowForm(false);
              setEditing(null);
            },
            onConfirm: () => {
              const form = document.querySelector(
                "#upazila-form"
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
          <UpazilaForm
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

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Upazila"
          description={`Are you sure you want to delete "${upazilaToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete Upazila"
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

function UpazilaForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial?: Upazila;
  onCancel: () => void;
  onSubmit: (values: {
    name: string;
    code?: string;
    description?: string;
    isActive?: boolean;
  }) => void;
  submitting?: boolean;
}) {
  const isCreate = !initial;

  // Single form state object
  const [formState, setFormState] = useState({
    name: initial?.name || "",
    code: initial?.code || "",
    description: initial?.description || "",
    isActive: initial?.isActive ?? true,
  });

  // Validation state
  const [errors, setErrors] = useState<{
    name?: string;
    code?: string;
    description?: string;
  }>({});

  // Reset form when initial prop changes (switching between create/edit modes)
  useEffect(() => {
    if (initial) {
      setFormState({
        name: initial.name || "",
        code: initial.code || "",
        description: initial.description || "",
        isActive: initial.isActive ?? true,
      });
    } else {
      // Reset to defaults for create mode
      setFormState({
        name: "",
        code: "",
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
      code: formState.code?.trim() || undefined,
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
    <form id="upazila-form" onSubmit={handleSubmit} className="space-y-4">
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
          label="Code"
          type="text"
          value={formState.code}
          onChange={(e) => {
            setFormState((prev) => ({ ...prev, code: e.target.value }));
            clearError("code");
          }}
          error={errors.code}
          disabled={submitting}
        />
      </div>

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
