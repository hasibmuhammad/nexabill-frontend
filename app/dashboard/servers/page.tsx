"use client";

import { PageHeader } from "@/components/ui/page-header";
import { type MikrotikServer } from "@/lib/api-mikrotik";
import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { ConnectionHelp } from "./components/ConnectionHelp";
import { EmptyState } from "./components/EmptyState";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ServerFilters } from "./components/ServerFilters";
import { ServerGrid } from "./components/ServerGrid";
import { ServerModal } from "./components/ServerModal";
import { ServerStatusSummary } from "./components/ServerStatusSummary";
import { useServerMutations } from "./hooks/useServerMutations";
import { useServerQueries } from "./hooks/useServerQueries";

export default function ServersPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedServer, setSelectedServer] = useState<MikrotikServer | null>(
    null
  );
  const [refreshingStatus, setRefreshingStatus] = useState<string | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [filteredServers, setFilteredServers] = useState<MikrotikServer[]>([]);

  const { servers, isLoading, error } = useServerQueries();
  const {
    addServerMutation,
    editServerMutation,
    importUsersMutation,
    syncClientsMutation,
    refreshStatusMutation,
    toggleStatusMutation,
    bulkRefreshMutation,
  } = useServerMutations();

  // Initialize filtered servers when servers change
  useEffect(() => {
    setFilteredServers(servers);
  }, [servers]);

  // Handle escape key to close forms
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showAddForm) setShowAddForm(false);
        if (showEditForm) setShowEditForm(false);
      }
    };

    if (showAddForm || showEditForm) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showAddForm, showEditForm]);

  const closeForm = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedServer(null);
    // Reset form if needed
    const form = document.querySelector("form") as HTMLFormElement;
    if (form) {
      form.reset();
    }
    // Clear any pending mutations
    addServerMutation.reset();
    editServerMutation.reset();
  };

  // Auto-refresh server statuses every 5 minutes
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      // Only auto-refresh if the page is visible and not already refreshing
      if (!bulkRefreshMutation.isPending && !isLoading) {
        bulkRefreshMutation.mutate();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [bulkRefreshMutation, isLoading, autoRefreshEnabled]);

  const handleRefreshStatus = (serverId: string) => {
    setRefreshingStatus(serverId);
    refreshStatusMutation.mutate(serverId, {
      onSettled: () => setRefreshingStatus(null),
    });
  };

  const handleAddServer = (data: any) => {
    addServerMutation.mutate(data, {
      onSuccess: () => {
        closeForm();
      },
    });
  };

  const handleEditServer = (data: any) => {
    editServerMutation.mutate(data, {
      onSuccess: () => {
        closeForm();
      },
    });
  };

  if (isLoading) {
    return (
      <LoadingSpinner message="Checking server connections..." fullScreen />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <PageHeader
        title="Mikrotik Servers"
        subtitle="Manage your Mikrotik routers and network infrastructure"
        actions={[
          {
            label: bulkRefreshMutation.isPending
              ? "Checking..."
              : "Refresh All",
            icon: RefreshCw,
            onClick: () => bulkRefreshMutation.mutate(),
            variant: "outline",
            disabled: isLoading || bulkRefreshMutation.isPending,
            loading: isLoading || bulkRefreshMutation.isPending,
          },
          {
            label: "Add Server",
            icon: Plus,
            onClick: () => setShowAddForm(true),
            variant: "primary",
          },
        ]}
      />

      {/* Error Boundary */}
      <ErrorBoundary error={error} hasServers={servers.length > 0} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Server Modal */}
        <ServerModal
          isOpen={showAddForm}
          onClose={closeForm}
          onSubmit={handleAddServer}
          isLoading={addServerMutation.isPending}
        />

        {/* Edit Server Modal */}
        <ServerModal
          isOpen={showEditForm}
          onClose={closeForm}
          server={selectedServer}
          onSubmit={handleEditServer}
          isLoading={editServerMutation.isPending}
        />

        {/* Connection Help */}
        <ConnectionHelp />

        {/* Status Summary */}
        <ServerStatusSummary
          servers={servers}
          autoRefreshEnabled={autoRefreshEnabled}
          onAutoRefreshToggle={setAutoRefreshEnabled}
        />

        {/* Filters */}
        <ServerFilters
          servers={servers}
          onFilteredServers={setFilteredServers}
        />

        {/* Servers Grid */}
        <ServerGrid
          servers={filteredServers}
          onRefreshStatus={handleRefreshStatus}
          onImportUsers={(serverId) => importUsersMutation.mutate(serverId)}
          onSyncClients={(serverId) => syncClientsMutation.mutate(serverId)}
          onToggleStatus={(serverId) => toggleStatusMutation.mutate(serverId)}
          onEdit={(server) => {
            setSelectedServer(server);
            setShowEditForm(true);
          }}
          refreshingStatus={refreshingStatus}
          isImportUsersPending={importUsersMutation.isPending}
          isSyncClientsPending={syncClientsMutation.isPending}
          isToggleStatusPending={toggleStatusMutation.isPending}
          isBulkRefreshPending={bulkRefreshMutation.isPending}
        />

        {/* Empty State */}
        {filteredServers?.length === 0 && (
          <EmptyState
            hasServers={servers.length > 0}
            onAddServer={() => setShowAddForm(true)}
          />
        )}
      </div>
    </div>
  );
}
