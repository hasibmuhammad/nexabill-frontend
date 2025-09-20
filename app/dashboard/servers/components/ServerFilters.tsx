"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { type MikrotikServer } from "@/lib/api-mikrotik";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface ServerFiltersProps {
  servers: MikrotikServer[];
  onFilteredServers: (servers: MikrotikServer[]) => void;
}

export function ServerFilters({
  servers,
  onFilteredServers,
}: ServerFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, statusFilter);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    applyFilters(searchTerm, value);
  };

  const applyFilters = (search: string, status: string) => {
    let filtered = servers;

    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter(
        (server) =>
          server.name.toLowerCase().includes(search.toLowerCase()) ||
          server.host.toLowerCase().includes(search.toLowerCase()) ||
          server.location?.toLowerCase().includes(search.toLowerCase()) ||
          server.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (status !== "all") {
      filtered = filtered.filter((server) => {
        if (status === "connected") {
          return (
            server.status === "ACTIVE" &&
            server.connectionStatus === "CONNECTED"
          );
        } else if (status === "disconnected") {
          return (
            server.connectionStatus === "DISCONNECTED" ||
            server.status === "INACTIVE"
          );
        } else if (status === "active") {
          return server.status === "ACTIVE";
        } else if (status === "inactive") {
          return server.status === "INACTIVE";
        }
        return true;
      });
    }

    onFilteredServers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    onFilteredServers(servers);
  };

  const hasActiveFilters = searchTerm.trim() || statusFilter !== "all";

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
              { value: "all", label: "All Servers" },
              { value: "connected", label: "Connected" },
              { value: "disconnected", label: "Disconnected" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
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
