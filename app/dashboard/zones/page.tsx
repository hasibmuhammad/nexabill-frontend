"use client";

import { ZoneSearch } from "@/app/dashboard/zones/components/ZoneSearch";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ColumnDef, DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import {
    createZone,
    deleteZone,
    getZones,
    toggleZoneStatus,
    updateZone,
    type UpdateZoneDto,
    type Zone
} from "@/lib/api-zones";
import { zoneSchema, type ZoneFormValues } from "@/lib/schemas/zone";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { ZonesFilters } from "./components/ZonesFilters";
 
export default function ZonesPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce({ value: searchTerm, delay: 250 });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const queryClient = useQueryClient();

  // Fetch zones once (high limit), filter and paginate client-side
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

  // Mutations
  const createZoneMutation = useMutation({
    mutationFn: createZone,
    onSuccess: () => {
      toast.success("Zone created successfully!");
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create zone");
    },
  });

  const updateZoneMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateZoneDto }) =>
      updateZone(id, data),
    onSuccess: () => {
      toast.success("Zone updated successfully!");
      setShowEditForm(false);
      setSelectedZone(null);
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update zone");
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: deleteZone,
    onSuccess: () => {
      toast.success("Zone deleted successfully!");
      setShowDeleteConfirm(false);
      setSelectedZone(null);
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete zone");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleZoneStatus,
    onSuccess: () => {
      toast.success("Zone status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update zone status"
      );
    },
  });

  // No-op

  // Handle form submission
  const handleSubmit = (values: ZoneFormValues) => {
    if (showEditForm && selectedZone) {
      updateZoneMutation.mutate({
        id: selectedZone.id,
        data: values,
      });
    } else {
      createZoneMutation.mutate(values);
    }
  };

  // Handle edit
  const handleEdit = (zone: Zone) => {
    setSelectedZone(zone);
    setShowEditForm(true);
  };

  // Handle delete
  const handleDelete = (zone: Zone) => {
    setSelectedZone(zone);
    setShowDeleteConfirm(true);
  };

  // Handle status toggle
  const handleToggleStatus = (zone: Zone) => {
    toggleStatusMutation.mutate(zone.id);
  };

  // Close modals
  const closeModals = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setShowDeleteConfirm(false);
    setSelectedZone(null);
  };

  // Reset to first page when search/status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Handle entries per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [entriesPerPage]);

  // Note: Keep hooks above; handle loading/error below hooks to preserve order

  const zonesAll = zonesResp?.data || [];

  // Client-side filter like Packages
  const filteredZones = useMemo(() => {
    const base =
      statusFilter === "ALL"
        ? zonesAll
        : zonesAll.filter((z: Zone) =>
            statusFilter === "ACTIVE" ? z.isActive : !z.isActive
          );

    if (!debouncedSearch) return base as Zone[];
    const q = debouncedSearch.toLowerCase();
    return (base as Zone[]).filter(
      (z) =>
        z.name.toLowerCase().includes(q) ||
        (z.code || "").toLowerCase().includes(q) ||
        (z.description || "").toLowerCase().includes(q)
    );
  }, [zonesAll, debouncedSearch, statusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredZones.slice(startIndex, endIndex);
  }, [filteredZones, currentPage, entriesPerPage]);

  const total = filteredZones.length;
  const totalPages = Math.ceil(total / entriesPerPage) || 1;

  if (zonesLoading && !zonesResp) {
    return <PageLoader message="Loading zones..." />;
  }

  if (zonesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Zones
          </h2>
          <p className="text-gray-600 mb-4">
            {zonesError instanceof Error
              ? zonesError.message
              : "An unknown error occurred"}
          </p>
          <Button onClick={() => refetchZones()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Define table columns (uses client-side paginatedData like Packages)
  const columns: ColumnDef<Zone, any>[] = [
    {
      id: "index",
      header: "#",
      enableSorting: false,
      cell: ({ row }) => {
        const rowNumber =
          (currentPage - 1) * entriesPerPage +
          (paginatedData as Zone[]).indexOf(row.original) +
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
      header: "Zone",
      accessorKey: "name",
      enableSorting: true,
      cell: ({ original: z }) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {z.name}
          </div>
          {z.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {z.description}
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
      cell: ({ original: z }) =>
        z.code ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {z.code}
          </span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        ),
      columnClassName: "text-left",
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "isActive",
      enableSorting: true,
      cell: ({ original: z }) => (
        <button
          onClick={() => handleToggleStatus(z)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            z.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {z.isActive ? "Active" : "Inactive"}
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
      cell: ({ original: z }) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(z.createdAt).toLocaleDateString()}
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
      cell: ({ original: z }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(z)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(z)}
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
        title="Zones"
        subtitle="Manage geographic zones for client organization"
        actions={[
          {
            label: "New Zone",
            icon: Plus,
            variant: "primary",
            onClick: () => setShowAddForm(true),
          },
        ]}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters - like Packages UI */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg mb-6 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <ZonesFilters
                status={statusFilter}
                onChangeStatus={setStatusFilter}
                isLoading={zonesLoading}
              />
            </div>
            <div className="lg:ml-auto">
              <ZoneSearch
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
          loading={zonesLoading}
          emptyMessage={
            searchTerm ? "No zones match your search." : "No zones found."
          }
        />
      </div>

      {/* Add/Edit Zone Modal */}
      <Modal
        isOpen={showAddForm || showEditForm}
        onClose={closeModals}
        title={showEditForm ? "Edit Zone" : "Add New Zone"}
        size="lg"
        footer={{
          cancelText: "Cancel",
          confirmText: showEditForm ? "Update Zone" : "Create Zone",
          onCancel: closeModals,
          onConfirm: () => {
            const form = document.querySelector(
              "#zone-form"
            ) as HTMLFormElement;
            if (form) form.requestSubmit();
          },
          confirmVariant: "primary",
          isLoading:
            createZoneMutation.isPending || updateZoneMutation.isPending,
          disabled:
            createZoneMutation.isPending || updateZoneMutation.isPending,
        }}
      >
        <ZoneForm
          initial={selectedZone || undefined}
          onSubmit={handleSubmit}
          submitting={
            createZoneMutation.isPending || updateZoneMutation.isPending
          }
        />

        {/* Buttons moved to Modal footer */}
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          if (!selectedZone) return;
          setConfirmingDelete(true);
          deleteZoneMutation.mutate(selectedZone.id, {
            onSettled: () => {
              setConfirmingDelete(false);
              setShowDeleteConfirm(false);
            },
          } as any);
        }}
        title="Delete Zone"
        description={`This action cannot be undone. This will permanently delete the zone "${
          selectedZone?.name || ""
        }" and all associated data.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={confirmingDelete || deleteZoneMutation.isPending}
      />
    </div>
  );
}
function ZoneForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Zone;
  onSubmit: (values: ZoneFormValues) => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: initial?.name || "",
      code: initial?.code || "",
      description: initial?.description || "",
    },
  });

  // Reset form when initial prop changes
  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name || "",
        code: initial.code || "",
        description: initial.description || "",
      });
    } else {
      reset({
        name: "",
        code: "",
        description: "",
      });
    }
  }, [initial, reset]);

  return (
    <form
      id="zone-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Zone Name"
          required
          type="text"
          {...register("name")}
          placeholder="Enter zone name"
          error={errors.name?.message}
          disabled={submitting}
        />
        <Input
          label="Zone Code"
          type="text"
          {...register("code")}
          placeholder="Enter zone code (optional)"
          error={errors.code?.message}
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
