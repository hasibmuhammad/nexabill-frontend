"use client";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { Filter, X } from "lucide-react";
import { useState } from "react";

interface UpazilaFiltersProps {
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
  onFilterChange?: (key: string, value: string) => void;
  filters?: {
    status?: string;
  };
}

export function UpazilaFilters({
  onRefresh,
  onExport,
  isLoading = false,
  onFilterChange,
  filters = {},
}: UpazilaFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const filterRef = useOutsideClick({
    callback: () => setShowFilters(false),
    enabled: showFilters,
  });

  // Calculate active filters count
  const activeFiltersCount = Object.values(localFilters).filter(
    (value) => value !== "" && value !== undefined
  ).length;

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange?.(key, value);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onFilterChange?.("status", "");
  };

  const applyFilters = () => {
    setShowFilters(false);
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  return (
    <div className="relative flex items-center space-x-3">
      {/* Filters Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowFilters(!showFilters)}
        className={`h-10 px-4 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 ${
          showFilters
            ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400"
            : ""
        }`}
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {/* Filter Panel */}
      {showFilters && (
        <div
          ref={filterRef}
          className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-40 p-6 min-w-[500px]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Filter Upazilas
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <Select
                options={statusOptions}
                value={localFilters.status || ""}
                onChange={(value) => handleFilterChange("status", value)}
                placeholder="Select status"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-9 px-4"
              disabled={activeFiltersCount === 0}
            >
              Clear All
            </Button>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={applyFilters}
                className="h-9 px-4"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
