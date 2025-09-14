import { getPackageAnalytics } from "@/lib/packages";
import { useQuery } from "@tanstack/react-query";

export interface PackageAnalytics {
  id: string;
  name: string;
  mikrotikProfile: string;
  monthlyPrice: string;
  isActive: boolean;
  totalClients: number;
  activeClients: number;
  connectedClients: number;
  clients: Array<{
    id: string;
    name: string;
    mikrotikUsername: string;
    status: "ACTIVE" | "SUSPENDED" | "TERMINATED";
    connectionStatus: "CONNECTED" | "DISCONNECTED";
    mikrotikServer: {
      name: string;
    };
  }>;
}

export function usePackageAnalytics() {
  return useQuery({
    queryKey: ["package-analytics"],
    queryFn: getPackageAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
