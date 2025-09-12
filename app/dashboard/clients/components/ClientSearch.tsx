"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface ClientSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  isSearching: boolean;
  debouncedSearch: string;
  resultsCount?: number;
}

export function ClientSearch({
  searchValue,
  onSearchChange,
  isSearching,
  debouncedSearch,
  resultsCount,
}: ClientSearchProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Search input */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search clients..."
            value={searchValue}
            onChange={(e) => {
              console.log("Search input changed:", e.target.value);
              onSearchChange(e.target.value);
            }}
            className="pl-10 pr-10 h-10 w-80 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
          {/* Clear X icon - show when there's text in search */}
          {searchValue ? (
            <button
              onClick={() => {
                onSearchChange("");
                console.log("Search cleared");
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 z-20 cursor-pointer"
              title={`Clear search: "${searchValue}"`}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Search status and results */}
      <div className="flex items-center space-x-4">
        {/* Search status indicator */}
        {isSearching && (
          <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Searching...</span>
          </div>
        )}
        {/* Search results summary */}
        {debouncedSearch && !isSearching && (
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Found {resultsCount || 0} result
            {resultsCount !== 1 ? "s" : ""} for "{debouncedSearch}"
          </div>
        )}
      </div>
    </div>
  );
}
