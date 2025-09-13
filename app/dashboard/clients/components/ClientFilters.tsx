"use client";

import { Button } from "@/components/ui/button";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { getMikrotikServers } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Filter, X } from "lucide-react";
import { useState } from "react";

interface ClientFiltersProps {
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
  selectedServer?: string;
  onServerChange?: (serverId: string) => void;
}

export function ClientFilters({
  onRefresh,
  onExport,
  isLoading = false,
  selectedServer = "",
  onServerChange,
}: ClientFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const filterRef = useOutsideClick({
    callback: () => setShowFilters(false),
    enabled: showFilters,
  });

  // Fetch Mikrotik servers for filter dropdown
  const { data: mikrotikServers = [] } = useQuery({
    queryKey: ["mikrotik-servers"],
    queryFn: getMikrotikServers,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

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
        {showFilters && (
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
            5
          </span>
        )}
      </Button>

      {/* Filter Panel */}
      {showFilters && (
        <div
          ref={filterRef}
          className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-30 p-6 min-w-[600px]"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select className="w-full h-10 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Connection Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Connection
              </label>
              <select className="w-full h-10 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Connections</option>
                <option value="CONNECTED">Connected</option>
                <option value="DISCONNECTED">Disconnected</option>
              </select>
            </div>

            {/* Mikrotik Server Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Mikrotik Server
              </label>
              <select
                value={selectedServer}
                onChange={(e) => onServerChange?.(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Servers</option>
                {mikrotikServers.map((server: any) => (
                  <option key={server.id} value={server.id}>
                    {server.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Zone Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Zone
              </label>
              <select className="w-full h-10 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Zones</option>
                <option value="zone1">Zone 1</option>
                <option value="zone2">Zone 2</option>
                <option value="zone3">Zone 3</option>
              </select>
            </div>

            {/* District Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                District
              </label>
              <select className="w-full h-10 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Districts</option>
                <option value="district1">District 1</option>
                <option value="district2">District 2</option>
                <option value="district3">District 3</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
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
              onClick={() => setShowFilters(false)}
              className="h-9 px-4"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
