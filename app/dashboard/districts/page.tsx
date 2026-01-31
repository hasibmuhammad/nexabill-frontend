"use client";

import { DistrictFilters } from "@/app/dashboard/districts/components/DistrictFilters";
import { DistrictSearch } from "@/app/dashboard/districts/components/DistrictSearch";
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
  createDistrict,
  deleteDistrict,
  getDistricts,
  updateDistrict,
  type District,
  type UpdateDistrictDto,
} from "@/lib/api-districts";
import { districtSchema, type DistrictFormValues } from "@/lib/schemas/district";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

export default function DistrictsPage() {
  const queryClient = useQueryClient();
  const dataTable = useDataTable<District>({
    initialPageSize: 10,
    initialPageIndex: 0,
    initialSearch: "",
    initialSortBy: "name",
    initialSortOrder: "asc",
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<District | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [districtToDelete, setDistrictToDelete] = useState<District | null>(
    null
  );
  const [filters, setFilters] = useState({
    status: "",
  });

  // Use the debounce hook for search
  const debouncedSearch = useDebounce({ value: dataTable.search, delay: 250 });

  // Reset to first page when search or filters change
  useEffect(() => {
    dataTable.setPageIndex(0);
  }, [debouncedSearch, filters]);

  const {
    data: districts,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "districts",
      filters,
      debouncedSearch,
      dataTable.pageIndex,
      dataTable.pageSize,
    ],
    queryFn: async () => {
      const response = await getDistricts({
        page: dataTable.pageIndex + 1,
        limit: dataTable.pageSize,
        search: debouncedSearch,
        isActive: filters.status ? filters.status === "true" : undefined,
      });

      // Handle standardized response structure
      if (response?.data && Array.isArray(response.data)) {
        return {
          districts: response.data,
          meta: response.meta || {
            total: response.data.length,
            totalPages: 1,
            currentPage: 1,
            limit: dataTable.pageSize,
          },
        };
      }

      return {
        districts: response?.data || [],
        meta: {
          total: response?.data?.length || 0,
          totalPages: 1,
          currentPage: 1,
          limit: dataTable.pageSize,
        },
      };
    },
    enabled: !!debouncedSearch || dataTable.pageIndex >= 0,
  });

  const filtered = useMemo(() => {
    if (!districts?.districts) return [] as District[];
    return districts.districts;
  }, [districts?.districts]);

  const createMut = useMutation({
    mutationFn: createDistrict,
    onSuccess: () => {
      toast.success("District created");
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      setShowForm(false);
    },
    onError: () => toast.error("Failed to create district"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDistrictDto }) =>
      updateDistrict(id, data),
    onSuccess: () => {
      toast.success("District updated");
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      setShowForm(false);
      setEditing(null);
    },
    onError: () => toast.error("Failed to update district"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteDistrict(id),
    onSuccess: () => {
      toast.success("District deleted");
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
    onError: () => toast.error("Failed to delete district"),
  });

  const startEdit = (d: District) => {
    setEditing(d);
    setShowForm(true);
  };

  const handleDeleteClick = (d: District) => {
    setDistrictToDelete(d);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (districtToDelete) {
      deleteMut.mutate(districtToDelete.id);
      setShowDeleteConfirm(false);
      setDistrictToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDistrictToDelete(null);
  };

  const handlePageChange = dataTable.setPageIndex;
  const handleEntriesPerPageChange = dataTable.setPageSize;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    dataTable.setPageIndex(0); // Reset to first page when filters change
  };

  // Define table columns
  const columns: ColumnDef<District, any>[] = [
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
      cell: ({ original: d }) => (
        <div>
          <div className="text-xs font-medium text-slate-900 dark:text-white">
            {d.name}
          </div>
          {d.description && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {d.description}
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
      cell: ({ original: d }) => (
        <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs text-slate-700 dark:text-slate-300">
          {d.code || "-"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "isActive",
      enableSorting: true,
      cell: ({ original: d }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            d.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
          }`}
        >
          {d.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      enableSorting: true,
      cell: ({ original: d }) => (
        <div className="text-xs text-slate-900 dark:text-white">
          {new Date(d.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ original: d }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => startEdit(d)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(d)}
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
        title="Districts"
        subtitle="Manage service districts"
        actions={[
          {
            label: "New District",
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
              <DistrictFilters
                onRefresh={refetch}
                onExport={() => {
                  toast.success("Exporting district data...");
                  // TODO: Implement actual export functionality
                  const csvContent =
                    "data:text/csv;charset=utf-8," +
                    "Name,Code,Description,Status,Created\n" +
                    "Sample District,DIST001,Sample district description,Active,2024-01-01";
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "districts.csv");
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
              <DistrictSearch
                searchValue={dataTable.search}
                onSearchChange={dataTable.setSearch}
              />
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          total={districts?.meta?.total || 0}
          pageIndex={dataTable.pageIndex}
          pageSize={dataTable.pageSize}
          pageCount={districts?.meta?.totalPages || 1}
          onPageSizeChange={handleEntriesPerPageChange}
          onPageChange={handlePageChange}
          loading={isLoading}
          emptyMessage="No districts found."
        />

        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          title={editing ? "Edit District" : "New District"}
          size="xl"
          footer={{
            cancelText: "Cancel",
            confirmText: editing ? "Update District" : "Create District",
            onCancel: () => {
              setShowForm(false);
              setEditing(null);
            },
            onConfirm: () => {
              const form = document.querySelector(
                "#district-form"
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
          <DistrictForm
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
          title="Delete District"
          description={`Are you sure you want to delete "${districtToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete District"
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

function DistrictForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial?: District;
  onCancel: () => void;
  onSubmit: (values: DistrictFormValues) => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DistrictFormValues>({
    resolver: zodResolver(districtSchema),
    defaultValues: {
      name: initial?.name || "",
      code: initial?.code || "",
      description: initial?.description || "",
      isActive: initial?.isActive ?? true,
    },
  });

  const isActive = watch("isActive");

  // Reset form when initial prop changes
  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name || "",
        code: initial.code || "",
        description: initial.description || "",
        isActive: initial.isActive ?? true,
      });
    } else {
      reset({
        name: "",
        code: "",
        description: "",
        isActive: true,
      });
    }
  }, [initial, reset]);

  return (
    <form
      id="district-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Name"
          required
          type="text"
          {...register("name")}
          error={errors.name?.message}
          disabled={submitting}
        />
        <Input
          label="Code"
          type="text"
          {...register("code")}
          error={errors.code?.message}
          disabled={submitting}
        />
      </div>

      <Select
        label="Status"
        options={[
          { value: "ACTIVE", label: "Active" },
          { value: "INACTIVE", label: "Inactive" },
        ]}
        value={isActive ? "ACTIVE" : "INACTIVE"}
        onChange={(value) => setValue("isActive", value === "ACTIVE")}
        disabled={submitting}
      />

      <Textarea
        label="Description"
        {...register("description")}
        error={errors.description?.message}
        placeholder="Optional description"
        disabled={submitting}
        rows={3}
      />
    </form>
  );
}
