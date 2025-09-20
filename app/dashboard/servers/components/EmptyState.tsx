"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Server } from "lucide-react";

interface EmptyStateProps {
  hasServers: boolean;
  onAddServer: () => void;
}

export function EmptyState({ hasServers, onAddServer }: EmptyStateProps) {
  return (
    <Card className="p-8 sm:p-12 text-center">
      <Server className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {hasServers ? "No Servers Match Your Filters" : "No Mikrotik Servers"}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
        {hasServers
          ? "Try adjusting your search or filter criteria to find servers."
          : "Get started by adding your first Mikrotik server to manage your network infrastructure."}
      </p>
      {!hasServers && (
        <Button onClick={onAddServer} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Server
        </Button>
      )}
    </Card>
  );
}
