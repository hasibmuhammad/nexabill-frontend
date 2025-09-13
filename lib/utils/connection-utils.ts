// Utility functions for formatting connection and uptime information

export interface ConnectionSession {
  ".id": string;
  name: string;
  service: string;
  "caller-id": string;
  address: string;
  uptime: string;
  encoding: string;
  "session-id": string;
  "limit-bytes-in": string;
  "limit-bytes-out": string;
  radius: string;
  serverId: string;
  serverName: string;
}

/**
 * Parse Mikrotik uptime string and convert to human-readable format
 * @param uptimeString - Mikrotik uptime string (e.g., "2d3h45m30s", "1h30m", "45m30s")
 * @returns Human-readable uptime string
 */
export function formatUptime(uptimeString: string): string {
  if (!uptimeString || uptimeString === "0s") {
    return "Just connected";
  }

  // Remove any whitespace and convert to lowercase
  const uptime = uptimeString.trim().toLowerCase();

  // Parse the uptime string
  const days = uptime.match(/(\d+)d/);
  const hours = uptime.match(/(\d+)h/);
  const minutes = uptime.match(/(\d+)m/);
  const seconds = uptime.match(/(\d+)s/);

  const dayCount = days ? parseInt(days[1]) : 0;
  const hourCount = hours ? parseInt(hours[1]) : 0;
  const minuteCount = minutes ? parseInt(minutes[1]) : 0;
  const secondCount = seconds ? parseInt(seconds[1]) : 0;

  // Format the output
  const parts: string[] = [];

  if (dayCount > 0) {
    parts.push(`${dayCount} day${dayCount > 1 ? "s" : ""}`);
  }

  if (hourCount > 0) {
    parts.push(`${hourCount} hour${hourCount > 1 ? "s" : ""}`);
  }

  if (minuteCount > 0 && dayCount === 0) {
    // Only show minutes if less than a day
    parts.push(`${minuteCount} minute${minuteCount > 1 ? "s" : ""}`);
  }

  if (secondCount > 0 && dayCount === 0 && hourCount === 0) {
    // Only show seconds if less than an hour
    parts.push(`${secondCount} second${secondCount > 1 ? "s" : ""}`);
  }

  return parts.join(", ") || "Just connected";
}

/**
 * Format IP address with proper styling
 * @param ipAddress - IP address string
 * @returns Formatted IP address
 */
export function formatIPAddress(ipAddress: string): string {
  if (!ipAddress || ipAddress === "0.0.0.0") {
    return "No IP";
  }
  return ipAddress;
}

/**
 * Format data usage from bytes
 * @param bytes - Number of bytes
 * @returns Formatted data usage string
 */
export function formatDataUsage(bytes: string | number): string {
  const bytesNum = typeof bytes === "string" ? parseInt(bytes) || 0 : bytes;

  if (bytesNum === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytesNum;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Get connection quality indicator based on uptime
 * @param uptimeString - Mikrotik uptime string
 * @returns Connection quality info
 */
export function getConnectionQuality(uptimeString: string): {
  quality: "excellent" | "good" | "fair" | "poor";
  color: string;
  description: string;
} {
  if (!uptimeString || uptimeString === "0s") {
    return {
      quality: "poor",
      color: "text-gray-500",
      description: "Just connected",
    };
  }

  // Parse uptime to get total minutes
  const uptime = uptimeString.trim().toLowerCase();
  const days = uptime.match(/(\d+)d/);
  const hours = uptime.match(/(\d+)h/);
  const minutes = uptime.match(/(\d+)m/);

  const dayCount = days ? parseInt(days[1]) : 0;
  const hourCount = hours ? parseInt(hours[1]) : 0;
  const minuteCount = minutes ? parseInt(minutes[1]) : 0;

  const totalMinutes = dayCount * 24 * 60 + hourCount * 60 + minuteCount;

  if (totalMinutes >= 24 * 60) {
    // More than 1 day
    return {
      quality: "excellent",
      color: "text-green-600",
      description: "Stable connection",
    };
  } else if (totalMinutes >= 60) {
    // More than 1 hour
    return {
      quality: "good",
      color: "text-blue-600",
      description: "Good connection",
    };
  } else if (totalMinutes >= 10) {
    // More than 10 minutes
    return {
      quality: "fair",
      color: "text-yellow-600",
      description: "Fair connection",
    };
  } else {
    return {
      quality: "poor",
      color: "text-orange-600",
      description: "New connection",
    };
  }
}

/**
 * Get service type display name
 * @param service - Mikrotik service type
 * @returns Human-readable service name
 */
export function getServiceDisplayName(service: string): string {
  const serviceMap: Record<string, string> = {
    pppoe: "PPPoE",
    pptp: "PPTP",
    l2tp: "L2TP",
    sstp: "SSTP",
    ovpn: "OpenVPN",
    ikev2: "IKEv2",
    hotspot: "Hotspot",
    default: "Default",
  };

  return serviceMap[service.toLowerCase()] || service.toUpperCase();
}

/**
 * Get encoding display name
 * @param encoding - Mikrotik encoding type
 * @returns Human-readable encoding name
 */
export function getEncodingDisplayName(encoding: string): string {
  const encodingMap: Record<string, string> = {
    "mppe-128": "MPPE 128-bit",
    "mppe-40": "MPPE 40-bit",
    "mppe-56": "MPPE 56-bit",
    none: "No Encryption",
    auto: "Auto",
  };

  return encodingMap[encoding.toLowerCase()] || encoding.toUpperCase();
}
