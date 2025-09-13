"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ZoneSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function ZoneSearch({ searchValue, onSearchChange }: ZoneSearchProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Sync local search with parent search
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange(localSearch);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [localSearch, searchValue, onSearchChange]);

  return (
    <div className="flex flex-col gap-2">
      {/* Search Input */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search zones by name, code, or description..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 pr-10 h-10 w-80"
          />
          {localSearch ? (
            <button
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 z-20 cursor-pointer"
              title={`Clear search: "${localSearch}"`}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
