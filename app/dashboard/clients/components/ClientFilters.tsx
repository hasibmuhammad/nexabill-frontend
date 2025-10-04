"use client";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { getMikrotikServers } from "@/lib/api";
import { getActiveDistricts } from "@/lib/api-districts";
import { getZones } from "@/lib/api-zones";
import {
  CLIENT_STATUS_OPTIONS,
  CONNECTION_STATUS_OPTIONS,
} from "@/lib/constants/filters";
import { useQuery } from "@tanstack/react-query";
import { Filter, X } from "lucide-react";
import { useMemo, useState } from "react";

interface FilterState {
  server: string;
  status: string;
  connection: string;
  clientType: string;
  zone: string;
  district: string;
}

interface ClientFiltersProps {
  isLoading?: boolean;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
}

export function ClientFilters({
  isLoading = false,
  filters,
  onFilterChange,
}: ClientFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const filterRef = useOutsideClick({
    callback: () => setShowFilters(false),
    enabled: showFilters,
  });

  const { data: mikrotikServers = [] } = useQuery({
    queryKey: ["mikrotik-servers"],
    queryFn: getMikrotikServers,
    staleTime: 5 * 60 * 1000,
  });

  const { data: zonesData } = useQuery({
    queryKey: ["zones"],
    queryFn: () => getZones({ limit: 100, isActive: true }),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: districts = [],
    isLoading: districtsLoading,
    error: districtsError,
  } = useQuery({
    queryKey: ["districts"],
    queryFn: getActiveDistricts,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter((value) => value !== "").length;
  }, [filters]);

  // Get active filters for display
  const activeFilters = useMemo(() => {
    const activeFilters = [];

    if (filters.status) {
      const statusLabels: { [key: string]: string } = {
        ACTIVE: "Active",
        INACTIVE: "Inactive",
        SUSPENDED: "Suspended",
        PENDING: "Pending",
      };
      activeFilters.push({
        key: "status",
        label: "Status",
        value: statusLabels[filters.status] || filters.status,
      });
    }

    if (filters.connection) {
      const connectionLabels: { [key: string]: string } = {
        CONNECTED: "Connected",
        DISCONNECTED: "Disconnected",
      };
      activeFilters.push({
        key: "connection",
        label: "Connection",
        value: connectionLabels[filters.connection] || filters.connection,
      });
    }

    if (filters.clientType) {
      const clientTypeLabels: { [key: string]: string } = {
        HOME: "Home",
        CORPORATE: "Corporate",
      };
      activeFilters.push({
        key: "clientType",
        label: "Type",
        value: clientTypeLabels[filters.clientType] || filters.clientType,
      });
    }

    if (filters.server) {
      const server = mikrotikServers.find((s: any) => s.id === filters.server);
      activeFilters.push({
        key: "server",
        label: "Server",
        value: server?.name || "Unknown Server",
      });
    }

    if (filters.zone) {
      const zones = zonesData?.data || [];
      const zone = zones.find((z: any) => z.id === filters.zone);
      activeFilters.push({
        key: "zone",
        label: "Zone",
        value: zone?.name || filters.zone,
      });
    }

    if (filters.district) {
      const district = districts.find((d: any) => d.id === filters.district);
      activeFilters.push({
        key: "district",
        label: "District",
        value: district?.name || filters.district,
      });
    }

    return activeFilters;
  }, [filters, mikrotikServers, zonesData, districts]);

  // Clear individual filter
  const clearFilter = (filterKey: keyof FilterState) => {
    onFilterChange(filterKey, "");
  };

  // Clear all filters
  const clearAllFilters = () => {
    Object.keys(filters).forEach((key) => {
      onFilterChange(key as keyof FilterState, "");
    });
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="relative">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 transition-all duration-200 ${
              activeFiltersCount > 0
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                : "hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div
            ref={filterRef}
            className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-40 p-6 min-w-[500px]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Filter Clients
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
              <Select
                label="Status"
                value={filters.status}
                onChange={(value) => onFilterChange("status", value)}
                placeholder="All Statuses"
                options={CLIENT_STATUS_OPTIONS}
                selectClassName="h-11"
              />

              {/* Connection Filter */}
              <Select
                label="Connection"
                value={filters.connection}
                onChange={(value) => onFilterChange("connection", value)}
                placeholder="All Connections"
                options={CONNECTION_STATUS_OPTIONS}
                selectClassName="h-11"
              />

              {/* Client Type Filter */}
              <Select
                label="Client Type"
                value={filters.clientType}
                onChange={(value) => onFilterChange("clientType", value)}
                placeholder="All Types"
                options={[
                  { value: "", label: "All Types" },
                  { value: "HOME", label: "Home" },
                  { value: "CORPORATE", label: "Corporate" },
                ]}
                selectClassName="h-11"
              />

              {/* Mikrotik Server Filter */}
              <Select
                label="Mikrotik Server"
                value={filters.server}
                onChange={(value) => onFilterChange("server", value)}
                placeholder="All Servers"
                options={[
                  { value: "", label: "All Servers" },
                  ...(Array.isArray(mikrotikServers)
                    ? mikrotikServers.map((server: any) => ({
                        value: server.id,
                        label: server.name,
                      }))
                    : []),
                ]}
                selectClassName="h-11"
              />

              {/* Zone Filter */}
              <Select
                label="Zone"
                value={filters.zone}
                onChange={(value) => onFilterChange("zone", value)}
                placeholder="All Zones"
                options={[
                  { value: "", label: "All Zones" },
                  ...(Array.isArray(zonesData?.data)
                    ? zonesData.data.map((zone: any) => ({
                        value: zone.id,
                        label: zone.name,
                      }))
                    : []),
                ]}
                selectClassName="h-11"
              />

              {/* District Filter */}
              <Select
                label="District"
                value={filters.district}
                onChange={(value) => onFilterChange("district", value)}
                placeholder="All Districts"
                options={[
                  { value: "", label: "All Districts" },
                  ...(Array.isArray(districts)
                    ? districts.map((district: any) => ({
                        value: district.id,
                        label: district.name,
                      }))
                    : []),
                ]}
                selectClassName="h-11"
              />
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {activeFiltersCount > 0
                  ? `${activeFiltersCount} filter${
                      activeFiltersCount !== 1 ? "s" : ""
                    } applied`
                  : "No filters applied"}
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  disabled={activeFiltersCount === 0}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Active filters:
          </span>
          {activeFilters.map((filter) => (
            <div
              key={filter.key}
              className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-full text-sm font-medium"
            >
              <span className="text-blue-600 dark:text-blue-400">
                {filter.label}:
              </span>
              <span>{filter.value}</span>
              <button
                onClick={() => clearFilter(filter.key as keyof FilterState)}
                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
