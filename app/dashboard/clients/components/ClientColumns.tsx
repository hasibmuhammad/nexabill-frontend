"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@/components/ui/data-table";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Wifi,
  WifiOff,
} from "lucide-react";

interface ISPClient {
  id: string;
  trackCode: string;
  name: string;
  phone: string;
  address: string;
  mikrotikUsername: string;
  serviceProfile: string;
  monthlyFee: string;
  connectionDate: string;
  billCycleDate: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  connectionStatus: "CONNECTED" | "DISCONNECTED";
  lastSyncAt: string | null;
  mikrotikServer: {
    id: string;
    name: string;
  };
  email?: string | null;
  nid?: string | null;
  districtId?: string | null;
  zoneId?: string | null;
  subzoneId?: string | null;
  connectionTypeId?: string | null;
  protocolTypeId?: string | null;
  outstandingBalance?: string;
  autoDisableEnabled?: boolean;
  gracePeriodDays?: number;
  mikrotikServerId?: string;
  mikrotikUserId?: string;
  resellerId?: string | null;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
  reseller?: any | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  district?: any | null;
  zone?: any | null;
  subzone?: any | null;
  connectionType?: any | null;
  protocolType?: any | null;
}

interface ClientColumnsProps {
  onEdit: (client: ISPClient) => void;
  isClientOnline: (client: ISPClient) => boolean;
}

export function useClientColumns({
  onEdit,
  isClientOnline,
}: ClientColumnsProps) {
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) {
      return "৳0";
    }
    return `৳${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "INACTIVE":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
      case "SUSPENDED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4" />;
      case "INACTIVE":
        return <AlertCircle className="h-4 w-4" />;
      case "SUSPENDED":
        return <AlertCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getBillCycleStatus = (billCycleDate: string) => {
    const today = new Date();
    const billDate = new Date(billCycleDate);
    const diffTime = billDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: "Today", className: "text-red-600" };
    if (diffDays === 1)
      return { text: "Tomorrow", className: "text-orange-600" };
    if (diffDays <= 3)
      return { text: `${diffDays} days`, className: "text-yellow-600" };
    return { text: `${diffDays} days`, className: "text-green-600" };
  };

  const columns: ColumnDef<ISPClient, any>[] = [
    {
      id: "trackCode",
      header: "Client Code",
      accessorKey: "trackCode",
      enableSorting: false,
      columnClassName: "text-center",
      cell: ({ original: client }) => (
        <div className="text-center">
          <span className="font-mono text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
            {client.trackCode || "N/A"}
          </span>
        </div>
      ),
    },
    {
      id: "client",
      header: "Client ID",
      accessorKey: "name",
      enableSorting: false,
      cell: ({ original: client }) => (
        <div className="space-y-1">
          <div className="font-medium">{client.name || "N/A"}</div>
          <div className="text-sm text-muted-foreground">
            {client.email || "No email"}
          </div>
          <div className="text-xs text-muted-foreground">
            {client.phone || "No phone"}
          </div>
        </div>
      ),
    },
    {
      id: "service",
      header: "Service",
      accessorKey: "serviceProfile",
      enableSorting: false,
      cell: ({ original: client }) => (
        <div>
          <div className="space-y-1">
            <div className="font-medium">{client.serviceProfile || "N/A"}</div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(Number(client.monthlyFee || 0))}/month
            </div>
            <div className="text-xs text-muted-foreground">
              {client.mikrotikServer?.name || "Unknown Server"}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      enableSorting: false,
      columnClassName: "text-center",
      cellClassName: "text-center",
      cell: ({ original: client }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            client.status
          )}`}
        >
          {getStatusIcon(client.status)}
          <span className="ml-1">{client.status}</span>
        </span>
      ),
    },
    {
      id: "connection",
      header: "Connection",
      accessorKey: "connectionStatus",
      enableSorting: false,
      columnClassName: "text-center",
      cell: ({ original: client }) => {
        const isOnline = isClientOnline(client);
        return (
          <div className="text-center">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isOnline
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {isOnline ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  <Wifi className="h-3 w-3 mr-1" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                  <WifiOff className="h-3 w-3 mr-1" />
                  <span>Offline</span>
                </>
              )}
            </span>
          </div>
        );
      },
    },
    {
      id: "billCycle",
      header: "Bill Cycle",
      accessorKey: "billCycleDate",
      enableSorting: false,
      columnClassName: "text-center",
      cell: ({ original: client }) => {
        const billCycle = getBillCycleStatus(client.billCycleDate);
        return (
          <div className="text-center">
            <div className={`text-sm font-medium ${billCycle.className}`}>
              {billCycle.text}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(client.billCycleDate).toLocaleDateString()}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      columnClassName: "text-center",
      cellClassName: "text-center",
      enableSorting: false,
      cell: ({ original: client }) => (
        <div className="flex space-x-2 justify-center">
          <Button size="sm" variant="outline">
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline">
            <Activity className="h-3 w-3" />
          </Button>
          {isClientOnline(client) ? (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              <WifiOff className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 hover:text-green-700"
            >
              <Wifi className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return columns;
}
