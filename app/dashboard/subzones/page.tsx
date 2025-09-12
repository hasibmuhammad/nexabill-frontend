"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import PageLoader from "@/components/ui/page-loader";
import {
  getSubzones,
  type CreateSubzoneDto,
  type Subzone,
} from "@/lib/api-subzones";
import { getZones, Zone } from "@/lib/api-zones";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

export default function SubzonesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Subzone | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState<CreateSubzoneDto>({
    name: "",
    code: "",
    description: "",
    zoneId: "",
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch zones for dropdown
  const { data: zonesData } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const response = await getZones({ limit: 1000 });
      return response.data || [];
    },
  });

  // Fetch subzones
  const { data: subzonesData, isLoading } = useQuery({
    queryKey: ["subzones", currentPage, entriesPerPage, debouncedSearch],
    queryFn: async () => {
      const response = await getSubzones({
        page: currentPage,
        limit: entriesPerPage,
        search: debouncedSearch || undefined,
      });
      return response;
    },
  });

  const subzones = subzonesData?.data || [];
  const total = subzonesData?.meta?.total || 0;
  const totalPages = subzonesData?.meta?.totalPages || 1;

  // Close form
  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    resetForm();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle entries per page change
  const handleEntriesPerPageChange = (value: string) => {
    const newEntriesPerPage = parseInt(value);
    setEntriesPerPage(newEntriesPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const filtered = useMemo(() => {
    if (!subzones) return [] as Subzone[];
    if (!debouncedSearch) return subzones;
    const q = debouncedSearch.toLowerCase();
    return subzones.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.code && s.code.toLowerCase().includes(q))
    );
  }, [subzones, debouncedSearch]);

  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, filtered.length);

  const createMut = useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      zoneId: string;
      isActive: boolean;
    }) => {
      // TODO: Replace with actual API call
      console.log("Creating subzone:", data);
      const zone = zonesData?.find((z) => z.id === data.zoneId);
      return {
        id: "temp-" + Date.now(),
        ...data,
        zoneName: zone?.name || "Unknown Zone",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subzones"] });
      setShowForm(false);
      toast.success("Subzone created successfully");
    },
    onError: () => {
      toast.error("Failed to create subzone");
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        description?: string;
        zoneId: string;
        isActive: boolean;
      };
    }) => {
      // TODO: Replace with actual API call
      console.log("Updating subzone:", id, data);
      const zone = zonesData?.find((z) => z.id === data.zoneId);
      return {
        id,
        ...data,
        zoneName: zone?.name || "Unknown Zone",
        updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subzones"] });
      setShowForm(false);
      setEditing(null);
      toast.success("Subzone updated successfully");
    },
    onError: () => {
      toast.error("Failed to update subzone");
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Replace with actual API call
      console.log("Deleting subzone:", id);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subzones"] });
      toast.success("Subzone deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete subzone");
    },
  });

  const startEdit = (subzone: Subzone) => {
    setEditing(subzone);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      zoneId: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 theme-transition">
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Subzones
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage service subzones
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["subzones"] })
                }
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
              <Button
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> New Subzone
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <PageLoader message="Loading subzones..." />
        ) : (
          <>
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search subzones by name, description, or zone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Show entries:
                  </span>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => handleEntriesPerPageChange(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                  </select>
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
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Zone
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
                    {filtered.map((subzone, index) => (
                      <tr
                        key={subzone.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {startEntry + index}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {subzone.name}
                          </div>
                          {subzone.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {subzone.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          {subzone.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                            {subzone.zone.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              subzone.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {subzone.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          {new Date(subzone.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(subzone)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Are you sure you want to delete this subzone?"
                                  )
                                ) {
                                  deleteMut.mutate(subzone.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-700"
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
                  Showing {startEntry} to {endEntry} of {filtered.length}{" "}
                  entries
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
          title={editing ? "Edit Subzone" : "New Subzone"}
          size="md"
          footer={{
            cancelText: "Cancel",
            confirmText: editing ? "Update Subzone" : "Create Subzone",
            onCancel: () => {
              setShowForm(false);
              setEditing(null);
            },
            onConfirm: () => {
              const form = document.querySelector(
                "#subzone-form"
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
          <SubzoneForm
            zones={zonesData || []}
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
      </div>
    </div>
  );
}

function SubzoneForm({
  zones,
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  zones: Zone[];
  initial?: Subzone;
  onCancel: () => void;
  onSubmit: (values: {
    name: string;
    description?: string;
    zoneId: string;
    isActive: boolean;
  }) => void;
  submitting?: boolean;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [zoneId, setZoneId] = useState(initial?.zoneId || "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Subzone name is required");
      return;
    }
    if (!zoneId) {
      toast.error("Please select a zone");
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      zoneId,
      isActive,
    });
  };

  return (
    <form id="subzone-form" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Subzone Name *
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter subzone name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description
        </label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Zone *
        </label>
        <select
          value={zoneId}
          onChange={(e) => setZoneId(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select a zone</option>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>
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
