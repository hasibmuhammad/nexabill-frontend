"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Types
export interface ColumnDef<TData, TValue> {
  accessorKey?: keyof TData;
  accessorFn?: (originalRow: TData) => TValue;
  id: string;
  header: string;
  cell?: (info: {
    row: Row<TData>;
    getValue: () => TValue;
    original: TData;
  }) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
  size?: number;
  minSize?: number;
  maxSize?: number;
  columnClassName?: string; // For table header styling (width, alignment, etc.)
  cellClassName?: string; // For table cell styling (alignment, etc.)
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // Pagination
  pageSize?: number;
  pageIndex?: number;
  pageCount?: number;
  total?: number; // Add total prop for accurate pagination info
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  // Sorting
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  // Selection
  enableRowSelection?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selectedRows: Set<string>) => void;
  getRowId?: (row: TData) => string;
  // Actions
  actions?: React.ReactNode;
  bulkActions?: React.ReactNode;
  // Customization
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  loading?: boolean;
  error?: string | null;
  // Styling
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
}

export interface Row<TData> {
  id: string;
  original: TData;
  getValue: (key: string) => any;
  getSelected: () => boolean;
  toggleSelected: (value?: boolean) => void;
}

export interface TableState {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting: {
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  rowSelection: Set<string>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  pageIndex = 0,
  pageCount = 1,
  total,
  onPageChange,
  onPageSizeChange,

