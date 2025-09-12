import { TableState } from "@/components/ui/data-table";
import { useCallback, useMemo, useState } from "react";

export interface UseDataTableProps<TData> {
  initialPageSize?: number;
  initialPageIndex?: number;
  initialSearch?: string;
  initialSortBy?: string;
  initialSortOrder?: "asc" | "desc";
  initialSelectedRows?: Set<string>;
}

export function useDataTable<TData>({
  initialPageSize = 10,
  initialPageIndex = 0,
  initialSearch = "",
  initialSortBy = "",
  initialSortOrder = "asc",
  initialSelectedRows = new Set(),
}: UseDataTableProps<TData> = {}) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);
  const [selectedRows, setSelectedRows] = useState(initialSelectedRows);

  const handlePageChange = useCallback((page: number) => {
    setPageIndex(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPageIndex(0); // Reset to first page
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPageIndex(0); // Reset to first page when searching
  }, []);

  const handleSortChange = useCallback((key: string, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
  }, []);

  const handleSelectionChange = useCallback((rows: Set<string>) => {
    setSelectedRows(rows);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const toggleSelection = useCallback((rowId: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((rowIds: string[]) => {
    setSelectedRows(new Set(rowIds));
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setSortBy("");
    setSortOrder("asc");
    setPageIndex(0);
  }, []);

  const tableState = useMemo<TableState>(
    () => ({
      pagination: {
        pageIndex,
        pageSize,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
      rowSelection: selectedRows,
    }),
    [pageIndex, pageSize, sortBy, sortOrder, selectedRows]
  );

  return {
    // State
    pageSize,
    pageIndex,
    search,
    sortBy,
    sortOrder,
    selectedRows,
    tableState,

    // Handlers
    setPageSize: handlePageSizeChange,
    setPageIndex: handlePageChange,
    setSearch: handleSearchChange,
    setSortBy: (key: string) => handleSortChange(key, sortOrder),
    setSortOrder: (order: "asc" | "desc") => handleSortChange(sortBy, order),
    setSelectedRows: handleSelectionChange,

    // Actions
    clearSelection,
    toggleSelection,
    selectAll,
    resetFilters,

    // Computed
    hasFilters: search !== "" || sortBy !== "" || sortOrder !== "asc",
    hasSelection: selectedRows.size > 0,
  };
}
