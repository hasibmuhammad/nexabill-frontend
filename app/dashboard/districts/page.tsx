"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import PageLoader from "@/components/ui/page-loader";
import { Textarea } from "@/components/ui/textarea";
import {
  createDistrict,
  deleteDistrict,
  getDistricts,
  toggleDistrictStatus,
  updateDistrict,
  type CreateDistrictDto,
  type District,
  type UpdateDistrictDto,
} from "@/lib/api-districts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function DistrictsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<District | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, isActiveFilter]);

  // Fetch districts data
  const {
    data: districtsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "districts",
      currentPage,
      entriesPerPage,
      debouncedSearch,
      isActiveFilter,
    ],
    queryFn: () =>
      getDistricts({
        page: currentPage,
        limit: entriesPerPage,
        search: debouncedSearch || undefined,
        isActive: isActiveFilter,
      }),
    placeholderData: (previousData) => previousData,
  });

  const districts = districtsData?.data || [];
  const total = districtsData?.meta?.total || 0;
  const totalPages = districtsData?.meta?.totalPages || 0;

  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, total);

  const createMut = useMutation({
    mutationFn: createDistrict,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      setShowForm(false);
      toast.success("District created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create district"
      );
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDistrictDto }) =>
      updateDistrict(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      setShowForm(false);
      setEditing(null);
      toast.success("District updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update district"
      );
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteDistrict,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      toast.success("District deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete district"
      );
    },
  });

  const toggleStatusMut = useMutation({
    mutationFn: toggleDistrictStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      toast.success("District status updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update district status"
      );
    },
  });

  const startEdit = (district: District) => {
    setEditing(district);
    setShowForm(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEntriesPerPageChange = (value: string) => {
    const newEntriesPerPage = parseInt(value);
    setEntriesPerPage(newEntriesPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handleStatusToggle = (district: District) => {
    toggleStatusMut.mutate(district.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 theme-transition">
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Districts
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage service districts
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> New District
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && currentPage === 1 ? (
          <PageLoader message="Loading districts..." />
        ) : (
          <>
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search districts by name, code or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Status:
                    </span>
                    <select
                      value={
                        isActiveFilter === undefined
                          ? ""
                          : isActiveFilter.toString()
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setIsActiveFilter(
                          value === "" ? undefined : value === "true"
                        );
                      }}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Show entries:
                    </span>
                    <select
                      value={entriesPerPage}
                      onChange={(e) =>
                        handleEntriesPerPageChange(e.target.value)
                      }
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {districts.map((district, index) => (
                      <tr
                        key={district.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {startEntry + index}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {district.name}
                          </div>
                          {district.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {district.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          {district.code || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          {district.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              district.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {district.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          {new Date(district.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(district)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusToggle(district)}
                              disabled={toggleStatusMut.isPending}
                              className={
                                district.isActive
                                  ? "text-orange-600 hover:text-orange-700"
                                  : "text-green-600 hover:text-green-700"
                              }
                            >
                              {district.isActive ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Are you sure you want to delete this district? This action cannot be undone."
                                  )
                                ) {
                                  deleteMut.mutate(district.id);
                                }
                              }}
                              disabled={deleteMut.isPending}
                              className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {startEntry} to {endEntry} of {total} entries
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "primary" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}

        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          title={editing ? "Edit District" : "New District"}
          size="md"
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
                // Remove isActive from create operation as it's not in CreateDistrictDto
                const { isActive, ...createData } = values;
                createMut.mutate(createData);
              }
            }}
            submitting={createMut.isPending || updateMut.isPending}
          />
        </Modal>
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
  onSubmit: (values: CreateDistrictDto & { isActive?: boolean }) => void;
  submitting?: boolean;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [code, setCode] = useState(initial?.code || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("District name is required");
      return;
    }
    onSubmit({
      name: name.trim(),
      code: code.trim() || undefined,
      description: description.trim() || undefined,
      isActive,
    });
  };

  return (
    <form id="district-form" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          District Name *
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter district name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          District Code
        </label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter district code (optional)"
        />
      </div>

      <div>
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description (optional)"
          rows={3}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
        />
        <label
          htmlFor="isActive"
          className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
        >
          Active
        </label>
      </div>
    </form>
  );
}
