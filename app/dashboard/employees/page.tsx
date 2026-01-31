"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ColumnDef, DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useDataTable } from "@/hooks/use-data-table";
import { useDebounce } from "@/hooks/use-debounce";
import {
    createEmployee,
    deleteEmployee,
    getEmployees,
    updateEmployee,
    type Employee as ApiEmployee,
} from "@/lib/api-employees";
import { employeeSchema, type EmployeeFormValues } from "@/lib/schemas/employee";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Edit, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { EmployeeSearch } from "./components/EmployeeSearch";
import { EmployeesFilters } from "./components/EmployeesFilters";

type Employee = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  designation: "ENGINEER" | "TECHNICIAN" | "BILL_COLLECTOR";
  status: "ACTIVE" | "INACTIVE";
  salary?: string;
};

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const dataTable = useDataTable<Employee>({
    initialPageSize: 10,
    initialPageIndex: 0,
    initialSearch: "",
    initialSortBy: "name",
    initialSortOrder: "asc",
  });
  const [filters, setFilters] = useState<{
    status: string;
    designation: string;
  }>({ status: "", designation: "" });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null
  );
  const debouncedSearch = useDebounce({ value: dataTable.search, delay: 250 });
  const {
    data: employeesResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "employees",
      dataTable.pageIndex,
      dataTable.pageSize,
      debouncedSearch,
      filters.status,
    ],
    queryFn: async () => {
      const isActiveParam = filters.status
        ? filters.status === "ACTIVE"
        : undefined;
      const res = await getEmployees({
        page: dataTable.pageIndex + 1,
        limit: dataTable.pageSize,
        search: debouncedSearch.trim() || undefined,
        isActive: isActiveParam,
      });
      return res;
    },
  });

  useEffect(() => {
    dataTable.setPageIndex(0);
  }, [debouncedSearch, filters.status, filters.designation]);

  const serverEmployees: Employee[] = useMemo(() => {
    const list = (employeesResponse?.data || []) as ApiEmployee[];
    return list.map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      phone: e.phone,
      designation: e.designation,
      salary: e.salary,
      status: e.isActive ? "ACTIVE" : "INACTIVE",
    }));
  }, [employeesResponse]);

  const employees = useMemo(() => {
    if (!filters.designation) return serverEmployees;
    return serverEmployees.filter((e) => e.designation === filters.designation);
  }, [serverEmployees, filters.designation]);

  const totalCount = employeesResponse?.meta?.total || employees.length || 0;
  const totalPages = employeesResponse?.meta?.totalPages || 1;

  const createMut = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success("Employee created");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create employee"
      );
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateEmployee(id, data),
    onSuccess: () => {
      toast.success("Employee updated");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update employee"
      );
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      toast.success("Employee deleted");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete employee"
      );
    },
  });

  const filtered = useMemo(() => employees, [employees]);

  const startEdit = (emp: Employee) => {
    setEditing(emp);
    setShowForm(true);
  };

  const handleDeleteClick = (emp: Employee) => {
    setEmployeeToDelete(emp);
    setShowDeleteConfirm(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);
  };

  const handlePageChange = dataTable.setPageIndex;
  const handleEntriesPerPageChange = dataTable.setPageSize;

  const columns: ColumnDef<Employee, any>[] = [
    {
      id: "index",
      header: "#",
      enableSorting: false,
      cell: ({ row }) => {
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
    { id: "name", header: "Name", accessorKey: "name", enableSorting: true },
    { id: "email", header: "Email", accessorKey: "email", enableSorting: true },
    {
      id: "salary",
      header: "Salary",
      accessorKey: "salary",
      enableSorting: false,
      cell: ({ original }) => (
        <span className="text-xs text-slate-900 dark:text-white">
          {original.salary
            ? `৳${Number(original.salary).toLocaleString()}`
            : "-"}
        </span>
      ),
    },
    {
      id: "designation",
      header: "Designation",
      accessorKey: "designation",
      enableSorting: true,
      cell: ({ original }) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {original.designation.replace("_", " ")}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      enableSorting: true,
      cell: ({ original }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            original.status === "ACTIVE"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
          }`}
        >
          {original.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ original }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => startEdit(original)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(original)}
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
        title="Employees"
        subtitle="Manage your team members and their designations"
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
              toast.success("Exporting employee data...");
              const csv =
                "data:text/csv;charset=utf-8," +
                "Name,Email,Designation,Salary,Status\n" +
                employees
                  .map(
                    (e) =>
                      `${e.name},${e.email},${e.designation},${
                        e.salary || ""
                      },${e.status}`
                  )
                  .join("\n");
              const link = document.createElement("a");
              link.href = encodeURI(csv);
              link.download = "employees.csv";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            },
          },
          {
            label: "New Employee",
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
        {/* Search and Filters - Side by Side (standardized) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg mb-6 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <EmployeesFilters
                filters={filters}
                onFilterChange={(key, value) =>
                  setFilters((prev) => ({ ...prev, [key]: value }))
                }
                isLoading={isLoading}
              />
            </div>
            <div className="lg:ml-auto">
              <EmployeeSearch
                searchValue={dataTable.search}
                onSearchChange={dataTable.setSearch}
              />
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          total={totalCount}
          pageIndex={dataTable.pageIndex}
          pageSize={dataTable.pageSize}
          pageCount={totalPages}
          onPageSizeChange={handleEntriesPerPageChange}
          onPageChange={handlePageChange}
          loading={isLoading}
          emptyMessage="No employees found."
        />

        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          title={editing ? "Edit Employee" : "New Employee"}
          size="lg"
          footer={{
            cancelText: "Cancel",
            confirmText: editing ? "Update" : "Create",
            onCancel: () => {
              setShowForm(false);
              setEditing(null);
            },
            onConfirm: () => {
              const form = document.querySelector(
                "#employee-form"
              ) as HTMLFormElement;
              if (form) form.requestSubmit();
            },
            confirmVariant: "primary",
          }}
        >
          <EmployeeForm
            initial={editing || undefined}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            onSubmit={(values) => {
              const data = {
                name: values.name,
                email: values.email || undefined,
                phone: values.phone,
                designation: values.designation,
                salary: values.salary,
                isActive: values.status === "ACTIVE",
              };

              if (editing) {
                updateMut.mutate({
                  id: editing.id,
                  data,
                });
              } else {
                createMut.mutate(data);
              }
            }}
          />
        </Modal>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Employee"
          description={`Are you sure you want to delete "${employeeToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => {
            if (!employeeToDelete) return;
            deleteMut.mutate(employeeToDelete.id);
            setShowDeleteConfirm(false);
            setEmployeeToDelete(null);
          }}
          onCancel={handleDeleteCancel}
          confirmVariant="danger"
          tone="danger"
        />
      </div>
    </div>
  );
}

function EmployeeForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial?: Employee;
  onCancel: () => void;
  onSubmit: (values: EmployeeFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: initial?.name || "",
      email: initial?.email || "",
      phone: initial?.phone || "",
      salary: initial?.salary || "",
      designation: initial?.designation || ("" as any),
      status: (initial?.status || "ACTIVE") as any,
    },
  });

  const designation = watch("designation");
  const status = watch("status");

  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name || "",
        email: initial.email || "",
        phone: initial.phone || "",
        salary: initial.salary || "",
        designation: initial.designation as any,
        status: (initial.status || "ACTIVE") as any,
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        salary: "",
        designation: "" as any,
        status: "ACTIVE",
      });
    }
  }, [initial, reset]);

  return (
    <form
      id="employee-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Name"
          required
          {...register("name")}
          error={errors.name?.message}
        />
        <Input
          type="text"
          required
          label="Phone"
          {...register("phone")}
          error={errors.phone?.message}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          required
          label="Salary (৳)"
          type="text"
          {...register("salary")}
          placeholder="e.g., 30000"
          error={errors.salary?.message}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          required
          showSearch={false}
          label="Designation"
          position="top"
          value={designation}
          onChange={(v) => {
            setValue("designation", v as any);
          }}
          options={[
            { value: "ENGINEER", label: "Engineer" },
            { value: "TECHNICIAN", label: "Technician" },
            { value: "BILL_COLLECTOR", label: "Bill Collector" },
          ]}
          error={errors.designation?.message}
        />
        <Select
          showSearch={false}
          position="top"
          label="Status"
          value={status}
          onChange={(v) => setValue("status", v as any)}
          options={[
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ]}
        />
      </div>
    </form>
  );
}
