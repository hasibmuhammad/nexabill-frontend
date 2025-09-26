"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { type MikrotikServer } from "@/lib/api-mikrotik";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ServerFiltersProps {
  servers: MikrotikServer[];
  onFilteredServers: (filters: { status: string; search: string }) => void;
}

export function ServerFilters({
  servers,
  onFilteredServers,
}: ServerFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Notify parent of filter changes
  useEffect(() => {
    onFilteredServers({ status: statusFilter, search: searchTerm });
  }, [searchTerm, statusFilter, onFilteredServers]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const hasActiveFilters = searchTerm.trim() || statusFilter !== "ALL";

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search servers by name, host, location, or description..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            options={[
              { value: "ALL", label: "All Servers" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
            selectClassName="min-w-[140px]"
          />
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {hasActiveFilters && (
        <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Showing filtered results
        </div>
      )}
    </Card>
  );
}
