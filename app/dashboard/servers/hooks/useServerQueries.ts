"use client";

import {
  getMikrotikServers,
  getMikrotikServersWithStatus,
} from "@/lib/api-mikrotik";
import { useQuery } from "@tanstack/react-query";

export function useServerQueries() {
  // First check if there are any servers at all
  const {
    data: serversList,
    isLoading: serversLoading,
    error: serversError,
  } = useQuery({
    queryKey: ["mikrotik-servers-list"],
    queryFn: getMikrotikServers,
    retry: 1,
    retryDelay: 2000,
  });

  // Only fetch with status if there are servers
  const {
    data: servers,
    isLoading: statusLoading,
    error: statusError,
  } = useQuery({
    queryKey: ["mikrotik-servers-with-status"],
    queryFn: getMikrotikServersWithStatus,
    enabled: !!serversList && serversList.length > 0, // Only run if servers exist
    retry: 1,
    retryDelay: 2000,
  });

  // Use servers with status if available, otherwise use basic servers list
  const finalServers = servers || serversList || [];
  const isLoading =
    serversLoading || (serversList && serversList.length > 0 && statusLoading);
  const error = serversError || statusError;

  // Ensure servers is always an array, even if API returns error or unexpected data
  // Handle both direct array and paginated response structure
  const serversArray = Array.isArray(finalServers)
    ? finalServers
    : finalServers && Array.isArray(finalServers)
    ? finalServers
    : [];

  return {
    servers: serversArray,
    isLoading,
    error,
    serversList,
    serversWithStatus: servers,
  };
}
