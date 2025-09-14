import { getMatchingClients } from "@/lib/packages";
import { useQuery } from "@tanstack/react-query";

export interface MatchingClientsData {
  package: {
    mikrotikProfile: string;
    name: string;
    monthlyPrice: string;
  };
  matchingClients: Array<{
    id: string;
    name: string;
    mikrotikUsername: string;
    serviceProfile: string;
    monthlyFee: string;
    status: "ACTIVE" | "SUSPENDED" | "TERMINATED";
    connectionStatus: "CONNECTED" | "DISCONNECTED";
    mikrotikServer: {
      id: string;
      name: string;
      host: string;
    };
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  assignedClients: any[];
  totalMatches: number;
  totalAssigned: number;
}

export function useMatchingClientsCount(packageId: string) {
  return useQuery({
    queryKey: ["matching-clients-count", packageId],
    queryFn: () => getMatchingClients(packageId),
    enabled: !!packageId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}