  sortBy,
  sortOrder = "asc",
  onSortChange,
  enableRowSelection = false,
  selectedRows = new Set(),
  onSelectionChange,
  getRowId = (row: TData) => (row as any).id,
  actions,
  bulkActions,
  title,
  subtitle,
  emptyMessage = "No data found",
  loading = false,
  error = null,
  className,
  striped = true,
  hoverable = true,
}: DataTableProps<TData, TValue>) {
  // Calculate dynamic sticky positions based on content
  const hasTitleOrActions = !!(title || subtitle || actions);
  const hasBulkActions =
    enableRowSelection && selectedRows.size > 0 && bulkActions;

  // Base offset from page header (adjust this based on your page layout)
  const baseOffset = 85;

  // Calculate positions dynamically
  const titleAreaHeight = hasTitleOrActions ? 72 : 0; // ~72px for title/actions area
  const bulkActionsHeight = hasBulkActions ? 67 : 0; // ~64px for bulk actions

  const [localSortBy, setLocalSortBy] = React.useState(sortBy);
  const [localSortOrder, setLocalSortOrder] = React.useState(sortOrder);
  const [localPageIndex, setLocalPageIndex] = React.useState(pageIndex);
  const [localPageSize, setLocalPageSize] = React.useState(pageSize);
  const [localSelectedRows, setLocalSelectedRows] =
    React.useState(selectedRows);

  // Sync local state with props
  React.useEffect(() => {
    setLocalSortBy(sortBy);
  }, [sortBy]);

  React.useEffect(() => {
    setLocalSortOrder(sortOrder);
  }, [sortOrder]);

  React.useEffect(() => {
    setLocalPageIndex(pageIndex);
  }, [pageIndex]);

  React.useEffect(() => {
    setLocalPageSize(pageSize);
  }, [pageSize]);

  // Fix infinite loop by checking if selectedRows actually changed
  React.useEffect(() => {
    if (
      selectedRows.size !== localSelectedRows.size ||
      !Array.from(selectedRows).every((id) => localSelectedRows.has(id))
    ) {
      setLocalSelectedRows(selectedRows);
    }
  }, [selectedRows, localSelectedRows]);

  // Handle sorting
  const handleSort = React.useCallback(
    (key: string) => {
      const newSortOrder =
        localSortBy === key && localSortOrder === "asc" ? "desc" : "asc";
      setLocalSortBy(key);
      setLocalSortOrder(newSortOrder);
      if (onSortChange) {
        onSortChange(key, newSortOrder);
      }
    },
    [localSortBy, localSortOrder, onSortChange]
  );

  // Handle pagination
  const handlePageChange = React.useCallback(
    (page: number) => {
      setLocalPageIndex(page);
      if (onPageChange) {
        onPageChange(page);
      }
    },
    [onPageChange]
  );

  const handlePageSizeChange = React.useCallback(
    (size: number) => {
      setLocalPageSize(size);
      setLocalPageIndex(0); // Reset to first page
      if (onPageSizeChange) {
        onPageSizeChange(size);
      }
    },
    [onPageSizeChange]
  );

  // Handle row selection
  const handleSelectAll = React.useCallback(() => {
    if (localSelectedRows.size === data.length && data.length > 0) {
      const newSelection = new Set<string>();
      setLocalSelectedRows(newSelection);
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
    } else {
      const newSelection = new Set(data.map((row) => getRowId(row)));
      setLocalSelectedRows(newSelection);
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
    }
  }, [data, localSelectedRows.size, getRowId, onSelectionChange]);

  const handleRowSelection = React.useCallback(
    (rowId: string, selected: boolean) => {
      const newSelection = new Set(localSelectedRows);
      if (selected) {
        newSelection.add(rowId);
      } else {
        newSelection.delete(rowId);
      }
      setLocalSelectedRows(newSelection);
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
    },
    [localSelectedRows, onSelectionChange]
  );

  // Create rows with selection state
  const rows: Row<TData>[] = React.useMemo(() => {
    return data.map((row, index) => {
      const id = getRowId(row);
      return {
        id,
        original: row,
        getValue: (key: string) => {
          const column = columns.find((col) => col.id === key);
          if (column?.accessorKey) {
            return (row as any)[column.accessorKey];
          }
          if (column?.accessorFn) {
            return column.accessorFn(row);
          }
          return undefined;
        },
        getSelected: () => localSelectedRows.has(id),
        toggleSelected: (value?: boolean) => {
          const newValue = value ?? !localSelectedRows.has(id);
          handleRowSelection(id, newValue);
        },
      };
    });
  }, [data, columns, getRowId, localSelectedRows, handleRowSelection]);

  // Render cell content
  const renderCell = React.useCallback(
    (row: Row<TData>, column: ColumnDef<TData, TValue>) => {
      if (column.cell) {
        return column.cell({
          row,
          getValue: () => row.getValue(column.id),
          original: row.original,
        });
      }

      const value = row.getValue(column.id);
      if (value === null || value === undefined) {
        return <span className="text-muted-foreground">-</span>;
      }

      if (typeof value === "string") {
        return <span>{value}</span>;
      }

      if (typeof value === "number") {
        return <span>{value.toLocaleString()}</span>;
      }

      if (typeof value === "boolean") {
        return <span>{value ? "Yes" : "No"}</span>;
      }

      return <span>{String(value)}</span>;
    },
    []
  );

  // Pagination controls
  const canGoPrevious = localPageIndex > 0;
  const canGoNext = localPageIndex < pageCount - 1;

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </div>
        <div className="rounded-md border">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </div>
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-8 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full flex flex-col max-w-full", className)}>
      {/* Header */}
      <div className="rounded-t-lg flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="space-y-1">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          )}
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        {actions}
      </div>

      {/* Bulk Actions */}
      {hasBulkActions && (
        <div
          style={{ top: `${baseOffset + titleAreaHeight}px` }}
          className="sticky z-30 flex items-center justify-between bg-white dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 p-4"
        >
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {localSelectedRows.size} row(s) selected
          </span>
          {bulkActions}
        </div>
      )}

      {/* Single Table with Sticky Header */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-white dark:bg-slate-800 flex-1 flex flex-col overflow-hidden">
          <div className="w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-white dark:bg-slate-800">
                  {enableRowSelection && (
                    <TableHead className="w-12 bg-white dark:bg-slate-800 px-3 py-4 text-center">
                      <div className="flex items-center justify-center h-12">
                        <Checkbox
                          checked={
                            localSelectedRows.size === data.length &&
                            data.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                          className="h-4 w-4 rounded border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white hover:border-slate-400 dark:hover:border-slate-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                        />
                      </div>
                    </TableHead>
                  )}
                  {columns.map((column) => (
                    <TableHead
                      key={column.id}
                      className={cn(
                        "bg-white dark:bg-slate-800 px-6 py-4 font-medium text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700",
                        column.columnClassName || "text-left"
                      )}
                      onClick={() =>
                        column.enableSorting && handleSort(column.id)
                      }
                    >
                      <div
                        className={cn(
                          "flex items-center",
                          column.columnClassName?.includes("text-center")
                            ? "justify-center"
                            : column.columnClassName?.includes("text-right")
                            ? "justify-end"
                            : "justify-start"
                        )}
                      >
                        <span className="font-semibold">{column.header}</span>
                        {column.enableSorting && (
                          <div className="flex items-center ml-2">
                            {localSortBy === column.id ? (
                              <span className="inline-flex text-blue-600 dark:text-blue-400">
                                {localSortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </span>
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500 opacity-50" />
                            )}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (enableRowSelection ? 1 : 0)}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <div className="w-6 h-6 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                          {emptyMessage}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, rowIndex) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getSelected() ? "selected" : undefined}
                      className={cn(
                        "border-slate-200 dark:border-slate-700 transition-colors duration-200",
                        striped &&
                          rowIndex % 2 === 1 &&
                          "bg-slate-50/50 dark:bg-slate-700/30",
                        hoverable &&
                          "hover:bg-slate-100/50 dark:hover:bg-slate-700/50",
                        row.getSelected() && "bg-blue-50/50 dark:bg-blue-900/20"
                      )}
                    >
                      {enableRowSelection && (
                        <TableCell className="w-12 px-3 py-4 border-slate-200 dark:border-slate-700 text-center">
                          <Checkbox
                            checked={row.getSelected()}
                            onCheckedChange={(checked) =>
                              row.toggleSelected(checked as boolean)
                            }
                            aria-label={`Select row ${rowIndex + 1}`}
                            className="h-4 w-4 rounded border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white hover:border-slate-400 dark:hover:border-slate-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          className={cn(
                            "px-6 py-4 border-slate-200 dark:border-slate-700",
                            column.cellClassName || "text-left"
                          )}
                        >
                          <div
                            className={cn(
                              column.cellClassName?.includes("text-center")
                                ? "text-center"
                                : column.cellClassName?.includes("text-right")
                                ? "text-right"
                                : "text-left"
                            )}
                          >
                            {renderCell(row, column)}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Sticky Pagination */}
      {data.length > 0 && (
        <div className="rounded-b-lg sticky bottom-0 z-10 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Show
              </span>
              <div className="relative">
                <select
                  value={localPageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="h-9 px-3 py-2 pr-8 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 appearance-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Pagination Info */}
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Showing{" "}
              <span className="font-semibold">
                {localPageIndex * localPageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(
                  (localPageIndex + 1) * localPageSize,
                  total || data.length
                )}
              </span>{" "}
              of <span className="font-semibold">{total || data.length}</span>{" "}
              entries
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(0)}
              disabled={!canGoPrevious}
              className="h-9 w-9 p-0 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(localPageIndex - 1)}
              disabled={!canGoPrevious}
              className="h-9 w-9 p-0 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                let pageNum;
                if (pageCount <= 5) {
                  pageNum = i;
                } else if (localPageIndex < 3) {
                  pageNum = i;
                } else if (localPageIndex > pageCount - 3) {
                  pageNum = pageCount - 5 + i;
                } else {
                  pageNum = localPageIndex - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={localPageIndex === pageNum ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="h-9 w-9 p-0 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(localPageIndex + 1)}
              disabled={!canGoNext}
              className="h-9 w-9 p-0 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pageCount - 1)}
              disabled={!canGoNext}
              className="h-9 w-9 p-0 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
