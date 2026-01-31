"use client";

import { SubzoneSearch } from "@/app/dashboard/subzones/components/SubzoneSearch";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ColumnDef, DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import {
    createSubzone,
    deleteSubzone,
    getSubzones,
    toggleSubzoneStatus,
    updateSubzone,
    type Subzone,
    type UpdateSubzoneDto
} from "@/lib/api-subzones";
import { getZones } from "@/lib/api-zones";
import { subzoneSchema, type SubzoneFormValues } from "@/lib/schemas/subzone";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { SubzonesFilters } from "./components/SubzonesFilters";

export default function SubzonesPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [selectedSubzone, setSelectedSubzone] = useState<Subzone | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce({ value: searchTerm, delay: 250 });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [zoneFilter, setZoneFilter] = useState<string>("ALL");

  const queryClient = useQueryClient();

  // Fetch zones for dropdown
  const {
    data: zonesResp,
    isLoading: zonesLoading,
    error: zonesError,
    refetch: refetchZones,
  } = useQuery({
    queryKey: ["zones"],
    queryFn: () =>
      getZones({
        page: 1,
        limit: 1000,
      }),
    placeholderData: (previousData) => previousData,
  });

  // Fetch subzones once (high limit), filter and paginate client-side
  const {
    data: subzonesResp,
    isLoading: subzonesLoading,
    error: subzonesError,
    refetch: refetchSubzones,
  } = useQuery({
    queryKey: ["subzones"],
    queryFn: () =>
      getSubzones({
        page: 1,
        limit: 1000,
      }),
    placeholderData: (previousData) => previousData,
  });

  // Mutations
  const createSubzoneMutation = useMutation({
    mutationFn: createSubzone,
    onSuccess: () => {
      toast.success("Subzone created successfully!");
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ["subzones"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create subzone");
    },
  });

  const updateSubzoneMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubzoneDto }) =>
      updateSubzone(id, data),
    onSuccess: () => {
      toast.success("Subzone updated successfully!");
      setShowEditForm(false);
      setSelectedSubzone(null);
      queryClient.invalidateQueries({ queryKey: ["subzones"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update subzone");
    },
  });

  const deleteSubzoneMutation = useMutation({
    mutationFn: deleteSubzone,
    onSuccess: () => {
      toast.success("Subzone deleted successfully!");
      setShowDeleteConfirm(false);
      setSelectedSubzone(null);
      queryClient.invalidateQueries({ queryKey: ["subzones"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete subzone");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleSubzoneStatus,
    onSuccess: () => {
      toast.success("Subzone status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["subzones"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update subzone status"
      );
    },
  });

  // No-op

  // Handle form submission
  const handleSubmit = (values: SubzoneFormValues) => {
    if (showEditForm && selectedSubzone) {
      updateSubzoneMutation.mutate({
        id: selectedSubzone.id,
        data: values,
      });
    } else {
      createSubzoneMutation.mutate(values);
    }
  };

  // Handle edit
  const handleEdit = (subzone: Subzone) => {
    setSelectedSubzone(subzone);
    setShowEditForm(true);
  };

  // Handle delete
  const handleDelete = (subzone: Subzone) => {
    setSelectedSubzone(subzone);
    setShowDeleteConfirm(true);
  };

  // Handle status toggle
  const handleToggleStatus = (subzone: Subzone) => {
    toggleStatusMutation.mutate(subzone.id);
  };

  // Close modals
  const closeModals = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setShowDeleteConfirm(false);
    setSelectedSubzone(null);
  };

  // Reset to first page when search/status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, zoneFilter]);

  // Handle entries per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [entriesPerPage]);

  // Note: Keep hooks above; handle loading/error below hooks to preserve order

  const zonesAll = zonesResp?.data || [];
  const subzonesAll = subzonesResp?.data || [];

  // Client-side filter like Zones
  const filteredSubzones = useMemo(() => {
    let base = subzonesAll;

    // Filter by status
    if (statusFilter !== "ALL") {
      base = base.filter((s: Subzone) =>
        statusFilter === "ACTIVE" ? s.isActive : !s.isActive
      );
    }

    // Filter by zone
    if (zoneFilter !== "ALL") {
      base = base.filter((s: Subzone) => s.zoneId === zoneFilter);
    }

    // Filter by search
    if (!debouncedSearch) return base as Subzone[];
    const q = debouncedSearch.toLowerCase();
    return (base as Subzone[]).filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q) ||
        s.zone.name.toLowerCase().includes(q)
    );
  }, [subzonesAll, debouncedSearch, statusFilter, zoneFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredSubzones.slice(startIndex, endIndex);
  }, [filteredSubzones, currentPage, entriesPerPage]);

  const total = filteredSubzones.length;
  const totalPages = Math.ceil(total / entriesPerPage) || 1;

  if (subzonesLoading && !subzonesResp) {
    return <PageLoader message="Loading subzones..." />;
  }

  if (subzonesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Subzones
          </h2>
          <p className="text-gray-600 mb-4">
            {subzonesError instanceof Error
              ? subzonesError.message
              : "An unknown error occurred"}
          </p>
          <Button onClick={() => refetchSubzones()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Define table columns (uses client-side paginatedData like Zones)
  const columns: ColumnDef<Subzone, any>[] = [
    {
      id: "index",
      header: "#",
      enableSorting: false,
      cell: ({ row }) => {
        const rowNumber =
          (currentPage - 1) * entriesPerPage +
          (paginatedData as Subzone[]).indexOf(row.original) +
          1;
        return (
          <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {rowNumber}
          </div>
        );
      },
      columnClassName: "w-12 text-left",
      cellClassName: "text-left",
    },
    {
      id: "name",
      header: "Subzone",
      accessorKey: "name",
      enableSorting: true,
      cell: ({ original: s }) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {s.name}
          </div>
          {s.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {s.description}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "zone",
      header: "Zone",
      accessorKey: "zoneId",
      enableSorting: true,
      cell: ({ original: s }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
          {s.zone.name}
        </span>
      ),
      columnClassName: "text-left",
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "isActive",
      enableSorting: true,
      cell: ({ original: s }) => (
        <button
          onClick={() => handleToggleStatus(s)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            s.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {s.isActive ? "Active" : "Inactive"}
        </button>
      ),
      columnClassName: "text-left",
      cellClassName: "text-left",
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      enableSorting: true,
      cell: ({ original: s }) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(s.createdAt).toLocaleDateString()}
          </span>
        </div>
      ),
      columnClassName: "text-left",
      cellClassName: "text-left",
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ original: s }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(s)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(s)}
            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 theme-transition">
      <PageHeader
        title="Subzones"
        subtitle="Manage geographic subzones for client organization"
        actions={[
          {
            label: "New Subzone",
            icon: Plus,
            variant: "primary",
            onClick: () => setShowAddForm(true),
          },
        ]}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters - like Zones UI */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg mb-6 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <SubzonesFilters
                status={statusFilter}
                onChangeStatus={setStatusFilter}
                zoneId={zoneFilter}
                onChangeZoneId={setZoneFilter}
                zones={zonesAll}
                isLoading={subzonesLoading}
              />
            </div>
            <div className="lg:ml-auto">
              <SubzoneSearch
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={paginatedData}
          total={total}
          pageIndex={currentPage - 1}
          pageSize={entriesPerPage}
          pageCount={totalPages}
          onPageSizeChange={(size) => {
            setEntriesPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page + 1)}
          loading={subzonesLoading}
          emptyMessage={
            searchTerm ? "No subzones match your search." : "No subzones found."
          }
        />
      </div>

      {/* Add/Edit Subzone Modal */}
      <Modal
        isOpen={showAddForm || showEditForm}
        onClose={closeModals}
        title={showEditForm ? "Edit Subzone" : "Add New Subzone"}
        size="lg"
        footer={{
          cancelText: "Cancel",
          confirmText: showEditForm ? "Update Subzone" : "Create Subzone",
          onCancel: closeModals,
          onConfirm: () => {
            const form = document.querySelector(
              "#subzone-form"
            ) as HTMLFormElement;
            if (form) form.requestSubmit();
          },
          confirmVariant: "primary",
          isLoading:
            createSubzoneMutation.isPending || updateSubzoneMutation.isPending,
          disabled:
            createSubzoneMutation.isPending || updateSubzoneMutation.isPending,
        }}
      >
        <SubzoneForm
          initial={selectedSubzone || undefined}
          onSubmit={handleSubmit}
          zones={zonesAll}
          submitting={
            createSubzoneMutation.isPending || updateSubzoneMutation.isPending
          }
        />

        {/* Buttons moved to Modal footer */}
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          if (!selectedSubzone) return;
          setConfirmingDelete(true);
          deleteSubzoneMutation.mutate(selectedSubzone.id, {
            onSettled: () => {
              setConfirmingDelete(false);
              setShowDeleteConfirm(false);
            },
          } as any);
        }}
        title="Delete Subzone"
        description={`This action cannot be undone. This will permanently delete the subzone "${
          selectedSubzone?.name || ""
        }" and all associated data.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={confirmingDelete || deleteSubzoneMutation.isPending}
      />
    </div>
  );
}
function SubzoneForm({
  initial,
  onSubmit,
  zones,
  submitting,
}: {
  initial?: Subzone;
  onSubmit: (values: SubzoneFormValues) => void;
  zones: any[];
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubzoneFormValues>({
    resolver: zodResolver(subzoneSchema),
    defaultValues: {
      name: initial?.name || "",
      description: initial?.description || "",
      zoneId: initial?.zoneId || "",
    },
  });

  const zoneId = watch("zoneId");

  // Reset form when initial prop changes
  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name || "",
        description: initial.description || "",
        zoneId: initial.zoneId || "",
      });
    } else {
      reset({
        name: "",
        description: "",
        zoneId: "",
      });
    }
  }, [initial, reset]);

  return (
    <form
      id="subzone-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Subzone Name"
          required
          type="text"
          {...register("name")}
          placeholder="Enter subzone name"
          error={errors.name?.message}
          disabled={submitting}
        />

        <Select
          label="Zone"
          options={zones.map((zone) => ({
            value: zone.id,
            label: zone.name,
          }))}
          value={zoneId}
          onChange={(value) => setValue("zoneId", value)}
          placeholder="Select a zone"
          error={errors.zoneId?.message}
          required
          disabled={submitting}
        />
      </div>
      <Textarea
        label="Description"
        {...register("description")}
        placeholder="Optional description"
        error={errors.description?.message}
        rows={3}
        disabled={submitting}
      />
    </form>
  );
}
