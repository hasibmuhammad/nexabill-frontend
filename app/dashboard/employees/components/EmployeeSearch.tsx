"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

export function EmployeeSearch({
  searchValue,
  onSearchChange,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
}) {
  const [localSearch, setLocalSearch] = useState(searchValue);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== searchValue) onSearchChange(localSearch);
    }, 500);
    return () => clearTimeout(t);
  }, [localSearch, searchValue, onSearchChange]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearchChange(localSearch);
            }
            if (e.key === "Escape") {
              setLocalSearch("");
              onSearchChange("");
            }
          }}
          placeholder="Search name, email or phone..."
          className="pl-10 pr-10 h-10 w-80"
          aria-label="Search employees"
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
  );
}
