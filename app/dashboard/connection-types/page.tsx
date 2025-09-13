"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import PageLoader from "@/components/ui/page-loader";
import { Textarea } from "@/components/ui/textarea";
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

interface ConnectionType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ConnectionTypesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ConnectionType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Mock data for now - replace with actual API calls
  const { data: connectionTypes, isLoading } = useQuery({
    queryKey: ["connectionTypes"],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // Generate mock data for testing
      const mockConnectionTypes: ConnectionType[] = Array.from(
        { length: 120 },
        (_, i) => ({
          id: `connection-${i + 1}`,
          name: `Connection Type ${i + 1}`,
          description: `Description for Connection Type ${i + 1}`,
          isActive: Math.random() > 0.3,
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
      );
      return mockConnectionTypes;
    },
  });

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
  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, filtered.length);

  const createMut = useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      isActive: boolean;
    }) => {
      // TODO: Replace with actual API call
      console.log("Creating connection type:", data);
      return {
        id: "temp-" + Date.now(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionTypes"] });
      setShowForm(false);
      toast.success("Connection type created successfully");
    },
    onError: () => {
      toast.error("Failed to create connection type");
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; description?: string; isActive: boolean };
    }) => {
      // TODO: Replace with actual API call
      console.log("Updating connection type:", id, data);
      return { id, ...data, updatedAt: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionTypes"] });
      setShowForm(false);
      setEditing(null);
      toast.success("Connection type updated successfully");
    },
    onError: () => {
      toast.error("Failed to update connection type");
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Replace with actual API call
      console.log("Deleting connection type:", id);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionTypes"] });
      toast.success("Connection type deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete connection type");
    },
  });

  const startEdit = (connectionType: ConnectionType) => {
    setEditing(connectionType);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 theme-transition">
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Connection Types
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage network connection types
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["connectionTypes"],
                  })
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
                <Plus className="h-4 w-4 mr-2" /> New Connection Type
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <PageLoader message="Loading connection types..." />
        ) : (
          <>
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search connection types by name or description..."
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
                    {paginatedData.map((connectionType, index) => (
                      <tr
                        key={connectionType.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {startEntry + index}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {connectionType.name}
                          </div>
                          {connectionType.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {connectionType.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          {connectionType.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              connectionType.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {connectionType.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          {new Date(
                            connectionType.createdAt
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(connectionType)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Are you sure you want to delete this connection type?"
                                  )
                                ) {
                                  deleteMut.mutate(connectionType.id);
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
          title={editing ? "Edit Connection Type" : "New Connection Type"}
          size="md"
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
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Connection type name is required");
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      isActive,
    });
  };

  return (
    <form
      id="connection-type-form"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Connection Type Name *
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter connection type name"
          required
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
