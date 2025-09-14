// Filter constants for client filtering
export const CLIENT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "PENDING", label: "Pending" },
];

export const CONNECTION_STATUS_OPTIONS = [
  { value: "CONNECTED", label: "Connected" },
  { value: "DISCONNECTED", label: "Disconnected" },
];

// Type definitions for better type safety
export type ClientStatus = (typeof CLIENT_STATUS_OPTIONS)[number]["value"];
export type ConnectionStatus =
  (typeof CONNECTION_STATUS_OPTIONS)[number]["value"];
